import placeholderMasculino from "../assets/talento-masculino.png";
import placeholderFemenino from "../assets/talento-femenino.png";

import { API_URL } from "../config/api";

function normalizarSexo(sexo) {
  return String(sexo || "")
    .trim()
    .toLowerCase();
}

export function esSexoFemenino(sexo) {
  const valor = normalizarSexo(sexo);

  return ["femenino", "mujer", "female", "f", "actriz"].includes(valor);
}

export function obtenerPlaceholderPorSexo(sexo) {
  return esSexoFemenino(sexo)
    ? placeholderFemenino
    : placeholderMasculino;
}

export function construirUrlFoto(url) {
  if (!url) return "";

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }

  return `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

export function obtenerFotoTalento(talento) {
  const foto =
    talento?.FotoUrl ||
    talento?.Foto ||
    talento?.ImagenUrl ||
    talento?.ProfilePath ||
    "";

  if (typeof foto === "string" && foto.trim() !== "") {
    return construirUrlFoto(foto);
  }

  return obtenerPlaceholderPorSexo(talento?.Sexo);
}

export function manejarErrorFotoTalento(event, sexo) {
  event.currentTarget.onerror = null;
  event.currentTarget.src = obtenerPlaceholderPorSexo(sexo);
}
