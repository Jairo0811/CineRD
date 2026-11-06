using System.Globalization;
using System.Text.RegularExpressions;

namespace CineRD.Application.Actores;

/// <summary>
/// Filtros del listado ya validados. <see cref="BuscarPatron"/> y <see cref="ProfesionPatron"/> son
/// patrones LIKE listos para usarse como parámetros (nunca se concatenan al SQL).
/// </summary>
public sealed record ActorListQuery(
    string? BuscarPatron,
    ActorEstadoFiltro Estado,
    int? Anio,
    string? ProfesionPatron,
    ActorOrden Orden)
{
    public const int BuscarMaxLength = 150;
    public const int ProfesionMaxLength = 100;

    public static ActorListQuery Crear(string? buscar, string? estado, int? anio, string? profesion, string? orden) =>
        new(
            Patron(buscar, BuscarMaxLength),
            ActorOrdenParser.ParseEstado(estado),
            anio,
            Patron(profesion, ProfesionMaxLength),
            ActorOrdenParser.Parse(orden));

    // Express activa el filtro con `if (buscar)` (texto sin recortar) y usa buscar.trim() como valor.
    // Una cadena de solo espacios activa el filtro con el patrón "%%".
    private static string? Patron(string? valor, int maxLength)
    {
        if (string.IsNullOrEmpty(valor)) return null;
        var recortado = valor.Trim();
        var limite = maxLength - 2; // deja espacio a los dos comodines '%'
        if (recortado.Length > limite) recortado = recortado[..limite];
        return $"%{recortado}%";
    }
}

public static class JsNumber
{
    private static readonly Regex EnteroInicial = new(@"^[\s]*[+-]?\d+", RegexOptions.Compiled | RegexOptions.CultureInvariant);

    /// <summary>Replica <c>Number.parseInt(valor, 10)</c> de JavaScript: toma el prefijo entero. Devuelve false si es NaN o desborda int.</summary>
    public static bool TryParseInt(string? valor, out int resultado)
    {
        resultado = 0;
        if (valor is null) return false;
        var m = EnteroInicial.Match(valor);
        if (!m.Success) return false;
        return int.TryParse(m.Value.Trim(), NumberStyles.AllowLeadingSign, CultureInfo.InvariantCulture, out resultado);
    }

    /// <summary>Replica la validación de Express: <c>Number(id)</c> debe ser un entero positivo.</summary>
    public static bool TryParsePositiveId(string? valor, out int id)
    {
        id = 0;
        if (valor is null) return false;
        if (!decimal.TryParse(
                valor,
                NumberStyles.AllowLeadingWhite | NumberStyles.AllowTrailingWhite | NumberStyles.AllowLeadingSign | NumberStyles.AllowDecimalPoint | NumberStyles.AllowExponent,
                CultureInfo.InvariantCulture,
                out var numero))
        {
            return false;
        }
        if (numero != decimal.Truncate(numero) || numero <= 0 || numero > int.MaxValue) return false;
        id = (int)numero;
        return true;
    }
}
