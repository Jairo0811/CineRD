const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const { crearPoliticaCors } = require("../src/config/cors");

const silenciar = (fn) => {
  const warn = console.warn;
  console.warn = () => {};
  try { return fn(); } finally { console.warn = warn; }
};

test("producción: solo se aceptan los orígenes de FRONTEND_URLS (con o sin barra final)", () => {
  const { esOrigenPermitido } = crearPoliticaCors({
    NODE_ENV: "production",
    FRONTEND_URLS: "https://cinerd.netlify.app/, https://www.cinerd.do",
  });
  assert.equal(esOrigenPermitido("https://cinerd.netlify.app"), true);
  assert.equal(esOrigenPermitido("https://www.cinerd.do"), true);
  assert.equal(esOrigenPermitido("https://evil.example"), false);
  assert.equal(esOrigenPermitido("https://cinerd.netlify.app.evil.example"), false);
});

test("producción: localhost y redes privadas ya no se aceptan", () => {
  const { esOrigenPermitido } = crearPoliticaCors({ NODE_ENV: "production", FRONTEND_URLS: "https://cinerd.netlify.app" });
  ["http://localhost:5173", "http://127.0.0.1:5173", "http://192.168.1.20:5173", "http://10.0.0.5", "null"].forEach((origen) =>
    assert.equal(esOrigenPermitido(origen), false, origen),
  );
});

test("producción sin FRONTEND_URLS no abre nada por defecto", () => {
  const { esOrigenPermitido } = silenciar(() => crearPoliticaCors({ NODE_ENV: "production" }));
  assert.equal(esOrigenPermitido("http://localhost:5173"), false);
  assert.equal(esOrigenPermitido(undefined), true, "sin cabecera Origin (health checks, curl) se permite");
});

test("desarrollo: acepta localhost y redes privadas en el puerto del frontend, pero no otros sitios", () => {
  const { esOrigenPermitido } = crearPoliticaCors({ NODE_ENV: "development" });
  assert.equal(esOrigenPermitido("http://localhost:5173"), true);
  assert.equal(esOrigenPermitido("http://192.168.1.20:5173"), true);
  assert.equal(esOrigenPermitido("http://172.20.0.4:5173"), true);
  assert.equal(esOrigenPermitido("http://localhost:9999"), false);
  assert.equal(esOrigenPermitido("http://172.32.0.1:5173"), false);
  assert.equal(esOrigenPermitido("https://evil.example"), false);
});

test("un origen no permitido recibe 403 y la ruta ni siquiera se ejecuta; uno permitido recibe cabeceras CORS", async () => {
  const { middleware } = crearPoliticaCors({ NODE_ENV: "production", FRONTEND_URLS: "https://cinerd.netlify.app" });
  const app = express();
  let ejecuciones = 0;
  app.use(middleware);
  app.post("/accion", (req, res) => { ejecuciones += 1; res.json({ ok: true }); });

  const servidor = app.listen(0);
  const base = `http://127.0.0.1:${servidor.address().port}`;
  try {
    const bloqueada = await fetch(`${base}/accion`, { method: "POST", headers: { Origin: "https://evil.example" } });
    assert.equal(bloqueada.status, 403);
    assert.equal((await bloqueada.json()).mensaje, "Origen no permitido");
    assert.equal(ejecuciones, 0);

    const preflight = await fetch(`${base}/accion`, {
      method: "OPTIONS",
      headers: { Origin: "https://evil.example", "Access-Control-Request-Method": "POST" },
    });
    assert.equal(preflight.status, 403);

    const permitida = await fetch(`${base}/accion`, { method: "POST", headers: { Origin: "https://cinerd.netlify.app" } });
    assert.equal(permitida.status, 200);
    assert.equal(permitida.headers.get("access-control-allow-origin"), "https://cinerd.netlify.app");
    assert.equal(permitida.headers.get("access-control-allow-credentials"), "true");
    assert.equal(ejecuciones, 1);

    const sinOrigen = await fetch(`${base}/accion`, { method: "POST" });
    assert.equal(sinOrigen.status, 200);
  } finally {
    servidor.close();
  }
});
