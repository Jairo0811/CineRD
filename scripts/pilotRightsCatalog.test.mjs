import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createRightsReviewCatalog, PILOT_FILM_IDS } from "./pilotRightsCatalog.mjs";

const tables = { Peliculas: [
  { Id: 4, Titulo: "Sanky Panky", Foto: "/uploads/peliculas/sanky.jpg", Backdrop: null },
  { Id: 16, Titulo: "Nueba Yol", Foto: "/uploads/peliculas/nueba.jpg", Backdrop: "/uploads/peliculas/nueba-backdrop.jpg" },
  { Id: 56, Titulo: "La Lucha de Ana", Foto: "/uploads/peliculas/ana.jpg" },
  { Id: 5, Titulo: "Perico Ripiao", Foto: "/uploads/peliculas/perico.jpg" },
  { Id: 52, Titulo: "Otra película", Foto: "/uploads/peliculas/otra.jpg" },
] };
function record(filmId, path, field = "Foto", overrides = {}) {
  return {
    file_path: path, kind: "pelicula", entity_id: String(filmId),
    field, status: "AUTORIZADO", rights_holder: "Titular acreditado",
    permission_basis: "PERMISO", evidence_ref: "LIC-CINERD-001",
    commercial_use_authorized: "SI", license_scope: "WEB_MONETIZADA",
    license_until: "SIN_VENCIMIENTO",
    reviewed_on: "2026-11-07", reviewed_by: "Revisor editorial",
    ...overrides,
  };
}

describe("CineRD / permisos de afiches por archivo", () => {
  it("no altera el catálogo por defecto sin restricciones registradas", () => {
    const result = createRightsReviewCatalog(tables);
    assert.strictEqual(result.tables, tables);
    assert.deepEqual(result.excludedPaths, []);
  });
  it("sin licencias, el piloto oculta solo cuatro películas", () => {
    const masked = createRightsReviewCatalog(tables, "pilot");
    assert.deepEqual(PILOT_FILM_IDS, [4, 5, 16, 56]);
    assert.equal(masked.excludedPaths.length, 5);
    for (const film of masked.tables.Peliculas.filter(p => PILOT_FILM_IDS.includes(p.Id))) {
      assert.equal(film.Foto, null);
      assert.equal(film.Backdrop || null, null);
    }
    assert.equal(masked.tables.Peliculas.find(p => p.Id === 52).Foto, "/uploads/peliculas/otra.jpg");
    assert.equal(tables.Peliculas[0].Foto, "/uploads/peliculas/sanky.jpg");
  });
  it("rehabilita exclusivamente el afiche documentado en la vista piloto", () => {
    const permission = record(4, "/uploads/peliculas/sanky.jpg");
    const out = createRightsReviewCatalog(tables, "pilot", [permission]);
    assert.equal(out.tables.Peliculas.find(p => p.Id === 4).Foto, permission.file_path);
    assert.equal(out.tables.Peliculas.find(p => p.Id === 5).Foto, null);
    assert.equal(out.tables.Peliculas.find(p => p.Id === 16).Backdrop, null);
    assert.deepEqual(out.authorizedPaths, [permission.file_path]);
    assert.equal(out.excludedPaths.length, 4);
  });
  it("un permiso de Foto no autoriza automáticamente un Backdrop", () => {
    const permission = record(16, "/uploads/peliculas/nueba.jpg");
    const out = createRightsReviewCatalog(tables, "pilot", [permission]);
    const nueba = out.tables.Peliculas.find(p => p.Id === 16);
    assert.equal(nueba.Foto, permission.file_path);
    assert.equal(nueba.Backdrop, null);
  });
  it("no interpreta permisos para otra película o sin evidencia como autorizaciones", () => {
    assert.throws(() => createRightsReviewCatalog(tables, "pilot", [
      record(5, "/uploads/peliculas/sanky.jpg"),
    ]), /incorrecto/);
    assert.throws(() => createRightsReviewCatalog(tables, "pilot", [
      record(4, "/uploads/peliculas/sanky.jpg", "Foto", { commercial_use_authorized: "NO" }),
    ]), /inválida/);
    assert.throws(() => createRightsReviewCatalog(tables, "pilot", [
      record(4, "/uploads/peliculas/sanky.jpg", "Foto", { license_until: "2020-01-01" }),
    ]), /vencida/);
  });
  it("un archivo marcado RETIRAR o RESTRINGIDO se excluye incluso fuera del piloto", () => {
    const restricted = record(4, "/uploads/peliculas/sanky.jpg", "Foto", { status: "RETIRAR" });
    const out = createRightsReviewCatalog(tables, "", [restricted]);
    assert.equal(out.tables.Peliculas.find(p => p.Id === 4).Foto, null);
    assert.equal(out.tables.Peliculas.find(p => p.Id === 5).Foto, "/uploads/peliculas/perico.jpg");
  });
  it("rechaza modos no admitidos y rutas no seguras", () => {
    assert.throws(() => createRightsReviewCatalog(tables, "all"), /inválido/);
    assert.throws(() => createRightsReviewCatalog({
      Peliculas: [{ Id: 4, Foto: "/uploads/peliculas/../private.jpg" }],
    }, "pilot"), /insegura/);
  });
});
