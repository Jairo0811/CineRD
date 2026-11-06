namespace CineRD.API.Storage;

/// <summary>Resuelve las carpetas de medios igual que backend/src/config/storage.js (UPLOADS_DIR, PRIVATE_STORAGE_DIR).</summary>
public static class UploadsLocation
{
    public static string Resolve(string? configurado, string porDefecto) =>
        Path.GetFullPath(string.IsNullOrWhiteSpace(configurado)
            ? Path.Combine(Directory.GetCurrentDirectory(), porDefecto)
            : configurado);

    /// <summary>
    /// Falso si la carpeta privada (evidencias) quedaría dentro de la pública o viceversa:
    /// en ese caso /uploads no debe publicarse.
    /// </summary>
    public static bool SonCarpetasSeparadas(string uploadsDir, string privateDir)
    {
        var comparison = OperatingSystem.IsWindows() ? StringComparison.OrdinalIgnoreCase : StringComparison.Ordinal;
        return !EstaDentroDe(privateDir, uploadsDir, comparison) && !EstaDentroDe(uploadsDir, privateDir, comparison);
    }

    private static bool EstaDentroDe(string ruta, string contenedor, StringComparison comparison)
    {
        var r = Path.TrimEndingDirectorySeparator(ruta);
        var c = Path.TrimEndingDirectorySeparator(contenedor);
        return r.Equals(c, comparison)
            || r.StartsWith(c + Path.DirectorySeparatorChar, comparison)
            || r.StartsWith(c + Path.AltDirectorySeparatorChar, comparison);
    }
}
