using CineRD.API;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddProblemDetails();
builder.Services.AddHealthChecks();

var app = builder.Build();
app.UseExceptionHandler();

// The local HTTP-only launch profile has no TLS port to redirect to.
// Production must configure TLS termination and forwarded headers at ingress.
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.MapGet("/", () => Results.Ok(new { mensaje = "API de CineRD funcionando correctamente" }));
app.MapGet("/health", (HttpContext context) =>
    Results.Ok(new { status = "ok", service = "cinerd-api", requestId = context.TraceIdentifier }));

// Do not claim database readiness until SQL Server connectivity is implemented.
app.MapGet("/ready", () =>
    Results.Json(new { status = "not-ready", database = "not-configured" }, statusCode: 503));

app.Run();

public partial class Program;
