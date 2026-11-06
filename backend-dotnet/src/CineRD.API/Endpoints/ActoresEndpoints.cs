using CineRD.Application.Actores;
using static CineRD.API.Endpoints.EndpointResults;

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
                return ErrorControlado(ex, logs, "CineRD.API.Actores", "Error al obtener los actores");
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
                return ErrorControlado(ex, logs, "CineRD.API.Actores", "Error al obtener el actor");
            }
        });

        return app;
    }
}
