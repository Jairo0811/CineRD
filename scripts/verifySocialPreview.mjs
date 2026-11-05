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

function meta(type, name) {
  const tags = html.match(/<meta\s+[^>]*>/gi) || [];
  const tag = tags.find(item => item.includes(`${type}="${name}"`));
  return tag?.match(/\bcontent="([^"]+)"/i)?.[1];
}

const expectedImage = `${origin}/logo.png`;
assert.ok(html.includes(`rel="canonical" href="${origin}/"`), 'Canonical incorrecta');
assert.equal(meta('property', 'og:url'), `${origin}/`);
assert.equal(meta('property', 'og:type'), 'website');
assert.equal(meta('property', 'og:image'), expectedImage);
assert.equal(meta('property', 'og:image:type'), 'image/png');
assert.equal(meta('property', 'og:image:width'), '512');
assert.equal(meta('property', 'og:image:height'), '512');
assert.equal(meta('name', 'twitter:image'), expectedImage);
assert.equal(meta('name', 'twitter:card'), 'summary_large_image');
for (const [type, field] of [
  ['property', 'og:title'], ['property', 'og:description'],
  ['name', 'twitter:title'], ['name', 'twitter:description'],
]) {
  assert.ok(meta(type, field)?.trim(), `Metadato faltante: ${field}`);
}

const logo = readBuilt('logo.png');
assert.ok(logo.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])), 'La imagen social no es PNG');
assert.equal(logo.readUInt32BE(16), 512, 'Ancho real de logo.png incorrecto');
assert.equal(logo.readUInt32BE(20), 512, 'Alto real de logo.png incorrecto');

assert.ok(robots.includes(`Sitemap: ${origin}/sitemap.xml`), 'robots.txt usa otro dominio');
assert.ok(sitemap.includes(`<loc>${origin}/</loc>`), 'sitemap.xml usa otro dominio');
for (const [name, content] of [['index.html', html], ['robots.txt', robots], ['sitemap.xml', sitemap]]) {
  assert.ok(!content.includes('cinerd.netlify.app'), `Dominio canónico antiguo en ${name}`);
}

console.log('✓ Social preview verificada: Open Graph, Twitter Card, logo 512x512, canonical y sitemap Cloudflare.');
