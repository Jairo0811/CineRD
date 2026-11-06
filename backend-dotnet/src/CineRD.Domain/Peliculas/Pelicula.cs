namespace CineRD.Domain.Peliculas;

/// <summary>Película del catálogo (tabla dbo.Peliculas), con las columnas que expone la API pública.</summary>
public sealed record Pelicula(
    int Id,
    int? TMDbId,
    string Titulo,
    string? Genero,
    string? Director,
    string? Productora,
    DateOnly? FechaEstreno,
    string? Foto,
    string? Sinopsis,
    string? IdiomaOriginal);

public sealed record PeliculaConConteo(Pelicula Pelicula, int CantidadActores);
