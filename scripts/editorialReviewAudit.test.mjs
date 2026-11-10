import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { makeItem, validateApprovals, inventory } from "./editorialReviewAudit.mjs";

describe("CineRD / control de aprobaciones editoriales E-5",()=>{
  it("inventario completo: 46 sinopsis y 12 contextos",()=>{
    const data=inventory();
    assert.equal(data.length,58);
    assert.equal(data.filter(x=>x.kind==="sinopsis").length,46);
    assert.equal(data.filter(x=>x.kind==="contexto").length,12);
    assert.equal(data.filter(x=>x.fuenteInvalida).length,0);
    assert.equal(new Set(data.map(x=>x.kind+":"+x.filmId)).size,58);
    const sql=data.filter(x=>x.kind==="sinopsis" && x.origin==="SQL");
    assert.deepEqual(sql.map(x=>x.filmId).sort((a,b)=>a-b),[5,6,10,55,56]);
    assert.ok(sql.every(x=>x.fuentes>0 && !x.faltanFuentes));
  });
  it("ninguna pieza adquiere aprobación de oficio",()=>{
    const data=inventory();
    const result=validateApprovals(data,[]);
    assert.equal(result.approved.size,0);
    assert.deepEqual(result.failures,[]);
  });
  it("exige firma, revisión de fuentes y fingerprint vigente",()=>{
    const item=makeItem({Id:1,Titulo:"Ejemplo"},"sinopsis",
      "Este es un texto de prueba de control de revisión editorial.",
      "This is example text for review checks.",["https://example.com"]);
    const ok={filmId:1,kind:"sinopsis",status:"aprobado",fingerprint:item.fingerprint,
      reviewer:"Editor verificador",reviewedAt:"2026-11-07",sourcesChecked:true,
      notes:"Revisada la exactitud, procedencia y redacción."};
    assert.equal(validateApprovals([item],[ok]).approved.size,1);
    assert.equal(validateApprovals([item],[{...ok,fingerprint:"otro"}]).approved.size,0);
    assert.equal(validateApprovals([item],[{...ok,sourcesChecked:false}]).failures.length,1);
    assert.equal(validateApprovals([item],[{...ok,reviewer:""}]).failures.length,1);
    assert.equal(validateApprovals([item],[ok,ok]).failures.length,1);
  });
});
