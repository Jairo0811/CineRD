
export const DEMO_MODE =
  import.meta.env.VITE_DEMO_MODE === "true";

// Determina el origen de la API según el entorno.
// En Netlify Demo utiliza el dominio actual.
// En desarrollo utiliza VITE_API_URL o localhost:3000.
const API_ORIGIN = DEMO_MODE
  ? window.location.origin
  : (
      import.meta.env.VITE_API_URL ||
      `${window.location.protocol}//${window.location.hostname}:3000`
    );

// URL principal de la aplicación/backend.
export const API_URL = API_ORIGIN.replace(/\/$/, "");

// URL base para las solicitudes HTTP.
export const API_BASE_URL = `${API_URL}/api`;

// Hostnames reconocidos como entornos locales.
const LOCAL_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
]);

/**
 * Resuelve las URLs de imágenes y archivos multimedia
 * almacenados por CineRD.
 *
 * Compatible con:
 * - Desarrollo local (Node.js + SQL Server).
 * - Dispositivos en la misma red local.
 * - Demo estática publicada en Netlify.
 * - Backend remoto en producción.
 *
 * Las URLs antiguas que apunten a localhost
 * se reescriben utilizando el origen actual.
 */
export const resolveMediaUrl = (value) => {
  if (!value) return null;

  const mediaPath = String(value).trim();

  if (!mediaPath) return null;

  // Rutas relativas al origen del sitio.
  if (mediaPath.startsWith("/")) {
    return `${API_URL}${mediaPath}`;
  }

  try {
    const url = new URL(mediaPath);

    // Sustituir referencias antiguas a localhost.
    if (LOCAL_HOSTNAMES.has(url.hostname)) {
      return `${API_URL}${url.pathname}${url.search}${url.hash}`;
    }

    // Mantener URLs externas válidas.
    return url.toString();
  } catch {
    // Rutas sin dominio, por ejemplo:
    // uploads/peliculas/imagen.jpg
    return `${API_URL}/${mediaPath.replace(/^\/+/, "")}`;
  }
};
