const cors = require("cors");

const normalizarOrigen = (valor) => String(valor || "").trim().replace(/\/+$/, "");

const leerOrigenesConfigurados = (env, produccion) => {
  // En producción no hay valor por defecto: si falta FRONTEND_URLS, no se abre nada por accidente.
  const porDefecto = produccion ? "" : "http://localhost:5173";
  return String(env.FRONTEND_URLS || env.FRONTEND_URL || porDefecto)
    .split(",")
    .map(normalizarOrigen)
    .filter(Boolean);
};

// En producción, incluso un origen escrito accidentalmente en FRONTEND_URLS
// queda bloqueado si usa HTTP, credenciales, ruta, loopback o red privada.
const esOrigenSeguroProduccion = (origin) => {
  try {
    const url = new URL(origin);
    const host = url.hostname.toLowerCase();
    return url.protocol === "https:" && !url.username && !url.password &&
      url.pathname === "/" && !url.search && !url.hash &&
      url.origin === origin &&
      !["localhost", "127.0.0.1", "[::1]", "::1"].includes(host) &&
      !/^(10\\.|192\\.168\\.|172\\.(1[6-9]|2\\d|3[0-1])\\.)/.test(host);
  } catch { return false; }
};

// Solo para desarrollo: localhost y redes privadas (por ejemplo, probar desde el móvil en la LAN).
const esOrigenLocal = (origin) => {
  try {
    const url = new URL(origin);
    const esHttp = url.protocol === "http:" || url.protocol === "https:";
    const esPuertoFrontend = url.port === "5173" || url.port === "";
    const esLocalhost = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    const esIPv4Privada =
      /^10\./.test(url.hostname) ||
      /^192\.168\./.test(url.hostname) ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(url.hostname);
    return esHttp && esPuertoFrontend && (esLocalhost || esIPv4Privada);
  } catch {
    return false;
  }
};

/**
 * Política de CORS de la API.
 *
 * - Sin cabecera Origin (curl, health checks, servidor a servidor): se permite.
 * - Origen listado en FRONTEND_URLS: se permite (se ignora la barra final).
 * - Orígenes locales o de red privada: solo cuando NODE_ENV no es "production".
 * - Cualquier otro origen recibe 403. Se responde antes de ejecutar la ruta para que un sitio
 *   ajeno tampoco pueda provocar acciones con las cookies del usuario (CORS por sí solo solo
 *   impide leer la respuesta, no que la petición se procese).
 */
function crearPoliticaCors(env = process.env) {
  const produccion = env.NODE_ENV === "production";
  const lista=leerOrigenesConfigurados(env, produccion);
  const confiables=produccion ? lista.filter(esOrigenSeguroProduccion) : lista;
  const configurados = new Set(confiables);
  if(produccion && confiables.length!==lista.length)
    console.warn("FRONTEND_URLS: se ignoraron "+(lista.length-confiables.length)+
      " orígenes inseguros en producción.");

  if (produccion && configurados.size === 0) {
    console.warn("FRONTEND_URLS no está definido: la API rechazará todas las peticiones entre orígenes.");
  }

  const esOrigenPermitido = (origin) => {
    if (!origin) return true;
    const normalizado = normalizarOrigen(origin);
    if (configurados.has(normalizado)) return true;
    return !produccion && esOrigenLocal(normalizado);
  };

  const bloquearOrigenNoPermitido = (req, res, next) => {
    if (esOrigenPermitido(req.headers.origin)) return next();
    return res.status(403).json({ mensaje: "Origen no permitido", requestId: req.requestId });
  };

  const middleware = [
    bloquearOrigenNoPermitido,
    cors({ origin: (origin, callback) => callback(null, esOrigenPermitido(origin)), credentials: true }),
  ];

  return { esOrigenPermitido, middleware };
}

module.exports = { crearPoliticaCors, normalizarOrigen };
