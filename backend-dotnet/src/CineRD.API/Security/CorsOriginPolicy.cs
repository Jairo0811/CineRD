using System.Text.RegularExpressions;

namespace CineRD.API.Security;

/// <summary>
/// Misma política que backend/src/config/cors.js:
/// sin cabecera Origin se permite; los orígenes de FRONTEND_URLS se permiten (sin barra final);
/// localhost y redes privadas (puerto 5173 o por defecto) solo fuera de producción; el resto, 403.
/// </summary>
public sealed partial class CorsOriginPolicy
{
    private readonly HashSet<string> _configurados;
    private readonly bool _produccion;

    public CorsOriginPolicy(string? frontendUrls, bool produccion)
    {
        _produccion = produccion;
        // En producción no hay valor por defecto: si falta FRONTEND_URLS no se abre nada por accidente.
        var origen = string.IsNullOrWhiteSpace(frontendUrls) ? (produccion ? "" : "http://localhost:5173") : frontendUrls;
        _configurados = origen.Split(',').Select(Normalizar).Where(o => o.Length > 0).ToHashSet(StringComparer.Ordinal);
    }

    public int Configurados => _configurados.Count;
    public bool EsProduccion => _produccion;

    public static string Normalizar(string? valor) => (valor ?? string.Empty).Trim().TrimEnd('/');

    public bool IsAllowed(string? origin)
    {
        if (string.IsNullOrEmpty(origin)) return true;
        var normalizado = Normalizar(origin);
        if (_configurados.Contains(normalizado)) return true;
        return !_produccion && EsOrigenLocal(normalizado);
    }

    private static bool EsOrigenLocal(string origin)
    {
        if (!Uri.TryCreate(origin, UriKind.Absolute, out var url)) return false;
        var esHttp = url.Scheme is "http" or "https";
        var puertoOk = url.IsDefaultPort || url.Port == 5173;
        var host = url.Host;
        var esLocalhost = host is "localhost" or "127.0.0.1";
        var esPrivada = Privada().IsMatch(host);
        return esHttp && puertoOk && (esLocalhost || esPrivada);
    }

    [GeneratedRegex(@"^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)")]
    private static partial Regex Privada();
}
