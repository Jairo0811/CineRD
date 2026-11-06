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
                lector.GetInt("CantidadPeliculas"),
                lector.GetInt("CantidadPeliculasDirigidas")));
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
        Id: r.GetInt("Id"),
        TMDbId: r.GetNullableInt("TMDbId"),
        Nombres: r.GetNullableString("Nombres"),
        Apellidos: r.GetNullableString("Apellidos"),
        NombreCompleto: r.GetNullableString("NombreCompleto") ?? string.Empty,
        NombreArtistico: r.GetNullableString("NombreArtistico"),
        Profesion: r.GetNullableString("Profesion"),
        FechaNacimiento: r.GetNullableDate("FechaNacimiento"),
        AnioNacimiento: r.GetNullableInt("AnioNacimiento"),
        Sexo: r.GetNullableString("Sexo"),
        EstaVivo: r.GetBool("EstaVivo"),
        FechaFallecimiento: r.GetNullableDate("FechaFallecimiento"),
        Foto: r.GetNullableString("Foto"),
        InstagramUrl: r.GetNullableString("InstagramUrl"),
        FacebookUrl: r.GetNullableString("FacebookUrl"),
        TikTokUrl: r.GetNullableString("TikTokUrl"),
        YouTubeUrl: r.GetNullableString("YouTubeUrl"),
        SpotifyUrl: r.GetNullableString("SpotifyUrl"),
        XUrl: r.GetNullableString("XUrl"),
        SitioWebUrl: r.GetNullableString("SitioWebUrl"),
        EsVerificado: r.GetBool("EsVerificado"));
}
