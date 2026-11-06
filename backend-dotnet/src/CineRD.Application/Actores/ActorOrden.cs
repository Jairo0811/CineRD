namespace CineRD.Application.Actores;

public enum ActorOrden
{
    Az,
    Za,
    MasPeliculas,
    MenosPeliculas,
    NacimientoReciente,
    NacimientoAntiguo,
}

public enum ActorEstadoFiltro
{
    Todos,
    Vivo,
    Fallecido,
}

public static class ActorOrdenParser
{
    /// <summary>Equivale al switch de Express: cualquier valor desconocido usa el orden por defecto (A-Z).</summary>
    public static ActorOrden Parse(string? valor) => valor switch
    {
        "za" => ActorOrden.Za,
        "masPeliculas" => ActorOrden.MasPeliculas,
        "menosPeliculas" => ActorOrden.MenosPeliculas,
        "nacimientoReciente" => ActorOrden.NacimientoReciente,
        "nacimientoAntiguo" => ActorOrden.NacimientoAntiguo,
        _ => ActorOrden.Az,
    };

    public static ActorEstadoFiltro ParseEstado(string? valor) => valor switch
    {
        "vivo" => ActorEstadoFiltro.Vivo,
        "fallecido" => ActorEstadoFiltro.Fallecido,
        _ => ActorEstadoFiltro.Todos,
    };
}
