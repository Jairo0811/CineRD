const {test}=require("node:test");
const assert=require("node:assert/strict");
const loaded=require("../database/seeds/catalog.snapshot.json");
const ledger=require("../docs/catalog-corrections-e4.json");
const {auditExport,diffPaths}=require("./verifyE4SnapshotExport.cjs");

const clone=x=>JSON.parse(JSON.stringify(x));
// Reconstruct the E-4 preimage irrespective of whether the local snapshot has
// already been exported. The fixture does not write or modify the real catalog.
const base=clone(loaded);
for(const row of ledger.rows) {
  const film=base.tables.Peliculas.find(x=>x.Id===row.filmId);
  film[row.field]=row.field==="FechaEstreno"
    ? row.expected+"T00:00:00.000Z":row.expected;
}
const refreshed=()=>{
  const next=clone(base);
  next.generatedAtUtc=new Date(Date.parse(base.generatedAtUtc)+60_000).toISOString();
  for(const row of ledger.rows) {
    const film=next.tables.Peliculas.find(x=>x.Id===row.filmId);
    film[row.field]=row.field==="FechaEstreno"
      ? row.proposed+"T00:00:00.000Z":row.proposed;
  }
  return next;
};

test("E-4: siete cambios exactos más generatedAtUtc pasan sin escribir archivos",()=>{
  const result=auditExport(base,refreshed(),ledger);
  assert.equal(result.ok,true,result.problems.join(" | "));
  assert.equal(result.verifiedChanges,7);
  assert.deepEqual(result.verifiedKeys,[
    "9:Genero","9:FechaEstreno","24:Director","24:FechaEstreno",
    "30:Director","32:Director","32:FechaEstreno"
  ]);
});

test("E-4: cambios ajenos en actores o metadatos bloquean sincronización",()=>{
  const exported=refreshed();
  exported.tables.Actores[0].Nombre="Nombre alterado";
  let report=auditExport(base,exported,ledger);
  assert.equal(report.ok,false);
  assert.match(report.problems.join(" | "),/Diferencias fuera de E-4/);
  assert.ok(report.problems.some(x=>x.includes("Actores")));
  const another=refreshed();
  another.media.availableLocally=0;
  report=auditExport(base,another,ledger);
  assert.equal(report.ok,false);
  assert.match(report.problems.join(" | "),/media.availableLocally/);
});

test("E-4: alteración de una sola propuesta o fecha incompleta bloquea",()=>{
  const exported=refreshed();
  exported.tables.Peliculas.find(x=>x.Id===24).Director="Otra persona";
  let report=auditExport(base,exported,ledger);
  assert.equal(report.ok,false);
  assert.match(report.problems.join(" | "),/24:Director/);
  const badDate=refreshed();
  badDate.tables.Peliculas.find(x=>x.Id===9).FechaEstreno="2011-01-20T04:00:00.000Z";
  report=auditExport(base,badDate,ledger);
  assert.equal(report.ok,false);
  assert.match(report.problems.join(" | "),/9:FechaEstreno/);
});

test("E-4: cambio de base, título y filas extra son detectados",()=>{
  const exported=refreshed();
  exported.sourceDatabase="OtraBase";
  assert.match(auditExport(base,exported,ledger).problems.join(" | "),/base de datos/);
  const renamed=refreshed();
  renamed.tables.Peliculas.find(x=>x.Id===9).Titulo="Película cambiada";
  assert.match(auditExport(base,renamed,ledger).problems.join(" | "),/Identidad/);
  const added=refreshed();
  added.tables.Peliculas.push({...added.tables.Peliculas[0],Id:10000});
  assert.match(auditExport(base,added,ledger).problems.join(" | "),/Diferencias fuera de E-4/);
});

test("E-4: fecha de exportación debe ser nueva y UTC verificable",()=>{
  const exported=refreshed();
  exported.generatedAtUtc=base.generatedAtUtc;
  assert.match(auditExport(base,exported,ledger).problems.join(" | "),/fecha UTC/);
  const fake=refreshed();
  fake.generatedAtUtc="fecha-falsa";
  assert.match(auditExport(base,fake,ledger).problems.join(" | "),/fecha UTC/);
});

test("E-4: una exportación incompleta no puede aprobarse como segura",()=>{
  const exported=refreshed();
  delete exported.tables;
  assert.equal(auditExport(base,exported,ledger).ok,false);
  const fewer={...ledger,rows:ledger.rows.slice(1)};
  assert.equal(auditExport(base,refreshed(),fewer).ok,false);
  const changedOld=clone(base);
  changedOld.tables.Peliculas.find(x=>x.Id===9).Genero="Comedia";
  assert.match(auditExport(changedOld,refreshed(),ledger).problems.join(" | "),/versión HEAD/);
});

test("E-4: comparación estructural incluye los arrays y campos privados nuevos",()=>{
  assert.deepEqual(diffPaths({a:[{x:1}]},{a:[{x:2}],extra:true}),[
    "$.a[0].x","$.extra"
  ]);
});
