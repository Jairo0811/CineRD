using System.Data.Common;
using CineRD.Application.Peliculas;
using CineRD.Domain.Peliculas;
using CineRD.Infrastructure.Actores;
using CineRD.Infrastructure.Persistence;
using Microsoft.Extensions.Options;

namespace CineRD.Infrastructure.Peliculas;

public sealed class SqlPeliculaRepository(IDbConnectionFactory fabrica, IOptions<SqlServerOptions> options) : IPeliculaRepository
{
    public async Task<IReadOnlyList<PeliculaConConteo>> ListarAsync(PeliculaListQuery query, CancellationToken cancellationToken)
    {
        var resultado = new List<PeliculaConConteo>();
        await using var lector = await EjecutarAsync(PeliculaSqlBuilder.Listado(query), cancellationToken);
        while (await lector.Lector.ReadAsync(cancellationToken))
        {
            resultado.Add(new PeliculaConConteo(Leer(lector.Lector), lector.Lector.GetInt("CantidadActores")));
        }
        return resultado;
    }

    public async Task<Pelicula?> ObtenerPorIdAsync(int id, CancellationToken cancellationToken)
    {
        await using var lector = await EjecutarAsync(PeliculaSqlBuilder.Detalle(id), cancellationToken);
        return await lector.Lector.ReadAsync(cancellationToken) ? Leer(lector.Lector) : null;
    }

    public async Task<IReadOnlyList<Pelicula>> ListarPorDirectorAsync(string nombrePatron, CancellationToken cancellationToken)
    {
        var resultado = new List<Pelicula>();
        await using var lector = await EjecutarAsync(PeliculaSqlBuilder.PorDirector(nombrePatron), cancellationToken);
        while (await lector.Lector.ReadAsync(cancellationToken)) resultado.Add(Leer(lector.Lector));
        return resultado;
    }

    private async Task<LectorAbierto> EjecutarAsync(SqlConsulta consulta, CancellationToken cancellationToken)
    {
        var conexion = fabrica.CreateConnection();
        try
        {
            await conexion.OpenAsync(cancellationToken);
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
            var lector = await comando.ExecuteReaderAsync(cancellationToken);
            return new LectorAbierto(conexion, comando, lector);
        }
        catch
        {
            await conexion.DisposeAsync();
            throw;
        }
    }

    private static Pelicula Leer(DbDataReader r) => new(
        Id: r.GetInt("Id"),
        TMDbId: r.GetNullableInt("TMDbId"),
        Titulo: r.GetNullableString("Titulo") ?? string.Empty,
        Genero: r.GetNullableString("Genero"),
        Director: r.GetNullableString("Director"),
        Productora: r.GetNullableString("Productora"),
        FechaEstreno: r.GetNullableDate("FechaEstreno"),
        Foto: r.GetNullableString("Foto"),
        Sinopsis: r.GetNullableString("Sinopsis"),
        IdiomaOriginal: r.GetNullableString("IdiomaOriginal"));

    private sealed class LectorAbierto(DbConnection conexion, DbCommand comando, DbDataReader lector) : IAsyncDisposable
    {
        public DbDataReader Lector { get; } = lector;

        public async ValueTask DisposeAsync()
        {
            await Lector.DisposeAsync();
            await comando.DisposeAsync();
            await conexion.DisposeAsync();
        }
    }
}
