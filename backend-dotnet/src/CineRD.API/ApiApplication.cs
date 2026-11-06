using System.Text.Encodings.Web;
using CineRD.API.Endpoints;
using CineRD.API.Json;
using CineRD.Infrastructure;
using Microsoft.AspNetCore.Http.Json;

namespace CineRD.API;

public static class ApiApplication
{
    /// <summary>Construye la aplicación. <paramref name="configurarServicios"/> permite sustituir dependencias en pruebas.</summary>
    public static WebApplication Create(string[] args, Action<IServiceCollection>? configurarServicios = null)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.Services.AddProblemDetails();
        builder.Services.AddHealthChecks();
        builder.Services.AddCineRDInfrastructure(builder.Configuration);

        // Contrato JSON de Express: PascalCase tal cual, fechas SQL DATE como instante UTC, sin escapar acentos.
        builder.Services.Configure<JsonOptions>(o =>
        {
            o.SerializerOptions.PropertyNamingPolicy = null;
            o.SerializerOptions.DictionaryKeyPolicy = null;
            o.SerializerOptions.Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping;
            o.SerializerOptions.Converters.Add(new ExpressDateOnlyConverter());
        });

        configurarServicios?.Invoke(builder.Services);

        var app = builder.Build();
        app.UseExceptionHandler();

        // The local HTTP-only launch profile has no TLS port to redirect to.
        // Production must configure TLS termination and forwarded headers at ingress.
        if (!app.Environment.IsDevelopment())
        {
            app.UseHttpsRedirection();
        }

        app.MapOperationalEndpoints();
        app.MapActoresEndpoints();
        return app;
    }
}
