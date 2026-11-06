using System.Data;
using CineRD.Application.Peliculas;
using CineRD.Infrastructure.Actores;

namespace CineRD.Infrastructure.Peliculas;

/// <summary>SQL de lectura de películas (réplica de peliculasController.js). Valores solo como parámetros; ORDER BY de lista blanca.</summary>
public static class PeliculaSqlBuilder
{
    private const string Columnas = "Id, TMDbId, Titulo, Genero, Director, Productora, FechaEstreno, Foto, Sinopsis, IdiomaOriginal";

    private static string OrderBy(PeliculaOrden orden) => orden switch
    {
        PeliculaOrden.EstrenoAsc => "ORDER BY P.FechaEstreno ASC",
        PeliculaOrden.Az => "ORDER BY P.Titulo ASC",
        PeliculaOrden.Za => "ORDER BY P.Titulo DESC",
        PeliculaOrden.MasActores => "ORDER BY CantidadActores DESC, P.Titulo ASC",
        PeliculaOrden.MenosActores => "ORDER BY CantidadActores ASC, P.Titulo ASC",
        _ => "ORDER BY P.FechaEstreno DESC",
    };

    // El tamaño del parámetro acompaña a la longitud del valor para no truncarlo (un valor más largo que la columna simplemente no coincide).
    private static int Tamano(string valor) => Math.Clamp(valor.Length, 1, 4000);

    public static SqlConsulta Listado(PeliculaListQuery q)
    {
        var sql = new System.Text.StringBuilder(
            """
            SELECT
              P.Id, P.TMDbId, P.Titulo, P.Genero, P.Director, P.Productora,
              P.FechaEstreno, P.Foto, P.Sinopsis, P.IdiomaOriginal,
              COUNT(AP.ActorId) AS CantidadActores
            FROM Peliculas P
            LEFT JOIN ActoresPeliculas AP ON P.Id = AP.PeliculaId
            WHERE 1 = 1
            """);
        var parametros = new List<SqlParametro>();

        if (q.BuscarPatron is not null)
        {
            sql.Append(" AND (P.Titulo LIKE @Buscar OR P.Director LIKE @Buscar OR P.Productora LIKE @Buscar)");
            parametros.Add(new SqlParametro("@Buscar", DbType.String, Tamano(q.BuscarPatron), q.BuscarPatron));
        }

        if (q.Genero is not null)
        {
            sql.Append(" AND P.Genero = @Genero");
            parametros.Add(new SqlParametro("@Genero", DbType.String, Tamano(q.Genero), q.Genero));
        }

        sql.Append(" GROUP BY P.Id, P.TMDbId, P.Titulo, P.Genero, P.Director, P.Productora, P.FechaEstreno, P.Foto, P.Sinopsis, P.IdiomaOriginal ");
        sql.Append(OrderBy(q.Orden));
        return new SqlConsulta(sql.ToString(), parametros);
    }

    public static SqlConsulta Detalle(int id) => new(
        $"SELECT {Columnas} FROM Peliculas WHERE Id = @Id",
        [new SqlParametro("@Id", DbType.Int32, null, id)]);

    public static SqlConsulta PorDirector(string nombrePatron) => new(
        $"SELECT {Columnas} FROM Peliculas WHERE Director LIKE @Nombre ORDER BY FechaEstreno DESC",
        [new SqlParametro("@Nombre", DbType.String, Tamano(nombrePatron), nombrePatron)]);
}
