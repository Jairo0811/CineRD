/**
 * CineRD: en vista piloto, cada archivo se habilita individualmente
 * ÚNICAMENTE si existe una autorización documental vigente en el ledger.
 * Sin permiso => cubierta CineRD. El modo normal conserva su conducta
 * previa salvo RETIRAR / RESTRINGIDO para los cuatro filmes prioritarios.
 *
 * No sustituye una revisión legal: la evidencia se verifica fuera del repo.
 */
import { isEffectiveCommercialLicense } from "./verifyMediaRightsLedger.mjs";

export const PILOT_FILM_IDS = Object.freeze([4, 5, 16, 56]);
const TARGETS = new Set(PILOT_FILM_IDS);
const MODES = new Set(["", "pilot"]);
const SAFE_POSTER = /^\/uploads\/peliculas\/[^/.][^/]*$/i;
const EXCLUDED_STATUSES = new Set(["RESTRINGIDO", "RETIRAR"]);

export function createRightsReviewCatalog(tables, mode = "", rightsRows = []) {
  if (!MODES.has(mode)) throw new Error("VITE_MEDIA_RIGHTS_MODE inválido: vacío o 'pilot'.");
  if (!Array.isArray(tables?.Peliculas)) throw new Error("Catálogo sin tabla Peliculas");
  if (!Array.isArray(rightsRows)) throw new Error("Registro de derechos inválido");

  const rightsByPath = new Map(rightsRows.map(row => [row.file_path, row]));
  const excluded = new Set();
  const retainedAuthorized = new Set();
  let changed = false;

  const movies = tables.Peliculas.map(movie => {
    if (!TARGETS.has(Number(movie.Id))) return movie;
    let next = movie;
    for (const field of ["Foto", "Backdrop"]) {
      const path = movie[field];
      if (!path) continue;
      if (!SAFE_POSTER.test(path) || path.includes("..") || path.includes("\\")) {
        throw new Error("Ruta de afiche insegura: " + path);
      }
      const record = rightsByPath.get(path);
      // A license is attached to ONE exact file, ONE field and ONE film.
      const sameFile = record?.kind === "pelicula" &&
        Number(record?.entity_id) === Number(movie.Id) && record?.field === field;
      if (record?.status === "AUTORIZADO" && !sameFile) {
        throw new Error("AUTORIZADO vinculado a película/campo incorrecto: " + path);
      }
      const licensed = sameFile && record?.status === "AUTORIZADO" &&
        isEffectiveCommercialLicense(record);
      if (sameFile && record?.status === "AUTORIZADO" && !licensed) {
        throw new Error("Autorización inválida o vencida para: " + path);
      }

      if (licensed) retainedAuthorized.add(path);
      const blocked = sameFile && EXCLUDED_STATUSES.has(record?.status);
      const hide = blocked || (mode === "pilot" && !licensed);
      if (hide) {
        if (next === movie) next = { ...movie };
        next[field] = null;
        excluded.add(path);
        changed = true;
      }
    }
    return next;
  });
  return {
    tables: changed ? { ...tables, Peliculas: movies } : tables,
    excludedPaths: [...excluded].sort(),
    authorizedPaths: [...retainedAuthorized].sort(),
  };
}
