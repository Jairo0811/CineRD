/**
 * Control de inventario de derechos sobre imágenes públicas en CineRD.
 *
 * Verifica TRAZABILIDAD del catálogo, no concede licencias ni certifica derechos.
 * Ejecutar: node scripts/verifyMediaRightsLedger.mjs
 * El CSV es un registro editorial INTERNO: nunca se copia a frontend/public.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const COLUMNS = [
  "file_path", "kind", "entity_id", "entity_name", "field", "source_url",
  "rights_holder", "permission_basis", "evidence_ref", "commercial_use_authorized",
  "attribution", "reviewed_on", "reviewed_by", "status", "notes",
  "license_scope", "license_until",
];
const STATUSES = new Set(["PENDIENTE", "AUTORIZADO", "RESTRINGIDO", "RETIRAR"]);
const APPROVAL_BASIS = new Set(["PROPIEDAD", "LICENCIA", "PERMISO", "DOMINIO_PUBLICO"]);
const SAFE_PATH = /^\/uploads\/(actores|peliculas|galerias)\/[^/.][^/]*$/i;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function validDate(value) {
  if (!ISO_DATE.test(String(value || ""))) return false;
  const d = new Date(value + "T00:00:00Z");
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

/** Requiere revisión documental real: el CSV no verifica firmas o contratos. */
export function isEffectiveCommercialLicense(row, today = new Date().toISOString().slice(0, 10)) {
  if (row?.status !== "AUTORIZADO") return false;
  if (!["PROPIEDAD", "LICENCIA", "PERMISO", "DOMINIO_PUBLICO"].includes(row.permission_basis)) return false;
  if (!["rights_holder", "evidence_ref", "reviewed_by"].every(key => String(row[key] || "").trim())) return false;
  if (row.commercial_use_authorized !== "SI" || row.license_scope !== "WEB_MONETIZADA") return false;
  if (!validDate(row.reviewed_on) || row.reviewed_on > today) return false;
  if (row.license_until === "SIN_VENCIMIENTO") return true;
  return validDate(row.license_until) && row.license_until >= today;
}

export function readCsv(text) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter(line => line.trim() !== "");
  if (!lines.length) throw new Error("CSV vacío");
  function parseLine(line, number) {
    const fields = [];
    let value = "";
    let quoted = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (quoted && line[i + 1] === '"') { value += '"'; i++; }
        else if (!quoted && value === "") quoted = true;
        else if (quoted) quoted = false;
        else throw new Error("Comilla CSV mal colocada en línea " + number);
      } else if (c === "," && !quoted) { fields.push(value); value = ""; }
      else value += c;
    }
    if (quoted) throw new Error("Comilla CSV sin cerrar en línea " + number);
    fields.push(value);
    return fields;
  }
  const header = parseLine(lines[0], 1);
  if (header.join("|") !== COLUMNS.join("|")) {
    throw new Error("Encabezados CSV incorrectos: " + header.join(","));
  }
  return lines.slice(1).map((line, index) => {
    const values = parseLine(line, index + 2);
    if (values.length !== COLUMNS.length) throw new Error("Número de columnas inválido en línea " + (index + 2));
    return Object.fromEntries(COLUMNS.map((column, i) => [column, values[i]]));
  });
}

export function expectedFromCatalog(catalog) {
  const t = catalog.tables;
  if (!t || !Array.isArray(t.Actores) || !Array.isArray(t.Peliculas) || !Array.isArray(t.GaleriaMultimedia)) {
    throw new Error("Snapshot sin las tablas públicas necesarias para auditar medios");
  }
  const rows = [];
  for (const a of t.Actores) if (a.Foto) rows.push({
    file_path: a.Foto, kind: "talento", entity_id: String(a.Id),
    entity_name: a.NombreArtistico || a.NombreCompleto || "", field: "Foto",
  });
  for (const p of t.Peliculas) for (const field of ["Foto", "Backdrop"]) {
    if (p[field]) rows.push({
      file_path: p[field], kind: "pelicula", entity_id: String(p.Id),
      entity_name: p.Titulo || "", field,
    });
  }
  for (const g of t.GaleriaMultimedia) if (g.Archivo) rows.push({
    file_path: g.Archivo, kind: "galeria", entity_id: String(g.Id),
    entity_name: g.Titulo || "", field: "Archivo",
  });
  return rows;
}

export function auditRows(catalog, rows) {
  const errors = [];
  const expected = expectedFromCatalog(catalog);
  const indexed = new Map();
  for (const row of rows) {
    const key = row.file_path;
    if (indexed.has(key)) errors.push("Archivo duplicado en el registro: " + key);
    indexed.set(key, row);
    if (!SAFE_PATH.test(key) || key.includes("..") || key.includes("\\")) errors.push("Ruta insegura: " + key);
    if (!STATUSES.has(row.status)) errors.push("Estado de derechos inválido: " + key + " (" + row.status + ")");
    if (row.source_url) {
      try { if (new URL(row.source_url).protocol !== "https:") throw new Error("unsafe"); }
      catch { errors.push("source_url debe ser una URL HTTPS: " + key); }
    }
    if (!["", "SI", "NO"].includes(row.commercial_use_authorized)) {
      errors.push("commercial_use_authorized debe ser SI, NO o vacío: " + key);
    }
    // La aprobación NO puede deducirse de TMDbId, una URL, un póster público
    // o la mera atribución. Requiere evidencia documental y autorización comercial.
    if (row.status === "AUTORIZADO") {
      const missing = ["rights_holder", "permission_basis", "evidence_ref",
        "reviewed_by", "reviewed_on"].filter(k => !row[k]?.trim());
      if (missing.length) errors.push("AUTORIZADO sin evidencia (" + missing.join(", ") + "): " + key);
      if (!APPROVAL_BASIS.has(row.permission_basis)) errors.push("Fundamento de licencia no aceptable: " + key);
      if (row.commercial_use_authorized !== "SI") errors.push("AUTORIZADO sin permiso comercial documentado: " + key);
      if (row.reviewed_on && !validDate(row.reviewed_on)) {
        errors.push("Fecha de revisión inválida: " + key);
      }
      if (!isEffectiveCommercialLicense(row)) {
        errors.push("AUTORIZADO sin uso web comercial explícito o con licencia vencida: " + key);
      }
    }
  }
  const expectedMap = new Map();
  for (const e of expected) {
    if (expectedMap.has(e.file_path)) errors.push("El catálogo reutiliza una ruta en varias fichas: " + e.file_path);
    expectedMap.set(e.file_path, e);
    const actual = indexed.get(e.file_path);
    if (!actual) { errors.push("Sin registro de derechos: " + e.file_path); continue; }
    for (const k of ["kind", "entity_id", "entity_name", "field"]) {
      if (actual[k] !== e[k]) errors.push("Desactualizado " + k + " para " + e.file_path);
    }
  }
  for (const key of indexed.keys()) {
    if (!expectedMap.has(key)) errors.push("Archivo del registro ya no referenciado por catálogo: " + key);
  }
  const counts = Object.fromEntries([...STATUSES].map(k => [k, rows.filter(r => r.status === k).length]));
  const byKind = Object.fromEntries(["talento", "pelicula", "galeria"].map(k => [k, rows.filter(r => r.kind === k).length]));
  return { errors, expected: expected.length, rows: rows.length, counts, byKind };
}

export function runAudit() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const catalog = JSON.parse(fs.readFileSync(path.join(root, "database/seeds/catalog.snapshot.json"), "utf8"));
  const csv = fs.readFileSync(path.join(root, "docs/media-rights-ledger.csv"), "utf8");
  const result = auditRows(catalog, readCsv(csv));
  console.log("CineRD · auditoría documental: " + result.rows + " imágenes, " +
    result.byKind.talento + " fotos de talentos, " + result.byKind.pelicula + " medios de películas, " +
    result.byKind.galeria + " archivos de galería.");
  console.log("Estados: " + Object.entries(result.counts).map(([k, v]) => k + "=" + v).join(" | "));
  if (result.errors.length) {
    console.error(result.errors.join("\n"));
    process.exitCode = 1;
    return result;
  }
  console.log("✓ Registro sincronizado con el snapshot. ¡Esto NO certifica las licencias!");
  if (result.counts.PENDIENTE) {
    console.warn("⚠ " + result.counts.PENDIENTE + " archivos SIN evidencia de derechos registrada; no declarar cumplimiento comercial.");
  }
  return result;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) runAudit();
