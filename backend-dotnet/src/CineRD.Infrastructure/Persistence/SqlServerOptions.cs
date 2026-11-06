namespace CineRD.Infrastructure.Persistence;

/// <summary>Configuración de SQL Server. Nunca se registra ni se serializa (contiene secretos).</summary>
public sealed class SqlServerOptions
{
    public const string SectionName = "SqlServer";

    /// <summary>Cadena completa (ConnectionStrings:CineRD). Si existe, tiene prioridad sobre los campos sueltos.</summary>
    public string? ConnectionString { get; set; }

    public string? Server { get; set; }
    public int Port { get; set; } = 1433;
    public string? Database { get; set; }
    public string? User { get; set; }
    public string? Password { get; set; }
    public bool Encrypt { get; set; } = true;
    public bool TrustServerCertificate { get; set; }
    public int ConnectionTimeoutSeconds { get; set; } = 15;
    public int CommandTimeoutSeconds { get; set; } = 30;
    public int MaxPoolSize { get; set; } = 10;
    public int ReadinessTimeoutSeconds { get; set; } = 5;
}
