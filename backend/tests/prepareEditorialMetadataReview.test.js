const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {reviewPacket,saveTemplate,checkReview,parseArgs,localFile}=require("../scripts/prepareEditorialMetadataReview");

const root=path.resolve(__dirname,"../..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const inputs=()=>({
  snapshot:read("database/seeds/catalog.snapshot.json"),
  dossier:read("docs/editorial-metadata-candidates-f26.json"),
  matrix:read("docs/editorial-issues-f2.json"),
  legacyE4:read("docs/catalog-corrections-e4.json"),
  policy:fs.readFileSync(path.join(root,"docs/POLITICA_FECHA_ESTRENO_F27.md"),"utf8")
});
const fresh=()=>reviewPacket(inputs());
const clone=o=>structuredClone(o);
function completed(packet) {
  const template=clone(packet);
  for(const item of template.decisions){
    item.decision="aprobado";
    item.reviewer="Responsable editorial prueba sintética";
    item.reviewedAt="2026-11-08T22:50:00-04:00";
    item.notes="Validación artificial en pruebas; NO constituye decisión real ni respaldo de permisos.";
    item.policyAccepted=true;
    item.sourcesChecked=true;
    item.releaseDateVerified=true;
    item.evidence=[item.sources[0]];
  }
  return template;
}

test("F-2.8: exactamente seis propuestas con decisiones PENDIENTES y 2 retenidas",()=>{
  const packet=fresh();
  assert.equal(packet.version,1);
  assert.deepEqual(packet.decisions.map(i=>i.filmId),[27,36,40,42,44,56]);
  assert.deepEqual(packet.retained,[31,47]);
  assert.ok(packet.decisions.every(i=>i.decision==="pendiente" &&
    i.reviewer===null && i.reviewedAt===null && i.policyAccepted===false));
  assert.equal(packet.sqlApplyAuthorized,false);
  assert.equal(packet.createdAsApproval,false);
  assert.match(localFile(packet),/backend[/\\]backups[/\\]editorial[/\\]review-f28/);
  assert.equal(checkReview(packet,packet).ok,false);
});

test("F-2.8: huellas cambian con fuente, propuesta y política",()=>{
  const a=inputs();
  const original=reviewPacket(a);
  const b=clone(a.dossier);b.items[0].sources.push("https://example.org/otra-fuente");
  const changedSource=reviewPacket({...a,dossier:b});
  assert.notEqual(original.batchHash,changedSource.batchHash);
  assert.notEqual(original.decisions[0].fingerprint,changedSource.decisions[0].fingerprint);
  const policy=reviewPacket({...a,policy:a.policy+"\nNueva aclaración verificable."});
  assert.notEqual(original.policyHash,policy.policyHash);
  assert.notEqual(original.batchHash,policy.batchHash);
  // A moved preimage outside the snapshot is caught by F-2.7 validation.
  const e=clone(a.dossier);e.items[0].proposals[0].from="2013-01-01";
  assert.throws(()=>reviewPacket({...a,dossier:e}),/distinta en snapshot/);
});

test("F-2.8: un borrador nuevo no aprueba el lote",()=>{
  const packet=fresh();
  const report=checkReview(packet,packet);
  assert.equal(report.ok,false);
  assert.equal(report.approved,0);
  assert.equal(report.rejected,0);
  assert.equal(report.problems.length,6);
  assert.ok(report.problems.every(x=>x.includes("decisión pendiente")));
});

test("F-2.8: completitud simulada no escribe ni registra aprobaciones",()=>{
  const packet=fresh();
  const report=checkReview(completed(packet),packet);
  assert.equal(report.ok,true);
  assert.equal(report.approved,6);
  assert.equal(report.rejected,0);
  // Status does not authorize SQL, even in this synthetic test.
  assert.equal(packet.sqlApplyAuthorized,false);
});

test("F-2.8: rechaza fuente eliminada, fingerprint cambiado y aprobación sin evidencia",()=>{
  const packet=fresh();
  const x=completed(packet);x.decisions[0].fingerprint="alterada";
  assert.equal(checkReview(x,packet).ok,false);
  const y=completed(packet);y.decisions[0].sources.pop();
  assert.equal(checkReview(y,packet).ok,false);
  const z=completed(packet);z.decisions[0].evidence=[];
  assert.equal(checkReview(z,packet).ok,false);
  const w=completed(packet);w.decisions[0].policyAccepted=false;
  assert.equal(checkReview(w,packet).ok,false);
});

test("F-2.8: rechaza duplicados, estados falsos o fecha sin zona",()=>{
  const packet=fresh();
  const duplicates=completed(packet);duplicates.decisions[1]=clone(duplicates.decisions[0]);
  assert.equal(checkReview(duplicates,packet).ok,false);
  const altered=completed(packet);altered.sqlApplyAuthorized=true;
  assert.equal(checkReview(altered,packet).ok,false);
  const noTimeZone=completed(packet);noTimeZone.decisions[0].reviewedAt="2026-11-08";
  assert.equal(checkReview(noTimeZone,packet).ok,false);
});

test("F-2.8: rechazos documentados se admiten sin considerarse aprobaciones",()=>{
  const packet=fresh(),completedSheet=completed(packet);
  const row=completedSheet.decisions.find(x=>x.filmId===36);
  row.decision="rechazado";row.policyAccepted=false;
  row.sourcesChecked=false;row.releaseDateVerified=false;row.evidence=[];
  const report=checkReview(completedSheet,packet);
  assert.equal(report.ok,true);
  assert.equal(report.approved,5);
  assert.equal(report.rejected,1);
});

test("F-2.8: creación privada wx nunca pisa un expediente previo",()=>{
  const packet=fresh();let written="",ops=[];
  const f="/tmp/cinerd-f28-test.json";
  const mock={
    mkdirSync(dir,opts){ops.push({dir,opts});},
    writeFileSync(file,data,opts){written=data;ops.push({file,opts});}
  };
  const a=saveTemplate(packet,{fsApi:mock,file:f});
  assert.equal(a.created,true);
  assert.equal(JSON.parse(written).decisions.length,6);
  assert.equal(ops[1].opts.flag,"wx");
  assert.equal(ops[1].opts.mode,0o600);
  const existing={
    mkdirSync(){},
    writeFileSync(){const error=Error("Already exists");error.code="EEXIST";throw error;}
  };
  assert.equal(saveTemplate(packet,{fsApi:existing,file:f}).created,false);
});

test("F-2.8: CLI no acepta --apply ni guardado accidental",()=>{
  assert.equal(parseArgs(["--show"]),"--show");
  assert.equal(parseArgs(["--create"]),"--create");
  assert.equal(parseArgs(["--check"]),"--check");
  assert.throws(()=>parseArgs([]),/Uso/);
  assert.throws(()=>parseArgs(["--apply"]),/Uso/);
  assert.throws(()=>parseArgs(["--create","--check"]),/Uso/);
});
