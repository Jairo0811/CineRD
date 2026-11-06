namespace CineRD.Application.Peliculas;

public enum PeliculaOrden
{
    EstrenoDesc,
    EstrenoAsc,
    Az,
    Za,
    MasActores,
    MenosActores,
}

public static class PeliculaOrdenParser
{
    /// <summary>Equivale al switch de Express: cualquier valor desconocido usa estrenoDesc.</summary>
    public static PeliculaOrden Parse(string? valor) => valor switch
    {
        "estrenoAsc" => PeliculaOrden.EstrenoAsc,
        "az" => PeliculaOrden.Az,
        "za" => PeliculaOrden.Za,
        "masActores" => PeliculaOrden.MasActores,
        "menosActores" => PeliculaOrden.MenosActores,
        _ => PeliculaOrden.EstrenoDesc,
    };
}

/// <summary><see cref="BuscarPatron"/> es un patrón LIKE para usar como parámetro; <see cref="Genero"/> es el valor exacto recortado.</summary>
public sealed record PeliculaListQuery(string? BuscarPatron, string? Genero, PeliculaOrden Orden)
{
    // Express activa los filtros con `if (buscar)` / `if (genero)` (texto sin recortar) y usa el valor recortado.
    public static PeliculaListQuery Crear(string? buscar, string? genero, string? orden) => new(
        string.IsNullOrEmpty(buscar) ? null : $"%{buscar.Trim()}%",
        string.IsNullOrEmpty(genero) ? null : genero.Trim(),
        PeliculaOrdenParser.Parse(orden));
}
