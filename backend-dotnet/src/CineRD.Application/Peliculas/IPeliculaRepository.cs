using CineRD.Domain.Peliculas;

namespace CineRD.Application.Peliculas;

public interface IPeliculaRepository
{
    Task<IReadOnlyList<PeliculaConConteo>> ListarAsync(PeliculaListQuery query, CancellationToken cancellationToken);

    Task<Pelicula?> ObtenerPorIdAsync(int id, CancellationToken cancellationToken);

    /// <param name="nombrePatron">Patrón LIKE ya construido (%nombre%).</param>
    Task<IReadOnlyList<Pelicula>> ListarPorDirectorAsync(string nombrePatron, CancellationToken cancellationToken);
}
