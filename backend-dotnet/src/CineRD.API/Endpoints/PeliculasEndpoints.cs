using CineRD.Application.Actores;
using CineRD.Application.Peliculas;
using static CineRD.API.Endpoints.EndpointResults;

namespace CineRD.API.Endpoints;

/// <summary>Lecturas públicas de películas: mismo contrato que peliculasController.js.</summary>
public static class PeliculasEndpoints
{
    private const string Categoria = "CineRD.API.Peliculas";

    public static IEndpointRouteBuilder MapPeliculasEndpoints(this IEndpointRouteBuilder app)
    {
        var grupo = app.MapGroup("/api/peliculas");

        grupo.MapGet("/", async (string? buscar, string? genero, string? orden,
            PeliculaService servicio, ILoggerFactory logs, CancellationToken ct) =>
        {
            try
            {
                return Results.Ok(await servicio.ListarAsync(buscar, genero, orden, ct));
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                return ErrorControlado(ex, logs, Categoria, "Error al obtener las películas");
            }
        });

        // La ruta literal tiene prioridad sobre /{id}.
        grupo.MapGet("/director/{nombre}", async (string nombre,
            PeliculaService servicio, ILoggerFactory logs, CancellationToken ct) =>
        {
            try
            {
                var r = await servicio.ListarPorDirectorAsync(nombre, ct);
                return r.Estado == ResultadoEstado.Ok ? Results.Ok(r.Valor) : Mensaje(StatusCodes.Status400BadRequest, r.Mensaje!);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                return ErrorControlado(ex, logs, Categoria, "Error al obtener películas dirigidas");
            }
        });

        grupo.MapGet("/{id}", async (string id, PeliculaService servicio, ILoggerFactory logs, CancellationToken ct) =>
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
                return ErrorControlado(ex, logs, Categoria, "Error al obtener la película");
            }
        });

        return app;
    }
}
