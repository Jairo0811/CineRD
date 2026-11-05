const sharp = require("sharp");

const ANCHO_POSTER = 450;
const ALTO_POSTER = 650;

/**
 * Mantiene la ilustración y los textos del cartel íntegros. El póster nítido
 * se reduce solo si es necesario; NUNCA se amplía ni se recorta. El espacio
 * restante se rellena con una copia desenfocada/oscurecida del mismo póster.
 */
async function normalizarPosterPelicula(buffer) {
  const original = await sharp(buffer)
    .rotate()
    .flatten({ background: "#101c30" })
    .toBuffer();

  const primerPlano = await sharp(original)
    .resize(ANCHO_POSTER, ALTO_POSTER, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 90, mozjpeg: true })
    .toBuffer();

  const { width, height } = await sharp(primerPlano).metadata();
  if (width === ANCHO_POSTER && height === ALTO_POSTER) return primerPlano;

  const fondo = await sharp(original)
    .resize(ANCHO_POSTER, ALTO_POSTER, { fit: "cover" })
    .blur(24)
    .modulate({ brightness: 0.4, saturation: 0.65 })
    .jpeg({ quality: 85 })
    .toBuffer();

  return sharp(fondo).composite([{
    input: primerPlano,
    left: Math.floor((ANCHO_POSTER - width) / 2),
    top: Math.floor((ALTO_POSTER - height) / 2),
  }]).jpeg({ quality: 90, mozjpeg: true }).toBuffer();
}

/**
 * Detección conservadora de bandas blancas SIMÉTRICAS agregadas en versiones
 * anteriores por resize(450,650,{fit:"contain",background:white}).
 * Una franja de un póster blanco podría ser intencional: siempre revisar
 * la imagen antes de aplicar la reparación.
 */
async function detectarFranjasBlancasPoster(buffer) {
  const { data, info } = await sharp(buffer)
    .rotate()
    .removeAlpha()
    .toColourspace("srgb")
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  if (width !== ANCHO_POSTER || height !== ALTO_POSTER || channels < 3) return null;

  function pixelBlanco(x, y) {
    const i = (y * width + x) * channels;
    return data[i] >= 247 && data[i + 1] >= 247 && data[i + 2] >= 247;
  }

  function bordeBlanco(indice, fila) {
    const limite = fila ? width : height;
    let total = 0;
    let blancos = 0;
    for (let n = 0; n < limite; n += 3) {
      total++;
      if (fila ? pixelBlanco(n, indice) : pixelBlanco(indice, n)) blancos++;
    }
    return blancos / total >= 0.985;
  }

  function longitudBlanca(limite, desdeFinal, fila) {
    const maximo = Math.floor(limite * 0.42);
    let n = 0;
    while (n < maximo && bordeBlanco(desdeFinal ? limite - 1 - n : n, fila)) n++;
    return n;
  }

  const top = longitudBlanca(height, false, true);
  const bottom = longitudBlanca(height, true, true);
  const left = longitudBlanca(width, false, false);
  const right = longitudBlanca(width, true, false);

  const simetricos = (a, b) =>
    a >= 14 && b >= 14 && Math.abs(a - b) <= Math.max(8, (a + b) * 0.08);

  const horizontal = simetricos(top, bottom) && left < 10 && right < 10;
  const vertical = simetricos(left, right) && top < 10 && bottom < 10;
  if (horizontal === vertical) return null;

  return horizontal
    ? { left: 0, top, width, height: height - top - bottom }
    : { left, top: 0, width: width - left - right, height };
}

/** Devuelve null si no detecta bandas blancas confiables. */
async function repararPosterPelicula(buffer) {
  const recorte = await detectarFranjasBlancasPoster(buffer);
  if (!recorte) return null;
  const sinFranjas = await sharp(buffer).rotate().extract(recorte).toBuffer();
  return { recorte, buffer: await normalizarPosterPelicula(sinFranjas) };
}

module.exports = {
  ANCHO_POSTER,
  ALTO_POSTER,
  normalizarPosterPelicula,
  detectarFranjasBlancasPoster,
  repararPosterPelicula,
};
