using System.Data.Common;

namespace CineRD.Infrastructure.Persistence;

public interface IDbConnectionFactory
{
    /// <summary>Crea una conexión sin abrir. Lanza <see cref="CineRD.Application.Abstractions.DatabaseNotConfiguredException"/> si no hay configuración.</summary>
    DbConnection CreateConnection();
}
