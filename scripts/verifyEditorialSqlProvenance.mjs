/**
 * CineRD F-2.3: status of original SQL synopsis provenance and text reuse.
 * Documentary overlap does not establish who owns or wrote the original.
 * Does not approve content or change SQL/AdSense.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function verifySqlProvenanceLedger(ledger, films, sourceLedger) {
  const errors = [];
  if (!ledger || ledger.version !== 1 || !ledger.entries ||
      Array.isArray(ledger.entries) || !Array.isArray(films) ||
      !sourceLedger || !sourceLedger.entries) {
    return { total: 0, sinEvidencia: 0, acreditadas: 0,
      errors: ["Estructura de registro de procedencia invalida"] };
  }
  const withSql = films.filter(f => String(f.Sinopsis ?? "").trim().length > 0);
  const filmMap = new Map(withSql.map(f => [String(f.Id), f]));
  const entries = Object.entries(ledger.entries);
  if (filmMap.size !== withSql.length) errors.push("IDs SQL duplicados en catalogo");
  let sinEvidencia = 0, acreditadas = 0;
  for (const [key, row] of entries) {
    const film = filmMap.get(key);
    if (!film) { errors.push("Procedencia ajena a sinopsis SQL: " + key); continue; }
    if (!row || typeof row !== "object") {
      errors.push("Fila de procedencia invalida: " + key); continue;
    }
    if (Number(row.filmId) !== Number(key) ||
        row.title !== film.Titulo || Number(row.year) !== Number(String(film.FechaEstreno).slice(0, 4)))
      errors.push("ID/titulo/anio no coinciden: " + key);
    if (!sourceLedger.entries[key]) errors.push("Faltan fuentes F-2.1: " + key);
    if (!["por_identificar", "documentado"].includes(row.textOriginStatus))
      errors.push("Origen invalido: " + key);
    if (!["sin_evidencia_registrada", "acreditada"].includes(row.reusePermissionStatus))
      errors.push("Estado de permiso invalido: " + key);
    else if (row.reusePermissionStatus === "sin_evidencia_registrada") sinEvidencia++;
    else acreditadas++;
    if (row.observedOverlap !== "muy_alta") errors.push("Categoria de contraste incorrecta: " + key);
    if (!Array.isArray(row.comparisonSources) || row.comparisonSources.length < 1 ||
        new Set(row.comparisonSources).size !== row.comparisonSources.length ||
        row.comparisonSources.some(url => {
          try { return new URL(url).protocol !== "https:"; } catch { return true; }
        })) errors.push("Fuentes de contraste invalidas: " + key);
    if (typeof row.researchNote !== "string" || row.researchNote.trim().length < 50)
      errors.push("Nota de investigacion insuficiente: " + key);
    if (!Array.isArray(row.permissionEvidence)) errors.push("Evidencia de permisos invalida: " + key);
    const reviewed = typeof row.reviewedBy === "string" && row.reviewedBy.trim() &&
      typeof row.reviewedAt === "string" && !Number.isNaN(Date.parse(row.reviewedAt));
    if (row.reusePermissionStatus === "acreditada" &&
        (!reviewed || !Array.isArray(row.permissionEvidence) ||
          row.permissionEvidence.length === 0 ||
          row.permissionEvidence.some(e => !e || typeof e !== "string" || !e.trim())))
      errors.push("Permiso declarado sin evidencia y revisor: " + key);
    if (row.textOriginStatus === "documentado" && !reviewed)
      errors.push("Origen documentado sin revisor: " + key);
    if (row.reusePermissionStatus === "sin_evidencia_registrada" &&
        Array.isArray(row.permissionEvidence) && row.permissionEvidence.length > 0)
      errors.push("Evidencia registrada sin revisar estado: " + key);
  }
  for (const key of filmMap.keys()) if (!Object.hasOwn(ledger.entries, key))
    errors.push("Falta sinopsis SQL: " + key);
  return { total: entries.length, sinEvidencia, acreditadas, errors };
}

function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const read = rel => JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));
  const ledger = read("docs/editorial-provenance-sql-f23.json");
  const films = read("database/seeds/catalog.snapshot.json").tables.Peliculas;
  const sourceLedger = read("docs/editorial-sources-sql-f2.json");
  const result = verifySqlProvenanceLedger(ledger, films, sourceLedger);
  if (process.argv.includes("--json")) console.log(JSON.stringify(result, null, 2));
  else {
    console.log(`CineRD F-2.3 / procedencia SQL: ${result.total} sinopsis; ${result.sinEvidencia} sin evidencia de permiso registrada; ${result.acreditadas} acreditadas.`);
    for (const error of result.errors) console.error("✗ " + error);
    if (result.errors.length === 0) console.log("✓ Registro trazable. No constituye autorizacion ni aprobacion editorial.");
  }
  if (result.errors.length) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
