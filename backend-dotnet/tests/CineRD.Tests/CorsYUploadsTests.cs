using System.Net;
using CineRD.API.Security;
using CineRD.API.Storage;
using CineRD.Application.Abstractions;
using CineRD.Tests.Support;

namespace CineRD.Tests;

public class CorsOriginPolicyTests
{
    [Theory]
    [InlineData(null)]
    [InlineData("")]
    public void SinOriginSiempreSePermite(string? origin) =>
        Assert.True(new CorsOriginPolicy("https://cinerd.pages.dev", true).IsAllowed(origin));

    [Theory]
    [InlineData("https://cinerd.pages.dev")]
    [InlineData("https://cinerd.pages.dev/")]
    [InlineData("https://otro.dev")]
    public void OrigenesConfiguradosSePermitenIgnorandoBarraFinal(string origin) =>
        Assert.True(new CorsOriginPolicy("https://cinerd.pages.dev/, https://otro.dev", true).IsAllowed(origin));

    [Theory]
    [InlineData("https://malo.example")]
    [InlineData("http://cinerd.pages.dev")]
    [InlineData("https://cinerd.pages.dev.malo.example")]
    [InlineData("null")]
    public void OrigenAjenoSeRechaza(string origin) =>
        Assert.False(new CorsOriginPolicy("https://cinerd.pages.dev", false).IsAllowed(origin));

    [Theory]
    [InlineData("http://localhost:5173", true)]
    [InlineData("http://127.0.0.1:5173", true)]
    [InlineData("http://192.168.1.20:5173", true)]
    [InlineData("http://10.0.0.5", true)]
    [InlineData("http://172.20.1.1:5173", true)]
    [InlineData("http://172.32.1.1:5173", false)]
    [InlineData("http://localhost:9999", false)]
    [InlineData("http://8.8.8.8:5173", false)]
    public void LocalYRedPrivadaSoloFueraDeProduccion(string origin, bool esperado)
    {
        Assert.Equal(esperado, new CorsOriginPolicy("https://cinerd.pages.dev", false).IsAllowed(origin));
        Assert.False(new CorsOriginPolicy("https://cinerd.pages.dev", true).IsAllowed(origin));
    }

    [Fact]
    public void SinConfiguracionDesarrolloUsaVite_ProduccionNoAbreNada()
    {
        Assert.True(new CorsOriginPolicy(null, false).IsAllowed("http://localhost:5173"));
        var prod = new CorsOriginPolicy(null, true);
        Assert.Equal(0, prod.Configurados);
        Assert.False(prod.IsAllowed("http://localhost:5173"));
        Assert.True(prod.IsAllowed(null));
    }
}

public class UploadsLocationTests
{
    [Fact]
    public void CarpetasHermanasSonSeparadas() =>
        Assert.True(UploadsLocation.SonCarpetasSeparadas(Path.GetFullPath("/data/uploads"), Path.GetFullPath("/data/private")));

    [Fact]
    public void PrivadaDentroDePublicaOViceversaSeRechaza()
    {
        Assert.False(UploadsLocation.SonCarpetasSeparadas(Path.GetFullPath("/data"), Path.GetFullPath("/data/private")));
        Assert.False(UploadsLocation.SonCarpetasSeparadas(Path.GetFullPath("/data/private/pub"), Path.GetFullPath("/data/private")));
        Assert.False(UploadsLocation.SonCarpetasSeparadas(Path.GetFullPath("/data/x"), Path.GetFullPath("/data/x/")));
    }

    [Fact]
    public void PrefijoDeNombreNoCuentaComoContenido() =>
        Assert.True(UploadsLocation.SonCarpetasSeparadas(Path.GetFullPath("/data/uploads"), Path.GetFullPath("/data/uploads-private")));
}

public class CorsApiTests
{
    private static Task<ApiHost> Iniciar(string env = "Development", params string[] args) =>
        ApiHost.StartAsync(new FakeActorRepository(), new FakeReadiness(DatabaseReadinessStatus.Ready), env, args);

    private static HttpRequestMessage Get(string ruta, string? origin)
    {
        var r = new HttpRequestMessage(HttpMethod.Get, ruta);
        if (origin is not null) r.Headers.Add("Origin", origin);
        return r;
    }

    [Fact]
    public async Task OrigenNoPermitidoRecibe403ConMensajeYNoEjecutaLaRuta()
    {
        await using var api = await Iniciar("Production", "--FRONTEND_URLS=https://cinerd.pages.dev");
        var r = await api.Client.SendAsync(Get("/api/actores", "https://malo.example"));
        Assert.Equal(HttpStatusCode.Forbidden, r.StatusCode);
        var cuerpo = await r.Content.ReadAsStringAsync();
        Assert.Contains("Origen no permitido", cuerpo);
        Assert.False(r.Headers.Contains("Access-Control-Allow-Origin"));
    }

    [Fact]
    public async Task OrigenPermitidoRecibeCabecerasConCredenciales()
    {
        await using var api = await Iniciar("Production", "--FRONTEND_URLS=https://cinerd.pages.dev");
        var r = await api.Client.SendAsync(Get("/api/actores", "https://cinerd.pages.dev"));
        Assert.Equal(HttpStatusCode.OK, r.StatusCode);
        Assert.Equal("https://cinerd.pages.dev", r.Headers.GetValues("Access-Control-Allow-Origin").Single());
        Assert.Equal("true", r.Headers.GetValues("Access-Control-Allow-Credentials").Single());
    }

    [Fact]
    public async Task SinOriginPasaSinCabecerasCors()
    {
        await using var api = await Iniciar("Production");
        var r = await api.Client.SendAsync(Get("/health", null));
        Assert.Equal(HttpStatusCode.OK, r.StatusCode);
        Assert.False(r.Headers.Contains("Access-Control-Allow-Origin"));
    }

    [Fact]
    public async Task PreflightDeOrigenPermitidoResponde204ConMetodosYCabeceras()
    {
        await using var api = await Iniciar("Production", "--FRONTEND_URLS=https://cinerd.pages.dev");
        var req = new HttpRequestMessage(HttpMethod.Options, "/api/actores");
        req.Headers.Add("Origin", "https://cinerd.pages.dev");
        req.Headers.Add("Access-Control-Request-Method", "PUT");
        req.Headers.Add("Access-Control-Request-Headers", "content-type,authorization");
        var r = await api.Client.SendAsync(req);
        Assert.Equal(HttpStatusCode.NoContent, r.StatusCode);
        Assert.Contains("PUT", string.Join(",", r.Headers.GetValues("Access-Control-Allow-Methods")));
        Assert.Contains("authorization", string.Join(",", r.Headers.GetValues("Access-Control-Allow-Headers")).ToLowerInvariant());
    }

    [Fact]
    public async Task DesarrolloPermiteViteLocal()
    {
        await using var api = await Iniciar("Development");
        var r = await api.Client.SendAsync(Get("/api/actores", "http://localhost:5173"));
        Assert.Equal(HttpStatusCode.OK, r.StatusCode);
    }

    [Fact]
    public async Task IncluyeCabecerasDeSeguridad()
    {
        await using var api = await Iniciar();
        var r = await api.Client.GetAsync("/health");
        Assert.Equal("nosniff", r.Headers.GetValues("X-Content-Type-Options").Single());
        Assert.Equal("DENY", r.Headers.GetValues("X-Frame-Options").Single());
        Assert.Equal("strict-origin-when-cross-origin", r.Headers.GetValues("Referrer-Policy").Single());
    }
}

public class UploadsApiTests : IDisposable
{
    private readonly string _raiz = Path.Combine(Path.GetTempPath(), "cinerd-uploads-" + Guid.NewGuid().ToString("N"));
    private readonly string _uploads;
    private readonly string _privado;

    public UploadsApiTests()
    {
        _uploads = Path.Combine(_raiz, "uploads");
        _privado = Path.Combine(_raiz, "private");
        Directory.CreateDirectory(Path.Combine(_uploads, "actores"));
        Directory.CreateDirectory(Path.Combine(_privado, "evidencias-creditos"));
        File.WriteAllBytes(Path.Combine(_uploads, "actores", "foto.jpg"), [0xFF, 0xD8, 0xFF, 0xD9]);
        File.WriteAllText(Path.Combine(_uploads, ".secreto.jpg"), "oculto");
        File.WriteAllText(Path.Combine(_uploads, "actores", "datos.xyz"), "tipo desconocido");
        File.WriteAllText(Path.Combine(_privado, "evidencias-creditos", "prueba.pdf"), "evidencia privada");
    }

    public void Dispose() => Directory.Delete(_raiz, recursive: true);

    private Task<ApiHost> Iniciar(string? privado = null) =>
        ApiHost.StartAsync(new FakeActorRepository(), new FakeReadiness(DatabaseReadinessStatus.Ready), "Development",
            $"--UPLOADS_DIR={_uploads}", $"--PRIVATE_STORAGE_DIR={privado ?? _privado}");

    [Fact]
    public async Task SirveArchivosPublicosConSuTipo()
    {
        await using var api = await Iniciar();
        var r = await api.Client.GetAsync("/uploads/actores/foto.jpg");
        Assert.Equal(HttpStatusCode.OK, r.StatusCode);
        Assert.Equal("image/jpeg", r.Content.Headers.ContentType!.MediaType);
        Assert.Equal(4, (await r.Content.ReadAsByteArrayAsync()).Length);
    }

    [Fact]
    public async Task ArchivoInexistenteEs404() =>
        Assert.Equal(HttpStatusCode.NotFound, (await (await Iniciar()).Client.GetAsync("/uploads/actores/no-existe.jpg")).StatusCode);

    [Theory]
    [InlineData("/uploads/.secreto.jpg")]
    [InlineData("/uploads/actores/../.secreto.jpg")]
    public async Task ArchivosOcultosSeNiegan(string ruta)
    {
        await using var api = await Iniciar();
        var r = await api.Client.GetAsync(ruta);
        Assert.True(r.StatusCode is HttpStatusCode.Forbidden or HttpStatusCode.NotFound);
        Assert.DoesNotContain("oculto", await r.Content.ReadAsStringAsync());
    }

    [Theory]
    [InlineData("/uploads/../private/evidencias-creditos/prueba.pdf")]
    [InlineData("/uploads/%2e%2e/private/evidencias-creditos/prueba.pdf")]
    [InlineData("/uploads/..%2fprivate/evidencias-creditos/prueba.pdf")]
    [InlineData("/private/evidencias-creditos/prueba.pdf")]
    [InlineData("/uploads/evidencias-creditos/prueba.pdf")]
    public async Task NuncaSirveEvidenciasPrivadas(string ruta)
    {
        await using var api = await Iniciar();
        var r = await api.Client.GetAsync(ruta);
        Assert.NotEqual(HttpStatusCode.OK, r.StatusCode);
        Assert.DoesNotContain("evidencia privada", await r.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task TiposDeArchivoDesconocidosNoSeSirven()
    {
        await using var api = await Iniciar();
        Assert.Equal(HttpStatusCode.NotFound, (await api.Client.GetAsync("/uploads/actores/datos.xyz")).StatusCode);
    }

    [Fact]
    public async Task SiLasCarpetasSeSolapanNoSePublicaNada()
    {
        await using var api = await Iniciar(privado: Path.Combine(_uploads, "actores"));
        Assert.Equal(HttpStatusCode.NotFound, (await api.Client.GetAsync("/uploads/actores/foto.jpg")).StatusCode);
    }
}
