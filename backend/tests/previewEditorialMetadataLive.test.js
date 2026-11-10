const {test} = require("node:test");
const assert = require("node:assert/strict");
const snapshot = require("../../database/seeds/catalog.snapshot.json");
const matrix = require("../../docs/editorial-issues-f2.json");
const dossier = require("../../docs/editorial-metadata-candidates-f26.json");
const e4 = require("../../docs/catalog-corrections-e4.json");
const {
  QUERY,validDate,validateDossier,compareLiveDateCandidates,selectLiveDates
} = require("../scripts/previewEditorialMetadataLive");

const clone = x => structuredClone(x);
const batch = () => validateDossier(dossier,snapshot,matrix,e4);
const original = () => batch().items.map(x => ({
  Id:x.filmId,Titulo:x.title,FechaEstreno:new Date(x.previous+"T00:00:00.000Z")
}));
const snapshotAligned = () => batch().items.map(x => ({
  Id:x.filmId,Titulo:x.title,FechaEstreno:new Date(x.snapshotCurrent+"T00:00:00.000Z")
}));

test("F-2.7: expediente tiene exactamente seis fechas, dos retenciones y cero autorizaciones",()=>{
  const b=batch();
  assert.deepEqual(b.items.map(i=>i.filmId),[27,36,40,42,44,56]);
  assert.deepEqual(b.retained,[31,47]);
  assert.equal(b.database,snapshot.sourceDatabase);
  assert.equal(b.humanApprovals,0);
  assert.equal(b.applyAuthorized,false);
  assert.equal(dossier.automaticApply,false);
  assert.equal(dossier.approvalsCreated,false);
});

test("F-2.7: fechas calendario estrictas rechazan día inexistente y typo",()=>{
  for(const v of ["2000-02-29","1997-10-23","2023-11-30"])assert.equal(validDate(v),true);
  for(const v of ["2026-02-29","2005-13-01","1997-10-32","2014-3-27","bad"])
    assert.equal(validDate(v),false);
});

test("F-2.7: lote sintético histórico detecta las fechas ya corregidas en snapshot",()=>{
  const b=batch(),r=compareLiveDateCandidates(b,original());
  assert.deepEqual(r.counts,{ORIGINAL:6,ALREADY:0,DRIFT:0,MISSING:0});
  assert.equal(r.snapshotMismatch,b.items.filter(x=>x.snapshotCurrent!==x.previous).length);
  assert.equal(r.allOriginal,true);
  assert.equal(r.safeToApplyAutomatically,false);
});

test("F-2.7: snapshot refleja fase de sincronización sin habilitar auto-aplicación",()=>{
  const b=batch();
  assert.equal(b.items.find(x=>x.filmId===40).snapshotCurrent,"2023-11-30");
  const r=compareLiveDateCandidates(b,snapshotAligned());
  const originals=b.items.filter(x=>x.snapshotCurrent===x.previous).length;
  const corrected=b.items.filter(x=>x.snapshotCurrent===x.proposed).length;
  assert.deepEqual(r.counts,{ORIGINAL:originals,ALREADY:corrected,DRIFT:0,MISSING:0});
  assert.equal(r.snapshotMismatch,0);
  assert.equal(r.allOriginal,originals===6);
  assert.equal(r.allAlready,corrected===6);
  assert.equal(r.mixed,originals>0&&corrected>0);
  assert.equal(r.hasDrift,false);
  assert.equal(r.safeToApplyAutomatically,false);
});

test("F-2.7: seis valores propuestos no conceden permiso y detectan desincronización",()=>{
  const b=batch(), records=original();
  for(const r of records)r.FechaEstreno=new Date(b.items.find(i=>i.filmId===r.Id).proposed+"T00:00:00Z");
  const c=compareLiveDateCandidates(b,records);
  assert.equal(c.allAlready,true);
  assert.equal(c.counts.ALREADY,6);
  // Se compara contra HEAD en cada fase; tras sincronización debe ser 0.
  assert.equal(c.snapshotMismatch,b.items.filter(x=>x.snapshotCurrent!==x.proposed).length);
  assert.equal(c.safeToApplyAutomatically,false);
});

test("F-2.7: estado mixto no permite aplicar el lote",()=>{
  const records=original();
  records[0].FechaEstreno=new Date(batch().items[0].proposed+"T00:00:00Z");
  const c=compareLiveDateCandidates(batch(),records);
  assert.equal(c.mixed,true);
  const expectedMismatches=batch().items.map((x,i)=>i===0?x.proposed:x.previous)
    .filter((value,i)=>value!==batch().items[i].snapshotCurrent).length;
  assert.equal(c.snapshotMismatch,expectedMismatches);
  assert.equal(c.safeToApplyAutomatically,false);
});

test("F-2.7: detecta fecha desconocida, título alterado, ausente y filas duplicadas",()=>{
  const records=original();
  records[0].FechaEstreno=new Date("2013-01-01T00:00:00Z");
  records[1].Titulo="Película cambiada";
  const r=compareLiveDateCandidates(batch(),records.slice(0,5));
  assert.deepEqual(r.counts,{ORIGINAL:3,ALREADY:0,DRIFT:2,MISSING:1});
  assert.equal(r.hasDrift,true);
  assert.throws(()=>compareLiveDateCandidates(batch(),[...original(),original()[0]]),/ajeno o duplicado/);
  assert.throws(()=>compareLiveDateCandidates(batch(),[...original(),{Id:999}]),/ajeno o duplicado/);
});

test("F-2.7: no inventa aprobaciones, no usa campos arbitrarios ni ignora cambios de base",()=>{
  const a=clone(dossier);a.items[0].applyAuthorized=true;
  assert.throws(()=>validateDossier(a,snapshot,matrix,e4),/autorización/);
  const b=clone(dossier);b.items[0].proposals[0].field="Genero";
  assert.throws(()=>validateDossier(b,snapshot,matrix,e4),/fecha inválida/);
  const c=clone(dossier);c.items[0].proposals[0].to="2014-02-31";
  assert.throws(()=>validateDossier(c,snapshot,matrix,e4),/fecha inválida/);
  const d=clone(snapshot);d.tables.Peliculas.find(x=>x.Id===27).FechaEstreno="2015-01-01T00:00:00Z";
  assert.throws(()=>validateDossier(dossier,d,matrix,e4),/distinta en snapshot/);
  const e=clone(dossier);e.items[0].state="APROBADO";
  assert.throws(()=>validateDossier(e,snapshot,matrix,e4),/autorización/);
});

test("F-2.7: consulta SQL tiene exclusivamente SELECT parametrizado de seis IDs",async()=>{
  const got=[];
  const pool={request(){return {
    input(name,type,id){got.push({name,type,id});return this;},
    async query(query){assert.equal(query,QUERY);return {recordset:original()};}
  }}};
  const rows=await selectLiveDates(pool,batch(),{Int:"SQL_INT"});
  assert.equal(rows.length,6);
  assert.deepEqual(got.map(x=>x.id),[27,36,40,42,44,56]);
  assert.deepEqual(got.map(x=>x.name),["id0","id1","id2","id3","id4","id5"]);
  assert.ok(QUERY.startsWith("SELECT "));
  assert.ok(!/\b(UPDATE|INSERT|DELETE|ALTER|DROP|EXEC|MERGE)\b/i.test(QUERY));
});
