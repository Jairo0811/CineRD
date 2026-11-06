using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace CineRD.API.Json;

/// <summary>
/// Express serializa las columnas SQL DATE como instante UTC (p. ej. "1990-05-01T00:00:00.000Z").
/// Este conversor produce el mismo texto para conservar el contrato con el frontend.
/// </summary>
public sealed class ExpressDateOnlyConverter : JsonConverter<DateOnly>
{
    public override DateOnly Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var texto = reader.GetString() ?? throw new JsonException("Fecha vacía.");
        return DateOnly.FromDateTime(DateTime.Parse(texto, CultureInfo.InvariantCulture, DateTimeStyles.AdjustToUniversal | DateTimeStyles.AssumeUniversal));
    }

    public override void Write(Utf8JsonWriter writer, DateOnly value, JsonSerializerOptions options) =>
        writer.WriteStringValue(value.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture) + "T00:00:00.000Z");
}
