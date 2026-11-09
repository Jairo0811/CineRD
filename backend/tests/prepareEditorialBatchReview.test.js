const {test}=require("node:test");
const assert=require("node:assert/strict");
const snapshot=require("../../database/seeds/catalog.snapshot.json");
const drafts=require("../../docs/editorial-sql-replacement-drafts-f23.json");
const provenance=require("../../docs/editorial-provenance-sql-f23.json");
const issues=require("../../docs/editorial-issues-f2.json");
const sources=require("../../docs/editorial-sources-sql-f2.json");
const approvals=require("../../docs/editorial-sql-migration-approvals-f23.json");
const {collectPackets}=require("../scripts/prepareEditorialHumanReview");
const {buildBatchPacket,savePacket,parseArgs}=
  require("../scripts/prepareEditorialBatchReview");

const packets=()=>collectPackets(snapshot,drafts,provenance,issues,sources);

test("F-2.3: un expediente único contiene exactamente las 5 tramas originales/ES/EN",()=>{
  const out=buildBatchPacket(packets());
  assert.deepEqual(out.films,[5,6,10,55,56]);
  assert.match(out.combinedHash,/^[a-f0-9]{64}$/);
  for(const p of packets()) {
    assert.ok(out.content.includes("## Revisión de película #"+p.film.Id));
    assert.ok(out.content.includes(p.film.Sinopsis.replace(/\r\n/g,"\n")));
    assert.ok(out.content.includes(p.draft.es));
    assert.ok(out.content.includes(p.draft.en));
    assert.ok(out.content.includes(p.fingerprint));
    assert.ok(p.draft.sources.every(url=>out.content.includes(url)));
  }
  assert.equal((out.content.match(/## Revisión de película #/g)||[]).length,5);
});

test("F-2.3: nunca genera firmas, decisiones, licencias ni aprobaciones",()=>{
  const out=buildBatchPacket(packets());
  assert.match(out.content,/Decisión conjunta — COMPLETAR SOLO TRAS UNA REVISIÓN REAL/);
  assert.match(out.content,/Responsable real:\*\* \[PENDIENTE\]/);
  assert.match(out.content,/Evidencias legales\/editoriales:\*\* \[PENDIENTE\]/);
  assert.match(out.content,/NO aprueba textos, licencias, derechos ni migraciones/);
  assert.equal(out.content.split("\n").filter(line=>/^\| (5|6|10|55|56) \| \[PENDIENTE\] \|/.test(line)).length,5);
  assert.deepEqual(approvals.approvals,[]);
});

test("F-2.3: el identificador consolidado cambia si cambia una huella",()=>{
  const original=packets();
  const a=buildBatchPacket(original);
  const changed=original.map(p=>({...p}));
  changed[2].fingerprint="0".repeat(64);
  const b=buildBatchPacket(changed);
  assert.notEqual(a.combinedHash,b.combinedHash);
  assert.throws(()=>buildBatchPacket(original.slice(1)),/cinco expedientes/);
  assert.throws(()=>buildBatchPacket([...original.slice(0,4),original[0]]),/ID/);
});

test("F-2.3: un único comando, con --show o creación privada por defecto",()=>{
  assert.deepEqual(parseArgs([]),{show:false});
  assert.deepEqual(parseArgs(["--show"]),{show:true});
  assert.throws(()=>parseArgs(["--apply"]),/Uso:/);
  assert.throws(()=>parseArgs(["--approve"]),/Uso:/);
  assert.throws(()=>parseArgs(["--all","--write"]),/Uso:/);
});

test("F-2.3: escritura única usa wx, modo privado y no sobrescribe notas",()=>{
  const out=buildBatchPacket(packets()),events=[];
  const directory="/offline/editorial";
  const fsApi={
    mkdirSync(p,options){events.push({kind:"mkdir",p,options});},
    writeFileSync(p,content,options){
      events.push({kind:"write",p,content,options});
    }
  };
  const saved=savePacket(out,{fsApi,directory});
  assert.equal(saved.status,"CREATED");
  assert.equal(events.length,2);
  assert.equal(events[1].options.flag,"wx");
  assert.equal(events[1].options.mode,0o600);
  assert.ok(saved.path.includes(out.combinedHash.slice(0,16)));
  assert.equal(events[1].content,out.content);
});

test("F-2.3: expediente ya presente NUNCA se sobrescribe",()=>{
  const out=buildBatchPacket(packets());
  let writes=0;
  const fsApi={
    mkdirSync:()=>{},
    writeFileSync:()=>{
      writes++;
      const error=new Error("Already exists");
      error.code="EEXIST";
      throw error;
    }
  };
  const result=savePacket(out,{fsApi,directory:"/offline/editorial"});
  assert.equal(result.status,"EXISTS_NO_OVERWRITE");
  assert.equal(writes,1);
});

test("F-2.3: fallos de E/S o archivos incorrectos no se ignoran",()=>{
  const out=buildBatchPacket(packets());
  assert.throws(()=>savePacket({combinedHash:"invalid",content:"abc"}),/mal formado/);
  const fsApi={mkdirSync:()=>{},writeFileSync:()=>{
    const error=new Error("permission denied");error.code="EACCES";throw error;
  }};
  assert.throws(()=>savePacket(out,{fsApi,directory:"/offline/editorial"}),/permission denied/);
});
