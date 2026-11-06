using System.Data.Common;
using CineRD.Application.Actores;
using CineRD.Domain.Actores;
using CineRD.Infrastructure.Persistence;
using Microsoft.Extensions.Options;

namespace CineRD.Infrastructure.Actores;

/// <summary>Repositorio de solo lectura sobre System.Data.Common (el proveedor SQL vive en la fábrica de conexiones).</summary>
public sealed class SqlActorRepository(IDbConnectionFactory fabrica, IOptions<SqlServerOptions> options) : IActorRepository
{
    public async Task<IReadOnlyList<ActorConConteos>> ListarAsync(ActorListQuery query, CancellationToken cancellationToken)
    {
        var consulta = ActorSqlBuilder.Listado(query);
        var resultado = new List<ActorConConteos>();

        await using var conexion = fabrica.CreateConnection();
        await conexion.OpenAsync(cancellationToken);
        await using var comando = Preparar(conexion, consulta);
        await using var lector = await comando.ExecuteReaderAsync(cancellationToken);
        while (await lector.ReadAsync(cancellationToken))
        {
            resultado.Add(new ActorConConteos(
                LeerActor(lector),
                lector.GetInt32(lector.GetOrdinal("CantidadPeliculas")),
                lector.GetInt32(lector.GetOrdinal("CantidadPeliculasDirigidas"))));
        }
        return resultado;
    }

    public async Task<Actor?> ObtenerPorIdAsync(int id, CancellationToken cancellationToken)
    {
        var consulta = ActorSqlBuilder.Detalle(id);

        await using var conexion = fabrica.CreateConnection();
        await conexion.OpenAsync(cancellationToken);
        await using var comando = Preparar(conexion, consulta);
        await using var lector = await comando.ExecuteReaderAsync(cancellationToken);
        return await lector.ReadAsync(cancellationToken) ? LeerActor(lector) : null;
    }

    private DbCommand Preparar(DbConnection conexion, SqlConsulta consulta)
    {
        var comando = conexion.CreateCommand();
        comando.CommandText = consulta.Texto;
        comando.CommandTimeout = Math.Max(1, options.Value.CommandTimeoutSeconds);
        foreach (var p in consulta.Parametros)
        {
            var parametro = comando.CreateParameter();
            parametro.ParameterName = p.Nombre;
            parametro.DbType = p.Tipo;
            if (p.Tamano is { } tamano) parametro.Size = tamano;
            parametro.Value = p.Valor;
            comando.Parameters.Add(parametro);
        }
        return comando;
    }

    private static Actor LeerActor(DbDataReader r) => new(
        Id: r.GetInt32(r.GetOrdinal("Id")),
        TMDbId: Entero(r, "TMDbId"),
        Nombres: Texto(r, "Nombres"),
        Apellidos: Texto(r, "Apellidos"),
        NombreCompleto: Texto(r, "NombreCompleto") ?? string.Empty,
        NombreArtistico: Texto(r, "NombreArtistico"),
        Profesion: Texto(r, "Profesion"),
        FechaNacimiento: Fecha(r, "FechaNacimiento"),
        AnioNacimiento: Entero(r, "AnioNacimiento"),
        Sexo: Texto(r, "Sexo"),
        EstaVivo: r.GetBoolean(r.GetOrdinal("EstaVivo")),
        FechaFallecimiento: Fecha(r, "FechaFallecimiento"),
        Foto: Texto(r, "Foto"),
        InstagramUrl: Texto(r, "InstagramUrl"),
        FacebookUrl: Texto(r, "FacebookUrl"),
        TikTokUrl: Texto(r, "TikTokUrl"),
        YouTubeUrl: Texto(r, "YouTubeUrl"),
        SpotifyUrl: Texto(r, "SpotifyUrl"),
        XUrl: Texto(r, "XUrl"),
        SitioWebUrl: Texto(r, "SitioWebUrl"),
        EsVerificado: r.GetBoolean(r.GetOrdinal("EsVerificado")));

    private static string? Texto(DbDataReader r, string columna)
    {
        var i = r.GetOrdinal(columna);
        return r.IsDBNull(i) ? null : r.GetString(i);
    }

    private static int? Entero(DbDataReader r, string columna)
    {
        var i = r.GetOrdinal(columna);
        return r.IsDBNull(i) ? null : r.GetInt32(i);
    }

    private static DateOnly? Fecha(DbDataReader r, string columna)
    {
        var i = r.GetOrdinal(columna);
        return r.IsDBNull(i) ? null : DateOnly.FromDateTime(r.GetDateTime(i));
    }
}
