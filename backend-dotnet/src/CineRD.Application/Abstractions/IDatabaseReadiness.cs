namespace CineRD.Application.Abstractions;

public enum DatabaseReadinessStatus
{
    Ready,
    NotConfigured,
    Unavailable,
}

/// <summary>Comprobación de disponibilidad de la base de datos (sin escrituras).</summary>
public interface IDatabaseReadiness
{
    Task<DatabaseReadinessStatus> CheckAsync(CancellationToken cancellationToken);
}
