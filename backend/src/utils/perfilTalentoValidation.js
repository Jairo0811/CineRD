/**
 * Enlaces de perfil públicos. Rechazar esquemas ejecutables como javascript:,
 * file:, data: y credenciales embebidas. Normalizar antes de guardar.
 */
const CAMPOS_SOCIALES = Object.freeze([
  "InstagramUrl", "FacebookUrl", "TikTokUrl", "YouTubeUrl",
  "SpotifyUrl", "XUrl", "SitioWebUrl",
]);

class ValidacionPerfilError extends Error {
  constructor(mensaje) { super(mensaje); this.name = "ValidacionPerfilError"; }
}

function validarEnlacePublico(valor, campo) {
  if (valor === undefined || valor === null || String(valor).trim() === "") return null;
  if (typeof valor !== "string" || valor.trim().length > 300) {
    throw new ValidacionPerfilError(`${campo}: enlace demasiado largo o inválido`);
  }
  const texto = valor.trim();
  let url;
  try { url = new URL(texto); }
  catch { throw new ValidacionPerfilError(`${campo}: debe indicar una URL HTTP o HTTPS completa`); }
  if (!["http:", "https:"].includes(url.protocol) || !url.hostname ||
      url.username || url.password ||
      /^(localhost|0\.0\.0\.0|127(?:\.\d{1,3}){3}|::1)$/i.test(url.hostname)) {
    throw new ValidacionPerfilError(`${campo}: URL pública HTTP o HTTPS no válida`);
  }
  return texto;
}

function normalizarEnlacesPublicos(datos = {}) {
  return Object.fromEntries(CAMPOS_SOCIALES.map(campo => [
    campo, validarEnlacePublico(datos[campo], campo),
  ]));
}

function validarTextoPublico(valor, campo, longitud) {
  if (valor === undefined || valor === null || String(valor).trim() === "") return null;
  if (typeof valor !== "string" || valor.trim().length > longitud) {
    throw new ValidacionPerfilError(`${campo}: supera los ${longitud} caracteres permitidos`);
  }
  return valor.trim();
}

module.exports = {
  CAMPOS_SOCIALES, ValidacionPerfilError,
  validarEnlacePublico, normalizarEnlacesPublicos, validarTextoPublico,
};
