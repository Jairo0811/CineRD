/**
 * CineRD F-2.3: auditoría estricta del segundo lote DESPUÉS de exportar SQL.
 * READ-ONLY: contrasta snapshot en HEAD vs snapshot en working tree.
 * SOLO admite las cinco fechas aprobadas y generatedAtUtc. Nunca escribe ni
 * ejecuta SQL, ni declara licencias o nuevas aprobaciones humanas.
 */
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const {isDeepStrictEqual}=require('node:util');
const {diffPaths}=require('./verifyF23ThreeDateSnapshot.cjs');
const root=path.resolve(__dirname,'..');
const snapshotFile='database/seeds/catalog.snapshot.json';
const approvalFile='docs/f23-approved-remaining-5-dates-2026-11-09.json';
const ids=[27,36,42,44,56];

function day(v){
  if(typeof v!=='string')return null;
  const m=/^(\d{4}-\d{2}-\d{2})T00:00:00(?:\.000)?Z$/.exec(v);
  return m?m[1]:null;
}
function date(v){
  return typeof v==='string' && /^\d{4}-\d{2}-\d{2}$/.test(v) &&
    Number.isFinite(Date.parse(v+'T00:00:00.000Z')) &&
    new Date(v+'T00:00:00.000Z').toISOString().slice(0,10)===v;
}
function timestamp(v){
  return typeof v==='string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(v) &&
    Number.isFinite(Date.parse(v)) && new Date(v).toISOString()===v;
}
function auditFiveExport(before,after,approval){
  const issues=[];
  if(before?.format!=='CineRD.CatalogSnapshot'||
    after?.format!==before?.format ||
    before?.sourceDatabase!=='CRUDPeliculas'||
    after?.sourceDatabase!=='CRUDPeliculas' ||
    !Array.isArray(before?.tables?.Peliculas) ||
    !Array.isArray(after?.tables?.Peliculas) ||
    !Array.isArray(approval?.decisions)){
      return {ok:false,verifiedDates:0,issues:['Formato/base de snapshot o aprobaciones inválidos']};
  }
  if(approval.sqlApplied!==true || approval.backupForThisBatchVerified!==true ||
     approval.humanApprovalByOwner!==true)
    issues.push('El segundo lote no tiene SQL aplicado, backup y aprobación humana documentados');
  if(JSON.stringify(approval.decisions.map(x=>x.filmId))!==JSON.stringify(ids))
    issues.push('Las decisiones no son exactamente #27,#36,#42,#44,#56');
  if(!timestamp(before.generatedAtUtc)||!timestamp(after.generatedAtUtc)||
     Date.parse(after.generatedAtUtc)<=Date.parse(before.generatedAtUtc))
    issues.push('generatedAtUtc no aumenta con ISO UTC válido');
  const expected=structuredClone(before);
  expected.generatedAtUtc=after.generatedAtUtc;
  let verifiedDates=0;
  for(const r of approval.decisions){
    if(!ids.includes(r.filmId)||r.field!=='FechaEstreno'||
       r.decision!=='APROBAR_CANDIDATA'||!date(r.currentSql)||
       !date(r.approvedNewValue)||r.currentSql===r.approvedNewValue){
      issues.push('Propuesta inválida para ID '+String(r.filmId));continue;
    }
    const source=before.tables.Peliculas.filter(f=>Number(f.Id)===r.filmId);
    const changed=after.tables.Peliculas.filter(f=>Number(f.Id)===r.filmId);
    const target=expected.tables.Peliculas.filter(f=>Number(f.Id)===r.filmId);
    if(source.length!==1||changed.length!==1||target.length!==1||
       source[0].Titulo!==r.title||changed[0].Titulo!==r.title){
      issues.push('Identidad distinta o duplicada #'+r.filmId);continue;
    }
    if(day(source[0].FechaEstreno)!==r.currentSql||
       day(changed[0].FechaEstreno)!==r.approvedNewValue){
      issues.push('Fecha anterior/nueva fuera de autorización #'+r.filmId);continue;
    }
    target[0].FechaEstreno=changed[0].FechaEstreno;
    verifiedDates++;
  }
  if(verifiedDates!==5)issues.push('No coinciden las cinco fechas aprobadas');
  if(!isDeepStrictEqual(expected,after))
    issues.push('Cambios adicionales ajenos a cinco fechas/generación: '+
      diffPaths(expected,after).join(', '));
  return {ok:issues.length===0,verifiedDates,issues,
    from:before.generatedAtUtc,to:after.generatedAtUtc};
}
function main(){
  if(process.argv.slice(2).some(x=>x!=='--json'))
    throw Error('Uso: node scripts/verifyF23FiveDateSnapshot.cjs [--json]');
  const before=JSON.parse(execFileSync('git',['show','HEAD:'+snapshotFile],{
    cwd:root,encoding:'utf8',maxBuffer:24*1024*1024
  }));
  const after=JSON.parse(fs.readFileSync(path.join(root,snapshotFile),'utf8'));
  const approval=JSON.parse(fs.readFileSync(path.join(root,approvalFile),'utf8'));
  const result=auditFiveExport(before,after,approval);
  if(process.argv.includes('--json'))console.log(JSON.stringify(result,null,2));
  else{
    console.log('CineRD F-2.3 — auditoría segundo lote (SOLO LECTURA)');
    console.log('Fechas comprobadas respecto a HEAD: '+result.verifiedDates+'/5');
    if(result.ok)console.log('✓ SOLO cambian FechaEstreno #27,#36,#42,#44,#56 y generatedAtUtc');
    else result.issues.forEach(x=>console.error('✗ '+x));
    console.log('No ejecuta SQL, no aprueba texto ni modifica archivos.');
  }
  if(!result.ok)process.exitCode=1;
}
if(require.main===module){
  try{main()}catch(e){console.error('✗ '+e.message);process.exitCode=1;}
}
module.exports={auditFiveExport};
