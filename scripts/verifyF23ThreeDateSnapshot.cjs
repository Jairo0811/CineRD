/**
 * CineRD F-2.3 — Audit of post-migration SQL snapshot export.
 * READ-ONLY: compares Git HEAD to the local database/seeds/catalog.snapshot.json.
 * Only accepts changes to exactly three approved FechaEstreno values and generatedAtUtc.
 * It does not connect to SQL, edit files, record approvals or publish a build.
 */
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const {isDeepStrictEqual}=require('node:util');
const root=path.resolve(__dirname,'..');
const snapPath='database/seeds/catalog.snapshot.json';
const approvalsPath='docs/f23-approved-release-dates-2026-11-09.json';
const EXPECTED_IDS=[10,40,55];

function diffPaths(a,b,prefix='$',limit=20,out=[]){
  if(out.length>=limit || isDeepStrictEqual(a,b))return out;
  if(a && b && typeof a==='object' && typeof b==='object' &&
     Array.isArray(a)===Array.isArray(b)){
    const keys=[...new Set([...Object.keys(a),...Object.keys(b)])].sort();
    for(const k of keys){if(out.length>=limit)break;diffPaths(a[k],b[k],
      prefix+(Array.isArray(a)?'['+k+']':'.'+k),limit,out);}
  }else out.push(prefix);
  return out;
}
const date=v=>typeof v==='string' && /^\d{4}-\d{2}-\d{2}$/.test(v) &&
  Number.isFinite(Date.parse(v+'T00:00:00.000Z')) &&
  new Date(v+'T00:00:00.000Z').toISOString().slice(0,10)===v;
const isoDate=v=>typeof v==='string' && /^\d{4}-\d{2}-\d{2}T00:00:00(?:\.000)?Z$/.test(v) ? v.slice(0,10):null;
const validTimestamp=v=>typeof v==='string' &&
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(v) &&
  Number.isFinite(Date.parse(v)) && new Date(v).toISOString()===v;

function auditExport(before,after,manifest){
  const issues=[];
  if(!before||!after||!manifest||
     before.format!=='CineRD.CatalogSnapshot'||after.format!==before.format||
     before.sourceDatabase!=='CRUDPeliculas'||after.sourceDatabase!=='CRUDPeliculas'||
     !Array.isArray(before.tables?.Peliculas)||!Array.isArray(after.tables?.Peliculas)||
     !Array.isArray(manifest.decisions))return {ok:false,issues:['Datos de catálogo o aprobaciones inválidos']};
  const rows=manifest.decisions;
  if(rows.length!==3 || JSON.stringify(rows.map(r=>r.filmId))!==JSON.stringify(EXPECTED_IDS))
    issues.push('El expediente no identifica exactamente tres decisiones #10, #40, #55');
  if(!validTimestamp(before.generatedAtUtc)||!validTimestamp(after.generatedAtUtc)||
     Date.parse(after.generatedAtUtc)<=Date.parse(before.generatedAtUtc))
    issues.push('La marca generatedAtUtc debe aumentar como fecha UTC ISO válida');
  const expected=structuredClone(before);
  expected.generatedAtUtc=after.generatedAtUtc;
  let matched=0;
  for(const r of rows){
    if(!Number.isInteger(r.filmId)||!EXPECTED_IDS.includes(r.filmId)||
      r.field!=='FechaEstreno'||r.decision!=='APROBAR_CANDIDATA'||
      !date(r.currentSql)||!date(r.approvedNewValue)) {
      issues.push('Decisión de fecha inválida: '+String(r.filmId));continue;
    }
    const original=before.tables.Peliculas.filter(f=>Number(f.Id)===r.filmId);
    const updated=after.tables.Peliculas.filter(f=>Number(f.Id)===r.filmId);
    const target=expected.tables.Peliculas.filter(f=>Number(f.Id)===r.filmId);
    if(original.length!==1||updated.length!==1||target.length!==1||
       original[0].Titulo!==r.title||updated[0].Titulo!==r.title){
      issues.push('Identidad ambigua o faltante: '+r.filmId);continue;
    }
    if(isoDate(original[0].FechaEstreno)!==r.currentSql ||
       isoDate(updated[0].FechaEstreno)!==r.approvedNewValue){
      issues.push('Fecha anterior/nueva distinta del registro aprobado: '+r.filmId);continue;
    }
    target[0].FechaEstreno=updated[0].FechaEstreno;
    matched++;
  }
  if(matched!==3)issues.push('No se validaron las 3 fechas autorizadas');
  if(!isDeepStrictEqual(expected,after))
    issues.push('Hay cambios extra fuera de las tres fechas y fecha de exportación: '+
      diffPaths(expected,after).join(', '));
  return {ok:issues.length===0,issues,verifiedDates:matched,
    timestampFrom:before.generatedAtUtc,timestampTo:after.generatedAtUtc,
    sourceDatabase:after.sourceDatabase};
}

function main(){
  if(process.argv.slice(2).some(arg=>arg!=='--json'))throw Error('Uso: node scripts/verifyF23ThreeDateSnapshot.cjs [--json]');
  const original=JSON.parse(execFileSync('git',['show','HEAD:'+snapPath],
    {cwd:root,encoding:'utf8',maxBuffer:24*1024*1024}));
  const local=JSON.parse(fs.readFileSync(path.join(root,snapPath),'utf8'));
  const manifest=JSON.parse(fs.readFileSync(path.join(root,approvalsPath),'utf8'));
  const result=auditExport(original,local,manifest);
  if(process.argv.includes('--json'))console.log(JSON.stringify(result,null,2));
  else{
    console.log('CineRD F-2.3 — auditoría de snapshot posterior a SQL (SOLO LECTURA)');
    console.log('Fechas confirmadas respecto a HEAD: '+result.verifiedDates+'/3');
    if(result.ok)console.log('✓ SOLO cambian FechaEstreno #10, #40, #55 y generatedAtUtc');
    else result.issues.forEach(e=>console.error('✗ '+e));
    console.log('No hace commit, no aprueba editoriales ni modifica SQL.');
  }
  if(!result.ok)process.exitCode=1;
}
if(require.main===module){try{main()}catch(e){console.error('✗ '+e.message);process.exitCode=1;}}
module.exports={auditExport,diffPaths};
