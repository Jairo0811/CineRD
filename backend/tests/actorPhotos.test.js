const test = require("node:test");
const assert = require("node:assert/strict");
const sharp = require("sharp");

const {
  ANCHO_RETRATO,
  ALTO_RETRATO,
  normalizarFotoTalento,
  detectarFranjasBlancas,
  repararFotoTalento,
} = require("../src/utils/actorPhoto");

const crearFoto = (width, height, background = "#3478b7") =>
  sharp({
    create: { width, height, channels: 3, background },
  }).jpeg({ quality: 95 }).toBuffer();

const esquina = async (buffer) => {
  const { data } = await sharp(buffer).extract({ left: 0, top: 0, width: 1, height: 1 })
    .removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return [...data];
};

test("fotos nuevas horizontales no reciben franjas blancas en el formato retrato", async () => {
  const entrada = await crearFoto(900, 400);
  const procesada = await normalizarFotoTalento(entrada);
  const info = await sharp(procesada).metadata();

  assert.equal(info.width, ANCHO_RETRATO);
  assert.equal(info.height, ALTO_RETRATO);
  assert.equal(info.format, "jpeg");
  const [r, g, b] = await esquina(procesada);
  assert.ok(r < 240 || g < 240 || b < 240, "no debe agregarse un fondo blanco");
});

test("fotos nuevas verticales mantienen relación 4:5 sin deformarse ni recortar", async () => {
  const entrada = await crearFoto(300, 900, "#b12452");
  const procesada = await normalizarFotoTalento(entrada);
  const info = await sharp(procesada).metadata();
  assert.equal(info.width, ANCHO_RETRATO);
  assert.equal(info.height, ALTO_RETRATO);
  assert.equal(await detectarFranjasBlancas(procesada), null);
});

test("detecta y repara bandas blancas superiores e inferiores heredadas", async () => {
  const base = await crearFoto(900, 450);
  const antiguo = await sharp(base).resize(450, 450, {
    fit: "contain", background: "#ffffff",
  }).jpeg({ quality: 90 }).toBuffer();

  const recorte = await detectarFranjasBlancas(antiguo);
  assert.ok(recorte, "debe detectar relleno blanco de la versión anterior");
  assert.equal(recorte.left, 0);
  assert.ok(recorte.top >= 90);
  const reparacion = await repararFotoTalento(antiguo);
  assert.deepEqual(reparacion.recorte, recorte);
  const info = await sharp(reparacion.buffer).metadata();
  assert.equal(info.width, ANCHO_RETRATO);
  assert.equal(info.height, ALTO_RETRATO);
});

test("detecta barras blancas laterales heredadas", async () => {
  const base = await crearFoto(450, 900);
  const antiguo = await sharp(base).resize(450, 450, {
    fit: "contain", background: "#ffffff",
  }).jpeg({ quality: 90 }).toBuffer();
  const recorte = await detectarFranjasBlancas(antiguo);
  assert.ok(recorte);
  assert.ok(recorte.left >= 90);
  assert.equal(recorte.top, 0);
});

test("no modifica fotos cuadradas sin bandas blancas", async () => {
  const original = await crearFoto(450, 450, "#173c72");
  assert.equal(await detectarFranjasBlancas(original), null);
  assert.equal(await repararFotoTalento(original), null);
});

test("una foto pequeña no se agranda: primer plano conserva sus dimensiones", async () => {
  const entrada = await sharp({
    create: { width: 90, height: 140, channels: 3, background: "#df2030" },
  }).png().toBuffer();

  const salida = await normalizarFotoTalento(entrada);
  const { data, info } = await sharp(salida).raw().toBuffer({ resolveWithObject: true });
  assert.equal(info.width, ANCHO_RETRATO);
  assert.equal(info.height, ALTO_RETRATO);

  // El fondo borroso es rojo oscuro. Solo los píxeles rojos intensos pertenecen
  // al retrato nítido; su ancho debe seguir siendo 90 px, no 450 px.
  let widthBright = 0;
  const y = Math.floor(ALTO_RETRATO / 2);
  for (let x = 0; x < ANCHO_RETRATO; x++) {
    const i = (y * ANCHO_RETRATO + x) * info.channels;
    if (data[i] > 170 && data[i + 1] < 100 && data[i + 2] < 110) widthBright++;
  }
  assert.ok(widthBright >= 85 && widthBright <= 95,
    `El retrato no debe ampliarse: ancho esperado ~90, recibido ${widthBright}`);
});

test("una foto horizontal conserva ambos extremos dentro del cuadro final", async () => {
  const izquierda = await sharp({
    create: { width: 600, height: 300, channels: 3, background: "#e31d28" },
  }).png().toBuffer();
  const derecha = await sharp({
    create: { width: 300, height: 300, channels: 3, background: "#2066e4" },
  }).png().toBuffer();

  const entrada = await sharp(izquierda)
    .composite([{ input: derecha, left: 300, top: 0 }])
    .png()
    .toBuffer();

  const salida = await normalizarFotoTalento(entrada);
  const { data, info } = await sharp(salida).raw().toBuffer({ resolveWithObject: true });

  const pixel = (x, y) => {
    const i = (y * info.width + x) * info.channels;
    return [data[i], data[i + 1], data[i + 2]];
  };

  const a = pixel(20, 280);
  const b = pixel(430, 280);
  assert.ok(a[0] > a[2] + 80, "el extremo izquierdo debe seguir rojo");
  assert.ok(b[2] > b[0] + 80, "el extremo derecho debe seguir azul");
});
