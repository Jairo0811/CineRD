using System.Data;
using CineRD.Application.Abstractions;
using CineRD.Application.Actores;
using CineRD.Infrastructure.Actores;
using CineRD.Infrastructure.Persistence;
using CineRD.Tests.Support;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;

namespace CineRD.Tests;

public class ActorSqlBuilderTests
{
    private static ActorListQuery Q(string? buscar = null, string? estado = null, int? anio = null, string? prof = null, string? orden = null) =>
        ActorListQuery.Crear(buscar, estado, anio, prof, orden);

    [Theory]
    [InlineData("az", "ORDER BY A.NombreCompleto ASC")]
    [InlineData("za", "ORDER BY A.NombreCompleto DESC")]
    [InlineData("masPeliculas", "ORDER BY CantidadPeliculas DESC, A.NombreCompleto ASC")]
    [InlineData("menosPeliculas", "ORDER BY CantidadPeliculas ASC, A.NombreCompleto ASC")]
    [InlineData("nacimientoReciente", "ORDER BY COALESCE(YEAR(A.FechaNacimiento),A.AnioNacimiento) DESC,A.NombreCompleto ASC")]
    [InlineData("nacimientoAntiguo", "ORDER BY COALESCE(YEAR(A.FechaNacimiento),A.AnioNacimiento) ASC,A.NombreCompleto ASC")]
    [InlineData("'; DROP TABLE Actores; --", "ORDER BY A.NombreCompleto ASC")]
    public void OrderByViajaDeLaListaBlanca(string orden, string esperado)
    {
        var sql = ActorSqlBuilder.Listado(Q(orden: orden)).Texto;
        Assert.EndsWith(esperado, sql.TrimEnd());
        Assert.DoesNotContain("DROP", sql);
    }

    [Fact]
    public void ValoresDelUsuarioSoloVanComoParametros()
    {
        const string malicioso = "x'; DROP TABLE Actores; --";
        var c = ActorSqlBuilder.Listado(Q(buscar: malicioso, anio: 1990, prof: malicioso, estado: "vivo"));

        Assert.DoesNotContain("DROP", c.Texto);
        Assert.Contains("A.Nombres LIKE @Buscar", c.Texto);
        Assert.Contains("A.Profesion LIKE @Profesion", c.Texto);
        Assert.Contains("A.EstaVivo = 1", c.Texto);
        string[] esperados = ["@Buscar", "@Anio", "@Profesion"];
        Assert.Equal(esperados, c.Parametros.Select(p => p.Nombre).ToArray());
        Assert.Equal("%" + malicioso + "%", c.Parametros[0].Valor);
        Assert.Equal(DbType.Int32, c.Parametros[1].Tipo);
        Assert.Equal(1990, c.Parametros[1].Valor);
    }

    [Fact]
    public void SinFiltrosNoHayParametrosNiWhereExtra()
    {
        var c = ActorSqlBuilder.Listado(Q());
        Assert.Empty(c.Parametros);
        Assert.Contains("WHERE 1 = 1 GROUP BY", c.Texto.Replace("\r", "").Replace("\n", " ").Replace("  ", " "));
    }

    [Fact]
    public void EstadoFallecidoFiltraPorCero() =>
        Assert.Contains("A.EstaVivo = 0", ActorSqlBuilder.Listado(Q(estado: "fallecido")).Texto);

    [Fact]
    public void DetalleUsaParametroYExistsDeVerificacion()
    {
        var c = ActorSqlBuilder.Detalle(7);
        Assert.Contains("WHERE A.Id = @Id", c.Texto);
        Assert.Contains("TU.Estado = N'ACTIVO'", c.Texto);
        Assert.DoesNotContain("CantidadPeliculas", c.Texto);
        Assert.Equal(7, Assert.Single(c.Parametros).Valor);
    }
}

public class SqlServerConnectionStringResolverTests
{
    [Fact]
    public void SinConfiguracionDevuelveNull() =>
        Assert.Null(SqlServerConnectionStringResolver.Resolve(new SqlServerOptions()));

    [Fact]
    public void FaltaUnCampoDevuelveNull() =>
        Assert.Null(SqlServerConnectionStringResolver.Resolve(new SqlServerOptions { Server = "s", Database = "d", User = "u" }));

    [Fact]
    public void LaCadenaCompletaTienePrioridad() =>
        Assert.Equal("Server=x;Database=y", SqlServerConnectionStringResolver.Resolve(new SqlServerOptions { ConnectionString = "Server=x;Database=y", Server = "otro" }));

    [Fact]
    public void ArmaLaCadenaYEscapaLaContrasena()
    {
        var cs = SqlServerConnectionStringResolver.Resolve(new SqlServerOptions
        {
            Server = "db.local", Port = 1444, Database = "CineRD", User = "app", Password = "p;a'ss=\"w\"", Encrypt = true,
        })!;
        Assert.Contains("db.local,1444", cs);
        Assert.Contains("Encrypt=True", cs);
        Assert.Contains("TrustServerCertificate=False", cs);

        var lectura = new System.Data.Common.DbConnectionStringBuilder { ConnectionString = cs };
        Assert.Equal("p;a'ss=\"w\"", lectura["Password"]);
    }
}

public class SqlActorRepositoryTests
{
    private static DataTable Tabla(bool conConteos)
    {
        var t = new DataTable();
        t.Columns.Add("Id", typeof(int));
        t.Columns.Add("TMDbId", typeof(int));
        foreach (var c in new[] { "Nombres", "Apellidos", "NombreCompleto", "NombreArtistico", "Profesion" }) t.Columns.Add(c, typeof(string));
        t.Columns.Add("FechaNacimiento", typeof(DateTime));
        t.Columns.Add("AnioNacimiento", typeof(int));
        t.Columns.Add("Sexo", typeof(string));
        t.Columns.Add("EstaVivo", typeof(bool));
        t.Columns.Add("FechaFallecimiento", typeof(DateTime));
        foreach (var c in new[] { "Foto", "InstagramUrl", "FacebookUrl", "TikTokUrl", "YouTubeUrl", "SpotifyUrl", "XUrl", "SitioWebUrl" }) t.Columns.Add(c, typeof(string));
        t.Columns.Add("EsVerificado", typeof(bool));
        if (conConteos)
        {
            t.Columns.Add("CantidadPeliculas", typeof(int));
            t.Columns.Add("CantidadPeliculasDirigidas", typeof(int));
        }
        return t;
    }

    private static void Fila(DataTable t, int id, bool vivo = true)
    {
        var r = t.NewRow();
        r["Id"] = id;
        r["TMDbId"] = DBNull.Value;
        r["Nombres"] = "Ana"; r["Apellidos"] = DBNull.Value; r["NombreCompleto"] = "Ana Pérez";
        r["NombreArtistico"] = DBNull.Value; r["Profesion"] = "Actriz";
        r["FechaNacimiento"] = new DateTime(1990, 5, 1); r["AnioNacimiento"] = DBNull.Value;
        r["Sexo"] = "Femenino"; r["EstaVivo"] = vivo; r["FechaFallecimiento"] = DBNull.Value;
        foreach (var c in new[] { "Foto", "InstagramUrl", "FacebookUrl", "TikTokUrl", "YouTubeUrl", "SpotifyUrl", "XUrl", "SitioWebUrl" }) r[c] = DBNull.Value;
        r["EsVerificado"] = true;
        if (t.Columns.Contains("CantidadPeliculas")) { r["CantidadPeliculas"] = 3; r["CantidadPeliculasDirigidas"] = 1; }
        t.Rows.Add(r);
    }

    private static SqlActorRepository Repo(FakeConnectionFactory f) =>
        new(f, Options.Create(new SqlServerOptions { CommandTimeoutSeconds = 12 }));

    [Fact]
    public async Task ListarMapeaFilasNulosFechasYConteos()
    {
        var tabla = Tabla(true);
        Fila(tabla, 10);
        var fabrica = new FakeConnectionFactory(tabla);

        var filas = await Repo(fabrica).ListarAsync(ActorListQuery.Crear("ana", null, 1990, null, "za"), CancellationToken.None);

        var f = Assert.Single(filas);
        Assert.Equal(10, f.Actor.Id);
        Assert.Null(f.Actor.TMDbId);
        Assert.Null(f.Actor.Apellidos);
        Assert.Equal(new DateOnly(1990, 5, 1), f.Actor.FechaNacimiento);
        Assert.Null(f.Actor.FechaFallecimiento);
        Assert.True(f.Actor.EsVerificado);
        Assert.Equal(3, f.CantidadPeliculas);
        Assert.Equal(1, f.CantidadPeliculasDirigidas);

        var cmd = fabrica.UltimoComando!;
        Assert.Equal(12, cmd.CommandTimeout);
        Assert.Contains("ORDER BY A.NombreCompleto DESC", cmd.CommandText);
        var nombres = cmd.Parameters.Cast<System.Data.Common.DbParameter>().Select(p => p.ParameterName).ToArray();
        string[] esperados = ["@Buscar", "@Anio"];
        Assert.Equal(esperados, nombres);
    }

    [Fact]
    public async Task ObtenerPorIdDevuelveElActorOnull()
    {
        var tabla = Tabla(false);
        Fila(tabla, 4, vivo: false);
        var actor = await Repo(new FakeConnectionFactory(tabla)).ObtenerPorIdAsync(4, CancellationToken.None);
        Assert.NotNull(actor);
        Assert.False(actor!.EstaVivo);

        var vacio = await Repo(new FakeConnectionFactory(Tabla(false))).ObtenerPorIdAsync(4, CancellationToken.None);
        Assert.Null(vacio);
    }
}

public class SqlDatabaseReadinessTests
{
    private static SqlDatabaseReadiness Crear(IDbConnectionFactory f) =>
        new(f, Options.Create(new SqlServerOptions { ReadinessTimeoutSeconds = 2 }), NullLogger<SqlDatabaseReadiness>.Instance);

    [Fact]
    public async Task ConConexionValidaEstaListo() =>
        Assert.Equal(DatabaseReadinessStatus.Ready, await Crear(new FakeConnectionFactory(new DataTable())).CheckAsync(CancellationToken.None));

    [Fact]
    public async Task SinConfigurarEsNotConfigured() =>
        Assert.Equal(DatabaseReadinessStatus.NotConfigured,
            await Crear(new ThrowingConnectionFactory(new DatabaseNotConfiguredException())).CheckAsync(CancellationToken.None));

    [Fact]
    public async Task ErrorDeConexionEsUnavailable() =>
        Assert.Equal(DatabaseReadinessStatus.Unavailable, await Crear(new UnreachableConnectionFactory()).CheckAsync(CancellationToken.None));

    [Fact]
    public async Task FabricaQueFallaEsUnavailable() =>
        Assert.Equal(DatabaseReadinessStatus.Unavailable,
            await Crear(new ThrowingConnectionFactory(new TimeoutException("boom"))).CheckAsync(CancellationToken.None));
}
