using System.Data.Common;
using CineRD.Application.Abstractions;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Options;

namespace CineRD.Infrastructure.Persistence;

/// <summary>Único punto que conoce Microsoft.Data.SqlClient. La cadena resuelta no se registra en logs.</summary>
public sealed class SqlServerConnectionFactory(IOptions<SqlServerOptions> options) : IDbConnectionFactory
{
    private readonly string? _connectionString = SqlServerConnectionStringResolver.Resolve(options.Value);

    public DbConnection CreateConnection()
    {
        if (_connectionString is null) throw new DatabaseNotConfiguredException();
        return new SqlConnection(_connectionString);
    }
}
