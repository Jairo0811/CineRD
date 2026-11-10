import {test} from "node:test";
import assert from "node:assert/strict";
import {loadHighTriage,triageHighIssues} from "./reportHighPriorityEditorial.mjs";

test("18 observaciones altas / 16 películas, sin aprobar nada",()=>{
  const report=loadHighTriage();
  assert.equal(report.highCount,18);
  assert.equal(report.filmCount,16);
  assert.equal(report.pendingHumanReview,18);
  assert.deepEqual(report.categories,{
    E4_EN_SNAPSHOT_SIN_AUTORIZACION:5,
    SINOPSIS_SQL_NUEVA_PENDIENTE:4,
    BORRADOR_ES_EN_SIN_REVISION:1,
    METADATOS_FUENTES_PENDIENTES:8
  });
  assert.equal(report.e4Proposals,7);
  assert.equal(report.e4SnapshotProposed,7);
  assert.equal(report.e4ApprovalsRecorded,0);
  assert.equal(report.e5ApprovalsRecorded,0);
  assert.deepEqual(report.errors,[]);
  assert.ok(report.items.every(x=>x.incidentStatus==="pendiente_verificacion"));
});

test("clasifica E-4 por estado verdadero, no por redacción histórica",()=>{
  const base=loadHighTriage();
  const item=base.items.find(x=>x.filmId===9 && x.kind==="sinopsis");
  assert.equal(item.category,"E4_EN_SNAPSHOT_SIN_AUTORIZACION");
  assert.deepEqual(item.e4SnapshotFields.map(x=>x.field),["Genero","FechaEstreno"]);
  assert.ok(item.e4SnapshotFields.every(x=>x.status==="YA_PROPUESTO_EN_SNAPSHOT"));
});

test("detecta desviaciones E-4 sin resolverlas ni inventar aprobaciones",()=>{
  const snapshot={
    tables:{Peliculas:[{Id:9,Titulo:"Lotoman",Genero:"Thriller",FechaEstreno:"2011-01-20T00:00:00.000Z"}]}
  };
  const matrix={items:[{
    filmId:9,title:"Lotoman",kind:"sinopsis",priority:"alta",
    status:"pendiente_verificacion",sourceReport:"docs/FASE_F2_2_AUDITORIA_ES_EN_LOTE1.md",
    e4Proposals:["Genero","FechaEstreno"]
  }]};
  const corrections={rows:[
    {filmId:9,field:"Genero",expected:"Infantil",proposed:"Comedia"},
    {filmId:9,field:"FechaEstreno",expected:"2011-03-10",proposed:"2011-01-20"}
  ]};
  const result=triageHighIssues({snapshot,matrix,corrections,
    drafts:{entries:{}},e4Approvals:{approvals:[]},e5Approvals:{approvals:[]}});
  assert.equal(result.errors.length,1);
  assert.match(result.errors[0],/Desviación E-4/);
  assert.equal(result.pendingHumanReview,1);
  assert.equal(result.e4ApprovalsRecorded,0);
});

test("rechaza registros incompletos antes de triar",()=>{
  assert.throws(()=>triageHighIssues({matrix:{items:[]}}),/inválidos/);
});
