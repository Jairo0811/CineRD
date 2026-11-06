using CineRD.Domain.Actores;

namespace CineRD.Application.Actores;

public static class ActorMapper
{
    public static ActorDetalleDto ToDetalle(Actor a) => new()
    {
        Id = a.Id, TMDbId = a.TMDbId, Nombres = a.Nombres, Apellidos = a.Apellidos,
        NombreCompleto = a.NombreCompleto, NombreArtistico = a.NombreArtistico, Profesion = a.Profesion,
        FechaNacimiento = a.FechaNacimiento, AnioNacimiento = a.AnioNacimiento, Sexo = a.Sexo,
        EstaVivo = a.EstaVivo, FechaFallecimiento = a.FechaFallecimiento, Foto = a.Foto,
        InstagramUrl = a.InstagramUrl, FacebookUrl = a.FacebookUrl, TikTokUrl = a.TikTokUrl,
        YouTubeUrl = a.YouTubeUrl, SpotifyUrl = a.SpotifyUrl, XUrl = a.XUrl, SitioWebUrl = a.SitioWebUrl,
        EsVerificado = a.EsVerificado,
    };

    public static ActorListadoDto ToListado(ActorConConteos c)
    {
        var a = c.Actor;
        return new ActorListadoDto
        {
            Id = a.Id, TMDbId = a.TMDbId, Nombres = a.Nombres, Apellidos = a.Apellidos,
            NombreCompleto = a.NombreCompleto, NombreArtistico = a.NombreArtistico, Profesion = a.Profesion,
            FechaNacimiento = a.FechaNacimiento, AnioNacimiento = a.AnioNacimiento, Sexo = a.Sexo,
            EstaVivo = a.EstaVivo, FechaFallecimiento = a.FechaFallecimiento, Foto = a.Foto,
            InstagramUrl = a.InstagramUrl, FacebookUrl = a.FacebookUrl, TikTokUrl = a.TikTokUrl,
            YouTubeUrl = a.YouTubeUrl, SpotifyUrl = a.SpotifyUrl, XUrl = a.XUrl, SitioWebUrl = a.SitioWebUrl,
            EsVerificado = a.EsVerificado,
            CantidadPeliculas = c.CantidadPeliculas,
            CantidadPeliculasDirigidas = c.CantidadPeliculasDirigidas,
        };
    }
}
