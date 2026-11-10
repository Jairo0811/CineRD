const {test}=require('node:test');
const assert=require('node:assert/strict');
const {auditFiveExport}=require('./verifyF23FiveDateSnapshot.cjs');
const decisions=[
[27,'Lotoman 003: Volando Bajito','2014-03-15','2014-03-27'],
[36,'Nueba Yol 3: Bajo la Nueva Ley','1997-10-31','1997-10-23'],
[42,'Andrea','2005-08-16','2005-08-18'],
[44,'Playball','2008-02-01','2008-02-14'],
[56,'La Lucha de Ana','2012-04-13','2012-05-24']
];
const iso=d=>d+'T00:00:00.000Z';
function sample(){
 const before={
   format:'CineRD.CatalogSnapshot',version:3,
   sourceDatabase:'CRUDPeliculas',
   generatedAtUtc:'2026-11-09T20:00:00.000Z',
   tables:{Peliculas:decisions.map(([id,title,d])=>({
     Id:id,Titulo:title,FechaEstreno:iso(d),Genero:'Drama'
   })).concat([{Id:40,Titulo:'Colao 2',FechaEstreno:iso('2023-11-30')}]),
   Actores:[{Id:2,Nombre:'Ejemplo'}]},
   media:{files:128}
 };
 const after=structuredClone(before);
 after.generatedAtUtc='2026-11-10T03:00:00.000Z';
 for(const [id,title,oldv,newv] of decisions)
   after.tables.Peliculas.find(f=>f.Id===id).FechaEstreno=iso(newv);
 const approval={humanApprovalByOwner:true,sqlApplied:true,
    backupForThisBatchVerified:true,decisions:decisions.map(
      ([filmId,title,currentSql,approvedNewValue])=>({
       filmId,title,currentSql,approvedNewValue,field:'FechaEstreno',
       decision:'APROBAR_CANDIDATA'
      }))};
 return {before,after,approval};
}
test('autoriza solo cinco diferencias FechaEstreno y nueva marca UTC',()=>{
 const x=sample(),r=auditFiveExport(x.before,x.after,x.approval);
 assert.equal(r.ok,true);assert.equal(r.verifiedDates,5);
 assert.deepEqual(r.issues,[]);
});
test('rechaza un cambio de fecha no autorizado, incluso de las primeras tres',()=>{
 const x=sample();
 x.after.tables.Peliculas.find(f=>f.Id===40).FechaEstreno=iso('2023-12-07');
 assert.equal(auditFiveExport(x.before,x.after,x.approval).ok,false);
});
test('rechaza valores incorrectos en cualquiera de cinco fechas',()=>{
 const x=sample();x.after.tables.Peliculas[1].FechaEstreno=iso('1997-10-22');
 assert.equal(auditFiveExport(x.before,x.after,x.approval).ok,false);
});
test('rechaza cambios de otros campos o multimedia',()=>{
 const x=sample();x.after.tables.Actores[0].Nombre='Alterado';
 assert.equal(auditFiveExport(x.before,x.after,x.approval).ok,false);
 const y=sample();y.after.media.files=127;
 assert.equal(auditFiveExport(y.before,y.after,y.approval).ok,false);
});
test('rechaza fecha de generación inválida o que no aumente',()=>{
 const x=sample();x.after.generatedAtUtc=x.before.generatedAtUtc;
 assert.equal(auditFiveExport(x.before,x.after,x.approval).ok,false);
 const y=sample();y.after.generatedAtUtc='invalid';
 assert.equal(auditFiveExport(y.before,y.after,y.approval).ok,false);
});
test('no admite sello/aprobación/backup inexistente',()=>{
 for(const p of ['humanApprovalByOwner','sqlApplied','backupForThisBatchVerified']){
   const x=sample();x.approval[p]=false;
   assert.equal(auditFiveExport(x.before,x.after,x.approval).ok,false);
 }
});
test('rechaza cambios de título, filas duplicadas y nuevas decisiones',()=>{
 const x=sample();x.after.tables.Peliculas[0].Titulo='No autorizado';
 assert.equal(auditFiveExport(x.before,x.after,x.approval).ok,false);
 const y=sample();y.after.tables.Peliculas.push(structuredClone(y.after.tables.Peliculas[0]));
 assert.equal(auditFiveExport(y.before,y.after,y.approval).ok,false);
 const z=sample();z.approval.decisions.push({
   filmId:99,title:'Otro',field:'FechaEstreno',decision:'APROBAR_CANDIDATA',
   currentSql:'2020-01-01',approvedNewValue:'2020-01-02'
 });
 assert.equal(auditFiveExport(z.before,z.after,z.approval).ok,false);
});
