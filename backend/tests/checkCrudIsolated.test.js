const test=require("node:test");
const assert=require("node:assert/strict");
const { requireIsolatedDatabase, runIsolatedCrud }=require("../scripts/checkCrudIsolated");

const env={
  DB_DATABASE:"CRUDPeliculas_E2E",NODE_ENV:"development",
  CINERD_E2E_CONFIRM:"CRUDPeliculas_E2E",
};
const sourceDatabase="CRUDPeliculas";
const argv=["--run","--confirm-isolated-db","CRUDPeliculas_E2E"];

test("sin --run la auditoría CRUD es solo PREVIEW sin conexión",()=>{
  assert.deepEqual(requireIsolatedDatabase({argv:[],env:{},sourceDatabase}),{mode:"PREVIEW"});
});

test("nunca acepta la base real, nombres inventados o faltantes de autorización",()=>{
  for(const variant of [
    {argv:["--run","--confirm-isolated-db","CRUDPeliculas"],env:{...env,DB_DATABASE:"CRUDPeliculas",CINERD_E2E_CONFIRM:"CRUDPeliculas"}},
    {argv,env:{...env,CINERD_E2E_CONFIRM:""}},
    {argv,env:{...env,DB_DATABASE:"CRUDPeliculas"}},
    {argv,env:{...env,NODE_ENV:"production"}},
    {argv:["--run"],env},
    {argv:["--run","--confirm-isolated-db","CRUDPeliculas_E2E","--force"],env},
    {argv:["--run","--confirm-isolated-db","master"],env:{...env,DB_DATABASE:"master",CINERD_E2E_CONFIRM:"master"}},
  ]) {
    assert.throws(()=>requireIsolatedDatabase({...variant,sourceDatabase}),/Protección E2E|confirmación/i);
  }
});

function fakeDb({ failOn }={}) {
  const state={began:false,rolledBack:false,calls:[]};
  class Transaction {
    async begin(){ state.began=true; }
    async rollback(){ state.rolledBack=true; }
  }
  class Request {
    constructor(tx){this.tx=tx;this.values={};}
    input(k,t,v){this.values[k]=v;return this;}
    async query(q){
      state.calls.push(q);
      if(failOn && q.includes(failOn)) throw Error("fallo SQL simulado");
      if(q.includes("UPDATE dbo.Actores")) return {recordset:[{Id:10,Profesion:"Actor"}]};
      if(q.includes("UPDATE dbo.Peliculas")) return {recordset:[{Id:20,Genero:"Comedia"}]};
      if(q.includes("INSERT INTO dbo.Actores")) return {recordset:[{Id:10}]};
      if(q.includes("INSERT INTO dbo.Peliculas")) return {recordset:[{Id:20}]};
      if(q.includes("GaleriaMultimedia")) return {recordset:[{Id:30}]};
      return {recordset:[{Id:10,PeliculaId:20,ActorId:10}]};
    }
  }
  const sql={
    Transaction,Request, ISOLATION_LEVEL:{READ_COMMITTED:"read_committed"},
    NVarChar:n=>"NVARCHAR_"+n,Date:"DATE",Int:"INT",
  };
  const pool={
    request:()=>({query:async()=>({recordset:[{Nombre:"CRUDPeliculas_E2E"}]})}),
  };
  return {state,getDb:()=>({sql,poolPromise:Promise.resolve(pool)})};
}

test("CRUD cubre las 13 operaciones y ejecuta ROLLBACK al final",async()=>{
  const {state,getDb}=fakeDb();
  const r=await runIsolatedCrud({mode:"ROLLBACK_E2E",database:"CRUDPeliculas_E2E"},{getDb});
  assert.equal(r.status,"CRUD_TX_ROLLBACK_PASS");
  assert.equal(r.rolledBack,true);
  assert.equal(r.operations.length,13);
  assert.equal(state.began,true);
  assert.equal(state.rolledBack,true);
  assert.equal(state.calls.length,13);
  assert.ok(state.calls.every(q=>q.includes("dbo.")));
});

test("un error durante INSERT también revierte y nunca marca PASS",async()=>{
  const {state,getDb}=fakeDb({failOn:"INSERT INTO dbo.PeliculaCreditos"});
  await assert.rejects(()=>runIsolatedCrud({mode:"ROLLBACK_E2E",database:"CRUDPeliculas_E2E"},{getDb}),/fallo SQL simulado/);
  assert.equal(state.rolledBack,true);
});

test("se rechaza pool que conecta a base distinta de la autorizada",async()=>{
  const {state,getDb}=fakeDb();
  await assert.rejects(()=>runIsolatedCrud({mode:"ROLLBACK_E2E",database:"OtraBase"},{getDb}),/apunta a otra base/);
  assert.equal(state.began,false);
});
