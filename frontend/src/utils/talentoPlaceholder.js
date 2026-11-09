/**
 * Retratos de respaldo originales de CineRD, generados como SVG vectorial.
 * No utilizan fotos de personas reales, imágenes de terceros o logos externos.
 * La silueta es neutra y únicamente cambia la paleta cromática por variante.
 *
 * No confundir la presencia de un fallback propio con licencia para las fotos
 * reales: siguen sujetas al ledger docs/media-rights-ledger.csv.
 */
import { API_URL } from "../config/api";

function crearRetratoVectorial(acento) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="400" viewBox="0 0 320 400">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#12253d"/>
        <stop offset="1" stop-color="#071323"/>
      </linearGradient>
      <radialGradient id="halo" cx="50%" cy="33%" r="55%">
        <stop offset="0" stop-color="${acento}" stop-opacity=".35"/>
        <stop offset="1" stop-color="${acento}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="320" height="400" fill="url(#bg)"/>
    <rect width="320" height="400" fill="url(#halo)"/>
    <circle cx="160" cy="151" r="65" fill="#adc3d7" opacity=".85"/>
    <path d="M55 357c0-61 47-108 105-108s105 47 105 108v43H55z" fill="#adc3d7" opacity=".85"/>
    <path d="M40 358h240M40 366h240" fill="none" stroke="${acento}" stroke-width="2" opacity=".7"/>
    <circle cx="160" cy="151" r="82" fill="none" stroke="${acento}" stroke-opacity=".48" stroke-width="2"/>
    <path d="M26 26h35M26 26v35M294 26h-35M294 26v35M26 374h35M26 374v-35M294 374h-35M294 374v-35"
      fill="none" stroke="${acento}" stroke-width="3" opacity=".6"/>
  </svg>`;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}
const placeholderMasculino = crearRetratoVectorial("#4da7ff");
const placeholderFemenino = crearRetratoVectorial("#f083c6");

function normalizarSexo(sexo) {
  return String(sexo || "").trim().toLowerCase();
}

export function esSexoFemenino(sexo) {
  const valor = normalizarSexo(sexo);
  return ["femenino", "mujer", "female", "f", "actriz"].includes(valor);
}

export function obtenerPlaceholderPorSexo(sexo) {
  return esSexoFemenino(sexo) ? placeholderFemenino : placeholderMasculino;
}

export function construirUrlFoto(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") ||
      url.startsWith("blob:") || url.startsWith("data:")) return url;
  return `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

export function obtenerFotoTalento(talento) {
  const foto = talento?.FotoUrl || talento?.Foto ||
    talento?.ImagenUrl || talento?.ProfilePath || "";
  if (typeof foto === "string" && foto.trim() !== "")
    return construirUrlFoto(foto);
  return obtenerPlaceholderPorSexo(talento?.Sexo);
}

export function manejarErrorFotoTalento(event, sexo) {
  event.currentTarget.onerror = null;
  event.currentTarget.src = obtenerPlaceholderPorSexo(sexo);
}
