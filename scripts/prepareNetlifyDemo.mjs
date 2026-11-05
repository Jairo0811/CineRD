import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const snapshotFile = path.join(root, 'database', 'seeds', 'catalog.snapshot.json');
const outPublic = path.join(root, 'frontend', 'public');
const outCatalog = path.join(outPublic, 'demo', 'catalog.json');

const BASIC_TABLES = ['Actores', 'Peliculas', 'ActoresPeliculas', 'PeliculaCreditos', 'PeliculaTraducciones'];
const EXTRA_TABLES = ['Premios', 'Nominaciones', 'GaleriaMultimedia'];
const PUBLIC_COLUMNS = {
  Premios: ['Id', 'Nombre', 'Organizacion', 'Pais', 'SitioWeb'],
  Nominaciones: ['Id', 'PremioId', 'Categoria', 'Anio', 'PeliculaId', 'ActorId', 'Resultado', 'Detalle', 'FuenteUrl'],
  GaleriaMultimedia: ['Id', 'PeliculaId', 'ActorId', 'Tipo', 'Titulo', 'Artista', 'Descripcion', 'Archivo', 'VideoUrl', 'AudioUrl', 'Proveedor', 'FuenteUrl', 'Orden', 'EsDestacada'],
};

if (!fs.existsSync(snapshotFile)) {
  throw new Error('Falta database/seeds/catalog.snapshot.json. Ejecuta npm run catalog:export desde backend/ y versiona el snapshot.');
}

const snapshot = JSON.parse(fs.readFileSync(snapshotFile, 'utf8'));
if (snapshot.format !== 'CineRD.CatalogSnapshot' || BASIC_TABLES.some(name => !Array.isArray(snapshot.tables?.[name]))) {
  throw new Error('Snapshot inválido: verifica el catálogo antes del build.');
}
if (snapshot.version >= 3 && EXTRA_TABLES.some(name => !Array.isArray(snapshot.tables?.[name]))) {
  throw new Error('Snapshot v3 incompleto: faltan premios, nominaciones o galería pública.');
}

const tables = Object.fromEntries(BASIC_TABLES.map(name => [name, snapshot.tables[name]]));
for (const name of EXTRA_TABLES) {
  // Whitelist defensiva: no exponer automáticamente futuras columnas privadas.
  const rows = snapshot.tables[name] || [];
  tables[name] = rows.map(row => Object.fromEntries(PUBLIC_COLUMNS[name].map(key => [key, row[key] ?? null])));
}

// Solamente catálogo y metadatos públicos: nunca incluir cuentas, sesiones,
// contraseñas, verificaciones, reclamaciones, credenciales ni evidencias privadas.
fs.mkdirSync(path.dirname(outCatalog), { recursive: true });
fs.writeFileSync(outCatalog, JSON.stringify({
  format: 'CineRD.PublicDemoCatalog',
  generatedAtUtc: snapshot.generatedAtUtc,
  tables,
}, null, 2));

const media = new Set();
function addMedia(value) {
  if (typeof value !== 'string') return;
  const clean = value.replaceAll('\\', '/').replace(/^\/+/, '');
  // Rutas de media estrictas: sin subcarpetas, traversal ni ficheros privados.
  if (/^uploads\/(actores|peliculas|galerias)\/[^/.][^/]*$/i.test(clean) && !clean.includes('..')) media.add(clean);
}
for (const a of tables.Actores) addMedia(a.Foto);
for (const p of tables.Peliculas) { addMedia(p.Foto); addMedia(p.Backdrop); }
for (const g of tables.GaleriaMultimedia) addMedia(g.Archivo);

let copied = 0;
for (const relative of media) {
  const source = path.join(root, 'backend', relative);
  const target = path.join(outPublic, relative);
  if (!fs.existsSync(source)) throw new Error(`Archivo público requerido inexistente: ${relative}`);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
  copied++;
}

const musicTypes = new Set(['TEMA_OFICIAL', 'CANCION_ORIGINAL', 'BANDA_SONORA', 'SCORE']);
const songs = tables.GaleriaMultimedia.filter(item => musicTypes.has(item.Tipo)).length;
console.log(`Demo CineRD preparada: ${tables.Peliculas.length} películas, ${tables.Actores.length} talentos, ${tables.ActoresPeliculas.length} participaciones, ${tables.Nominaciones.length} nominaciones, ${tables.GaleriaMultimedia.length} recursos multimedia (${songs} canciones/OST), ${copied} archivos.`);
if (snapshot.version < 3) {
  console.warn('⚠ El snapshot versionado es v2 y no incluye premios, galería ni soundtracks. Ejecuta npm run catalog:export en la PC con SQL Server y versiona el snapshot v3 para publicar estos datos.');
}
console.log('Archivos públicos generados en frontend/public/demo y frontend/public/uploads.');
