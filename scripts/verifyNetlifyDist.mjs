/**
 * Prueba de humo del artefacto publicado por Netlify.
 * Se ejecuta DESPUÉS de vite build para evitar un deploy que incluya
 * la SPA pero no /demo/deploy-status.json o las imágenes del catálogo.
 *
 * Uso: node scripts/verifyNetlifyDist.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'frontend', 'dist');

function requireFile(relative) {
  const file = path.join(dist, relative);
  if (!fs.existsSync(file) || !fs.statSync(file).isFile() || fs.statSync(file).size === 0) {
    throw new Error(`Netlify: archivo ausente o vacío en frontend/dist: ${relative}`);
  }
  return file;
}

try {
  requireFile('index.html');
  const catalog = JSON.parse(fs.readFileSync(requireFile('demo/catalog.json'), 'utf8'));
  const status = JSON.parse(fs.readFileSync(requireFile('demo/deploy-status.json'), 'utf8'));

  if (catalog.format !== 'CineRD.PublicDemoCatalog' ||
      !Array.isArray(catalog.tables?.Actores) ||
      !Array.isArray(catalog.tables?.Peliculas)) {
    throw new Error('Netlify: demo/catalog.json no tiene un catálogo público válido.');
  }
  if (status.format !== 'CineRD.PublicDemoDeploy') {
    throw new Error('Netlify: demo/deploy-status.json no tiene el formato esperado.');
  }
  if (process.env.COMMIT_REF && status.sourceCommit !== process.env.COMMIT_REF) {
    throw new Error('Netlify: el commit del manifiesto no coincide con COMMIT_REF.');
  }

  const media = new Set();
  function addMedia(value) {
    if (typeof value !== 'string') return;
    const clean = value.replaceAll('\\', '/').replace(/^\/+/, '');
    if (/^uploads\/(actores|peliculas|galerias)\/[^/.][^/]*$/i.test(clean) &&
        !clean.includes('..')) media.add(clean);
  }

  for (const a of catalog.tables.Actores) addMedia(a.Foto);
  for (const p of catalog.tables.Peliculas) {
    addMedia(p.Foto);
    addMedia(p.Backdrop);
  }
  for (const g of catalog.tables.GaleriaMultimedia || []) addMedia(g.Archivo);

  if (media.size !== status.mediaFilesCopied) {
    throw new Error(`Netlify: medios esperados (${media.size}) != copiados (${status.mediaFilesCopied}).`);
  }

  let checked = 0;
  const mediaChecksums = [];
  for (const relative of [...media].sort()) {
    const built = requireFile(relative);
    const original = path.join(root, 'backend', relative);
    if (!fs.existsSync(original)) throw new Error(`Netlify: fuente multimedia inexistente: ${relative}`);
    const hashDest = createHash('sha256').update(fs.readFileSync(built)).digest('hex');
    const hashSrc = createHash('sha256').update(fs.readFileSync(original)).digest('hex');
    if (hashDest !== hashSrc) {
      throw new Error(`Netlify: imagen no sincronizada en dist: ${relative}`);
    }
    mediaChecksums.push(`${relative}:${hashDest}`);
    checked++;
  }

  const globalHash = createHash('sha256').update(mediaChecksums.join('\n')).digest('hex');
  if (globalHash !== status.mediaSha256) {
    throw new Error('Netlify: el hash global no coincide con las imágenes publicadas.');
  }

  console.log(`✓ Netlify dist verificado: index.html, catálogo, manifiesto y ${checked} imágenes idénticas al repositorio.`);
  console.log(`✓ Revisión de origen: ${status.sourceCommit || '(ejecución local)'}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
