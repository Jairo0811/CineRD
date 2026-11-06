using System.Text.Encodings.Web;
using CineRD.API.Endpoints;
using CineRD.API.Json;
using CineRD.API.Security;
using CineRD.API.Storage;
using CineRD.Infrastructure;
using Microsoft.AspNetCore.Http.Json;
using Microsoft.Extensions.FileProviders;

namespace CineRD.API;

public static class ApiApplication
{
    /// <summary>Construye la aplicación. <paramref name="configurarServicios"/> permite sustituir dependencias en pruebas.</summary>
    public static WebApplication Create(string[] args, Action<IServiceCollection>? configurarServicios = null)
    {
        var builder = WebApplication.CreateBuilder(args);

        var cors = new CorsOriginPolicy(
            builder.Configuration["FRONTEND_URLS"] is { Length: > 0 } urls ? urls : builder.Configuration["FRONTEND_URL"],
            builder.Environment.IsProduction());
        builder.Services.AddSingleton(cors);
        builder.Services.AddCors();

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

        if (cors.EsProduccion && cors.Configurados == 0)
        {
            app.Logger.LogWarning("FRONTEND_URLS no está definido: la API rechazará todas las peticiones entre orígenes.");
        }

        // Cabeceras de seguridad (las mismas que app.js de Express).
        app.Use(async (context, next) =>
        {
            var h = context.Response.Headers;
            h["X-Content-Type-Options"] = "nosniff";
            h["X-Frame-Options"] = "DENY";
            h["Referrer-Policy"] = "strict-origin-when-cross-origin";
            h["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()";
            h["Cross-Origin-Opener-Policy"] = "same-origin-allow-popups";
            await next();
        });

        // Un origen no permitido recibe 403 antes de ejecutar la ruta (no solo se oculta la respuesta).
        app.Use(async (context, next) =>
        {
            if (cors.IsAllowed(context.Request.Headers.Origin.ToString()))
            {
                await next();
                return;
            }
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            await context.Response.WriteAsJsonAsync(new { mensaje = "Origen no permitido", requestId = context.TraceIdentifier });
        });
        app.UseCors(p => p.SetIsOriginAllowed(origin => cors.IsAllowed(origin)).AllowAnyMethod().AllowAnyHeader().AllowCredentials());

        app.UseExceptionHandler();

        // The local HTTP-only launch profile has no TLS port to redirect to.
        // Production must configure TLS termination and forwarded headers at ingress.
        if (!app.Environment.IsDevelopment())
        {
            app.UseHttpsRedirection();
        }

        MapearUploads(app);

        app.MapOperationalEndpoints();
        app.MapActoresEndpoints();
        app.MapPeliculasEndpoints();
        return app;
    }

    // GET /uploads/**: solo archivos públicos. Nunca se sirve la carpeta privada (evidencias de créditos).
    private static void MapearUploads(WebApplication app)
    {
        var uploadsDir = UploadsLocation.Resolve(app.Configuration["UPLOADS_DIR"], "uploads");
        var privateDir = UploadsLocation.Resolve(app.Configuration["PRIVATE_STORAGE_DIR"], "private");

        if (!UploadsLocation.SonCarpetasSeparadas(uploadsDir, privateDir))
        {
            app.Logger.LogError("UPLOADS_DIR y PRIVATE_STORAGE_DIR se solapan: /uploads queda desactivado por seguridad.");
            return;
        }

        if (!Directory.Exists(uploadsDir))
        {
            app.Logger.LogWarning("La carpeta de medios no existe: /uploads no estará disponible. Defina UPLOADS_DIR.");
            return;
        }

        // Equivalente a dotfiles: "deny" de express.static.
        app.Use(async (context, next) =>
        {
            if (context.Request.Path.StartsWithSegments("/uploads")
                && context.Request.Path.Value!.Split('/').Any(segmento => segmento.StartsWith('.')))
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                await context.Response.WriteAsJsonAsync(new { mensaje = "Acceso denegado" });
                return;
            }
            await next();
        });

        app.UseStaticFiles(new StaticFileOptions
        {
            FileProvider = new PhysicalFileProvider(uploadsDir),
            RequestPath = "/uploads",
            ServeUnknownFileTypes = false,
        });
    }
}
