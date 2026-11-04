import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const snapshotFile = path.join(root, 'database', 'seeds', 'catalog.snapshot.json');
const outPublic = path.join(root, 'frontend', 'public');
const outCatalog = path.join(outPublic, 'demo', 'catalog.json');

if (!fs.existsSync(snapshotFile)) {
  throw new Error('Falta database/seeds/catalog.snapshot.json. Ejecuta npm run catalog:export desde backend/ y versiona el snapshot.');
}

const snapshot = JSON.parse(fs.readFileSync(snapshotFile, 'utf8'));
const tableNames = ['Actores', 'Peliculas', 'ActoresPeliculas', 'PeliculaCreditos', 'PeliculaTraducciones'];
if (snapshot.format !== 'CineRD.CatalogSnapshot' || tableNames.some(name => !Array.isArray(snapshot.tables?.[name]))) {
  throw new Error('Snapshot inválido: verifica el catálogo antes del build.');
}

fs.mkdirSync(path.dirname(outCatalog), { recursive: true });
// Solamente metadatos y catálogo público: nunca incluir usuarios, sesiones, contraseñas ni evidencias.
fs.writeFileSync(outCatalog, JSON.stringify({
  format: 'CineRD.PublicDemoCatalog',
  generatedAtUtc: snapshot.generatedAtUtc,
  tables: Object.fromEntries(tableNames.map(name => [name, snapshot.tables[name]])),
}, null, 2));

const media = new Set();
function addMedia(value) {
  if (typeof value !== 'string') return;
  const clean = value.replaceAll('\\', '/').replace(/^\/+/, '');
  if (/^uploads\/(actores|peliculas)\/[^/]+$/i.test(clean)) media.add(clean);
}
for (const a of snapshot.tables.Actores) addMedia(a.Foto);
for (const p of snapshot.tables.Peliculas) { addMedia(p.Foto); addMedia(p.Backdrop); }

let copied = 0;
for (const relative of media) {
  const source = path.join(root, 'backend', relative);
  const target = path.join(outPublic, relative);
  if (!fs.existsSync(source)) throw new Error(`Imagen requerida inexistente: ${relative}`);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
  copied++;
}

console.log(`Demo CineRD preparada: ${snapshot.tables.Peliculas.length} películas, ${snapshot.tables.Actores.length} talentos, ${snapshot.tables.ActoresPeliculas.length} participaciones, ${copied} recursos multimedia.`);
console.log('Archivos públicos generados en frontend/public/demo y frontend/public/uploads.');
