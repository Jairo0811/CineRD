const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.resolve(__dirname, "../..");
const BACKEND_ROOT = path.resolve(__dirname, "..");
const SNAPSHOT_FILE = path.join(REPO_ROOT, "database", "seeds", "catalog.snapshot.json");

function fail(message) {
  console.error(`✗ ${message}`);
  process.exitCode = 1;
}

function normalizeLocalMedia(value) {
  if (!value || typeof value !== "string") return null;
  if (/^https?:\/\//i.test(value)) return null;
  const clean = value.replace(/\\/g, "/").replace(/^\/+/, "");
  return clean.startsWith("uploads/") ? clean : null;
}

function main() {
  if (!fs.existsSync(SNAPSHOT_FILE)) {
    throw new Error("No existe database/seeds/catalog.snapshot.json. Ejecuta npm run catalog:export primero.");
  }

  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_FILE, "utf8"));
  if (snapshot.format !== "CineRD.CatalogSnapshot") fail("Formato de snapshot no reconocido.");
  if (!Number.isInteger(snapshot.version) || snapshot.version < 1) fail("Versión de snapshot inválida.");
  if (!snapshot.tables || typeof snapshot.tables !== "object") fail("El snapshot no contiene tables.");

  const requiredTables = ["Actores", "Peliculas", "ActoresPeliculas", "PeliculaTraducciones"];
  if (snapshot.version >= 2) requiredTables.push("PeliculaCreditos");
  for (const table of requiredTables) {
    if (!Array.isArray(snapshot.tables?.[table])) fail(`Falta la colección ${table}.`);
  }

  const actores = snapshot.tables?.Actores || [];
  const peliculas = snapshot.tables?.Peliculas || [];
  const relaciones = snapshot.tables?.ActoresPeliculas || [];
  const creditos = snapshot.tables?.PeliculaCreditos || [];
  const traducciones = snapshot.tables?.PeliculaTraducciones || [];
  const actorIds = new Set(actores.map((x) => Number(x.Id)));
  const peliculaIds = new Set(peliculas.map((x) => Number(x.Id)));

  const actorDuplicados = actores.length - actorIds.size;
  const peliculaDuplicados = peliculas.length - peliculaIds.size;
  if (actorDuplicados) fail(`Hay ${actorDuplicados} Id de talento duplicado(s).`);
  if (peliculaDuplicados) fail(`Hay ${peliculaDuplicados} Id de película duplicado(s).`);

  let referenciasInvalidas = 0;
  for (const relacion of relaciones) {
    if (!actorIds.has(Number(relacion.ActorId)) || !peliculaIds.has(Number(relacion.PeliculaId))) referenciasInvalidas += 1;
  }
  for (const credito of creditos) {
    if (!actorIds.has(Number(credito.ActorId)) || !peliculaIds.has(Number(credito.PeliculaId))) referenciasInvalidas += 1;
  }
  for (const traduccion of traducciones) {
    if (!peliculaIds.has(Number(traduccion.PeliculaId))) referenciasInvalidas += 1;
  }
  if (referenciasInvalidas) fail(`Hay ${referenciasInvalidas} referencia(s) huérfana(s) en el catálogo.`);

  const media = new Set();
  actores.forEach((a) => { const p = normalizeLocalMedia(a.Foto); if (p) media.add(p); });
  peliculas.forEach((peli) => {
    [peli.Foto, peli.Backdrop].forEach((value) => { const p = normalizeLocalMedia(value); if (p) media.add(p); });
  });

  const missing = [...media].filter((mediaPath) => !fs.existsSync(path.join(BACKEND_ROOT, ...mediaPath.split("/"))));
  if (missing.length) {
    fail(`Faltan ${missing.length} archivo(s) multimedia referenciado(s):`);
    missing.slice(0, 20).forEach((item) => console.error(`  - backend/${item}`));
  }

  console.log(`✓ Snapshot v${snapshot.version} válido`);
  console.log(`✓ ${actores.length} talentos`);
  console.log(`✓ ${peliculas.length} películas`);
  console.log(`✓ ${relaciones.length} participaciones`);
  console.log(`✓ ${creditos.length} créditos profesionales`);
  console.log(`✓ ${traducciones.length} traducciones`);
  console.log(`✓ ${media.size - missing.length}/${media.size} archivos multimedia disponibles`);

  if (!process.exitCode) console.log("\n✓ Integridad del catálogo verificada correctamente.");
}

try {
  main();
} catch (error) {
  console.error("\n✗ No se pudo validar el catálogo:");
  console.error(error.message || error);
  process.exitCode = 1;
}
