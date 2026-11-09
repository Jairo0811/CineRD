const {test}=require("node:test");
const assert=require("node:assert/strict");
const ledger=require("../../docs/catalog-corrections-e4.json");
const snapshot=require("../../database/seeds/catalog.snapshot.json");
const {compareLiveRecords,compareSnapshotToLive,readLiveMovies}=require("../scripts/previewEditorialCorrectionsLive");

// Construct the historical E-4 preimage from the ledger, NOT from the snapshot.
// After a legitimate SQL export, the snapshot may already contain all proposed values.
const baseline=()=>[9,24,30,32].map(id=>{
  const f=snapshot.tables.Peliculas.find(x=>x.Id===id);
  const result={
    Id:f.Id,Titulo:f.Titulo,Genero:f.Genero,Director:f.Director,
    FechaEstreno:new Date(f.FechaEstreno)
  };
  for(const row of ledger.rows.filter(x=>x.filmId===id)) {
    result[row.field]=row.field==="FechaEstreno"
      ? new Date(row.expected+"T00:00:00.000Z") : row.expected;
  }
  return result;
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
  assert.equal(out.hasDrift,false);
  assert.equal(out.partial,true);
  assert.equal(out.unsafeToApply,true);
});

test("E-4: siete ALREADY es éxito de lectura y no autoriza reaplicar",()=>{
  const records=baseline();
  for(const row of ledger.rows) {
    const f=records.find(x=>x.Id===row.filmId);
    f[row.field]=row.field==="FechaEstreno"
      ? new Date(row.proposed+"T00:00:00.000Z") : row.proposed;
  }
  const out=inspect(records);
  assert.equal(out.counts.ALREADY,7);
  assert.equal(out.counts.EXPECTED,0);
  assert.equal(out.hasDrift,false);
  assert.equal(out.allAlready,true);
  assert.equal(out.partial,false);
  assert.equal(out.unsafeToApply,true);
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

test("E-4: SQL ALREADY y snapshot actualizado coinciden en los siete campos",()=>{
  const records=baseline();
  for(const row of ledger.rows) {
    const f=records.find(x=>x.Id===row.filmId);
    f[row.field]=row.field==="FechaEstreno"?
      new Date(row.proposed+"T00:00:00.000Z"):row.proposed;
  }
  const result=compareSnapshotToLive(inspect(records),snapshot);
  assert.equal(result.matched,7);
  assert.equal(result.mismatched,0);
  assert.equal(result.allAligned,true);
  const lotoman=result.items.find(x=>x.filmId===9&&x.field==="Genero");
  assert.equal(lotoman.snapshotCurrent,"Comedia");
  assert.equal(lotoman.expected,"Infantil");
  assert.equal(lotoman.current,"Comedia");
});

test("E-4: SQL original y snapshot propuesto NO coinciden, sin cambiar datos",()=>{
  const result=compareSnapshotToLive(inspect(baseline()),snapshot);
  assert.equal(result.matched,0);
  assert.equal(result.mismatched,7);
  assert.equal(result.allAligned,false);
  assert.equal(snapshot.tables.Peliculas.find(x=>x.Id===9).Genero,"Comedia");
});

test("E-4: un valor SQL inesperado tampoco se considera alineado",()=>{
  const records=baseline();
  for(const row of ledger.rows) {
    const f=records.find(x=>x.Id===row.filmId);
    f[row.field]=row.field==="FechaEstreno"?
      new Date(row.proposed+"T00:00:00.000Z"):row.proposed;
  }
  records.find(x=>x.Id===9).Genero="Drama";
  const result=compareSnapshotToLive(inspect(records),snapshot);
  assert.equal(result.mismatched,1);
  assert.equal(result.allAligned,false);
  assert.ok(result.items.some(x=>x.filmId===9&&x.field==="Genero"&&!x.match));
});
