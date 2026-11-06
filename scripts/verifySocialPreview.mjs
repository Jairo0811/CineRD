/**
 * Validate the *built* static social card. WhatsApp crawlers generally read
 * the initial HTML, not metadata inserted by the React application.
 *
 * Run with: node scripts/verifySocialPreview.mjs
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'frontend', 'dist');
const origin = 'https://cinerd.pages.dev';

function readBuilt(relative) {
  const file = path.join(dist, relative);
  assert.ok(fs.existsSync(file), `Archivo público ausente: ${relative}`);
  return fs.readFileSync(file);
}

const html = readBuilt('index.html').toString('utf8');
const robots = readBuilt('robots.txt').toString('utf8');
const sitemap = readBuilt('sitemap.xml').toString('utf8');
const adsTxt = readBuilt('ads.txt').toString('utf8');

function meta(type, name) {
  const tags = html.match(/<meta\s+[^>]*>/gi) || [];
  const tag = tags.find(item => item.includes(`${type}="${name}"`));
  return tag?.match(/\bcontent="([^"]+)"/i)?.[1];
}

const expectedImage = `${origin}/share-cinerd-v1.jpg`;
assert.ok(html.includes(`rel="canonical" href="${origin}/"`), 'Canonical incorrecta');
assert.equal(meta('property', 'og:url'), `${origin}/`);
assert.equal(meta('property', 'og:type'), 'website');
assert.equal(meta('name', 'google-adsense-account'), 'ca-pub-1228497984086853');
assert.equal(meta('property', 'og:image'), expectedImage);
assert.equal(meta('property', 'og:image:type'), 'image/jpeg');
assert.equal(meta('property', 'og:image:width'), '1200');
assert.equal(meta('property', 'og:image:height'), '630');
assert.equal(meta('name', 'twitter:image'), expectedImage);
assert.equal(meta('name', 'twitter:card'), 'summary_large_image');
for (const [type, field] of [
  ['property', 'og:title'], ['property', 'og:description'],
  ['name', 'twitter:title'], ['name', 'twitter:description'],
]) {
  assert.ok(meta(type, field)?.trim(), `Metadato faltante: ${field}`);
}

const banner = readBuilt('share-cinerd-v1.jpg');
assert.ok(banner.length > 30_000 && banner.length < 1_000_000, 'La portada social debe ser JPG optimizado (30 KB–1 MB)');
assert.ok(banner[0] === 0xff && banner[1] === 0xd8, 'La portada social no es un JPEG válido');

// Read JPEG SOF markers without adding dependencies to the frontend.
function jpegDimensions(bytes) {
  let offset = 2;
  const sof = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
  while (offset + 3 < bytes.length) {
    if (bytes[offset++] !== 0xff) continue;
    let marker = bytes[offset++];
    while (marker === 0xff && offset < bytes.length) marker = bytes[offset++];
    if (marker === 0xd9 || marker === 0xda) break;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (offset + 2 > bytes.length) break;
    const length = bytes.readUInt16BE(offset);
    if (length < 2 || offset + length > bytes.length) break;
    if (sof.has(marker)) return { height: bytes.readUInt16BE(offset + 3), width: bytes.readUInt16BE(offset + 5) };
    offset += length;
  }
  throw new Error('No se encontraron las dimensiones JPEG de la portada social.');
}
assert.deepEqual(jpegDimensions(banner), { width: 1200, height: 630 }, 'La portada social debe medir 1200x630');

assert.ok(robots.includes(`Sitemap: ${origin}/sitemap.xml`), 'robots.txt usa otro dominio');
assert.equal(adsTxt.trim(), 'google.com, pub-1228497984086853, DIRECT, f08c47fec0942fa0', 'ads.txt no coincide con el publicador oficial');
assert.ok(sitemap.includes(`<loc>${origin}/</loc>`), 'sitemap.xml usa otro dominio');
for (const [name, content] of [['index.html', html], ['robots.txt', robots], ['sitemap.xml', sitemap]]) {
  assert.ok(!content.includes('cinerd.netlify.app'), `Dominio canónico antiguo en ${name}`);
}

console.log('✓ Social preview verificada: Open Graph, Twitter Card, portada JPG 1200x630, canonical y sitemap Cloudflare.');
console.log('✓ AdSense: metaetiqueta de propiedad y ads.txt del publicador verificados; anuncios aún desactivados.');
