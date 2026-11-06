using CineRD.Application.Actores;
using CineRD.Domain.Peliculas;

namespace CineRD.Application.Peliculas;

/// <summary>Casos de uso de consulta de películas (solo lectura).</summary>
public sealed class PeliculaService(IPeliculaRepository repositorio)
{
    public const string MensajeIdInvalido = "El identificador de la película no es válido";
    public const string MensajeNoEncontrada = "Película no encontrada";
    public const string MensajeDirectorRequerido = "Debe indicar el nombre del director";

    public async Task<IReadOnlyList<PeliculaListadoDto>> ListarAsync(
        string? buscar, string? genero, string? orden, CancellationToken cancellationToken)
    {
        var filas = await repositorio.ListarAsync(PeliculaListQuery.Crear(buscar, genero, orden), cancellationToken);
        return filas.Select(f => Mapear(f.Pelicula, f.CantidadActores)).ToList();
    }

    public async Task<ResultadoConsulta<PeliculaDto>> ObtenerPorIdAsync(string? id, CancellationToken cancellationToken)
    {
        if (!JsNumber.TryParsePositiveId(id, out var peliculaId))
        {
            return ResultadoConsulta<PeliculaDto>.Invalido(MensajeIdInvalido);
        }

        var pelicula = await repositorio.ObtenerPorIdAsync(peliculaId, cancellationToken);
        return pelicula is null
            ? ResultadoConsulta<PeliculaDto>.NoEncontrado(MensajeNoEncontrada)
            : ResultadoConsulta<PeliculaDto>.Ok(Mapear(pelicula));
    }

    public async Task<ResultadoConsulta<IReadOnlyList<PeliculaDto>>> ListarPorDirectorAsync(
        string? nombre, CancellationToken cancellationToken)
    {
        var recortado = nombre?.Trim();
        if (string.IsNullOrEmpty(recortado))
        {
            return ResultadoConsulta<IReadOnlyList<PeliculaDto>>.Invalido(MensajeDirectorRequerido);
        }

        var filas = await repositorio.ListarPorDirectorAsync($"%{recortado}%", cancellationToken);
        IReadOnlyList<PeliculaDto> dtos = filas.Select(Mapear).ToList();
        return ResultadoConsulta<IReadOnlyList<PeliculaDto>>.Ok(dtos);
    }

    private static PeliculaDto Mapear(Pelicula p) => new()
    {
        Id = p.Id, TMDbId = p.TMDbId, Titulo = p.Titulo, Genero = p.Genero, Director = p.Director,
        Productora = p.Productora, FechaEstreno = p.FechaEstreno, Foto = p.Foto, Sinopsis = p.Sinopsis,
        IdiomaOriginal = p.IdiomaOriginal,
    };

    private static PeliculaListadoDto Mapear(Pelicula p, int cantidadActores) => new()
    {
        Id = p.Id, TMDbId = p.TMDbId, Titulo = p.Titulo, Genero = p.Genero, Director = p.Director,
        Productora = p.Productora, FechaEstreno = p.FechaEstreno, Foto = p.Foto, Sinopsis = p.Sinopsis,
        IdiomaOriginal = p.IdiomaOriginal, CantidadActores = cantidadActores,
    };
}
