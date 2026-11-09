const {test}=require("node:test");
const assert=require("node:assert/strict");
const snapshot=require("../../database/seeds/catalog.snapshot.json");
const drafts=require("../../docs/editorial-sql-replacement-drafts-f23.json");
const provenance=require("../../docs/editorial-provenance-sql-f23.json");
const issues=require("../../docs/editorial-issues-f2.json");
const sources=require("../../docs/editorial-sources-sql-f2.json");
const ledger=require("../../docs/editorial-sql-migration-approvals-f23.json");
const {collectPackets}=require("../scripts/prepareEditorialHumanReview");
const {buildBatchPacket}=require("../scripts/prepareEditorialBatchReview");
const {
 freshTemplate,saveTemplate,checkReviewedTemplate,recordReviewed,parseArgs
}=require("../scripts/recordEditorialBatchDecisions");
const packets=()=>collectPackets(snapshot,drafts,provenance,issues,sources);
const hash=()=>buildBatchPacket(packets()).combinedHash;
const clone=v=>JSON.parse(JSON.stringify(v));
const filled=()=>{
 const m=freshTemplate(packets(),hash());
 for(const d of m.decisions) {
  d.decision="aprobado";
  d.reviewer="Revisor sintético en prueba";
  d.reviewedAt="2026-11-08T20:45:00-04:00";
  for(const f of ["sourcesChecked","esReviewed","enReviewed","originalityReviewed","rightsReviewed","releaseAuthorized"])
   d[f]=true;
  d.notes="Escenario de prueba: revisión sintética aislada, nunca registrada como aprobación real.";
  d.evidence=["/tmp/prueba-editorial-sintetica/film-"+d.filmId+".md"];
 }
 return m;
};
test("F-2.3: plantilla local contiene cinco decisiones en PENDIENTE",()=>{
 const m=freshTemplate(packets(),hash());
 assert.deepEqual(m.decisions.map(x=>x.filmId),[5,6,10,55,56]);
 assert.ok(m.decisions.every(x=>x.decision==="pendiente"));
 assert.ok(m.decisions.every(x=>x.reviewedAt===null&&x.reviewer===null));
 assert.ok(m.decisions.every(x=>x.sourcesChecked===false&&x.rightsReviewed===false));
 assert.deepEqual(ledger.approvals,[]);
 assert.equal(checkReviewedTemplate(m,packets(),hash()).ok,false);
});
test("F-2.3: decisiones pendientes, rechazadas o parciales no se registran",()=>{
 const a=filled();a.decisions[1].decision="pendiente";
 assert.equal(checkReviewedTemplate(a,packets(),hash()).ok,false);
 const b=filled();b.decisions[4].decision="rechazado";
 assert.equal(checkReviewedTemplate(b,packets(),hash()).ok,false);
 const c=filled();c.decisions[2].rightsReviewed=false;
 assert.equal(checkReviewedTemplate(c,packets(),hash()).ok,false);
});
test("F-2.3: requiere cinco revisores, fecha, evidencia y notas reales",()=>{
 const a=filled();a.decisions[0].reviewer=null;
 assert.equal(checkReviewedTemplate(a,packets(),hash()).ok,false);
 const b=filled();b.decisions[0].reviewedAt="sin fecha";
 assert.equal(checkReviewedTemplate(b,packets(),hash()).ok,false);
 const c=filled();c.decisions[3].evidence=[];
 assert.equal(checkReviewedTemplate(c,packets(),hash()).ok,false);
 const d=filled();d.decisions[2].notes="Breve";
 assert.equal(checkReviewedTemplate(d,packets(),hash()).ok,false);
});
test("F-2.3: hash, identidad, duplicados y cambios de borrador se detectan",()=>{
 const a=filled();a.batchHash="0".repeat(64);
 assert.equal(checkReviewedTemplate(a,packets(),hash()).ok,false);
 const b=filled();b.decisions[1].fingerprint="0".repeat(64);
 assert.equal(checkReviewedTemplate(b,packets(),hash()).ok,false);
 const c=filled();c.decisions[0].filmId=56;
 assert.equal(checkReviewedTemplate(c,packets(),hash()).ok,false);
 const d=filled();d.decisions[1].title="Película falsa";
 assert.equal(checkReviewedTemplate(d,packets(),hash()).ok,false);
});
test("F-2.3: SOLO en pruebas sintéticas cinco decisiones completas pasan las validaciones",()=>{
 const result=checkReviewedTemplate(filled(),packets(),hash());
 assert.equal(result.ok,true,result.problems.join(" | "));
 assert.equal(result.approvals.length,5);
 assert.ok(result.approvals.every(x=>x.status==="aprobado"));
 assert.deepEqual(ledger.approvals,[]);
});
test("F-2.3: no se sobrescribe una hoja de decisiones preexistente",()=>{
 const calls=[];
 const m=freshTemplate(packets(),hash());
 const fsApi={mkdirSync:()=>{},writeFileSync:(file,content,opts)=>{
  calls.push(opts);
  const err=new Error("Already exists");err.code="EEXIST";throw err;
 }};
 const result=saveTemplate(m,{fsApi,dest:"/offline/form.json"});
 assert.equal(result.created,false);
 assert.equal(calls[0].flag,"wx");
 assert.equal(calls[0].mode,0o600);
});
test("F-2.3: registrar decisiones exige flag explícito y libro sin autorizaciones previas",()=>{
 assert.deepEqual(parseArgs([]),{mode:"template"});
 assert.deepEqual(parseArgs(["--check"]),{mode:"--check"});
 assert.deepEqual(parseArgs(["--record-reviewed"]),{mode:"--record-reviewed"});
 assert.throws(()=>parseArgs(["--apply"]),/Uso:/);
 assert.throws(()=>parseArgs(["--approve"]),/Uso:/);
 assert.throws(()=>parseArgs(["--record-reviewed","--apply"]),/Uso:/);
 assert.throws(()=>recordReviewed(filled(),packets(),hash(),{version:1,approvals:[{filmId:5}]}),/ya contiene/);
});
test("F-2.3: registro simulado es atómico y no ejecuta SQL",()=>{
 const calls=[];
 const fsApi={
  writeFileSync:(file,content,opts)=>{calls.push({op:"write",file,content,opts})},
  renameSync:(oldFile,newFile)=>{calls.push({op:"rename",oldFile,newFile})},
  unlinkSync:()=>{throw Error("Should not delete on success")}
 };
 const copy=clone(ledger);
 const result=recordReviewed(filled(),packets(),hash(),copy,{
  fsApi,ledgerFile:"/offline/approvals.json"
 });
 assert.equal(result.approvals.length,5);
 assert.deepEqual(copy.approvals,[]);
 assert.equal(calls[0].opts.flag,"wx");
 assert.ok(calls[0].file.endsWith(".tmp"));
 assert.equal(calls[1].op,"rename");
 assert.equal(calls[1].newFile,"/offline/approvals.json");
 assert.deepEqual(ledger.approvals,[]);
});
test("F-2.3: si faltan permisos no hay ningún archivo de aprobación",()=>{
 const a=filled();a.decisions[2].releaseAuthorized=false;
 let wrote=0;
 const fsApi={writeFileSync:()=>{wrote++;},renameSync:()=>{wrote++;}};
 assert.throws(()=>recordReviewed(a,packets(),hash(),clone(ledger),{
  fsApi,ledgerFile:"/offline/approvals.json"
 }),/incompleta/);
 assert.equal(wrote,0);
});
