import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createRightsReviewCatalog, PILOT_FILM_IDS } from "./pilotRightsCatalog.mjs";

describe("CineRD / pilot rights build", () => {
  const tables = {
    Peliculas: [
      { Id: 4, Titulo: "Sanky Panky", Foto: "/uploads/peliculas/sanky.jpg", Backdrop: null },
      { Id: 16, Titulo: "Nueba Yol", Foto: "/uploads/peliculas/nueba.jpg", Backdrop: "/uploads/peliculas/nueba-backdrop.jpg" },
      { Id: 56, Titulo: "La Lucha de Ana", Foto: "/uploads/peliculas/ana.jpg" },
      { Id: 5, Titulo: "Perico Ripiao", Foto: "/uploads/peliculas/perico.jpg" },
      { Id: 52, Titulo: "Otra película", Foto: "/uploads/peliculas/otra.jpg" },
    ],
  };
  it("no altera el catálogo si el modo está desactivado", () => {
    const result = createRightsReviewCatalog(tables);
    assert.strictEqual(result.tables, tables);
    assert.deepEqual(result.excludedPaths, []);
  });
  it("retira solo las referencias prioritarias sin mutar el snapshot original", () => {
    const masked = createRightsReviewCatalog(tables, "pilot");
    assert.deepEqual(PILOT_FILM_IDS, [4, 5, 16, 56]);
    assert.equal(masked.excludedPaths.length, 5);
    for (const film of masked.tables.Peliculas.filter(p => PILOT_FILM_IDS.includes(p.Id))) {
      assert.equal(film.Foto, null);
      assert.equal(film.Backdrop, null);
    }
    assert.equal(masked.tables.Peliculas.find(p => p.Id === 52).Foto, "/uploads/peliculas/otra.jpg");
    assert.equal(tables.Peliculas[0].Foto, "/uploads/peliculas/sanky.jpg");
  });
  it("rechaza modos no admitidos y rutas peligrosas", () => {
    assert.throws(() => createRightsReviewCatalog(tables, "all"), /inválido/);
    const altered = { Peliculas: [{ Id: 4, Foto: "/uploads/peliculas/../private.jpg" }] };
    assert.throws(() => createRightsReviewCatalog(altered, "pilot"), /insegura/);
  });
});
