/**
 * Comprueba que las cubiertas originales cubran exactamente el catálogo
 * cinematográfico versionado y no cambien las 4 identidades premium.
 * Uso: node scripts/verifyOriginalCoverCatalog.mjs
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  EDITORIAL_COVER_THEMES, PREMIUM_ORIGINAL_VARIANTS, POSTER_VARIANTS,
} from "../frontend/src/data/posterCoverCatalog.js";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const snapshot=JSON.parse(fs.readFileSync(path.join(root,"database/seeds/catalog.snapshot.json"),"utf8"));
const catalogIds=snapshot.tables.Peliculas.map(x=>Number(x.Id)).sort((a,b)=>a-b);
const coverIds=Object.keys(POSTER_VARIANTS).map(Number).sort((a,b)=>a-b);
assert.deepEqual(coverIds,catalogIds,"Cada película debe contar con un motivo editorial propio");
assert.deepEqual(PREMIUM_ORIGINAL_VARIANTS,{4:"coast",5:"rhythm",16:"city",56:"bloom"});
assert.equal(Object.keys(EDITORIAL_COVER_THEMES).length,42);
assert.equal(new Set(Object.values(POSTER_VARIANTS)).size,catalogIds.length,
  "No repetir motivos genéricos entre películas diferentes");
for(const [id,theme] of Object.entries(EDITORIAL_COVER_THEMES)){
  assert.match(theme.variant,/^[a-z][a-z0-9-]+$/,"Variante inválida "+id);
  for(const key of ["accent","back","gold"])
    assert.match(theme[key],/^#[0-9a-f]{6}$/i,"Color inválido "+id+"/"+key);
}
console.log("✓ CineRD: "+catalogIds.length+" cubiertas editoriales por película; 4 premium intactas y 42 nuevas.");
