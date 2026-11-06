using CineRD.Application.Actores;
using CineRD.Tests.Support;

namespace CineRD.Tests;

public class JsNumberTests
{
    [Theory]
    [InlineData("1", 1)]
    [InlineData(" 7 ", 7)]
    [InlineData("12.0", 12)]
    [InlineData("1e1", 10)]
    public void IdValido(string texto, int esperado)
    {
        Assert.True(JsNumber.TryParsePositiveId(texto, out var id));
        Assert.Equal(esperado, id);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("0")]
    [InlineData("-3")]
    [InlineData("1.5")]
    [InlineData("abc")]
    [InlineData("1; DROP TABLE Actores")]
    [InlineData("2147483648")]
    public void IdInvalido(string? texto) => Assert.False(JsNumber.TryParsePositiveId(texto, out _));

    [Theory]
    [InlineData("1990", 1990)]
    [InlineData("1990abc", 1990)]
    [InlineData(" -5", -5)]
    [InlineData("+12", 12)]
    public void ParseIntComoJavaScript(string texto, int esperado)
    {
        Assert.True(JsNumber.TryParseInt(texto, out var n));
        Assert.Equal(esperado, n);
    }

    [Theory]
    [InlineData("abc")]
    [InlineData("-")]
    [InlineData("99999999999")]
    public void ParseIntInvalido(string texto) => Assert.False(JsNumber.TryParseInt(texto, out _));
}

public class ActorListQueryTests
{
    [Theory]
    [InlineData("az", ActorOrden.Az)]
    [InlineData("za", ActorOrden.Za)]
    [InlineData("masPeliculas", ActorOrden.MasPeliculas)]
    [InlineData("menosPeliculas", ActorOrden.MenosPeliculas)]
    [InlineData("nacimientoReciente", ActorOrden.NacimientoReciente)]
    [InlineData("nacimientoAntiguo", ActorOrden.NacimientoAntiguo)]
    [InlineData("", ActorOrden.Az)]
    [InlineData(null, ActorOrden.Az)]
    [InlineData("Nombre; DROP TABLE Actores", ActorOrden.Az)]
    public void OrdenUsaListaBlancaConDefaultAz(string? valor, ActorOrden esperado) =>
        Assert.Equal(esperado, ActorOrdenParser.Parse(valor));

    [Theory]
    [InlineData("vivo", ActorEstadoFiltro.Vivo)]
    [InlineData("fallecido", ActorEstadoFiltro.Fallecido)]
    [InlineData("otro", ActorEstadoFiltro.Todos)]
    [InlineData(null, ActorEstadoFiltro.Todos)]
    public void EstadoDesconocidoNoFiltra(string? valor, ActorEstadoFiltro esperado) =>
        Assert.Equal(esperado, ActorOrdenParser.ParseEstado(valor));

    [Fact]
    public void BuscarSeRecortaYSeEnvuelveEnComodines() =>
        Assert.Equal("%ana%", ActorListQuery.Crear("  ana ", null, null, null, null).BuscarPatron);

    [Fact]
    public void BuscarSoloEspaciosActivaFiltroComoExpress() =>
        Assert.Equal("%%", ActorListQuery.Crear("   ", null, null, null, null).BuscarPatron);

    [Fact]
    public void BuscarVacioNoFiltra()
    {
        Assert.Null(ActorListQuery.Crear("", null, null, null, null).BuscarPatron);
        Assert.Null(ActorListQuery.Crear(null, null, null, null, null).ProfesionPatron);
    }

    [Fact]
    public void PatronesRespetanLongitudDeParametro()
    {
        var q = ActorListQuery.Crear(new string('a', 400), null, null, new string('b', 400), null);
        Assert.True(q.BuscarPatron!.Length <= ActorListQuery.BuscarMaxLength);
        Assert.True(q.ProfesionPatron!.Length <= ActorListQuery.ProfesionMaxLength);
    }
}

public class ActorServiceTests
{
    [Fact]
    public async Task ListarMapeaConteosYPasaFiltros()
    {
        var repo = new FakeActorRepository();
        repo.Filas.Add(new(Datos.Actor(3), 4, 2));
        var r = await new ActorService(repo).ListarAsync("ana", "vivo", "1990", "actriz", "masPeliculas", CancellationToken.None);

        Assert.Equal(ResultadoEstado.Ok, r.Estado);
        var dto = Assert.Single(r.Valor!);
        Assert.Equal(3, dto.Id);
        Assert.Equal(4, dto.CantidadPeliculas);
        Assert.Equal(2, dto.CantidadPeliculasDirigidas);
        Assert.Equal(1990, repo.UltimaConsulta!.Anio);
        Assert.Equal(ActorOrden.MasPeliculas, repo.UltimaConsulta.Orden);
        Assert.Equal(ActorEstadoFiltro.Vivo, repo.UltimaConsulta.Estado);
    }

    [Fact]
    public async Task AnioNoNumericoEsInvalidoYNoConsultaElRepositorio()
    {
        var repo = new FakeActorRepository();
        var r = await new ActorService(repo).ListarAsync(null, null, "abc", null, null, CancellationToken.None);
        Assert.Equal(ResultadoEstado.Invalido, r.Estado);
        Assert.Null(repo.UltimaConsulta);
    }

    [Theory]
    [InlineData("abc")]
    [InlineData("0")]
    [InlineData("-1")]
    [InlineData("1.5")]
    public async Task IdInvalidoNoConsultaElRepositorio(string id)
    {
        var repo = new FakeActorRepository();
        var r = await new ActorService(repo).ObtenerPorIdAsync(id, CancellationToken.None);
        Assert.Equal(ResultadoEstado.Invalido, r.Estado);
        Assert.Equal("El identificador del actor no es válido", r.Mensaje);
        Assert.Null(repo.UltimoId);
    }

    [Fact]
    public async Task ActorInexistenteEsNoEncontrado()
    {
        var r = await new ActorService(new FakeActorRepository()).ObtenerPorIdAsync("99", CancellationToken.None);
        Assert.Equal(ResultadoEstado.NoEncontrado, r.Estado);
        Assert.Equal("Actor no encontrado", r.Mensaje);
    }

    [Fact]
    public async Task ActorExistenteConservaNulos()
    {
        var repo = new FakeActorRepository();
        repo.Filas.Add(new(Datos.Actor(5), 0, 0));
        var r = await new ActorService(repo).ObtenerPorIdAsync("5", CancellationToken.None);
        Assert.Equal(ResultadoEstado.Ok, r.Estado);
        Assert.Null(r.Valor!.TMDbId);
        Assert.Null(r.Valor.Foto);
        Assert.Equal(new DateOnly(1990, 5, 1), r.Valor.FechaNacimiento);
    }
}
