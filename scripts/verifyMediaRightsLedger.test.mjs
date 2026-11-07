import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { COLUMNS, readCsv, expectedFromCatalog, auditRows } from "./verifyMediaRightsLedger.mjs";

const catalog = { tables: {
  Actores: [{ Id: 2, NombreCompleto: "Ada", Foto: "/uploads/actores/a.jpg" }],
  Peliculas: [{ Id: 4, Titulo: "La película, original", Foto: "/uploads/peliculas/b.jpg", Backdrop: null }],
  GaleriaMultimedia: [],
}};
const records = expectedFromCatalog(catalog).map(entry => Object.fromEntries(
  COLUMNS.map(c => [c, entry[c] || (c === "status" ? "PENDIENTE" : "")])
));
const esc = value => /[",\n]/.test(value) ? '"' + value.replaceAll('"', '""') + '"' : value;
const csv = rs => [COLUMNS.join(","), ...rs.map(r => COLUMNS.map(c => esc(r[c] || "")).join(","))].join("\n");

describe("registro de derechos", () => {
  it("reconoce títulos con comas y conserva campos CSV", () => {
    const fromCsv = readCsv(csv(records));
    assert.equal(fromCsv[1].entity_name, "La película, original");
    assert.deepEqual(auditRows(catalog, fromCsv).errors, []);
  });
  it("exige una fila por archivo de catálogo y rechaza duplicados", () => {
    assert.match(auditRows(catalog, records.slice(0, 1)).errors.join(" "), /Sin registro/);
    assert.match(auditRows(catalog, [...records, records[0]]).errors.join(" "), /duplicado/);
  });
  it("no autoriza una imagen con solo URL o atribución", () => {
    const copy = records.map(r => ({ ...r }));
    copy[0].status = "AUTORIZADO";
    copy[0].source_url = "https://www.themoviedb.org";
    copy[0].attribution = "TMDb";
    const errors = auditRows(catalog, copy).errors.join(" ");
    assert.match(errors, /AUTORIZADO sin evidencia/);
    assert.match(errors, /sin permiso comercial/);
  });
  it("permite aprobar solo con evidencia, titular y autorización comercial", () => {
    const copy = records.map(r => ({ ...r }));
    Object.assign(copy[0], {
      status: "AUTORIZADO", rights_holder: "Titular documentado",
      permission_basis: "PERMISO", evidence_ref: "LIC-2026-001",
      commercial_use_authorized: "SI", reviewed_on: "2026-11-07",
      reviewed_by: "Revisor editorial",
    });
    assert.deepEqual(auditRows(catalog, copy).errors, []);
  });
  it("rechaza rutas fuera de /uploads y valores de licencia no soportados", () => {
    const copy = records.map(r => ({ ...r }));
    copy[0].file_path = "/private/evidencia.jpg";
    copy[0].status = "DESCONOCIDO";
    assert.match(auditRows(catalog, copy).errors.join(" "), /Ruta insegura/);
    assert.match(auditRows(catalog, copy).errors.join(" "), /Estado de derechos inválido/);
  });
});
