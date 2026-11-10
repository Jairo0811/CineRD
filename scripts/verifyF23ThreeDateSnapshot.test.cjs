const {test}=require('node:test');
const assert=require('node:assert/strict');
const {auditExport}=require('./verifyF23ThreeDateSnapshot.cjs');

const decisions=[
  {filmId:10,title:'Vamos de robo',field:'FechaEstreno',decision:'APROBAR_CANDIDATA',
    currentSql:'2014-01-15',approvedNewValue:'2014-01-16'},
  {filmId:40,title:'Colao 2',field:'FechaEstreno',decision:'APROBAR_CANDIDATA',
    currentSql:'2023-12-07',approvedNewValue:'2023-11-30'},
  {filmId:55,title:'El Plan Perfecto',field:'FechaEstreno',decision:'APROBAR_CANDIDATA',
    currentSql:'2017-01-17',approvedNewValue:'2017-01-19'}
];
function fixture(){
  const before={
    format:'CineRD.CatalogSnapshot',version:3,
    generatedAtUtc:'2026-11-08T10:36:30.957Z',sourceDatabase:'CRUDPeliculas',
    tables:{Peliculas:decisions.map(r=>({
      Id:r.filmId,Titulo:r.title,
      FechaEstreno:r.currentSql+'T00:00:00.000Z',Genero:'Comedia',Sinopsis:''
    })).concat([{Id:27,Titulo:'Lotoman 003: Volando Bajito',
      FechaEstreno:'2014-03-15T00:00:00.000Z',Genero:'Comedia'}]),
      Actores:[{Id:1,Nombre:'Ejemplo'}]},
    media:{referenced:128,availableLocally:128,missing:[]}
  };
  const after=structuredClone(before);
  after.generatedAtUtc='2026-11-09T23:59:00.000Z';
  for(const r of decisions)
    after.tables.Peliculas.find(f=>f.Id===r.filmId).FechaEstreno=r.approvedNewValue+'T00:00:00.000Z';
  return {before,after,manifest:{decisions:structuredClone(decisions)}};
}

test('permite solo 3 fechas aprobadas y nuevo generatedAtUtc',()=>{
  const r=fixture(),result=auditExport(r.before,r.after,r.manifest);
  assert.equal(result.ok,true);
  assert.equal(result.verifiedDates,3);
  assert.deepEqual(result.issues,[]);
});
test('rechaza fecha incorrecta en cualquier ID autorizado',()=>{
  const r=fixture();r.after.tables.Peliculas[1].FechaEstreno='2023-12-01T00:00:00.000Z';
  assert.equal(auditExport(r.before,r.after,r.manifest).ok,false);
});
test('rechaza cambio en película no aprobada',()=>{
  const r=fixture();r.after.tables.Peliculas[3].FechaEstreno='2014-03-27T00:00:00.000Z';
  assert.match(auditExport(r.before,r.after,r.manifest).issues.join(' '),/cambios extra/);
});
test('rechaza cambios multimedia y cualquier otra tabla',()=>{
  const r=fixture();r.after.media.availableLocally=127;
  assert.equal(auditExport(r.before,r.after,r.manifest).ok,false);
  const q=fixture();q.after.tables.Actores[0].Nombre='Distinto';
  assert.equal(auditExport(q.before,q.after,q.manifest).ok,false);
});
test('rechaza base o fecha UTC de exportación inválidas',()=>{
  const r=fixture();r.after.sourceDatabase='CRUDPeliculas_E2E';
  assert.equal(auditExport(r.before,r.after,r.manifest).ok,false);
  const q=fixture();q.after.generatedAtUtc=q.before.generatedAtUtc;
  assert.equal(auditExport(q.before,q.after,q.manifest).ok,false);
});
test('rechaza fecha de origen que no coincide con el snapshot del HEAD',()=>{
  const r=fixture();r.before.tables.Peliculas[0].FechaEstreno='2014-01-14T00:00:00.000Z';
  assert.equal(auditExport(r.before,r.after,r.manifest).ok,false);
});
test('no permite autorizar una cuarta película mediante el expediente',()=>{
  const r=fixture();r.manifest.decisions.push({
    filmId:27,title:'Lotoman 003',field:'FechaEstreno',
    decision:'APROBAR_CANDIDATA',currentSql:'2014-03-15',approvedNewValue:'2014-03-27'
  });
  assert.equal(auditExport(r.before,r.after,r.manifest).ok,false);
});
