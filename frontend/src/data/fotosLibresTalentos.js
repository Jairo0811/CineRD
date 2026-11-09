/**
 * Alternativas fotográficas publicadas por sus autores bajo licencias abiertas.
 * Inventario externo separado de docs/media-rights-ledger.csv (que continúa
 * protegiendo las 128 imágenes locales con derechos pendientes).
 *
 * Se consultaron las páginas de Wikimedia Commons el 9 de noviembre de 2026.
 * No usar una foto sin título de archivo, autor, licencia y página de evidencia.
 * No atribuir estas licencias a las fotografías antiguas de backend/uploads.
 */
export const FOTOS_CC_TALENTOS = Object.freeze({
  3: {
    nombre: "Boca de Piano (Fausto Mata)",
    archivo: "Fausto Mata.jpg",
    autor: "809 New York Magazine",
    licencia: "CC BY 2.0",
    enlaceLicencia: "https://creativecommons.org/licenses/by/2.0/",
  },
  9: {
    nombre: "Miguel Céspedes",
    archivo: "Miguel adjusted.jpg",
    autor: "809 New York Magazine",
    licencia: "CC BY 2.0",
    enlaceLicencia: "https://creativecommons.org/licenses/by/2.0/",
  },
  8: {
    nombre: "Raymond Pozo",
    archivo: "Raymond adjusted.jpg",
    autor: "809 New York Magazine",
    licencia: "CC BY 2.0",
    enlaceLicencia: "https://creativecommons.org/licenses/by/2.0/",
  },
  17: {
    nombre: "Aquiles Correa",
    archivo: "Aquiles Correa at Hiram Bithorn Stadium.jpg",
    autor: "Dawin Manuel",
    licencia: "CC BY-SA 2.0",
    enlaceLicencia: "https://creativecommons.org/licenses/by-sa/2.0/",
  },
  10: {
    nombre: "Manolo Ozuna",
    archivo: "Manolo Ozuna.jpg",
    autor: "Reynaldo Brito",
    licencia: "CC BY-SA 3.0",
    enlaceLicencia: "https://creativecommons.org/licenses/by-sa/3.0/",
  },
  14: {
    nombre: "Tony Pascual / Pachulí",
    archivo: "Tony Pascual.jpg",
    autor: "809 New York Magazine",
    licencia: "CC BY 2.0",
    enlaceLicencia: "https://creativecommons.org/licenses/by/2.0/",
  },
});

export const CREDITOS_FOTOGRAFICOS = Object.freeze(
  Object.entries(FOTOS_CC_TALENTOS).map(([id, item]) => ({
    id: Number(id),
    ...item,
    fuente: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(item.archivo.replaceAll(" ", "_"))}`,
    // Página especial de Wikimedia que devuelve la fotografía original
    // o una miniatura generada por Commons.
    imagen: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(item.archivo.replaceAll(" ", "_"))}?width=480`,
  })),
);

export function obtenerFotoLibreTalento(id) {
  return CREDITOS_FOTOGRAFICOS.find((foto) => foto.id === Number(id)) || null;
}
