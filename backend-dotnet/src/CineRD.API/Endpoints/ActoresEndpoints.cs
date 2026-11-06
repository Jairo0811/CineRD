using CineRD.Application.Abstractions;
using CineRD.Application.Actores;

namespace CineRD.API.Endpoints;

/// <summary>GET /api/actores y GET /api/actores/{id}: mismo contrato que actoresController.js.</summary>
public static class ActoresEndpoints
{
    public static IEndpointRouteBuilder MapActoresEndpoints(this IEndpointRouteBuilder app)
    {
        var grupo = app.MapGroup("/api/actores");

        grupo.MapGet("/", async (
            string? buscar, string? estado, string? anio, string? profesion, string? orden,
            ActorService servicio, ILoggerFactory logs, CancellationToken ct) =>
        {
            try
            {
                var r = await servicio.ListarAsync(buscar, estado, anio, profesion, orden, ct);
                return r.Estado == ResultadoEstado.Ok
                    ? Results.Ok(r.Valor)
                    : Mensaje(StatusCodes.Status400BadRequest, r.Mensaje!);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                return ErrorControlado(ex, logs, "Error al obtener los actores");
            }
        });

        grupo.MapGet("/{id}", async (string id, ActorService servicio, ILoggerFactory logs, CancellationToken ct) =>
        {
            try
            {
                var r = await servicio.ObtenerPorIdAsync(id, ct);
                return r.Estado switch
                {
                    ResultadoEstado.Ok => Results.Ok(r.Valor),
                    ResultadoEstado.NoEncontrado => Mensaje(StatusCodes.Status404NotFound, r.Mensaje!),
                    _ => Mensaje(StatusCodes.Status400BadRequest, r.Mensaje!),
                };
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                return ErrorControlado(ex, logs, "Error al obtener el actor");
            }
        });

        return app;
    }

    // Formato de error del frontend: { mensaje }. A diferencia de Express, no se devuelve error.message.
    private static IResult Mensaje(int codigo, string mensaje) => Results.Json(new { mensaje }, statusCode: codigo);

    private static IResult ErrorControlado(Exception ex, ILoggerFactory logs, string mensaje)
    {
        // Solo el tipo de excepción: los mensajes de SQL Server pueden contener datos de conexión.
        logs.CreateLogger("CineRD.API.Actores").LogError("{Mensaje} ({TipoError}).", mensaje, ex.GetType().Name);
        return ex is DatabaseNotConfiguredException
            ? Mensaje(StatusCodes.Status503ServiceUnavailable, "Base de datos no disponible")
            : Mensaje(StatusCodes.Status500InternalServerError, mensaje);
    }
}
