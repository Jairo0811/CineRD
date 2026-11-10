const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { EventEmitter } = require("node:events");
const { generarNombreMedia, registrarLimpiezaEnFallo } = require("../src/middlewares/procesarImagen");

async function esperarEliminacion(file) {
  for (let i = 0; i < 30 && fs.existsSync(file); i++) {
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  assert.equal(fs.existsSync(file), false, "la foto nueva debe eliminarse si falló la escritura SQL");
}

test("identificadores de medios no colisionan ni en el mismo milisegundo", () => {
  const names = new Set(Array.from({ length: 100 }, () => generarNombreMedia(".jpeg")));
  assert.equal(names.size, 100);
  for (const file of names) {
    assert.match(file, /^\d{13}-[a-f0-9-]{36}\.jpeg$/i);
    assert.doesNotMatch(file, /[/\\]/);
  }
});

test("si INSERT/UPDATE falla (400/403/409/500) solo se elimina el archivo nuevo", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cinerd-upload-test-"));
  const historic = path.join(dir, "foto-historica.jpeg");
  fs.writeFileSync(historic, "historica");
  try {
    for (const statusCode of [400, 403, 409, 500]) {
      const newFile = path.join(dir, generarNombreMedia(".jpeg"));
      fs.writeFileSync(newFile, "temporal");
      const res = Object.assign(new EventEmitter(), { statusCode, writableEnded: true });
      registrarLimpiezaEnFallo(res, newFile);
      res.emit("finish");
      await esperarEliminacion(newFile);
      assert.equal(fs.readFileSync(historic, "utf8"), "historica");
    }
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test("respuesta exitosa conserva la imagen, y cierre prematuro la retira", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cinerd-upload-test-"));
  try {
    const success = path.join(dir, "nueva-aceptada.webp");
    fs.writeFileSync(success, "guardada");
    const resOk = Object.assign(new EventEmitter(), { statusCode: 201, writableEnded: true });
    registrarLimpiezaEnFallo(resOk, success);
    resOk.emit("finish");
    resOk.emit("close");
    assert.equal(fs.readFileSync(success, "utf8"), "guardada");

    const aborted = path.join(dir, "nueva-abortada.webp");
    fs.writeFileSync(aborted, "temporal");
    const resAbort = Object.assign(new EventEmitter(), { statusCode: 200, writableEnded: false });
    registrarLimpiezaEnFallo(resAbort, aborted);
    resAbort.emit("close");
    await esperarEliminacion(aborted);
    assert.equal(fs.existsSync(success), true);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
