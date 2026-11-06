using System.Text.Json.Serialization;

namespace CineRD.Application.Peliculas;

/// <summary>Contrato de GET /api/peliculas/{id} y /director/{nombre}. Orden y nombres idénticos a Express.</summary>
public record PeliculaDto
{
    public int Id { get; init; }
    public int? TMDbId { get; init; }
    public string Titulo { get; init; } = string.Empty;
    public string? Genero { get; init; }
    public string? Director { get; init; }
    public string? Productora { get; init; }
    public DateOnly? FechaEstreno { get; init; }
    public string? Foto { get; init; }
    public string? Sinopsis { get; init; }
    public string? IdiomaOriginal { get; init; }
}

/// <summary>Elemento de GET /api/peliculas: añade el conteo de actores al final.</summary>
public sealed record PeliculaListadoDto : PeliculaDto
{
    [JsonPropertyOrder(1)]
    public int CantidadActores { get; init; }
}
