const sharp = require("sharp");

const ANCHO_RETRATO = 450;
const ALTO_RETRATO = 560;

/**
 * Crea una fotografía de catálogo con relación 4:5 sin barras blancas añadidas.
 * El recorte mantiene la proporción original y usa la zona visualmente relevante.
 */
async function normalizarFotoTalento(buffer) {
  return sharp(buffer)
    .rotate()
    .flatten({ background: "#172b45" })
    .resize(ANCHO_RETRATO, ALTO_RETRATO, {
      fit: "cover",
      position: sharp.strategy.attention,
    })
    .jpeg({ quality: 90, mozjpeg: true })
    .toBuffer();
}

/**
 * Detecta SOLO el letterboxing blanco de imágenes cuadradas heredadas (450x450).
 * Requiere bandas blancas uniformes y simétricas en dos bordes opuestos.
 * No intenta recortar fondos de estudio blancos ni fotografías arbitrarias.
 */
async function detectarFranjasBlancas(buffer) {
  const { data, info } = await sharp(buffer)
    .rotate()
    .removeAlpha()
    .toColourspace("srgb")
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  if (width !== 450 || height !== 450 || channels < 3) return null;

  const casiBlanco = (x, y) => {
    const i = (y * width + x) * channels;
    return data[i] >= 247 && data[i + 1] >= 247 && data[i + 2] >= 247;
  };

  const esFilaBlanca = (y) => {
    let total = 0;
    let blancos = 0;
    for (let x = 0; x < width; x += 3) {
      total++;
      if (casiBlanco(x, y)) blancos++;
    }
    return blancos / total >= 0.985;
  };

  const esColumnaBlanca = (x) => {
    let total = 0;
    let blancos = 0;
    for (let y = 0; y < height; y += 3) {
      total++;
      if (casiBlanco(x, y)) blancos++;
    }
    return blancos / total >= 0.985;
  };

  const contarBorde = (limite, desdeFin, comprobador) => {
    let longitud = 0;
    const maximo = Math.floor(limite * 0.42);
    while (longitud < maximo && comprobador(desdeFin ? limite - 1 - longitud : longitud)) {
      longitud++;
    }
    return longitud;
  };

  const arriba = contarBorde(height, false, esFilaBlanca);
  const abajo = contarBorde(height, true, esFilaBlanca);
  const izquierda = contarBorde(width, false, esColumnaBlanca);
  const derecha = contarBorde(width, true, esColumnaBlanca);

  const simetricos = (a, b) =>
    a >= 12 && b >= 12 && Math.abs(a - b) <= Math.max(8, (a + b) * 0.1);

  const horizontales = simetricos(arriba, abajo) && izquierda < 12 && derecha < 12;
  const verticales = simetricos(izquierda, derecha) && arriba < 12 && abajo < 12;

  if (horizontales === verticales) return null;

  return horizontales
    ? { left: 0, top: arriba, width, height: height - arriba - abajo }
    : { left: izquierda, top: 0, width: width - izquierda - derecha, height };
}

/** Devuelve null cuando no se detecta padding heredado confiable. */
async function repararFotoTalento(buffer) {
  const recorte = await detectarFranjasBlancas(buffer);
  if (!recorte) return null;
  const recortada = await sharp(buffer).rotate().extract(recorte).toBuffer();
  return { recorte, buffer: await normalizarFotoTalento(recortada) };
}

module.exports = {
  ANCHO_RETRATO,
  ALTO_RETRATO,
  normalizarFotoTalento,
  detectarFranjasBlancas,
  repararFotoTalento,
};
