/** Asegura que los cuatro afiches estén ausentes del build opt-in. */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRightsReviewCatalog, PILOT_FILM_IDS } from "./pilotRightsCatalog.mjs";
import { readCsv } from "./verifyMediaRightsLedger.mjs";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = JSON.parse(fs.readFileSync(path.join(root, "database/seeds/catalog.snapshot.json"), "utf8"));
const catalog = JSON.parse(fs.readFileSync(path.join(root, "frontend/dist/demo/catalog.json"), "utf8"));
const manifest = JSON.parse(fs.readFileSync(path.join(root, "frontend/dist/demo/deploy-status.json"), "utf8"));
const rightsRows = readCsv(fs.readFileSync(path.join(root, "docs/media-rights-ledger.csv"), "utf8"));
const expected = createRightsReviewCatalog(src.tables, "pilot", rightsRows);
assert.ok(expected.excludedPaths.length <= 4, "No deberían excluirse más de cuatro pósteres en este piloto");
const images = new Set();
for (const a of catalog.tables.Actores) if (a.Foto) images.add(a.Foto);
for (const p of catalog.tables.Peliculas) for (const k of ["Foto", "Backdrop"]) if (p[k]) images.add(p[k]);
for (const g of catalog.tables.GaleriaMultimedia) if (g.Archivo) images.add(g.Archivo);
for (const id of PILOT_FILM_IDS) {
  const film = catalog.tables.Peliculas.find(p => Number(p.Id) === id);
  assert.ok(film, "Falta película " + id);
  const source = src.tables.Peliculas.find(p => Number(p.Id) === id);
  for (const field of ["Foto", "Backdrop"]) {
    const pathRef = source[field];
    if (!pathRef) {
      assert.equal(film[field] || null, null);
    } else {
      const shouldHide = expected.excludedPaths.includes(pathRef);
      assert.equal(film[field], shouldHide ? null : pathRef,
        "Imagen no coincide con licencia documental: " + id + " / " + field);
    }
  }
  assert.ok(fs.existsSync(path.join(root, "frontend/dist/peliculas", id + ".html")), "Falta HTML de película " + id);
}
for (const rel of expected.excludedPaths) {
  assert.ok(!fs.existsSync(path.join(root, "frontend/dist", rel.slice(1))), "Afiche aún publicado: " + rel);
}
assert.equal(manifest.mediaFilesCopied, images.size);
assert.equal(images.size, 128 - expected.excludedPaths.length,
  "El número de recursos debe variar según las licencias individuales");
console.log("✓ Vista piloto: " + expected.excludedPaths.length +
  " afiches no autorizados omitidos; " + expected.authorizedPaths.length +
  " afiches autorizados conservados; " + images.size + " medios publicados.");
