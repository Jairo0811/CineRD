/** Asegura que los cuatro afiches estén ausentes del build opt-in. */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRightsReviewCatalog, PILOT_FILM_IDS } from "./pilotRightsCatalog.mjs";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = JSON.parse(fs.readFileSync(path.join(root, "database/seeds/catalog.snapshot.json"), "utf8"));
const catalog = JSON.parse(fs.readFileSync(path.join(root, "frontend/dist/demo/catalog.json"), "utf8"));
const manifest = JSON.parse(fs.readFileSync(path.join(root, "frontend/dist/demo/deploy-status.json"), "utf8"));
const expected = createRightsReviewCatalog(src.tables, "pilot");
assert.equal(expected.excludedPaths.length, 4, "El piloto requiere cuatro pósteres originales");
const images = new Set();
for (const a of catalog.tables.Actores) if (a.Foto) images.add(a.Foto);
for (const p of catalog.tables.Peliculas) for (const k of ["Foto", "Backdrop"]) if (p[k]) images.add(p[k]);
for (const g of catalog.tables.GaleriaMultimedia) if (g.Archivo) images.add(g.Archivo);
for (const id of PILOT_FILM_IDS) {
  const film = catalog.tables.Peliculas.find(p => Number(p.Id) === id);
  assert.ok(film, "Falta película " + id);
  assert.equal(film.Foto, null);
  assert.equal(film.Backdrop, null);
  assert.ok(fs.existsSync(path.join(root, "frontend/dist/peliculas", id + ".html")), "Falta HTML de película " + id);
}
for (const rel of expected.excludedPaths) {
  assert.ok(!fs.existsSync(path.join(root, "frontend/dist", rel.slice(1))), "Afiche aún publicado: " + rel);
}
assert.equal(manifest.mediaFilesCopied, images.size);
assert.equal(images.size, 124, "El catálogo piloto debe conservar 124 medios del snapshot actual");
console.log("✓ Vista piloto: cuatro carteles ausentes del dist y 124 medios restantes conservados.");
