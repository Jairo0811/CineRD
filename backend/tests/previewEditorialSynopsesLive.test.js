const {test}=require("node:test");
const assert=require("node:assert/strict");
const snapshot=require("../../database/seeds/catalog.snapshot.json");
const drafts=require("../../docs/editorial-sql-replacement-drafts-f23.json");
const approvals=require("../../docs/editorial-sql-migration-approvals-f23.json");
const {loadBatch}=require("../scripts/applyEditorialSynopsesBatch");
const {compareLiveSynopses,selectLiveSynopses,QUERY}=
  require("../scripts/previewEditorialSynopsesLive");

const batch=()=>loadBatch(snapshot,drafts,approvals);
const original=()=>batch().items.map(({film})=>({
  Id:film.Id,Titulo:film.Titulo,FechaEstreno:new Date(film.FechaEstreno),
  Sinopsis:film.Sinopsis
}));
const applied=()=>{
  const data=original();
  const b=batch();
  for(const row of data)row.Sinopsis=b.items.find(x=>x.film.Id===row.Id).draft.es;
  return data;
};

test("F-2.3: cinco originales detectados sin modificar SQL",()=>{
  const result=compareLiveSynopses(batch(),original());
  assert.deepEqual(result.counts,{ORIGINAL:5,ALREADY:0,DRIFT:0,MISSING:0});
  assert.equal(result.allOriginal,true);
  assert.equal(result.safeToApply,true);
  assert.equal(approvals.approvals.length,0);
});

test("F-2.3: cinco propuestas ya aplicadas se reconocen como ALREADY",()=>{
  const result=compareLiveSynopses(batch(),applied());
  assert.deepEqual(result.counts,{ORIGINAL:0,ALREADY:5,DRIFT:0,MISSING:0});
  assert.equal(result.allAlready,true);
  assert.equal(result.safeToApply,false);
});

test("F-2.3: estado parcialmente aplicado rechaza el lote",()=>{
  const rows=original();rows[0].Sinopsis=batch().items[0].draft.es;
  const result=compareLiveSynopses(batch(),rows);
  assert.equal(result.mixed,true);
  assert.equal(result.safeToApply,false);
  assert.equal(result.counts.ALREADY,1);
});

test("F-2.3: detecta texto distinto, fecha incorrecta y ausencia",()=>{
  const rows=original();
  rows[1].Sinopsis="Tercera versión";
  rows[2].FechaEstreno=new Date("2019-01-01T00:00:00Z");
  const result=compareLiveSynopses(batch(),rows.slice(0,4));
  assert.deepEqual(result.counts,{ORIGINAL:2,ALREADY:0,DRIFT:2,MISSING:1});
  assert.equal(result.unexpected,true);
});

test("F-2.3: evita filas de ID duplicado, ajenas y faltas de estructura",()=>{
  const rows=original();
  assert.throws(()=>compareLiveSynopses(batch(),[...rows,rows[0]]),/ajena o duplicada/);
  assert.throws(()=>compareLiveSynopses(batch(),[...rows,{Id:999}]),/ajena o duplicada/);
  assert.throws(()=>compareLiveSynopses(batch(),{}),/incompletos/);
});

test("F-2.3: consulta única SELECT de cinco ID con parámetros, no UPDATE",async()=>{
  const got=[];
  const pool={request(){return {
    input(name,type,id){got.push({name,type,id});return this;},
    async query(query){assert.equal(query,QUERY);return {recordset:original()};}
  }}};
  const rows=await selectLiveSynopses(pool,batch(),{Int:"INT"});
  assert.equal(rows.length,5);
  assert.deepEqual(got.map(x=>x.id),[5,6,10,55,56]);
  assert.deepEqual(got.map(x=>x.name),["id0","id1","id2","id3","id4"]);
  assert.ok(QUERY.startsWith("SELECT "));
  assert.ok(!/\b(UPDATE|INSERT|DELETE|ALTER|DROP|EXEC)\b/i.test(QUERY));
});
