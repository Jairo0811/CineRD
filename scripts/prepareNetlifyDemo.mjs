import fs from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRightsReviewCatalog } from './pilotRightsCatalog.mjs';
import { readCsv, auditRows } from './verifyMediaRightsLedger.mjs';

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

let tables = Object.fromEntries(BASIC_TABLES.map(name => [name, snapshot.tables[name]]));
// Publicar únicamente las columnas explícitamente permitidas en galería/premios.
for (const name of EXTRA_TABLES) {
  const rows = snapshot.tables[name] || [];
  tables[name] = rows.map(row => Object.fromEntries(PUBLIC_COLUMNS[name].map(key => [key, row[key] ?? null])));
}
// El modo "review" excluye TODO archivo visual sin licencia documentada de actores, películas y galerías.
const rightsRows = readCsv(fs.readFileSync(path.join(root, 'docs', 'media-rights-ledger.csv'), 'utf8'));
const audit = auditRows(snapshot, rightsRows);
if (audit.errors.length) throw new Error('Registro de derechos inválido: ' + audit.errors.join('; '));
const review = createRightsReviewCatalog(tables, (process.env.VITE_MEDIA_RIGHTS_MODE || '').trim(), rightsRows);
tables = review.tables;
for (const resource of review.excludedPaths) {
  // El módulo piloto ha validado esta ruta de imagen.
  const relative = resource.slice(1);
  if (!/^uploads\/(actores|peliculas|galerias)\/[^/.][^/]*$/i.test(relative) || relative.includes('..')) throw new Error('Ruta piloto inválida: ' + relative);
  // Retirar restos del build anterior sin tocar backend/ ni el snapshot SQL.
  fs.rmSync(path.join(outPublic, relative), { force: true });
}
if (review.excludedPaths.length) console.log('CineRD: ' + review.excludedPaths.length + ' archivos excluidos del catálogo y archivos públicos.');
if (review.authorizedPaths.length) console.log('CineRD: ' + review.authorizedPaths.length + ' archivos con registro documental vigente en el CSV.');

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
const mediaChecksums = [];
const mediaCounts = { actores: 0, peliculas: 0, galerias: 0 };
for (const relative of [...media].sort()) {
  const source = path.join(root, 'backend', relative);
  const target = path.join(outPublic, relative);
  if (!fs.existsSync(source)) throw new Error(`Archivo público requerido inexistente: ${relative}`);

  // No confiar en archivos antiguos de frontend/public: copiar siempre el
  // original versionado más reciente del backend, también en builds con caché.
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);

  // La compilación falla si la versión pública no coincide byte a byte con
  // el JPEG de GitHub; así no se despliegan accidentalmente retratos antiguos.
  const hashOrigen = createHash('sha256').update(fs.readFileSync(source)).digest('hex');
  const hashDestino = createHash('sha256').update(fs.readFileSync(target)).digest('hex');
  if (hashOrigen !== hashDestino) {
    throw new Error(`No coincide la imagen de origen y la versión Netlify: ${relative}`);
  }

  mediaChecksums.push(`${relative}:${hashOrigen}`);
  const tipo = relative.split('/')[1];
  mediaCounts[tipo]++;
  copied++;
}

// Metadatos públicos mínimos para saber qué revisión y qué imágenes
// contiene realmente cada compilación estática (sin exponer datos privados).
const mediaChecksum = createHash('sha256').update(mediaChecksums.join('\n')).digest('hex');
fs.writeFileSync(path.join(outPublic, 'demo', 'deploy-status.json'), JSON.stringify({
  format: 'CineRD.PublicDemoDeploy',
  sourceCommit: process.env.COMMIT_REF || null,
  catalogGeneratedAtUtc: snapshot.generatedAtUtc,
  mediaFilesCopied: copied,
  mediaCounts,
  mediaSha256: mediaChecksum,
}, null, 2));

const musicTypes = new Set(['TEMA_OFICIAL', 'CANCION_ORIGINAL', 'BANDA_SONORA', 'SCORE']);
const songs = tables.GaleriaMultimedia.filter(item => musicTypes.has(item.Tipo)).length;
console.log(`Demo CineRD preparada: ${tables.Peliculas.length} películas, ${tables.Actores.length} talentos, ${tables.ActoresPeliculas.length} participaciones, ${tables.Nominaciones.length} nominaciones, ${tables.GaleriaMultimedia.length} recursos multimedia (${songs} canciones/OST), ${copied} archivos.`);
if (snapshot.version < 3) {
  console.warn('⚠ El snapshot versionado es v2 y no incluye premios, galería ni soundtracks. Ejecuta npm run catalog:export en la PC con SQL Server y versiona el snapshot v3 para publicar estos datos.');
}
console.log(`Medios Netlify verificados por SHA-256: ${mediaCounts.actores} fotos de talentos, ${mediaCounts.peliculas} pósteres y ${mediaCounts.galerias} archivos de galería.`);
console.log('Archivos públicos generados en frontend/public/demo y frontend/public/uploads.');
