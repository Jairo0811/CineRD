using System.Text.Json.Serialization;

namespace CineRD.Application.Actores;

/// <summary>Contrato de GET /api/actores/{id}. Los nombres y el orden de propiedades replican el JSON de Express.</summary>
public record ActorDetalleDto
{
    public int Id { get; init; }
    public int? TMDbId { get; init; }
    public string? Nombres { get; init; }
    public string? Apellidos { get; init; }
    public string NombreCompleto { get; init; } = string.Empty;
    public string? NombreArtistico { get; init; }
    public string? Profesion { get; init; }
    public DateOnly? FechaNacimiento { get; init; }
    public int? AnioNacimiento { get; init; }
    public string? Sexo { get; init; }
    public bool EstaVivo { get; init; }
    public DateOnly? FechaFallecimiento { get; init; }
    public string? Foto { get; init; }
    public string? InstagramUrl { get; init; }
    public string? FacebookUrl { get; init; }
    public string? TikTokUrl { get; init; }
    public string? YouTubeUrl { get; init; }
    public string? SpotifyUrl { get; init; }
    public string? XUrl { get; init; }
    public string? SitioWebUrl { get; init; }
    public bool EsVerificado { get; init; }
}

/// <summary>Contrato de cada elemento de GET /api/actores (añade los conteos al final, como Express).</summary>
public sealed record ActorListadoDto : ActorDetalleDto
{
    // System.Text.Json serializa primero las propiedades de la clase derivada; el orden explícito deja los conteos al final.
    [JsonPropertyOrder(1)]
    public int CantidadPeliculas { get; init; }

    [JsonPropertyOrder(2)]
    public int CantidadPeliculasDirigidas { get; init; }
}
