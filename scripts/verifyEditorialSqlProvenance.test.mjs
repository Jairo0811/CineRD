import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { verifySqlProvenanceLedger as verify } from "./verifyEditorialSqlProvenance.mjs";

const film = { Id:5, Titulo:"Perico Ripiao", FechaEstreno:"2003-11-27", Sinopsis:"Texto SQL" };
const sources = {entries: {"5": { fuentes:[{url:"https://example.org"}] }}};
const example = () => ({ version:1, entries: {
  "5": { filmId:5, title:"Perico Ripiao", year:2003,
    textOriginStatus:"por_identificar", reusePermissionStatus:"sin_evidencia_registrada",
    observedOverlap:"muy_alta", comparisonSources:["https://example.org/test"],
    researchNote:"Coincidencia documental en descripciones publicas; requiere revision de autoria y derechos.",
    reviewedBy:null, reviewedAt:null, permissionEvidence:[] }
} });

describe("CineRD / registro de procedencia de sinopsis SQL F-2.3", () => {
  it("reconoce sinopsis pendiente sin convertir fuentes en autorizacion", () => {
    const result = verify(example(), [film], sources);
    assert.deepEqual(result.errors, []);
    assert.equal(result.sinEvidencia, 1);
    assert.equal(result.acreditadas, 0);
  });
  it("detecta sinopsis omitidas y registros ajenos", () => {
    const a=example();a.entries={};
    assert.match(verify(a,[film],sources).errors.join(" | "), /Falta sinopsis SQL/);
    const b=example();b.entries["6"]={...b.entries["5"],filmId:6};
    assert.match(verify(b,[film],sources).errors.join(" | "), /ajena/);
  });
  it("impide declarar permiso acreditado sin revision y evidencia", () => {
    const a=example();a.entries["5"].reusePermissionStatus="acreditada";
    assert.match(verify(a,[film],sources).errors.join(" | "), /sin evidencia y revisor/);
  });
  it("detecta URLs invalidas, duplicadas y titulos alterados", () => {
    const a=example();
    a.entries["5"].comparisonSources=["http://example.org","http://example.org"];
    a.entries["5"].title="Otra pelicula";
    const errors=verify(a,[film],sources).errors.join(" | ");
    assert.match(errors,/Fuentes de contraste invalidas/);
    assert.match(errors,/ID\/titulo\/anio/);
  });
  it("exige que el origen documentado tenga revision identificada", () => {
    const a=example();a.entries["5"].textOriginStatus="documentado";
    assert.match(verify(a,[film],sources).errors.join(" | "), /Origen documentado sin revisor/);
  });
});
