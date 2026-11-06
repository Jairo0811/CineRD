using System.Data.Common;

namespace CineRD.Infrastructure.Persistence;

internal static class DataReaderExtensions
{
    public static string? GetNullableString(this DbDataReader r, string columna)
    {
        var i = r.GetOrdinal(columna);
        return r.IsDBNull(i) ? null : r.GetString(i);
    }

    public static int? GetNullableInt(this DbDataReader r, string columna)
    {
        var i = r.GetOrdinal(columna);
        return r.IsDBNull(i) ? null : r.GetInt32(i);
    }

    public static DateOnly? GetNullableDate(this DbDataReader r, string columna)
    {
        var i = r.GetOrdinal(columna);
        return r.IsDBNull(i) ? null : DateOnly.FromDateTime(r.GetDateTime(i));
    }

    public static int GetInt(this DbDataReader r, string columna) => r.GetInt32(r.GetOrdinal(columna));

    public static bool GetBool(this DbDataReader r, string columna) => r.GetBoolean(r.GetOrdinal(columna));
}
