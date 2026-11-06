using CineRD.Application.Abstractions;
using CineRD.Application.Actores;
using CineRD.Infrastructure.Actores;
using CineRD.Infrastructure.Persistence;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CineRD.Infrastructure;

public static class DependencyInjection
{
    /// <summary>
    /// Orden de configuración (de menor a mayor prioridad): sección "SqlServer", variables DB_* del backend Express,
    /// y ConnectionStrings:CineRD (variable ConnectionStrings__CineRD o User Secrets).
    /// </summary>
    public static IServiceCollection AddCineRDInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var opciones = new SqlServerOptions();
        configuration.GetSection(SqlServerOptions.SectionName).Bind(opciones);
        AplicarVariablesExpress(configuration, opciones);

        var cadena = configuration.GetConnectionString("CineRD");
        if (!string.IsNullOrWhiteSpace(cadena)) opciones.ConnectionString = cadena;

        services.AddSingleton(Microsoft.Extensions.Options.Options.Create(opciones));
        services.AddSingleton<IDbConnectionFactory, SqlServerConnectionFactory>();
        services.AddSingleton<IDatabaseReadiness, SqlDatabaseReadiness>();
        services.AddScoped<IActorRepository, SqlActorRepository>();
        services.AddScoped<ActorService>();
        return services;
    }

    // Permite reutilizar el mismo .env/variables que el backend Express (DB_SERVER, DB_USER, ...).
    private static void AplicarVariablesExpress(IConfiguration c, SqlServerOptions o)
    {
        o.Server = Pick(c["DB_SERVER"], o.Server);
        o.Database = Pick(c["DB_DATABASE"], o.Database);
        o.User = Pick(c["DB_USER"], o.User);
        o.Password = Pick(c["DB_PASSWORD"], o.Password);
        if (int.TryParse(c["DB_PORT"], out var puerto)) o.Port = puerto;
        if (bool.TryParse(c["DB_ENCRYPT"], out var cifrar)) o.Encrypt = cifrar;
        if (bool.TryParse(c["DB_TRUST_CERT"], out var confiar)) o.TrustServerCertificate = confiar;
        if (int.TryParse(c["DB_POOL_MAX"], out var pool)) o.MaxPoolSize = pool;
        if (int.TryParse(c["DB_CONNECTION_TIMEOUT_MS"], out var ct)) o.ConnectionTimeoutSeconds = Math.Max(1, ct / 1000);
        if (int.TryParse(c["DB_REQUEST_TIMEOUT_MS"], out var rt)) o.CommandTimeoutSeconds = Math.Max(1, rt / 1000);
    }

    private static string? Pick(string? preferido, string? actual) =>
        string.IsNullOrWhiteSpace(preferido) ? actual : preferido;
}
