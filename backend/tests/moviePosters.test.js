const test = require("node:test");
const assert = require("node:assert/strict");
const sharp = require("sharp");

const {
  ANCHO_POSTER,
  ALTO_POSTER,
  normalizarPosterPelicula,
  detectarFranjasBlancasPoster,
  repararPosterPelicula,
} = require("../src/utils/moviePoster");

const foto = (width, height, background = "#b72a45") =>
  sharp({ create: { width, height, channels: 3, background } })
    .png().toBuffer();

test("un cartel horizontal conserva los dos extremos sin zoom ni recorte", async () => {
  const izquierda = await foto(450, 450, "#d21c38");
  const derecha = await foto(450, 450, "#155ee2");
  const original = await sharp(izquierda)
    .composite([{ input: derecha, left: 450, top: 0 }]).png().toBuffer();

  const resultado = await normalizarPosterPelicula(original);
  const { data, info } = await sharp(resultado).raw().toBuffer({ resolveWithObject: true });
  assert.equal(info.width, ANCHO_POSTER);
  assert.equal(info.height, ALTO_POSTER);
  function pixel(x, y) {
    const i = (y * info.width + x) * info.channels;
    return [data[i], data[i + 1], data[i + 2]];
  }
  assert.ok(pixel(30, 325)[0] > pixel(30, 325)[2] + 70);
  assert.ok(pixel(420, 325)[2] > pixel(420, 325)[0] + 70);
});

test("un póster pequeño conserva escala de primer plano, sin ampliarse", async () => {
  const original = await foto(90, 140, "#db2132");
  const resultado = await normalizarPosterPelicula(original);
  const { data, info } = await sharp(resultado).raw().toBuffer({ resolveWithObject: true });
  let rojosNitidos = 0;
  const y = Math.floor(ALTO_POSTER / 2);
  for (let x = 0; x < ANCHO_POSTER; x++) {
    const i = (y * ANCHO_POSTER + x) * info.channels;
    if (data[i] > 170 && data[i + 1] < 100 && data[i + 2] < 110) rojosNitidos++;
  }
  assert.ok(rojosNitidos >= 85 && rojosNitidos <= 95, `No debe ampliarse: ${rojosNitidos} px`);
});

test("detecta y repara bandas blancas superior e inferior en JPEG legado", async () => {
  const source = await foto(900, 400);
  const antiguo = await sharp(source).resize(450, 650, {
    fit: "contain", background: "#ffffff",
  }).jpeg({ quality: 90 }).toBuffer();
  const recorte = await detectarFranjasBlancasPoster(antiguo);
  assert.ok(recorte);
  assert.equal(recorte.left, 0);
  assert.ok(recorte.top >= 200);
  const reparado = await repararPosterPelicula(antiguo);
  assert.deepEqual(reparado.recorte, recorte);
  const meta = await sharp(reparado.buffer).metadata();
  assert.equal(meta.width, ANCHO_POSTER);
  assert.equal(meta.height, ALTO_POSTER);
});

test("detecta bandas blancas laterales en JPEG legado", async () => {
  const source = await foto(240, 900);
  const antiguo = await sharp(source).resize(450, 650, {
    fit: "contain", background: "#ffffff",
  }).jpeg({ quality: 90 }).toBuffer();
  const recorte = await detectarFranjasBlancasPoster(antiguo);
  assert.ok(recorte);
  assert.ok(recorte.left >= 110);
  assert.equal(recorte.top, 0);
});

test("póster sin franjas o con borde no simétrico queda intacto", async () => {
  const original = await foto(450, 650, "#234f88");
  assert.equal(await repararPosterPelicula(original), null);
  const unBorde = await sharp(original)
    .extend({ top: 35, bottom: 0, left: 0, right: 0, background: "#ffffff" })
    .resize(450, 650, { fit: "fill" })
    .jpeg({ quality: 90 }).toBuffer();
  assert.equal(await detectarFranjasBlancasPoster(unBorde), null);
});
