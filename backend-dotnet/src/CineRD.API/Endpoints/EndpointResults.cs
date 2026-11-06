using CineRD.Application.Abstractions;

namespace CineRD.API.Endpoints;

internal static class EndpointResults
{
    // Formato de error del frontend: { mensaje }. A diferencia de Express, no se devuelve error.message.
    public static IResult Mensaje(int codigo, string mensaje) => Results.Json(new { mensaje }, statusCode: codigo);

    public static IResult ErrorControlado(Exception ex, ILoggerFactory logs, string categoria, string mensaje)
    {
        // Solo el tipo de excepción: los mensajes de SQL Server pueden contener datos de conexión.
        logs.CreateLogger(categoria).LogError("{Mensaje} ({TipoError}).", mensaje, ex.GetType().Name);
        return ex is DatabaseNotConfiguredException
            ? Mensaje(StatusCodes.Status503ServiceUnavailable, "Base de datos no disponible")
            : Mensaje(StatusCodes.Status500InternalServerError, mensaje);
    }
}
