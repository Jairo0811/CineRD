using CineRD.API;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddProblemDetails();
builder.Services.AddHealthChecks();

var app = builder.Build();
app.UseExceptionHandler();
app.UseHttpsRedirection();

app.MapGet("/", () => Results.Ok(new { mensaje = "API de CineRD funcionando correctamente" }));
app.MapGet("/health", (HttpContext context) =>
    Results.Ok(new { status = "ok", service = "cinerd-api", requestId = context.TraceIdentifier }));

// Do not claim database readiness until SQL Server connectivity is implemented.
app.MapGet("/ready", () =>
    Results.Json(new { status = "not-ready", database = "not-configured" }, statusCode: 503));

app.Run();

public partial class Program;
