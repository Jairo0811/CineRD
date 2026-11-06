namespace CineRD.Domain.Actores;

/// <summary>Talento del catálogo (tabla dbo.Actores) con su estado de verificación.</summary>
public sealed record Actor(
    int Id,
    int? TMDbId,
    string? Nombres,
    string? Apellidos,
    string NombreCompleto,
    string? NombreArtistico,
    string? Profesion,
    DateOnly? FechaNacimiento,
    int? AnioNacimiento,
    string? Sexo,
    bool EstaVivo,
    DateOnly? FechaFallecimiento,
    string? Foto,
    string? InstagramUrl,
    string? FacebookUrl,
    string? TikTokUrl,
    string? YouTubeUrl,
    string? SpotifyUrl,
    string? XUrl,
    string? SitioWebUrl,
    bool EsVerificado);

/// <summary>Talento junto con los conteos que muestra el listado público.</summary>
public sealed record ActorConConteos(Actor Actor, int CantidadPeliculas, int CantidadPeliculasDirigidas);
