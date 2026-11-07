/**
 * CineRD: piloto opcional para revisar cuatro carteles sin licencia documentada.
 * Modo normal no modifica el catálogo. No equivale a autorización legal.
 */
export const PILOT_FILM_IDS = Object.freeze([4, 5, 16, 56]);
const targetIds = new Set(PILOT_FILM_IDS);
const allowed = new Set(["", "pilot"]);
const pathOk = /^\/uploads\/peliculas\/[^/.][^/]*$/i;

export function createRightsReviewCatalog(tables, mode = "") {
  if (!allowed.has(mode)) throw new Error("VITE_MEDIA_RIGHTS_MODE inválido: se admite vacío o 'pilot'.");
  if (!Array.isArray(tables?.Peliculas)) throw new Error("Catálogo sin tabla Peliculas");
  if (mode !== "pilot") return { tables, excludedPaths: [] };

  const excludedPaths = new Set();
  const movies = tables.Peliculas.map((movie) => {
    if (!targetIds.has(Number(movie.Id))) return movie;
    for (const field of ["Foto", "Backdrop"]) {
      if (!movie[field]) continue;
      const value = String(movie[field]);
      if (!pathOk.test(value) || value.includes("..") || value.includes("\\")) {
        throw new Error("Ruta de archivo insegura para modo piloto: " + value);
      }
      excludedPaths.add(value);
    }
    return { ...movie, Foto: null, Backdrop: null };
  });
  return { tables: { ...tables, Peliculas: movies }, excludedPaths: [...excludedPaths].sort() };
}
