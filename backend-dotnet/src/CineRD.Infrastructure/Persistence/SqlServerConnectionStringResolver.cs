using System.Data.Common;

namespace CineRD.Infrastructure.Persistence;

public static class SqlServerConnectionStringResolver
{
    /// <summary>Devuelve la cadena de conexión o null si SQL Server no está configurado.</summary>
    public static string? Resolve(SqlServerOptions options)
    {
        if (!string.IsNullOrWhiteSpace(options.ConnectionString)) return options.ConnectionString;

        if (string.IsNullOrWhiteSpace(options.Server)
            || string.IsNullOrWhiteSpace(options.Database)
            || string.IsNullOrWhiteSpace(options.User)
            || string.IsNullOrEmpty(options.Password))
        {
            return null;
        }

        // DbConnectionStringBuilder escapa correctamente valores con ';' o comillas.
        var builder = new DbConnectionStringBuilder
        {
            ["Data Source"] = $"{options.Server.Trim()},{options.Port}",
            ["Initial Catalog"] = options.Database.Trim(),
            ["User ID"] = options.User,
            ["Password"] = options.Password,
            ["Encrypt"] = options.Encrypt ? "True" : "False",
            ["TrustServerCertificate"] = options.TrustServerCertificate ? "True" : "False",
            ["Connect Timeout"] = Math.Max(1, options.ConnectionTimeoutSeconds).ToString(System.Globalization.CultureInfo.InvariantCulture),
            ["Max Pool Size"] = Math.Max(1, options.MaxPoolSize).ToString(System.Globalization.CultureInfo.InvariantCulture),
            ["Application Name"] = "CineRD.API",
        };
        return builder.ConnectionString;
    }
}
