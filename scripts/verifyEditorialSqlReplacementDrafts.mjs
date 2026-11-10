/**
 * CineRD F-2.3: verify draft replacements for SQL synopses.
 * This command only reads data; it never publishes or approves proposals.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SINOPSIS_EDITORIALES_FASE_E } from "../frontend/src/data/sinopsisCuradasFaseE.js";

const text = value => String(value ?? "").replace(/\s+/g, " ").trim();

export function validateSqlSynopsisDrafts(plan, movies, provenance, sources, existingDrafts = {}) {
  const errors = [];
  if (!plan || plan.version !== 1 || plan.autoPublish !== false ||
      !plan.entries || Array.isArray(plan.entries) ||
      typeof plan.entries !== "object" ||
      !Array.isArray(movies) || !provenance?.entries || !sources?.entries) {
    return { total: 0, pending: 0, autoPublished: 0, errors: ["Plan o registros invalidos / publicacion automatica no permitida"] };
  }
  const filmRows = movies.filter(x => text(x.Sinopsis).length > 0);
  const filmsById = new Map(filmRows.map(x => [String(x.Id), x]));
  const planEntries = Object.entries(plan.entries);
  let pending = 0;
  for (const [key, entry] of planEntries) {
    const film = filmsById.get(key);
    if (!film) { errors.push("Película ajena a SQL: " + key); continue; }
    if (!entry || typeof entry !== "object") { errors.push("Propuesta vacía: " + key); continue; }
    if (Number(entry.filmId) !== Number(key) || entry.title !== film.Titulo ||
        Number(entry.year) !== Number(String(film.FechaEstreno).slice(0, 4)))
      errors.push("Identidad ID/título/año distinta del snapshot: " + key);
    if (entry.status !== "pendiente_revision" || entry.deployment !== "manual_only" ||
        entry.reviewedBy !== null || entry.reviewedAt !== null ||
        Object.hasOwn(entry, "approved") || Object.hasOwn(entry, "enabled"))
      errors.push("Publicación o aprobación no permitida: " + key);
    else pending++;
    if (typeof entry.es !== "string" || entry.es.trim().length < 125 ||
        typeof entry.en !== "string" || entry.en.trim().length < 120 ||
        text(entry.es) === text(film.Sinopsis))
      errors.push("Texto ES/EN insuficiente o idéntico al SQL: " + key);
    const registered = (sources.entries[key]?.fuentes || []).map(x => x.url);
    if (!registered.length || !Array.isArray(entry.sources) ||
        entry.sources.length < 1 || new Set(entry.sources).size !== entry.sources.length ||
        entry.sources.some(url => {
          try { return new URL(url).protocol !== "https:" || !registered.includes(url); }
          catch { return true; }
        })) errors.push("Fuentes no registradas o inseguras: " + key);
    if (!provenance.entries[key] ||
        entry.sourcePermissionStatus !== "sin_evidencia_registrada" ||
        provenance.entries[key].reusePermissionStatus !== "sin_evidencia_registrada")
      errors.push("Procedencia/permiso no conciliados: " + key);
    if (!Array.isArray(entry.openQuestions) || entry.openQuestions.length < 1 ||
        entry.openQuestions.some(q => typeof q !== "string" || q.trim().length < 20))
      errors.push("Revisión humana sin observaciones abiertas: " + key);
    const original = existingDrafts[Number(key)];
    if (entry.draftOrigin === "borrador_editorial_fase_e") {
      if (!original || entry.es !== original.es || entry.en !== original.en)
        errors.push("Borrador E modificado sin clasificar como nueva revisión: " + key);
    } else if (entry.draftOrigin !== "nueva_redaccion_f23") {
      errors.push("Origen de la propuesta invalido: " + key);
    }
  }
  for (const key of filmsById.keys()) if (!Object.hasOwn(plan.entries, key))
    errors.push("Sin propuesta de reemplazo: " + key);
  if (filmsById.size !== filmRows.length) errors.push("Películas SQL duplicadas");
  return { total: planEntries.length, pending, autoPublished: 0, errors };
}

function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const read = rel => JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));
  const result = validateSqlSynopsisDrafts(
    read("docs/editorial-sql-replacement-drafts-f23.json"),
    read("database/seeds/catalog.snapshot.json").tables.Peliculas,
    read("docs/editorial-provenance-sql-f23.json"),
    read("docs/editorial-sources-sql-f2.json"),
    SINOPSIS_EDITORIALES_FASE_E
  );
  if (process.argv.includes("--json")) console.log(JSON.stringify(result, null, 2));
  else {
    console.log(`CineRD F-2.3 / reemplazos SQL: ${result.total} propuestas, ${result.pending} pendientes, ${result.autoPublished} publicadas automáticamente.`);
    for (const error of result.errors) console.error("✗ " + error);
    if (!result.errors.length)
      console.log("✓ Propuestas de revisión trazables; SQL y publicación del sitio permanecen intactos.");
  }
  if (result.errors.length) process.exitCode = 1;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
