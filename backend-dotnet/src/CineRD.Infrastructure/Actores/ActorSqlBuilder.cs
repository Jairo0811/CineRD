using System.Data;
using CineRD.Application.Actores;

namespace CineRD.Infrastructure.Actores;

public sealed record SqlParametro(string Nombre, DbType Tipo, int? Tamano, object Valor);

public sealed record SqlConsulta(string Texto, IReadOnlyList<SqlParametro> Parametros);

/// <summary>
/// Construye el SQL de lectura de talentos. Los valores del usuario viajan solo como parámetros;
/// el ORDER BY sale de una lista blanca. El texto replica las consultas de actoresController.js.
/// </summary>
public static class ActorSqlBuilder
{
    private const string ColumnasListado =
        "A.Id,A.TMDbId,A.Nombres,A.Apellidos,A.NombreCompleto,A.NombreArtistico,A.Profesion," +
        "A.FechaNacimiento,A.AnioNacimiento,A.Sexo,A.EstaVivo,A.FechaFallecimiento,A.Foto," +
        "A.InstagramUrl,A.FacebookUrl,A.TikTokUrl,A.YouTubeUrl,A.SpotifyUrl,A.XUrl,A.SitioWebUrl";

    private const string SelectListado = $"""
        SELECT {ColumnasListado},
               CAST(CASE WHEN TV.ActorId IS NULL THEN 0 ELSE 1 END AS bit) AS EsVerificado,
               COUNT(AP.PeliculaId) AS CantidadPeliculas,
               (
                 SELECT COUNT(*)
                 FROM Peliculas PD
                 WHERE LOWER(LTRIM(RTRIM(PD.Director))) = LOWER(LTRIM(RTRIM(A.NombreCompleto)))
                    OR (
                      A.NombreArtistico IS NOT NULL
                      AND LOWER(LTRIM(RTRIM(PD.Director))) = LOWER(LTRIM(RTRIM(A.NombreArtistico)))
                    )
               ) AS CantidadPeliculasDirigidas
        FROM Actores A
        LEFT JOIN ActoresPeliculas AP ON A.Id = AP.ActorId
        LEFT JOIN (
          SELECT DISTINCT ActorId
          FROM TalentosUsuarios
          WHERE Estado = N'ACTIVO'
        ) TV ON TV.ActorId = A.Id
        WHERE 1 = 1
        """;

    // Lista blanca: única fuente de fragmentos ORDER BY.
    private static string OrderBy(ActorOrden orden) => orden switch
    {
        ActorOrden.Za => "ORDER BY A.NombreCompleto DESC",
        ActorOrden.MasPeliculas => "ORDER BY CantidadPeliculas DESC, A.NombreCompleto ASC",
        ActorOrden.MenosPeliculas => "ORDER BY CantidadPeliculas ASC, A.NombreCompleto ASC",
        ActorOrden.NacimientoReciente => "ORDER BY COALESCE(YEAR(A.FechaNacimiento),A.AnioNacimiento) DESC,A.NombreCompleto ASC",
        ActorOrden.NacimientoAntiguo => "ORDER BY COALESCE(YEAR(A.FechaNacimiento),A.AnioNacimiento) ASC,A.NombreCompleto ASC",
        _ => "ORDER BY A.NombreCompleto ASC",
    };

    public static SqlConsulta Listado(ActorListQuery q)
    {
        var sql = new System.Text.StringBuilder(SelectListado);
        var parametros = new List<SqlParametro>();

        if (q.BuscarPatron is not null)
        {
            sql.Append(" AND (A.Nombres LIKE @Buscar OR A.Apellidos LIKE @Buscar OR A.NombreCompleto LIKE @Buscar OR A.NombreArtistico LIKE @Buscar OR A.Profesion LIKE @Buscar)");
            parametros.Add(new SqlParametro("@Buscar", DbType.String, ActorListQuery.BuscarMaxLength, q.BuscarPatron));
        }

        if (q.Estado == ActorEstadoFiltro.Vivo) sql.Append(" AND A.EstaVivo = 1");
        if (q.Estado == ActorEstadoFiltro.Fallecido) sql.Append(" AND A.EstaVivo = 0");

        if (q.Anio is { } anio)
        {
            sql.Append(" AND (YEAR(A.FechaNacimiento) = @Anio OR A.AnioNacimiento = @Anio)");
            parametros.Add(new SqlParametro("@Anio", DbType.Int32, null, anio));
        }

        if (q.ProfesionPatron is not null)
        {
            sql.Append(" AND A.Profesion LIKE @Profesion");
            parametros.Add(new SqlParametro("@Profesion", DbType.String, ActorListQuery.ProfesionMaxLength, q.ProfesionPatron));
        }

        sql.Append(" GROUP BY A.Id,A.TMDbId,A.Nombres,A.Apellidos,A.NombreCompleto,A.NombreArtistico,A.Profesion,A.FechaNacimiento,A.AnioNacimiento,A.Sexo,A.EstaVivo,A.FechaFallecimiento,A.Foto,A.InstagramUrl,A.FacebookUrl,A.TikTokUrl,A.YouTubeUrl,A.SpotifyUrl,A.XUrl,A.SitioWebUrl,TV.ActorId ");
        sql.Append(OrderBy(q.Orden));

        return new SqlConsulta(sql.ToString(), parametros);
    }

    public static SqlConsulta Detalle(int id) => new(
        $"""
        SELECT {ColumnasListado},
               CAST(CASE WHEN EXISTS (
                 SELECT 1 FROM dbo.TalentosUsuarios TU
                 WHERE TU.ActorId = A.Id AND TU.Estado = N'ACTIVO'
               ) THEN 1 ELSE 0 END AS bit) AS EsVerificado
        FROM Actores A
        WHERE A.Id = @Id
        """,
        [new SqlParametro("@Id", DbType.Int32, null, id)]);
}
