#!/usr/bin/env node
/**
 * Paridad Express vs ASP.NET Core para GET /api/actores y GET /api/actores/{id}.
 * Ambos backends deben apuntar a la MISMA base de pruebas. Solo lectura. No guarda datos en disco.
 *
 * Uso:
 *   node scripts/compareActoresParity.mjs [--express http://localhost:3000] [--dotnet http://localhost:5100]
 *
 * Compara: código HTTP, claves y su ORDEN, tipos JSON, valores (incluidos null y fechas) y orden de filas.
 * Diferencia documentada (no se compara): el 500 de Express incluye `error.message`; .NET no lo expone.
 */
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1].replace(/\/$/, "") : fallback;
};
const EXPRESS = arg("express", "http://localhost:3000");
const DOTNET = arg("dotnet", "http://localhost:5100");

const QUERIES = [
  "",
  "?orden=za",
  "?orden=masPeliculas",
  "?orden=menosPeliculas",
  "?orden=nacimientoReciente",
  "?orden=nacimientoAntiguo",
  "?orden=desconocido",
  "?estado=vivo",
  "?estado=fallecido",
  "?estado=otro",
  "?buscar=a",
  "?buscar=%20%20",
  "?profesion=act",
  "?anio=1980",
  "?buscar=a&estado=vivo&profesion=act&orden=masPeliculas",
  "?buscar=zzzzzz-sin-resultados",
];

const tipo = (v) => (v === null ? "null" : Array.isArray(v) ? "array" : typeof v);

function diff(a, b, path, out) {
  if (tipo(a) !== tipo(b)) return out.push(`${path}: tipo ${tipo(a)} (express) vs ${tipo(b)} (dotnet)`);
  if (Array.isArray(a)) {
    if (a.length !== b.length) out.push(`${path}: longitud ${a.length} vs ${b.length}`);
    for (let i = 0; i < Math.min(a.length, b.length); i++) diff(a[i], b[i], `${path}[${i}]`, out);
    return;
  }
  if (a && typeof a === "object") {
    const ka = Object.keys(a), kb = Object.keys(b);
    if (ka.join("|") !== kb.join("|")) out.push(`${path}: claves/orden ${ka.join(",")} vs ${kb.join(",")}`);
    for (const k of ka) if (k in b) diff(a[k], b[k], `${path}.${k}`, out);
    return;
  }
  if (a !== b) out.push(`${path}: ${JSON.stringify(a)} vs ${JSON.stringify(b)}`);
}

async function get(base, ruta) {
  const r = await fetch(base + ruta);
  let cuerpo = null;
  try { cuerpo = await r.json(); } catch { /* cuerpo no JSON */ }
  return { status: r.status, cuerpo };
}

let fallos = 0, comparados = 0;
async function comparar(ruta) {
  const [e, d] = await Promise.all([get(EXPRESS, ruta), get(DOTNET, ruta)]);
  comparados++;
  const problemas = [];
  if (e.status !== d.status) problemas.push(`HTTP ${e.status} (express) vs ${d.status} (dotnet)`);
  else if (e.status >= 500) { /* 500: solo se exige el mismo código */ }
  else diff(e.cuerpo, d.cuerpo, "$", problemas);
  if (problemas.length) {
    fallos++;
    console.log(`DIFERENCIA ${ruta}`);
    problemas.slice(0, 8).forEach((p) => console.log(`   - ${p}`));
    if (problemas.length > 8) console.log(`   ... y ${problemas.length - 8} más`);
  } else {
    const n = Array.isArray(e.cuerpo) ? ` (${e.cuerpo.length} filas)` : "";
    console.log(`OK         ${ruta}${n}`);
  }
  return e;
}

for (const q of QUERIES) {
  const r = await comparar(`/api/actores${q}`);
  if (q === "" && Array.isArray(r.cuerpo)) globalThis.__ids = r.cuerpo.map((a) => a.Id);
}
const ids = globalThis.__ids ?? [];
for (const id of ids) await comparar(`/api/actores/${id}`);
for (const extra of ["0", "-1", "abc", "1.5", "2147483647"]) await comparar(`/api/actores/${extra}`);

console.log(`\n${comparados} comparaciones, ${fallos} con diferencias.`);
if (ids.length === 0) console.log("AVISO: el listado vino vacío o falló; no se comparó ningún detalle por id.");
process.exit(fallos === 0 && ids.length > 0 ? 0 : 1);
