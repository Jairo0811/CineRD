using CineRD.Application.Abstractions;

namespace CineRD.API.Endpoints;

public static class OperationalEndpoints
{
    public static IEndpointRouteBuilder MapOperationalEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/", () => Results.Ok(new { mensaje = "API de CineRD funcionando correctamente" }));

        app.MapGet("/health", (HttpContext context) =>
            Results.Ok(new { status = "ok", service = "cinerd-api", requestId = context.TraceIdentifier }));

        app.MapGet("/ready", async (HttpContext context, IDatabaseReadiness readiness, CancellationToken ct) =>
        {
            var estado = await readiness.CheckAsync(ct);
            return estado switch
            {
                DatabaseReadinessStatus.Ready =>
                    Results.Json(new { status = "ready", database = "ok", requestId = context.TraceIdentifier }),
                DatabaseReadinessStatus.NotConfigured =>
                    Results.Json(new { status = "not-ready", database = "not-configured", requestId = context.TraceIdentifier }, statusCode: 503),
                _ =>
                    Results.Json(new { status = "not-ready", database = "unavailable", requestId = context.TraceIdentifier }, statusCode: 503),
            };
        });

        return app;
    }
}
