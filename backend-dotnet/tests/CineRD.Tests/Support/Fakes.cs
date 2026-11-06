#pragma warning disable CS8765 // los setters base aceptan null ([AllowNull]); los dobles de prueba no lo necesitan
using System.Collections;
using System.Data;
using System.Data.Common;
using CineRD.Application.Abstractions;
using CineRD.Application.Actores;
using CineRD.Domain.Actores;
using CineRD.Infrastructure.Persistence;

namespace CineRD.Tests.Support;

public sealed class FakeActorRepository : IActorRepository
{
    public List<ActorConConteos> Filas { get; } = [];
    public ActorListQuery? UltimaConsulta { get; private set; }
    public int? UltimoId { get; private set; }
    public Exception? Falla { get; set; }

    public Task<IReadOnlyList<ActorConConteos>> ListarAsync(ActorListQuery query, CancellationToken cancellationToken)
    {
        UltimaConsulta = query;
        if (Falla is not null) throw Falla;
        return Task.FromResult<IReadOnlyList<ActorConConteos>>(Filas.ToList());
    }

    public Task<Actor?> ObtenerPorIdAsync(int id, CancellationToken cancellationToken)
    {
        UltimoId = id;
        if (Falla is not null) throw Falla;
        return Task.FromResult(Filas.Select(f => f.Actor).FirstOrDefault(a => a.Id == id));
    }
}

public sealed class FakeReadiness(DatabaseReadinessStatus estado) : IDatabaseReadiness
{
    public Task<DatabaseReadinessStatus> CheckAsync(CancellationToken cancellationToken) => Task.FromResult(estado);
}

public static class Datos
{
    public static Actor Actor(int id = 1, string nombre = "Ana Pérez") => new(
        Id: id, TMDbId: null, Nombres: "Ana", Apellidos: "Pérez", NombreCompleto: nombre, NombreArtistico: null,
        Profesion: "Actriz", FechaNacimiento: new DateOnly(1990, 5, 1), AnioNacimiento: null, Sexo: "Femenino",
        EstaVivo: true, FechaFallecimiento: null, Foto: null, InstagramUrl: null, FacebookUrl: null, TikTokUrl: null,
        YouTubeUrl: null, SpotifyUrl: null, XUrl: null, SitioWebUrl: null, EsVerificado: false);
}

/// <summary>Fábrica de conexiones en memoria: sirve filas de un DataTable y captura el comando ejecutado.</summary>
public sealed class FakeConnectionFactory(DataTable tabla) : IDbConnectionFactory
{
    public FakeCommand? UltimoComando { get; set; }
    public DbConnection CreateConnection() => new FakeConnection(this, tabla);
}

public sealed class FakeConnection(FakeConnectionFactory fabrica, DataTable tabla) : DbConnection
{
    private ConnectionState _estado = ConnectionState.Closed;
    public override string ConnectionString { get; set; } = string.Empty;
    public override string Database => "fake";
    public override string DataSource => "fake";
    public override string ServerVersion => "0";
    public override ConnectionState State => _estado;
    public override void ChangeDatabase(string databaseName) { }
    public override void Close() => _estado = ConnectionState.Closed;
    public override void Open() => _estado = ConnectionState.Open;
    protected override DbTransaction BeginDbTransaction(IsolationLevel isolationLevel) => throw new NotSupportedException();
    protected override DbCommand CreateDbCommand()
    {
        var cmd = new FakeCommand(tabla) { Connection = this };
        fabrica.UltimoComando = cmd;
        return cmd;
    }
}

public sealed class FakeCommand(DataTable tabla) : DbCommand
{
    private readonly FakeParameterCollection _parametros = new();
    public override string CommandText { get; set; } = string.Empty;
    public override int CommandTimeout { get; set; }
    public override CommandType CommandType { get; set; } = CommandType.Text;
    public override bool DesignTimeVisible { get; set; }
    public override UpdateRowSource UpdatedRowSource { get; set; }
    protected override DbConnection? DbConnection { get; set; }
    protected override DbParameterCollection DbParameterCollection => _parametros;
    protected override DbTransaction? DbTransaction { get; set; }
    public override void Cancel() { }
    public override int ExecuteNonQuery() => throw new NotSupportedException();
    public override object? ExecuteScalar() => 1;
    public override void Prepare() { }
    protected override DbParameter CreateDbParameter() => new FakeParameter();
    protected override DbDataReader ExecuteDbDataReader(CommandBehavior behavior) => tabla.CreateDataReader();
}

public sealed class FakeParameter : DbParameter
{
    public override DbType DbType { get; set; }
    public override ParameterDirection Direction { get; set; } = ParameterDirection.Input;
    public override bool IsNullable { get; set; }
    public override string ParameterName { get; set; } = string.Empty;
    public override int Size { get; set; }
    public override string SourceColumn { get; set; } = string.Empty;
    public override bool SourceColumnNullMapping { get; set; }
    public override object? Value { get; set; }
    public override void ResetDbType() { }
}

public sealed class FakeParameterCollection : DbParameterCollection
{
    private readonly List<DbParameter> _items = [];
    public override int Count => _items.Count;
    public override object SyncRoot => ((ICollection)_items).SyncRoot;
    public override int Add(object value) { _items.Add((DbParameter)value); return _items.Count - 1; }
    public override void AddRange(Array values) { foreach (var v in values) Add(v!); }
    public override void Clear() => _items.Clear();
    public override bool Contains(object value) => _items.Contains((DbParameter)value);
    public override bool Contains(string value) => _items.Any(p => p.ParameterName == value);
    public override void CopyTo(Array array, int index) => ((ICollection)_items).CopyTo(array, index);
    public override IEnumerator GetEnumerator() => _items.GetEnumerator();
    public override int IndexOf(object value) => _items.IndexOf((DbParameter)value);
    public override int IndexOf(string parameterName) => _items.FindIndex(p => p.ParameterName == parameterName);
    public override void Insert(int index, object value) => _items.Insert(index, (DbParameter)value);
    public override void Remove(object value) => _items.Remove((DbParameter)value);
    public override void RemoveAt(int index) => _items.RemoveAt(index);
    public override void RemoveAt(string parameterName) => _items.RemoveAll(p => p.ParameterName == parameterName);
    protected override DbParameter GetParameter(int index) => _items[index];
    protected override DbParameter GetParameter(string parameterName) => _items.First(p => p.ParameterName == parameterName);
    protected override void SetParameter(int index, DbParameter value) => _items[index] = value;
    protected override void SetParameter(string parameterName, DbParameter value) => _items[IndexOf(parameterName)] = value;
}

public sealed class ThrowingConnectionFactory(Exception ex) : IDbConnectionFactory
{
    public DbConnection CreateConnection() => throw ex;
}

/// <summary>Conexión cuyo Open falla: simula SQL Server inaccesible.</summary>
public sealed class UnreachableConnectionFactory : IDbConnectionFactory
{
    public DbConnection CreateConnection() => new UnreachableConnection();

    private sealed class UnreachableConnection : DbConnection
    {
        public override string ConnectionString { get; set; } = "Server=secreto;Password=secreto";
        public override string Database => "";
        public override string DataSource => "";
        public override string ServerVersion => "";
        public override ConnectionState State => ConnectionState.Closed;
        public override void ChangeDatabase(string databaseName) { }
        public override void Close() { }
        public override void Open() => throw new InvalidOperationException("No se pudo conectar a secreto con Password=secreto");
        public override Task OpenAsync(CancellationToken cancellationToken) => Task.FromException(new InvalidOperationException("No se pudo conectar a secreto con Password=secreto"));
        protected override DbTransaction BeginDbTransaction(IsolationLevel isolationLevel) => throw new NotSupportedException();
        protected override DbCommand CreateDbCommand() => throw new NotSupportedException();
    }
}
