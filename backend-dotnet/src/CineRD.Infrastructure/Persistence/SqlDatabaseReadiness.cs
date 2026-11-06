using CineRD.Application.Abstractions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace CineRD.Infrastructure.Persistence;

public sealed class SqlDatabaseReadiness(
    IDbConnectionFactory fabrica,
    IOptions<SqlServerOptions> options,
    ILogger<SqlDatabaseReadiness> logger) : IDatabaseReadiness
{
    public async Task<DatabaseReadinessStatus> CheckAsync(CancellationToken cancellationToken)
    {
        var segundos = Math.Max(1, options.Value.ReadinessTimeoutSeconds);
        using var limite = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        limite.CancelAfter(TimeSpan.FromSeconds(segundos));

        try
        {
            await using var conexion = fabrica.CreateConnection();
            await conexion.OpenAsync(limite.Token);
            await using var comando = conexion.CreateCommand();
            comando.CommandText = "SELECT 1;";
            comando.CommandTimeout = segundos;
            await comando.ExecuteScalarAsync(limite.Token);
            return DatabaseReadinessStatus.Ready;
        }
        catch (DatabaseNotConfiguredException)
        {
            return DatabaseReadinessStatus.NotConfigured;
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            throw; // el cliente cerró la petición
        }
        catch (Exception ex)
        {
            // Solo el tipo: el mensaje de SqlClient puede incluir servidor, base o usuario.
            logger.LogWarning("Comprobación de SQL Server fallida ({TipoError}).", ex.GetType().Name);
            return DatabaseReadinessStatus.Unavailable;
        }
    }
}
