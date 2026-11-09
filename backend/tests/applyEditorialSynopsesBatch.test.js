const {test}=require("node:test");
const assert=require("node:assert/strict");
const snapshot=require("../../database/seeds/catalog.snapshot.json");
const drafts=require("../../docs/editorial-sql-replacement-drafts-f23.json");
const approvals=require("../../docs/editorial-sql-migration-approvals-f23.json");
const {
  loadBatch,parseArgs,assertBatchGate,checkPreimages,applyBatch
}=require("../scripts/applyEditorialSynopsesBatch");

const clone=x=>JSON.parse(JSON.stringify(x));
const batch=()=>loadBatch(snapshot,drafts,approvals);
const live=()=>batch().items.map(({film})=>({
  Id:film.Id,Titulo:film.Titulo,Sinopsis:film.Sinopsis,
  FechaEstreno:new Date(film.FechaEstreno)
}));
const makeApproved=()=>{
  const b=batch();
  for(const item of b.items){
    item.approval={
      filmId:item.film.Id,status:"aprobado",fingerprint:item.fingerprint,
      reviewer:"Revisor sintético en prueba",
      reviewedAt:"2026-11-08T20:00:00-04:00",
      sourcesChecked:true,esReviewed:true,enReviewed:true,
      originalityReviewed:true,rightsReviewed:true,releaseAuthorized:true,
      notes:"Prueba aislada: registro artificial, nunca se guarda como aprobación real."
    };
  }
  return b;
};
const options={apply:true,show:false,confirmBackup:true,backupFile:"/tmp/backup-validado.bak"};
const env={DB_DATABASE:"CRUDPeliculas",DB_SERVER:"TEST",DB_USER:"test",DB_PASSWORD:"test"};
const statSync=()=>({isFile:()=>true,size:2048});

test("F-2.3 lote: cinco propuestas ES/EN y cero autorizaciones reales",()=>{
  const b=batch();
  assert.deepEqual(b.items.map(x=>x.film.Id),[5,6,10,55,56]);
  assert.ok(b.items.every(x=>x.approval===undefined));
  assert.ok(b.items.every(x=>x.draft.status==="pendiente_revision"));
  assert.ok(b.items.every(x=>x.draft.deployment==="manual_only"));
  assert.equal(drafts.autoPublish,false);
  assert.equal(approvals.approvals.length,0);
});

test("F-2.3 lote: ninguna película ni propuesta ajena puede incorporarse",()=>{
  const c=clone(drafts);c.entries["99"]={...c.entries["5"],filmId:99};
  assert.throws(()=>loadBatch(snapshot,c,approvals),/propuestas no coinciden/);
  const other=clone(snapshot);
  other.tables.Peliculas.find(x=>x.Id===5).Sinopsis=null;
  assert.throws(()=>loadBatch(other,drafts,approvals),/inventario/);
  const fake=clone(approvals);fake.approvals=[{filmId:99}];
  assert.throws(()=>loadBatch(snapshot,drafts,fake),/ajena o duplicada/);
});

test("F-2.3 lote: argumento único de aplicación exige confirmación y backup",()=>{
  assert.deepEqual(parseArgs([]),{apply:false,show:false,confirmBackup:false,backupFile:null});
  assert.deepEqual(parseArgs(["--show"]),{apply:false,show:true,confirmBackup:false,backupFile:null});
  assert.throws(()=>parseArgs(["--apply","--show"]),/no se combinan/);
  assert.throws(()=>parseArgs(["--confirm-db-backup"]),/solo se recibe/);
  assert.throws(()=>parseArgs(["--apply","--backup-file"]),/Falta ruta/);
  assert.throws(()=>parseArgs(["--apply","--apply"]),/repetido/);
  assert.throws(()=>parseArgs(["--test"]),/no reconocido/);
});

test("F-2.3 lote: no permite --apply sin las cinco autorizaciones reales",()=>{
  assert.throws(()=>assertBatchGate({batch:batch(),options,env,statSync}),/No hay aprobacion humana/);
  const partial=makeApproved();
  partial.items[4].approval=undefined;
  assert.throws(()=>assertBatchGate({batch:partial,options,env,statSync}),/No hay aprobacion humana/);
  const invalid=makeApproved();
  invalid.items[2].approval.fingerprint="falsa";
  assert.throws(()=>assertBatchGate({batch:invalid,options,env,statSync}),/huella/);
});

test("F-2.3 lote: la revisión sintética necesita misma base y .bak absoluto no vacío",()=>{
  const b=makeApproved();
  assert.equal(assertBatchGate({batch:b,options,env,statSync}).approved,5);
  assert.throws(()=>assertBatchGate({batch:b,options,env:{...env,DB_DATABASE:"Otra"},statSync}),/DB_DATABASE/);
  assert.throws(()=>assertBatchGate({batch:b,options:{...options,confirmBackup:false},env,statSync}),/confirm-db-backup/);
  assert.throws(()=>assertBatchGate({batch:b,options:{...options,backupFile:"relative.bak"},env,statSync}),/RUTA_ABSOLUTA/);
  assert.throws(()=>assertBatchGate({batch:b,options,env,statSync:()=>({isFile:()=>true,size:0})}),/no vacío/);
});

test("F-2.3 lote: exige las cinco preimágenes exactas antes de cualquier UPDATE",()=>{
  const b=batch();
  assert.equal(checkPreimages(b,live()),true);
  const changed=live();
  changed.find(x=>x.Id===10).Sinopsis+=" alteración.";
  assert.throws(()=>checkPreimages(b,changed),/original cambió.*10/);
  const wrongDate=live();
  wrongDate.find(x=>x.Id===56).FechaEstreno=new Date("2011-01-01T00:00:00.000Z");
  assert.throws(()=>checkPreimages(b,wrongDate),/Identidad SQL distinta.*56/);
  assert.throws(()=>checkPreimages(b,live().slice(1)),/incompleto/);
});

function simulatedDriver({failOnId=null,drift=false}={}) {
  const events=[];
  const records=live();
  if(drift)records[2].Sinopsis="Otro texto SQL";
  let selected=0;
  class Pool {
    async connect(){events.push("connect");}
    async close(){events.push("close");}
  }
  class Transaction {
    async begin(level){assert.equal(level,"SERIALIZABLE");events.push("begin");}
    async commit(){events.push("commit");}
    async rollback(){events.push("rollback");}
  }
  class Request {
    input(name,type,value){
      this[name]=value;
      return this;
    }
    async query(statement) {
      const id=this.filmId;
      if(statement.startsWith("SELECT ")) {
        selected++;
        assert.ok(statement.includes("WITH (UPDLOCK,HOLDLOCK)"));
        const row=records.find(x=>x.Id===id);
        events.push("select:"+id);
        return {recordset:row?[row]:[]};
      }
      assert.ok(statement.startsWith("UPDATE dbo.Peliculas SET Sinopsis=@newText"));
      assert.equal(selected,5,"all five SELECT must finish before updating");
      assert.equal(typeof this.newText,"string");
      events.push("update:"+id);
      if(id===failOnId)throw Error("simulated write failure");
      return {rowsAffected:[1]};
    }
  }
  return {
    driver:{ConnectionPool:Pool,Transaction,Request,Int:"Int",NVarChar:()=> "NVARCHAR",MAX:"MAX",ISOLATION_LEVEL:{SERIALIZABLE:"SERIALIZABLE"}},
    events
  };
}

test("F-2.3 lote: una única transacción para cinco cambios y preimagen antes de UPDATE",async()=>{
  const b=makeApproved(),{driver,events}=simulatedDriver();
  const filesystem={
    statSync,mkdirSync:()=>events.push("mkdir"),
    writeFileSync:(p,data,opts)=>{
      assert.ok(p.endsWith(".json"));
      assert.equal(opts.flag,"wx");
      assert.ok(data.includes('"preimages"'));
      events.push("preimage");
    }
  };
  const result=await applyBatch({batch:b,options,env,sqlDriver:driver,fsApi:filesystem,logger:{log:()=>{}}});
  assert.deepEqual(result,{updated:5});
  assert.equal(events.filter(x=>x==="begin").length,1);
  assert.equal(events.filter(x=>x==="commit").length,1);
  assert.equal(events.filter(x=>x.startsWith("update:")).length,5);
  assert.equal(events.filter(x=>x.startsWith("select:")).length,5);
  assert.ok(events.indexOf("preimage")<events.findIndex(x=>x.startsWith("update:")));
  assert.ok(!events.includes("rollback"));
});

test("F-2.3 lote: una diferencia SQL o fallo de escritura revierte todos los cambios",async()=>{
  const b=makeApproved(),filesystem={
    statSync,mkdirSync:()=>{},writeFileSync:()=>{}
  };
  const altered=simulatedDriver({drift:true});
  await assert.rejects(()=>applyBatch({batch:b,options,env,sqlDriver:altered.driver,fsApi:filesystem,logger:{log:()=>{}}}),/original cambió/);
  assert.ok(altered.events.includes("rollback"));
  assert.ok(!altered.events.some(x=>x.startsWith("update:")));
  const failed=simulatedDriver({failOnId:10});
  await assert.rejects(()=>applyBatch({batch:b,options,env,sqlDriver:failed.driver,fsApi:filesystem,logger:{log:()=>{}}}),/simulated write failure/);
  assert.ok(failed.events.includes("rollback"));
  assert.ok(!failed.events.includes("commit"));
});
