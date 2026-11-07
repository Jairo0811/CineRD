/**
 * Auditoría documental CineRD - Fase E.
 * Mide la cobertura real del snapshot, sin inventar biografías ni asumir que
 * un borrador editorial está validado. No escribe en SQL ni cambia el snapshot.
 * Uso: node scripts/reportEditorialQuality.mjs [--json]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getEditorialPelicula } from "../frontend/src/data/editorialPeliculas.js";
import { getSinopsisEditorial } from "../frontend/src/data/sinopsisCuradasFaseE.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const snapshot = JSON.parse(fs.readFileSync(path.join(root, "database/seeds/catalog.snapshot.json"), "utf8"));
const t = snapshot.tables;
const films = t.Peliculas || [];
const actors = t.Actores || [];
const relations = t.ActoresPeliculas || [];
const credits = t.PeliculaCreditos || [];
const missing = field => films.filter(f=>!String(f[field]??"").trim());
const missingFrom = (items, field) => items.filter(x=>!String(x[field]??"").trim());
const hasLink = id => relations.some(r=>Number(r.ActorId)===Number(id)) ||
    credits.some(r=>Number(r.ActorId)===Number(id));
const originalFilmIds = films.filter(f=>Boolean(getEditorialPelicula(f))).map(f=>f.Id);
const curatedFilmIds = films.filter(f=>!String(f.Sinopsis??"").trim() && Boolean(getSinopsisEditorial(f))).map(f=>f.Id);
const missingAfterCurated = films.filter(f=>!String(f.Sinopsis??"").trim() && !getSinopsisEditorial(f));
const priorityFilms = new Set([9,16,56,12,10,13]);
const report = {
  catalogGeneratedAtUtc: snapshot.generatedAtUtc,
  peliculas: {
    total: films.length,
    sinopsisRegistrada: films.length - missing("Sinopsis").length,
    sinSinopsisRegistrada: missing("Sinopsis").length,
    editorialesBorrador: originalFilmIds.length,
    idsConEditorial: originalFilmIds,
    sinopsisCuradasDisponibles: curatedFilmIds.length,
    idsConSinopsisCuradaDeRespaldo: curatedFilmIds,
    sinSinopsisNiBorrador: missingAfterCurated.length,
    idsSinSinopsisNiBorrador: missingAfterCurated.map(f=>f.Id),
    sinDirector: missing("Director").map(f=>({ id:f.Id, titulo:f.Titulo })),
    sinProductora: missing("Productora").map(f=>({ id:f.Id, titulo:f.Titulo })),
    sinGenero: missing("Genero").map(f=>({ id:f.Id, titulo:f.Titulo })),
    idsConDiscrepanciasExternasPorRevisar: films.filter(f=>priorityFilms.has(f.Id)).map(f=>f.Id),
  },
  talentos: {
    total: actors.length,
    sinProfesion: missingFrom(actors, "Profesion").map(a=>({ id:a.Id, nombre:a.NombreCompleto })),
    sinFechaNacimiento: missingFrom(actors, "FechaNacimiento").length,
    sinVinculosEnRepartoNiCreditos: actors.filter(a=>!hasLink(a.Id)).map(a=>({id:a.Id,nombre:a.NombreCompleto})),
  },
  advertencias: [
    "Los textos editoriales son borradores: requieren revisión humana de exactitud y redacción.",
    "La presencia de una ruta de imagen no acredita permisos de publicación.",
    "El reporte no cambia SQL Server ni el snapshot; discrepancias externas deben comprobarse antes de corregir origen.",
  ],
};
if (process.argv.includes("--json")) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log("CineRD · Fase E — auditoría de calidad editorial");
  console.log("Películas: " + report.peliculas.total +
    "; sinopsis registradas: " + report.peliculas.sinopsisRegistrada +
    "; borradores de respaldo listos: " + report.peliculas.sinopsisCuradasDisponibles +
    "; todavía sin ninguna sinopsis: " + report.peliculas.sinSinopsisNiBorrador + ".");
  console.log("Editoriales pendientes: " + report.peliculas.editorialesBorrador +
    "; sin director: " + report.peliculas.sinDirector.length +
    "; sin productora: " + report.peliculas.sinProductora.length + ".");
  console.log("Talentos: " + report.talentos.total +
    "; sin profesión: " + report.talentos.sinProfesion.length +
    "; sin fecha de nacimiento: " + report.talentos.sinFechaNacimiento +
    "; sin vínculo profesional: " + report.talentos.sinVinculosEnRepartoNiCreditos.length + ".");
  console.log("Revisar discrepancias: " + report.peliculas.idsConDiscrepanciasExternasPorRevisar.join(", ") + ".");
  console.log("⚠ No considerar la publicación técnica como aprobación editorial ni de AdSense.");
}
