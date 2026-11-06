namespace CineRD.Application.Actores;

public enum ResultadoEstado
{
    Ok,
    Invalido,
    NoEncontrado,
}

public sealed record ResultadoConsulta<T>(ResultadoEstado Estado, T? Valor, string? Mensaje)
{
    public static ResultadoConsulta<T> Ok(T valor) => new(ResultadoEstado.Ok, valor, null);
    public static ResultadoConsulta<T> Invalido(string mensaje) => new(ResultadoEstado.Invalido, default, mensaje);
    public static ResultadoConsulta<T> NoEncontrado(string mensaje) => new(ResultadoEstado.NoEncontrado, default, mensaje);
}

/// <summary>Casos de uso de consulta de talentos (solo lectura).</summary>
public sealed class ActorService(IActorRepository repositorio)
{
    public const string MensajeIdInvalido = "El identificador del actor no es válido";
    public const string MensajeNoEncontrado = "Actor no encontrado";
    public const string MensajeAnioInvalido = "El año de nacimiento no es válido";

    public async Task<ResultadoConsulta<IReadOnlyList<ActorListadoDto>>> ListarAsync(
        string? buscar, string? estado, string? anio, string? profesion, string? orden,
        CancellationToken cancellationToken)
    {
        int? anioFiltro = null;
        if (!string.IsNullOrEmpty(anio))
        {
            if (!JsNumber.TryParseInt(anio, out var valor))
            {
                return ResultadoConsulta<IReadOnlyList<ActorListadoDto>>.Invalido(MensajeAnioInvalido);
            }
            anioFiltro = valor;
        }

        var query = ActorListQuery.Crear(buscar, estado, anioFiltro, profesion, orden);
        var filas = await repositorio.ListarAsync(query, cancellationToken);
        IReadOnlyList<ActorListadoDto> dtos = filas.Select(ActorMapper.ToListado).ToList();
        return ResultadoConsulta<IReadOnlyList<ActorListadoDto>>.Ok(dtos);
    }

    public async Task<ResultadoConsulta<ActorDetalleDto>> ObtenerPorIdAsync(string? id, CancellationToken cancellationToken)
    {
        if (!JsNumber.TryParsePositiveId(id, out var actorId))
        {
            return ResultadoConsulta<ActorDetalleDto>.Invalido(MensajeIdInvalido);
        }

        var actor = await repositorio.ObtenerPorIdAsync(actorId, cancellationToken);
        return actor is null
            ? ResultadoConsulta<ActorDetalleDto>.NoEncontrado(MensajeNoEncontrado)
            : ResultadoConsulta<ActorDetalleDto>.Ok(ActorMapper.ToDetalle(actor));
    }
}
