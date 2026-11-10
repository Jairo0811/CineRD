import test from "node:test";
import assert from "node:assert/strict";
import { auditLocalCineRD, requireLoopbackOrigin } from "./auditLocalCineRD.mjs";

const snapshot = {
  tables: {
    Peliculas: [{ Id: 4, Titulo: "Sanky Panky" }, { Id: 5, Titulo: "Perico Ripiao" }],
    Actores: [{ Id: 3, NombreCompleto: "Fausto Mata" }],
    ActoresPeliculas: [{ PeliculaId: 4, ActorId: 3 }],
  },
};

function responder(body, status = 200) {
  return { status, json: async () => body };
}

test("solo permite auditar localhost, nunca dominios de producción", () => {
  assert.equal(requireLoopbackOrigin("http://127.0.0.1:3000/"), "http://127.0.0.1:3000");
  assert.equal(requireLoopbackOrigin("http://localhost:3000"), "http://localhost:3000");
  for (const url of [
    "https://cinerd.pages.dev", "https://127.0.0.1:3000",
    "http://192.168.1.20:3000", "http://127.0.0.1:3000/admin",
    "http://username:password@localhost:3000", "not-a-url",
  ]) {
    assert.throws(() => requireLoopbackOrigin(url), /local|permite/i, url);
  }
});

test("auditoría exitosa prueba salud, SQL, catálogo y denegación anónima sin escribir", async () => {
  const calls = [];
  const routes = {
    "/health": responder({ status: "ok" }),
    "/ready": responder({ status: "ready", database: "ok" }),
    "/api/peliculas": responder(snapshot.tables.Peliculas),
    "/api/actores": responder(snapshot.tables.Actores),
    "/api/peliculas/4": responder(snapshot.tables.Peliculas[0]),
    "/api/actores/3": responder(snapshot.tables.Actores[0]),
    "/api/auth/perfil": responder({ mensaje: "Autenticación requerida" }, 401),
    "/api/verificaciones/admin/pendientes": responder({ mensaje: "Autenticación requerida" }, 401),
    "/api/solicitudes-creditos/admin": responder({ mensaje: "Autenticación requerida" }, 401),
  };
  const fetchImpl = async (url, options) => {
    const parsed = new URL(url);
    calls.push({ url: parsed, options });
    if (!routes[parsed.pathname]) throw new Error("Ruta inesperada: " + parsed.pathname);
    return routes[parsed.pathname];
  };
  const result = await auditLocalCineRD({ snapshot, fetchImpl });
  assert.equal(result.status, "SMOKE_PASS");
  assert.equal(result.mode, "READ_ONLY");
  assert.deepEqual(result.reference, { films: 2, talents: 1, relations: 1 });
  assert.equal(result.checks.films.count, 2);
  assert.equal(result.checks.talents.count, 1);
  assert.equal(result.warnings.length, 0);
  assert.equal(calls.length, 9);
  assert.ok(calls.every(x => x.options.method === "GET"));
  assert.ok(calls.every(x => x.url.hostname === "127.0.0.1"));
});

test("SQL detenido no se confunde con éxito ni desencadena migraciones", async () => {
  const paths = [];
  const fetchImpl = async url => {
    const route = new URL(url).pathname;
    paths.push(route);
    if (route === "/health") return responder({ status: "ok" });
    if (route === "/ready") return responder({ status: "not-ready", database: "unavailable" }, 503);
    if (route.startsWith("/api/")) return responder({}, 401);
    throw new Error("Ruta inesperada");
  };
  const result = await auditLocalCineRD({ snapshot, fetchImpl });
  assert.equal(result.status, "INCOMPLETE");
  assert.equal(result.checks.ready.status, 503);
  assert.equal(result.checks.films, undefined);
  assert.ok(!paths.includes("/api/peliculas"));
  assert.equal(result.warnings.length, 1);
});

test("si la API no corre indica API_STOPPED y no intenta el catálogo", async () => {
  let calls = 0;
  const result = await auditLocalCineRD({
    snapshot, fetchImpl: async () => { calls++; throw new Error("ECONNREFUSED"); },
  });
  assert.equal(result.status, "API_STOPPED");
  assert.equal(result.checks.health.pass, false);
  assert.equal(calls, 1);
});
