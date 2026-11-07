/**
 * CineRD media publication gate.
 * ""       = historical behavior, but restricted/retired media are always withheld.
 * "pilot"  = mask only four prioritized posters absent documented license.
 * "review" = mask ALL unlicensed catalog images (films, actors and galleries).
 *
 * Never treat a CSV declaration as proof of a real contract. Editorial staff
 * must inspect private evidence before authorizing an image.
 */
import { isEffectiveCommercialLicense } from "./verifyMediaRightsLedger.mjs";

export const PILOT_FILM_IDS = Object.freeze([4, 5, 16, 56]);
const TARGETS = new Set(PILOT_FILM_IDS);
const MODES = new Set(["", "pilot", "review"]);
const SAFE_MEDIA = /^\/uploads\/(actores|peliculas|galerias)\/[^/.][^/]*$/i;
const BLOCKED = new Set(["RESTRINGIDO", "RETIRAR"]);

export function createRightsReviewCatalog(tables, mode = "", rightsRows = []) {
  if (!MODES.has(mode)) throw new Error("VITE_MEDIA_RIGHTS_MODE inválido: vacío, 'pilot' o 'review'.");
  if (!Array.isArray(tables?.Peliculas)) throw new Error("Catálogo sin tabla Peliculas");
  if (!Array.isArray(rightsRows)) throw new Error("Registro de derechos inválido");

  const indexed = new Map();
  for (const row of rightsRows) {
    if (indexed.has(row.file_path)) throw new Error("Archivo duplicado en permisos: " + row.file_path);
    indexed.set(row.file_path, row);
  }
  const excluded = new Set();
  const authorized = new Set();

  function filterRow(row, kind, field, id, maskPending) {
    const filename = row[field];
    if (!filename) return row;
    if (typeof filename !== "string" || !SAFE_MEDIA.test(filename) ||
        filename.includes("..") || filename.includes("\\")) {
      throw new Error("Ruta de archivo insegura: " + filename);
    }
    const license = indexed.get(filename);
    const identityMatches = license?.kind === kind &&
      String(license?.entity_id) === String(id) && license?.field === field;
    if (license?.status === "AUTORIZADO" && !identityMatches) {
      throw new Error("AUTORIZADO vinculado a entidad/campo incorrecto: " + filename);
    }
    const valid = identityMatches && isEffectiveCommercialLicense(license);
    if (identityMatches && license.status === "AUTORIZADO" && !valid) {
      throw new Error("Autorización inválida o vencida: " + filename);
    }
    if (valid) authorized.add(filename);
    const forbidden = identityMatches && BLOCKED.has(license?.status);
    if (!forbidden && (!maskPending || valid)) return row;
    excluded.add(filename);
    return { ...row, [field]: null };
  }
  function mapRows(source, kind, fields, shouldMask) {
    if (!Array.isArray(source)) return source;
    return source.map(row => {
      let next = row;
      for (const field of fields) {
        next = filterRow(next, kind, field, row.Id, shouldMask(row));
      }
      return next;
    });
  }

  const movies = mapRows(tables.Peliculas, "pelicula", ["Foto", "Backdrop"],
    p => mode === "review" || (mode === "pilot" && TARGETS.has(Number(p.Id))));
  const actors = mapRows(tables.Actores, "talento", ["Foto"],
    () => mode === "review");
  const galleries = mapRows(tables.GaleriaMultimedia, "galeria", ["Archivo"],
    () => mode === "review");

  const changed = excluded.size > 0;
  return {
    tables: changed ? { ...tables, Peliculas: movies, ...(actors ? { Actores: actors } : {}),
      ...(galleries ? { GaleriaMultimedia: galleries } : {}) } : tables,
    excludedPaths: [...excluded].sort(),
    authorizedPaths: [...authorized].sort(),
  };
}
