import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { inventory } from "./editorialReviewAudit.mjs";
import { buildEditorialPacket, writePrivatePacket } from "./prepareClosureEditorial.mjs";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));

test("cola E-4/E-5: 7 cambios y 58 textos, todos sin aprobaciones fingidas",()=>{
  const {markdown,summary}=buildEditorialPacket({
    changes:read("docs/catalog-corrections-e4.json").rows,
    items:inventory(),
    issues:read("docs/editorial-issues-f2.json").items,
    approvedE4:read("docs/catalog-corrections-e4-approvals.json").approvals,
    approvedE5:read("docs/editorial-approvals-e5.json").approvals,
  });
  assert.deepEqual(summary,{e4Total:7,e4Pending:7,e5Total:58,e5Pending:58,highPriority:18});
  assert.equal((markdown.match(/^### \[ \]/gm)||[]).length,65);
  assert.equal(markdown.includes("APROBADO AUTOMÁTICAMENTE"),false);
  assert.ok(markdown.includes("Lotoman"));
  assert.ok(markdown.includes("Fingerprint SHA-256"));
  assert.ok(markdown.includes("#### Texto español de la versión en revisión"));
  assert.ok(markdown.includes("#### Texto inglés de la versión en revisión"));
  assert.ok(markdown.includes("#### Referencias registradas"));
  assert.ok(markdown.includes("SIN TEXTO EN: comprobar el flujo SQL"));
  assert.ok(markdown.includes("128 imágenes"));
  assert.ok(markdown.includes("Valor anterior documentado E-4: 2011-03-10"));
  assert.ok(markdown.includes("Valor observado en snapshot (NO SQL Server): 2011-01-20"));
  assert.ok(markdown.includes("Estado del snapshot: PROPUESTA_PRESENTE_EN_SNAPSHOT_SIN_AUTORIZACION"));
  assert.ok(markdown.includes("Estado SQL Server original: verificar con SELECT independiente"));
  assert.equal(markdown.includes("- Valor actual: 2011-03-10"),false);
});

test("sin escritura de permisos; packet privado no puede sobrescribirse",()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),"cinerd-editorial-"));
  try {
    const file=path.join(dir,"private","review.md");
    writePrivatePacket(file,"PENDIENTE");
    assert.equal(fs.readFileSync(file,"utf8"),"PENDIENTE");
    assert.throws(()=>writePrivatePacket(file,"APROBADO"),/EEXIST/);
    assert.equal(fs.readFileSync(file,"utf8"),"PENDIENTE");
  } finally {fs.rmSync(dir,{recursive:true,force:true});}
});

test("un inventario incoherente impide crear paquete engañoso",()=>{
  assert.throws(()=>buildEditorialPacket({
    changes:[{filmId:9,title:"A",field:"Director",sources:[]},{filmId:9,title:"A",field:"Director",sources:[]}],
    items:[],issues:[],
  }),/duplicadas/);
  assert.throws(()=>buildEditorialPacket({
    changes:[],items:[{filmId:4,kind:"sinopsis",fingerprint:"a"}],issues:[],
  }),/no coincide/);
});

test("el paquete no afirma que el snapshot sea SQL real ni acepta divergencia silenciosa",()=>{
  const proposal={
    filmId:9,title:"Lotoman",field:"Genero",
    expected:"Infantil",proposed:"Comedia",
    sources:["https://example.invalid/fuente"]
  };
  const render=(snapshotFilms)=>buildEditorialPacket({
    changes:[proposal],items:[],issues:[],snapshotFilms
  });
  const approved=render([{Id:9,Titulo:"Lotoman",Genero:"Comedia"}]);
  assert.ok(approved.markdown.includes("PROPUESTA_PRESENTE_EN_SNAPSHOT_SIN_AUTORIZACION"));
  assert.equal(approved.summary.e4Pending,1);
  const historical=render([{Id:9,Titulo:"Lotoman",Genero:"Infantil"}]);
  assert.ok(historical.markdown.includes("VALOR_ANTERIOR_EN_SNAPSHOT"));
  assert.throws(()=>render([{Id:9,Titulo:"Lotoman",Genero:"Thriller"}]),/ni propuesto/);
  assert.throws(()=>render([{Id:9,Titulo:"Otra película",Genero:"Comedia"}]),/identidad/);
});
