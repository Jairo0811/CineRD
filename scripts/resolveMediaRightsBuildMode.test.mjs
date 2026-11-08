import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolveMediaRightsBuildMode as resolve } from "./resolveMediaRightsBuildMode.mjs";

describe("CineRD / modo de derechos según entorno de compilación", () => {
  it("mantiene el comportamiento local por defecto", () => {
    assert.equal(resolve({}), "");
    assert.equal(resolve({ VITE_MEDIA_RIGHTS_MODE: "pilot" }), "pilot");
    assert.equal(resolve({ VITE_MEDIA_RIGHTS_MODE: "review" }), "review");
  });
  it("la compilación Pages de main usa review sin configurar una variable manual", () => {
    assert.equal(resolve({ CF_PAGES:"1", CF_PAGES_BRANCH:"main" }), "review");
  });
  it("Cloudflare main no permite publicar accidentalmente el modo normal", () => {
    assert.equal(resolve({
      CF_PAGES:"1", CF_PAGES_BRANCH:"main", VITE_MEDIA_RIGHTS_MODE:"normal"
    }), "review");
    assert.equal(resolve({
      CF_PAGES:"1", CF_PAGES_BRANCH:"main", VITE_MEDIA_RIGHTS_MODE:"pilot"
    }), "review");
  });
  it("obliga review en todas las ramas de preview incluso sin variable de modo", () => {
    for (const branch of ["feature/example", "feat/f2-editorial-review", "develop", ""]) {
      assert.equal(resolve({ CF_PAGES:"1", CF_PAGES_BRANCH:branch }), "review");
      assert.equal(resolve({
        CF_PAGES:"1", CF_PAGES_BRANCH:branch, VITE_MEDIA_RIGHTS_MODE:"pilot"
      }), "review");
      assert.equal(resolve({
        CF_PAGES:"1", CF_PAGES_BRANCH:branch, VITE_MEDIA_RIGHTS_MODE:"normal"
      }), "review");
    }
  });
  it("mantiene validación explícita fuera de Cloudflare", () => {
    assert.equal(resolve({ CF_PAGES:"0", CF_PAGES_BRANCH:"main" }), "");
    assert.equal(resolve({ CF_PAGES:"0", VITE_MEDIA_RIGHTS_MODE:"review" }), "review");
    assert.throws(() => resolve({ VITE_MEDIA_RIGHTS_MODE:"normal" }), /inválido/);
  });
});
