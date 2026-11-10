/**
 * CineRD — auditoría de humo LOCAL sin escrituras SQL.
 * No ejecuta POST/PATCH/PUT/DELETE, migraciones, exportación ni backup.
 *
 * node scripts/auditLocalCineRD.mjs [--json]
 * CINERD_LOCAL_ORIGIN=http://127.0.0.1:3000 (solo loopback)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const snapshotPath = path.join(root, "database/seeds/catalog.snapshot.json");

export function requireLoopbackOrigin(origin) {
  let url;
  try { url = new URL(origin); } catch { throw new Error("Origen local HTTP inválido"); }
  if (url.protocol !== "http:" || !["localhost","127.0.0.1"].includes(url.hostname) ||
      (url.pathname !== "/" && url.pathname !== "") || url.search || url.hash ||
      url.username || url.password) {
    throw new Error("CineRD: solo se permite un origen HTTP localhost/127.0.0.1 sin ruta");
  }
  return url.origin;
}

async function checkedFetch(fetchImpl, origin, route) {
  try {
    const response = await fetchImpl(origin + route, {
      method: "GET",
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(6000),
    });
    let body = null;
    try { body = await response.json(); } catch { /* not JSON */ }
    return { route, status: response.status, body };
  } catch (error) {
    return { route, status: null, error: error?.name === "TimeoutError" ? "TIMEOUT" : "CONNECTION_FAILED" };
  }
}

export async function auditLocalCineRD({
  origin = "http://127.0.0.1:3000",
  fetchImpl = fetch,
  snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8")),
} = {}) {
  const api = requireLoopbackOrigin(origin);
  const filmsSnapshot = snapshot?.tables?.Peliculas || [];
  const talentSnapshot = snapshot?.tables?.Actores || [];
  const relationsSnapshot = snapshot?.tables?.ActoresPeliculas || [];
  const report = {
    format: "CineRD.LocalSmokeReport",
    mode: "READ_ONLY",
    origin: api,
    reference: {
      films: filmsSnapshot.length,
      talents: talentSnapshot.length,
      relations: relationsSnapshot.length,
    },
    checks: {},
    warnings: [],
    status: "INCOMPLETE",
  };

  const health = await checkedFetch(fetchImpl, api, "/health");
  report.checks.health = { status: health.status, pass: health.status === 200 && health.body?.status === "ok" };
  if (!report.checks.health.pass) {
    report.warnings.push("API local no disponible; iniciar backend antes de la auditoría");
    report.status = "API_STOPPED";
    return report;
  }

  const ready = await checkedFetch(fetchImpl, api, "/ready");
  report.checks.ready = { status: ready.status, pass: ready.status === 200 && ready.body?.database === "ok" };
  if (!report.checks.ready.pass) {
    report.warnings.push("SQL Server no está listo: revisar conexión local, sin ejecutar migraciones automáticamente");
  }

  // Acceso anónimo: endpoints privados deben dar 401, nunca contenido real.
  for (const route of ["/api/auth/perfil", "/api/verificaciones/admin/pendientes", "/api/solicitudes-creditos/admin"]) {
    const result = await checkedFetch(fetchImpl, api, route);
    report.checks[route] = { status: result.status, pass: result.status === 401 };
    if (result.status !== 401) report.warnings.push("Control de acceso pendiente: " + route);
  }

  if (report.checks.ready.pass) {
    const [films, talents] = await Promise.all([
      checkedFetch(fetchImpl, api, "/api/peliculas"),
      checkedFetch(fetchImpl, api, "/api/actores"),
    ]);
    report.checks.films = {
      status: films.status, count: Array.isArray(films.body) ? films.body.length : null,
      pass: films.status === 200 && Array.isArray(films.body),
    };
    report.checks.talents = {
      status: talents.status, count: Array.isArray(talents.body) ? talents.body.length : null,
      pass: talents.status === 200 && Array.isArray(talents.body),
    };
    for (const [label, expected] of [["films",filmsSnapshot.length],["talents",talentSnapshot.length]]) {
      if (report.checks[label].pass && report.checks[label].count !== expected) {
        report.warnings.push(label + ": el SQL local difiere del snapshot versionado (" +
          report.checks[label].count + " frente a " + expected + ")");
      }
    }
    for (const [kind, rows, route] of [
      ["filmDetail", films.body, "/api/peliculas/"],
      ["talentDetail", talents.body, "/api/actores/"],
    ]) {
      if (Array.isArray(rows) && rows.length && Number.isSafeInteger(Number(rows[0].Id))) {
        const result = await checkedFetch(fetchImpl, api, route + encodeURIComponent(rows[0].Id));
        report.checks[kind] = { status: result.status, pass: result.status === 200 && Number(result.body?.Id) === Number(rows[0].Id) };
      } else {
        report.checks[kind] = { status: null, pass: false };
      }
    }
  }

  const checks = Object.values(report.checks);
  report.status = checks.every(c => c.pass) ? "SMOKE_PASS" : "INCOMPLETE";
  report.notes = "SMOKE_PASS confirma rutas públicas y bloqueos anónimos: no certifica CRUD, roles con sesión, correo, backups o revisión editorial.";
  return report;
}

const direct = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (direct) {
  try {
    const result = await auditLocalCineRD({
      origin: process.env.CINERD_LOCAL_ORIGIN || "http://127.0.0.1:3000",
    });
    if (process.argv.includes("--json")) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log("CineRD — auditoría local (solo lectura)");
      console.log("API: " + (result.checks.health?.pass ? "PASS" : "FAIL") +
        "; SQL: " + (result.checks.ready?.pass ? "PASS" : "NOT_READY") +
        "; Resultado: " + result.status);
      for (const [name, item] of Object.entries(result.checks)) {
        console.log(" - " + name + ": " + (item.pass ? "PASS" : "FAIL") +
          " (HTTP " + (item.status ?? "sin respuesta") + ")" +
          (item.count == null ? "" : ", " + item.count + " registros"));
      }
      result.warnings.forEach(w => console.log(" ⚠ " + w));
      console.log("No se ejecutaron escrituras ni migraciones.");
    }
    if (result.status !== "SMOKE_PASS") process.exitCode = 1;
  } catch (error) {
    console.error("CineRD: " + error.message);
    process.exitCode = 1;
  }
}
