namespace CineRD.Application.Abstractions;

/// <summary>Se lanza cuando se necesita SQL Server pero no hay cadena de conexión configurada.</summary>
public sealed class DatabaseNotConfiguredException()
    : InvalidOperationException("SQL Server no está configurado.");
