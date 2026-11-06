using System.Data;
using System.Net;
using System.Text.Json;
using CineRD.Application.Actores;
using CineRD.Application.Peliculas;
using CineRD.Infrastructure.Peliculas;
using CineRD.Infrastructure.Persistence;
using CineRD.Tests.Support;
using Microsoft.Extensions.Options;

namespace CineRD.Tests;

public class PeliculaQueryTests
{
    [Theory]
    [InlineData("estrenoAsc", PeliculaOrden.EstrenoAsc)]
    [InlineData("az", PeliculaOrden.Az)]
    [InlineData("za", PeliculaOrden.Za)]
    [InlineData("masActores", PeliculaOrden.MasActores)]
    [InlineData("menosActores", PeliculaOrden.MenosActores)]
    [InlineData("estrenoDesc", PeliculaOrden.EstrenoDesc)]
    [InlineData("", PeliculaOrden.EstrenoDesc)]
    [InlineData(null, PeliculaOrden.EstrenoDesc)]
    [InlineData("x'; DROP TABLE Peliculas;--", PeliculaOrden.EstrenoDesc)]
    public void OrdenUsaListaBlancaConDefaultEstrenoDesc(string? valor, PeliculaOrden esperado) =>
        Assert.Equal(esperado, PeliculaOrdenParser.Parse(valor));

    [Fact]
    public void FiltrosSeRecortanYVaciosNoFiltran()
    {
        var q = PeliculaListQuery.Crear("  nueba ", " Comedia ", null);
        Assert.Equal("%nueba%", q.BuscarPatron);
        Assert.Equal("Comedia", q.Genero);
        var vacio = PeliculaListQuery.Crear("", null, null);
        Assert.Null(vacio.BuscarPatron);
        Assert.Null(vacio.Genero);
    }

    [Fact]
    public void SoloEspaciosActivaElFiltroComoExpress()
    {
        var q = PeliculaListQuery.Crear("  ", "  ", null);
        Assert.Equal("%%", q.BuscarPatron);
        Assert.Equal("", q.Genero);
    }
}

public class PeliculaSqlBuilderTests
{
    [Theory]
    [InlineData("estrenoAsc", "ORDER BY P.FechaEstreno ASC")]
    [InlineData("az", "ORDER BY P.Titulo ASC")]
    [InlineData("za", "ORDER BY P.Titulo DESC")]
    [InlineData("masActores", "ORDER BY CantidadActores DESC, P.Titulo ASC")]
    [InlineData("menosActores", "ORDER BY CantidadActores ASC, P.Titulo ASC")]
    [InlineData("loquesea", "ORDER BY P.FechaEstreno DESC")]
    public void OrderByViajaDeLaListaBlanca(string orden, string esperado) =>
        Assert.EndsWith(esperado, PeliculaSqlBuilder.Listado(PeliculaListQuery.Crear(null, null, orden)).Texto.TrimEnd());

    [Fact]
    public void ValoresDelUsuarioSoloVanComoParametros()
    {
        const string malicioso = "x'; DROP TABLE Peliculas; --";
        var c = PeliculaSqlBuilder.Listado(PeliculaListQuery.Crear(malicioso, malicioso, null));
        Assert.DoesNotContain("DROP", c.Texto);
        Assert.Contains("P.Genero = @Genero", c.Texto);
        string[] esperados = ["@Buscar", "@Genero"];
        Assert.Equal(esperados, c.Parametros.Select(p => p.Nombre).ToArray());
        Assert.Equal(malicioso, c.Parametros[1].Valor);
    }

    [Fact]
    public void ElTamanoDelParametroNuncaTruncaElValor()
    {
        var largo = new string('a', 300);
        var p = PeliculaSqlBuilder.Listado(PeliculaListQuery.Crear(null, largo, null)).Parametros.Single();
        Assert.Equal(300, p.Tamano);
        Assert.Equal(largo, p.Valor);
    }

    [Fact]
    public void DetalleYDirectorUsanParametros()
    {
        var d = PeliculaSqlBuilder.Detalle(5);
        Assert.Contains("WHERE Id = @Id", d.Texto);
        var dir = PeliculaSqlBuilder.PorDirector("%Muñiz%");
        Assert.Contains("Director LIKE @Nombre", dir.Texto);
        Assert.EndsWith("ORDER BY FechaEstreno DESC", dir.Texto);
        Assert.Equal("%Muñiz%", Assert.Single(dir.Parametros).Valor);
    }
}

public class PeliculaServiceTests
{
    [Fact]
    public async Task ListarMapeaConteoYPasaFiltros()
    {
        var repo = new FakePeliculaRepository();
        repo.Filas.Add(new(Datos.Pelicula(2), 7));
        var lista = await new PeliculaService(repo).ListarAsync("nue", "Comedia", "az", CancellationToken.None);
        Assert.Equal(7, Assert.Single(lista).CantidadActores);
        Assert.Equal(PeliculaOrden.Az, repo.UltimaConsulta!.Orden);
        Assert.Equal("Comedia", repo.UltimaConsulta.Genero);
    }

    [Theory]
    [InlineData("abc")]
    [InlineData("0")]
    [InlineData("-2")]
    [InlineData("1.5")]
    public async Task IdInvalido(string id)
    {
        var repo = new FakePeliculaRepository();
        var r = await new PeliculaService(repo).ObtenerPorIdAsync(id, CancellationToken.None);
        Assert.Equal(ResultadoEstado.Invalido, r.Estado);
        Assert.Equal("El identificador de la película no es válido", r.Mensaje);
        Assert.Null(repo.UltimoId);
    }

    [Fact]
    public async Task InexistenteEsNoEncontrada()
    {
        var r = await new PeliculaService(new FakePeliculaRepository()).ObtenerPorIdAsync("9", CancellationToken.None);
        Assert.Equal(ResultadoEstado.NoEncontrado, r.Estado);
        Assert.Equal("Película no encontrada", r.Mensaje);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task DirectorVacioEsInvalido(string? nombre)
    {
        var repo = new FakePeliculaRepository();
        var r = await new PeliculaService(repo).ListarPorDirectorAsync(nombre, CancellationToken.None);
        Assert.Equal(ResultadoEstado.Invalido, r.Estado);
        Assert.Equal("Debe indicar el nombre del director", r.Mensaje);
        Assert.Null(repo.UltimoPatronDirector);
    }

    [Fact]
    public async Task DirectorSeRecortaYSeEnvuelveEnComodines()
    {
        var repo = new FakePeliculaRepository();
        repo.Filas.Add(new(Datos.Pelicula(), 0));
        var r = await new PeliculaService(repo).ListarPorDirectorAsync("  Muñiz ", CancellationToken.None);
        Assert.Equal(ResultadoEstado.Ok, r.Estado);
        Assert.Equal("%Muñiz%", repo.UltimoPatronDirector);
    }
}

public class SqlPeliculaRepositoryTests
{
    private static DataTable Tabla(bool conConteo)
    {
        var t = new DataTable();
        t.Columns.Add("Id", typeof(int));
        t.Columns.Add("TMDbId", typeof(int));
        foreach (var c in new[] { "Titulo", "Genero", "Director", "Productora" }) t.Columns.Add(c, typeof(string));
        t.Columns.Add("FechaEstreno", typeof(DateTime));
        foreach (var c in new[] { "Foto", "Sinopsis", "IdiomaOriginal" }) t.Columns.Add(c, typeof(string));
        if (conConteo) t.Columns.Add("CantidadActores", typeof(int));
        var r = t.NewRow();
        r["Id"] = 3; r["TMDbId"] = DBNull.Value; r["Titulo"] = "Nueba Yol"; r["Genero"] = "Comedia";
        r["Director"] = "Angel Muñiz"; r["Productora"] = DBNull.Value; r["FechaEstreno"] = new DateTime(1995, 3, 17);
        r["Foto"] = DBNull.Value; r["Sinopsis"] = "texto"; r["IdiomaOriginal"] = "es";
        if (conConteo) r["CantidadActores"] = 12;
        t.Rows.Add(r);
        return t;
    }

    private static SqlPeliculaRepository Repo(FakeConnectionFactory f) =>
        new(f, Options.Create(new SqlServerOptions { CommandTimeoutSeconds = 9 }));

    [Fact]
    public async Task ListarMapeaFilasConConteoYParametros()
    {
        var f = new FakeConnectionFactory(Tabla(true));
        var filas = await Repo(f).ListarAsync(PeliculaListQuery.Crear("nue", "Comedia", "za"), CancellationToken.None);
        var fila = Assert.Single(filas);
        Assert.Equal(12, fila.CantidadActores);
        Assert.Equal(new DateOnly(1995, 3, 17), fila.Pelicula.FechaEstreno);
        Assert.Null(fila.Pelicula.TMDbId);
        Assert.Null(fila.Pelicula.Productora);
        Assert.Equal(9, f.UltimoComando!.CommandTimeout);
        Assert.Contains("ORDER BY P.Titulo DESC", f.UltimoComando.CommandText);
    }

    [Fact]
    public async Task DetalleYDirectorLeenFilas()
    {
        var p = await Repo(new FakeConnectionFactory(Tabla(false))).ObtenerPorIdAsync(3, CancellationToken.None);
        Assert.Equal("Nueba Yol", p!.Titulo);
        Assert.Null(await Repo(new FakeConnectionFactory(new DataTable())).ObtenerPorIdAsync(3, CancellationToken.None) is { } x ? x : null);
        var porDirector = await Repo(new FakeConnectionFactory(Tabla(false))).ListarPorDirectorAsync("%Muñiz%", CancellationToken.None);
        Assert.Single(porDirector);
    }
}

public class PeliculasApiTests
{
    private static readonly string[] Claves =
        ["Id", "TMDbId", "Titulo", "Genero", "Director", "Productora", "FechaEstreno", "Foto", "Sinopsis", "IdiomaOriginal"];

    private static FakePeliculaRepository Repo()
    {
        var r = new FakePeliculaRepository();
        r.Filas.Add(new(Datos.Pelicula(1), 4));
        return r;
    }

    [Fact]
    public async Task ListadoConservaNombresOrdenTiposYFechas()
    {
        await using var api = await ApiHost.StartAsync(Repo());
        var r = await api.Client.GetAsync("/api/peliculas?orden=az&genero=Comedia");
        Assert.Equal(HttpStatusCode.OK, r.StatusCode);
        using var doc = JsonDocument.Parse(await r.Content.ReadAsStringAsync());
        var p = doc.RootElement[0];
        string[] esperadas = [.. Claves, "CantidadActores"];
        Assert.Equal(esperadas, p.EnumerateObject().Select(x => x.Name).ToArray());
        Assert.Equal("1995-03-17T00:00:00.000Z", p.GetProperty("FechaEstreno").GetString());
        Assert.Equal(JsonValueKind.Null, p.GetProperty("TMDbId").ValueKind);
        Assert.Equal(4, p.GetProperty("CantidadActores").GetInt32());
    }

    [Fact]
    public async Task DetalleNoIncluyeConteo()
    {
        await using var api = await ApiHost.StartAsync(Repo());
        var r = await api.Client.GetAsync("/api/peliculas/1");
        Assert.Equal(HttpStatusCode.OK, r.StatusCode);
        using var doc = JsonDocument.Parse(await r.Content.ReadAsStringAsync());
        Assert.Equal(Claves, doc.RootElement.EnumerateObject().Select(x => x.Name).ToArray());
    }

    [Fact]
    public async Task Detalle404Y400ConMensajesDeExpress()
    {
        await using var api = await ApiHost.StartAsync(Repo());
        var no = await api.Client.GetAsync("/api/peliculas/99");
        Assert.Equal(HttpStatusCode.NotFound, no.StatusCode);
        Assert.Contains("Película no encontrada", await no.Content.ReadAsStringAsync());
        var mal = await api.Client.GetAsync("/api/peliculas/abc");
        Assert.Equal(HttpStatusCode.BadRequest, mal.StatusCode);
        Assert.Contains("El identificador de la película no es válido", await mal.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task DirectorTienePrioridadSobreId()
    {
        var repo = Repo();
        await using var api = await ApiHost.StartAsync(repo);
        var r = await api.Client.GetAsync("/api/peliculas/director/Mu%C3%B1iz");
        Assert.Equal(HttpStatusCode.OK, r.StatusCode);
        Assert.Equal("%Muñiz%", repo.UltimoPatronDirector);
        Assert.Null(repo.UltimoId);
    }

    [Fact]
    public async Task DirectorSoloEspaciosDevuelve400()
    {
        await using var api = await ApiHost.StartAsync(Repo());
        var r = await api.Client.GetAsync("/api/peliculas/director/%20%20");
        Assert.Equal(HttpStatusCode.BadRequest, r.StatusCode);
        Assert.Contains("Debe indicar el nombre del director", await r.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task ErrorInternoNoExponeDetalles()
    {
        var repo = Repo();
        repo.Falla = new InvalidOperationException("Login failed for user 'sa'");
        await using var api = await ApiHost.StartAsync(repo);
        foreach (var ruta in new[] { "/api/peliculas", "/api/peliculas/1", "/api/peliculas/director/x" })
        {
            var r = await api.Client.GetAsync(ruta);
            Assert.Equal(HttpStatusCode.InternalServerError, r.StatusCode);
            Assert.DoesNotContain("Login failed", await r.Content.ReadAsStringAsync());
        }
    }
}
