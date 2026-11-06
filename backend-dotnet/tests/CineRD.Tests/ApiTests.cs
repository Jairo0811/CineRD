using System.Net;
using System.Text.Json;
using CineRD.Application.Abstractions;
using CineRD.Application.Actores;
using CineRD.Tests.Support;

namespace CineRD.Tests;

public class HealthYReadyTests
{
    [Fact]
    public async Task HealthSiempreResponde200()
    {
        await using var api = await ApiHost.StartAsync(new FakeActorRepository(), new FakeReadiness(DatabaseReadinessStatus.Unavailable));
        var r = await api.Client.GetAsync("/health");
        Assert.Equal(HttpStatusCode.OK, r.StatusCode);
        using var doc = JsonDocument.Parse(await r.Content.ReadAsStringAsync());
        Assert.Equal("ok", doc.RootElement.GetProperty("status").GetString());
        Assert.Equal("cinerd-api", doc.RootElement.GetProperty("service").GetString());
    }

    [Theory]
    [InlineData(DatabaseReadinessStatus.Ready, 200, "ready", "ok")]
    [InlineData(DatabaseReadinessStatus.NotConfigured, 503, "not-ready", "not-configured")]
    [InlineData(DatabaseReadinessStatus.Unavailable, 503, "not-ready", "unavailable")]
    public async Task ReadyReflejaSqlServer(DatabaseReadinessStatus estado, int http, string status, string database)
    {
        await using var api = await ApiHost.StartAsync(new FakeActorRepository(), new FakeReadiness(estado));
        var r = await api.Client.GetAsync("/ready");
        Assert.Equal(http, (int)r.StatusCode);
        var texto = await r.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(texto);
        Assert.Equal(status, doc.RootElement.GetProperty("status").GetString());
        Assert.Equal(database, doc.RootElement.GetProperty("database").GetString());
        Assert.DoesNotContain("Server", texto);
    }
}

public class ActoresApiTests
{
    private static readonly string[] OrdenDetalle =
    [
        "Id", "TMDbId", "Nombres", "Apellidos", "NombreCompleto", "NombreArtistico", "Profesion", "FechaNacimiento",
        "AnioNacimiento", "Sexo", "EstaVivo", "FechaFallecimiento", "Foto", "InstagramUrl", "FacebookUrl", "TikTokUrl",
        "YouTubeUrl", "SpotifyUrl", "XUrl", "SitioWebUrl", "EsVerificado",
    ];

    private static FakeActorRepository RepoConUno()
    {
        var repo = new FakeActorRepository();
        repo.Filas.Add(new(Datos.Actor(1), 5, 2));
        return repo;
    }

    [Fact]
    public async Task ListadoConservaNombresOrdenTiposYFechasDeExpress()
    {
        await using var api = await ApiHost.StartAsync(RepoConUno(), new FakeReadiness(DatabaseReadinessStatus.Ready));
        var r = await api.Client.GetAsync("/api/actores?orden=masPeliculas");
        Assert.Equal(HttpStatusCode.OK, r.StatusCode);
        Assert.StartsWith("application/json", r.Content.Headers.ContentType!.MediaType);

        var texto = await r.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(texto);
        Assert.Equal(JsonValueKind.Array, doc.RootElement.ValueKind);
        var actor = doc.RootElement[0];

        var claves = actor.EnumerateObject().Select(p => p.Name).ToArray();
        string[] esperadas = [.. OrdenDetalle, "CantidadPeliculas", "CantidadPeliculasDirigidas"];
        Assert.Equal(esperadas, claves);
        Assert.Equal("1990-05-01T00:00:00.000Z", actor.GetProperty("FechaNacimiento").GetString());
        Assert.Equal(JsonValueKind.Null, actor.GetProperty("TMDbId").ValueKind);
        Assert.Equal(JsonValueKind.True, actor.GetProperty("EstaVivo").ValueKind);
        Assert.Equal(JsonValueKind.False, actor.GetProperty("EsVerificado").ValueKind);
        Assert.Equal(2, actor.GetProperty("CantidadPeliculasDirigidas").GetInt32());
        Assert.Contains("Ana Pérez", texto); // sin escapar acentos
    }

    [Fact]
    public async Task ListadoPasaFiltrosAlRepositorio()
    {
        var repo = RepoConUno();
        await using var api = await ApiHost.StartAsync(repo, new FakeReadiness(DatabaseReadinessStatus.Ready));
        await api.Client.GetAsync("/api/actores?buscar=ana&estado=vivo&anio=1990&profesion=actriz&orden=nacimientoAntiguo");
        var q = repo.UltimaConsulta!;
        Assert.Equal("%ana%", q.BuscarPatron);
        Assert.Equal("%actriz%", q.ProfesionPatron);
        Assert.Equal(1990, q.Anio);
        Assert.Equal(ActorEstadoFiltro.Vivo, q.Estado);
        Assert.Equal(ActorOrden.NacimientoAntiguo, q.Orden);
    }

    [Fact]
    public async Task ListadoVacioEsArregloVacio()
    {
        await using var api = await ApiHost.StartAsync(new FakeActorRepository(), new FakeReadiness(DatabaseReadinessStatus.Ready));
        var r = await api.Client.GetAsync("/api/actores");
        Assert.Equal("[]", await r.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task AnioInvalidoDevuelve400ConMensaje()
    {
        await using var api = await ApiHost.StartAsync(RepoConUno(), new FakeReadiness(DatabaseReadinessStatus.Ready));
        var r = await api.Client.GetAsync("/api/actores?anio=abc");
        Assert.Equal(HttpStatusCode.BadRequest, r.StatusCode);
        using var doc = JsonDocument.Parse(await r.Content.ReadAsStringAsync());
        Assert.True(doc.RootElement.TryGetProperty("mensaje", out _));
    }

    [Fact]
    public async Task DetalleNoIncluyeConteosYConservaOrden()
    {
        await using var api = await ApiHost.StartAsync(RepoConUno(), new FakeReadiness(DatabaseReadinessStatus.Ready));
        var r = await api.Client.GetAsync("/api/actores/1");
        Assert.Equal(HttpStatusCode.OK, r.StatusCode);
        using var doc = JsonDocument.Parse(await r.Content.ReadAsStringAsync());
        Assert.Equal(OrdenDetalle, doc.RootElement.EnumerateObject().Select(p => p.Name).ToArray());
    }

    [Fact]
    public async Task ActorInexistenteDevuelve404ConMensajeDeExpress()
    {
        await using var api = await ApiHost.StartAsync(RepoConUno(), new FakeReadiness(DatabaseReadinessStatus.Ready));
        var r = await api.Client.GetAsync("/api/actores/999");
        Assert.Equal(HttpStatusCode.NotFound, r.StatusCode);
        using var doc = JsonDocument.Parse(await r.Content.ReadAsStringAsync());
        Assert.Equal("Actor no encontrado", doc.RootElement.GetProperty("mensaje").GetString());
        Assert.Single(doc.RootElement.EnumerateObject());
    }

    [Theory]
    [InlineData("abc")]
    [InlineData("0")]
    [InlineData("-5")]
    [InlineData("1.5")]
    public async Task IdInvalidoDevuelve400ConMensajeDeExpress(string id)
    {
        await using var api = await ApiHost.StartAsync(RepoConUno(), new FakeReadiness(DatabaseReadinessStatus.Ready));
        var r = await api.Client.GetAsync("/api/actores/" + id);
        Assert.Equal(HttpStatusCode.BadRequest, r.StatusCode);
        using var doc = JsonDocument.Parse(await r.Content.ReadAsStringAsync());
        Assert.Equal("El identificador del actor no es válido", doc.RootElement.GetProperty("mensaje").GetString());
    }

    [Fact]
    public async Task ErrorInternoNoExponeDetalles()
    {
        var repo = RepoConUno();
        repo.Falla = new InvalidOperationException("Login failed for user 'sa' on server 10.0.0.5");
        await using var api = await ApiHost.StartAsync(repo, new FakeReadiness(DatabaseReadinessStatus.Ready));

        var lista = await api.Client.GetAsync("/api/actores");
        Assert.Equal(HttpStatusCode.InternalServerError, lista.StatusCode);
        var cuerpo = await lista.Content.ReadAsStringAsync();
        Assert.DoesNotContain("Login failed", cuerpo);
        Assert.DoesNotContain("10.0.0.5", cuerpo);
        Assert.Contains("Error al obtener los actores", cuerpo);

        var detalle = await api.Client.GetAsync("/api/actores/1");
        Assert.Equal(HttpStatusCode.InternalServerError, detalle.StatusCode);
        Assert.Contains("Error al obtener el actor", await detalle.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task SinSqlConfiguradoDevuelve503()
    {
        var repo = RepoConUno();
        repo.Falla = new DatabaseNotConfiguredException();
        await using var api = await ApiHost.StartAsync(repo, new FakeReadiness(DatabaseReadinessStatus.NotConfigured));
        var r = await api.Client.GetAsync("/api/actores");
        Assert.Equal(HttpStatusCode.ServiceUnavailable, r.StatusCode);
    }
}
