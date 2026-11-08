const {test}=require("node:test");
const assert=require("node:assert/strict");
const ledger=require("../../docs/catalog-corrections-e4.json");
const snapshot=require("../../database/seeds/catalog.snapshot.json");
const {compareLiveRecords,readLiveMovies}=require("../scripts/previewEditorialCorrectionsLive");

const baseline=()=>[9,24,30,32].map(id=>{
  const f=snapshot.tables.Peliculas.find(x=>x.Id===id);
  return {
    Id:f.Id,Titulo:f.Titulo,Genero:f.Genero,Director:f.Director,
    FechaEstreno:new Date(f.FechaEstreno)
  };
});
const inspect=records=>compareLiveRecords(ledger.rows,records);

test("E-4: 7 campos del SQL coinciden con el snapshot y no se da autorización",()=>{
  const out=inspect(baseline());
  assert.equal(out.items.length,7);
  assert.equal(out.counts.EXPECTED,7);
  assert.equal(out.counts.ALREADY,0);
  assert.equal(out.hasDrift,false);
  assert.ok(!out.items.some(x=>x.status==="APROBADO"));
});

test("E-4: detectar cambio ya aplicado sin volver a aplicar el lote completo",()=>{
  const records=baseline();
  records.find(x=>x.Id===9).Genero="Comedia";
  const out=inspect(records);
  assert.equal(out.counts.ALREADY,1);
  assert.equal(out.counts.EXPECTED,6);
  assert.equal(out.hasDrift,true);
});

test("E-4: detectar una discrepancia inesperada en nombre y fecha",()=>{
  const records=baseline();
  records.find(x=>x.Id===24).Titulo="Otro título";
  records.find(x=>x.Id===32).FechaEstreno=new Date("2026-05-05T00:00:00Z");
  const out=inspect(records);
  assert.equal(out.counts.DRIFT,3);
  assert.equal(out.hasDrift,true);
});

test("E-4: fecha SQL de tipo Date se compara por calendario",()=>{
  const records=baseline();
  records.find(x=>x.Id===32).FechaEstreno=new Date("2026-08-13T00:00:00Z");
  const out=inspect(records);
  const f=out.items.find(x=>x.filmId===32&&x.field==="FechaEstreno");
  assert.equal(f.status,"ALREADY");
  assert.equal(f.current,"2026-08-13");
});

test("E-4: registro ausente, duplicado o resultado incorrecto se rechaza",()=>{
  const missing=inspect(baseline().filter(x=>x.Id!==30));
  assert.equal(missing.counts.MISSING,1);
  assert.equal(missing.hasDrift,true);
  const records=baseline();
  assert.throws(()=>inspect([...records,records[0]]),/duplicado/);
  assert.throws(()=>inspect({recordset:records}),/invalidos/);
});

test("E-4: las consultas a SQL usan exclusivamente SELECT parametrizados",async()=>{
  const calls=[];
  const pool={request(){let id;
    return {
      input(name,typ,value){assert.equal(name,"id");assert.equal(typeof value,"number");id=value;return this;},
      async query(q){
        calls.push({id,q});
        return {recordset:[baseline().find(x=>x.Id===id)]};
      }
    };
  }};
  const result=await readLiveMovies(pool,[9,24,30,32]);
  assert.equal(result.length,4);
  assert.equal(calls.length,4);
  for(const x of calls) {
    assert.equal(x.q,"SELECT Id,Titulo,Genero,Director,FechaEstreno FROM dbo.Peliculas WHERE Id=@id");
    assert.ok(!/UPDATE|INSERT|DELETE|EXEC|DROP/i.test(x.q));
  }
});
