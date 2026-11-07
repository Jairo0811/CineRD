/** No image without a fully documented commercial license may reach dist in review mode. */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRightsReviewCatalog } from "./pilotRightsCatalog.mjs";
import { readCsv } from "./verifyMediaRightsLedger.mjs";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const snap = JSON.parse(fs.readFileSync(path.join(root,"database/seeds/catalog.snapshot.json"),"utf8"));
const built = JSON.parse(fs.readFileSync(path.join(root,"frontend/dist/demo/catalog.json"),"utf8"));
const status = JSON.parse(fs.readFileSync(path.join(root,"frontend/dist/demo/deploy-status.json"),"utf8"));
const rights = readCsv(fs.readFileSync(path.join(root,"docs/media-rights-ledger.csv"),"utf8"));
const expected = createRightsReviewCatalog(snap.tables,"review",rights);
const published = new Set();
for(const a of built.tables.Actores) if(a.Foto) published.add(a.Foto);
for(const p of built.tables.Peliculas) for(const field of ["Foto","Backdrop"]) if(p[field]) published.add(p[field]);
for(const g of built.tables.GaleriaMultimedia) if(g.Archivo) published.add(g.Archivo);
for (const name of ["Actores","Peliculas","GaleriaMultimedia"]) {
  for(const entity of built.tables[name]) {
    const reference = expected.tables[name].find(x=>String(x.Id)===String(entity.Id));
    assert.ok(reference,"Falta ficha "+name+":"+entity.Id);
    const fields = name==="Actores"?["Foto"]:name==="Peliculas"?["Foto","Backdrop"]:["Archivo"];
    for(const field of fields) {
      assert.equal(entity[field]||null, reference[field]||null, "Diferencia de permiso en "+name+":"+entity.Id+"/"+field);
    }
  }
}
for(const rel of expected.excludedPaths) {
  assert.ok(!published.has(rel),"Referencia publicada prohibida: "+rel);
  assert.ok(!fs.existsSync(path.join(root,"frontend/dist",rel.slice(1))),"Archivo distribuido sin permiso: "+rel);
}
assert.equal(status.mediaFilesCopied,published.size);
assert.equal(published.size,expected.authorizedPaths.length);
console.log("✓ Revisión integral: "+expected.excludedPaths.length+" recursos omitidos; "+
  expected.authorizedPaths.length+" autorizados; "+published.size+" recursos en dist.");
