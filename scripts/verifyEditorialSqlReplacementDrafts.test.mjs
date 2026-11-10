import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validateSqlSynopsisDrafts as check } from "./verifyEditorialSqlReplacementDrafts.mjs";

const films = [{Id: 5,Titulo:"Perico Ripiao",FechaEstreno:"2003-11-27",Sinopsis:"Texto SQL original"}];
const provenance = {entries: {"5": {reusePermissionStatus: "sin_evidencia_registrada"}}};
const sources = {entries: {"5": {fuentes: [{url: "https://example.org/film"}]}}};
const entry = () => ({
  filmId:5,title:"Perico Ripiao",year:2003,
  status:"pendiente_revision",deployment:"manual_only",reviewedBy:null,reviewedAt:null,
  sourcePermissionStatus:"sin_evidencia_registrada",draftOrigin:"borrador_editorial_fase_e",
  es:"Tres personajes salen de prisión y tratan de regresar con sus familias mientras atraviesan numerosos contratiempos y recurren a sus instrumentos musicales.",
  en:"Three former prisoners set out to reunite with their families while navigating unexpected setbacks and relying on their musical instruments along the way.",
  sources:["https://example.org/film"],openQuestions:["Verificar los nombres y circunstancias de los protagonistas."]
});
const plan = () => ({version:1,autoPublish:false,entries:{"5":entry()}});
const baseline = () => ({"5": {es:entry().es,en:entry().en}});
describe("CineRD / propuestas de sustitucion SQL F-2.3", () => {
  it("valida el borrador bilingüe sin publicarlo ni aprobarlo", () => {
    const result=check(plan(),films,provenance,sources,baseline());
    assert.deepEqual(result.errors,[]);
    assert.equal(result.pending,1);
    assert.equal(result.autoPublished,0);
  });
  it("impide la publicación automática incluso con contenido válido", () => {
    const p=plan();p.autoPublish=true;
    assert.match(check(p,films,provenance,sources,baseline()).errors.join(" | "),/publicacion automatica/);
  });
  it("rechaza firmas y estados de aprobación anticipados", () => {
    const p=plan();p.entries["5"].status="aprobado";
    assert.match(check(p,films,provenance,sources,baseline()).errors.join(" | "),/Publicación o aprobación/);
  });
  it("detecta falta de propuestas y películas externas", () => {
    const p=plan();p.entries={};
    assert.match(check(p,films,provenance,sources,baseline()).errors.join(" | "),/Sin propuesta/);
    const q=plan();q.entries["6"]={...entry(),filmId:6};
    assert.match(check(q,films,provenance,sources,baseline()).errors.join(" | "),/ajena a SQL/);
  });
  it("rechaza copia textual SQL y enlaces no registrados", () => {
    const p=plan();p.entries["5"].es="Texto SQL original";
    p.entries["5"].sources=["https://externo.org/otra"];
    const errors=check(p,films,provenance,sources,baseline()).errors.join(" | ");
    assert.match(errors,/Texto ES\/EN insuficiente/);
    assert.match(errors,/Fuentes no registradas/);
  });
  it("detecta cambios en los borradores base sin un nuevo control editorial", () => {
    const p=plan();p.entries["5"].es+=" Una oración adicional.";
    assert.match(check(p,films,provenance,sources,baseline()).errors.join(" | "),/Borrador E modificado/);
  });
  it("no confunde ausencia de permiso documentado con autorización", () => {
    const p=plan();p.entries["5"].sourcePermissionStatus="acreditada";
    assert.match(check(p,films,provenance,sources,baseline()).errors.join(" | "),/Procedencia\/permiso/);
  });
});
