/**
 * CineRD — E4 / sinopsis SQL + E5 + producción (3 frentes en paralelo).
 * SOLO LECTURA. No comunica secretos, no otorga aprobaciones, no ejecuta SQL,
 * no activa AdSense ni interpreta código listo como producción operativa.
 * Uso: node scripts/reportParallelClosure.mjs [--json] [--strict]
 * --strict: falla mientras haya bloqueos humanos o de infraestructura.
 */
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {inventory,validateApprovals} from "./editorialReviewAudit.mjs";
import {makeReport} from "./reportProductionCommercial.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const stripDate=v=>v==null?null:String(v).slice(0,10);
const normalized=(field,v)=>v==null?null:
  field==="FechaEstreno"?stripDate(v):String(v).trim();

export function assembleClosure({snapshot,e4,e4Approvals,e5Issues,e5Items,e5Approvals,
  drafts,sqlApprovals,production}){
  const errors=[],films=snapshot?.tables?.Peliculas||[];
  if(!Array.isArray(films)||!Array.isArray(e4?.rows)||!Array.isArray(e4Approvals?.approvals)||
     !Array.isArray(e5Issues?.items)||!Array.isArray(e5Items)||
     !Array.isArray(e5Approvals?.approvals)||!drafts?.entries||
     !Array.isArray(sqlApprovals?.approvals)||!production)
    throw Error("Faltan datos obligatorios de los tres frentes");
  const e4Keys=new Set(),e4Rows=[];
  for(const row of e4.rows){
    const key=row.filmId+":"+row.field;
    if(e4Keys.has(key))errors.push("E4 duplicado "+key);
    e4Keys.add(key);
    const film=films.find(f=>f.Id===row.filmId);
    if(!film||String(film.Titulo||"").trim()!==row.title)
      errors.push("E4 identidad distinta "+key);
    const current=normalized(row.field,film?.[row.field]);
    const status=current===normalized(row.field,row.proposed)?"PROPUESTA_EN_SNAPSHOT_NO_APROBADA":
      current===normalized(row.field,row.expected)?"VALOR_ANTERIOR_EN_SNAPSHOT":"REVISAR_DIVERGENCIA";
    if(status==="REVISAR_DIVERGENCIA")errors.push("E4 valor ajeno "+key);
    e4Rows.push({filmId:row.filmId,title:row.title,field:row.field,
      snapshotValue:current,previous:row.expected,proposed:row.proposed,
      status,approvalRecorded:e4Approvals.approvals.some(a=>a.filmId===row.filmId&&a.field===row.field),
      sourceCount:row.sources.length});
  }
  if(e4Rows.length!==7)errors.push("Inventario E4 distinto de 7");
  if(e4Approvals.approvals.length)errors.push("Validar manualmente firmas E4, no basta su presencia en JSON");
  const sourceIssues=new Map(e5Issues.items.map(i=>[i.filmId+":"+i.kind,i]));
  if(sourceIssues.size!==e5Issues.items.length)errors.push("Incidencias E5 duplicadas");
  const reviewed=validateApprovals(e5Items,e5Approvals.approvals);
  errors.push(...reviewed.failures);
  const e5Rows=e5Items.map(item=>{
    const issue=sourceIssues.get(item.filmId+":"+item.kind);
    if(!issue)errors.push("E5 sin incidencia "+item.filmId+":"+item.kind);
    return {filmId:item.filmId,title:item.titulo,kind:item.kind,
      priority:issue?.priority||"desconocida",observation:issue?.observation||"",
      sourceReport:issue?.sourceReport||null,sources:item.fuentes,
      fingerprint:item.fingerprint,
      status:reviewed.approved.has(item.kind+":"+item.filmId)?"aprobada":"PENDIENTE_REVISION_HUMANA"};
  });
  const byPriority={alta:[],media:[],baja:[]};
  for(const x of e5Rows){
    if(!byPriority[x.priority])errors.push("Prioridad E5 inválida: "+x.priority);
    else byPriority[x.priority].push(x);
  }
  for(const arr of Object.values(byPriority))arr.sort((a,b)=>a.filmId-b.filmId);
  if(e5Rows.length!==58||byPriority.alta.length!==18||
     byPriority.media.length!==18||byPriority.baja.length!==22)
    errors.push("Inventario E5 no coincide con matriz 18/18/22");
  if(e5Approvals.approvals.length!==reviewed.approved.size)
    errors.push("Hay aprobaciones E5 no válidas");
  const sqlFilms=films.filter(x=>String(x.Sinopsis??"").trim());
  const sqlDrafts=Object.values(drafts.entries).map(x=>{
    const film=sqlFilms.find(f=>f.Id===x.filmId);
    if(!film||film.Titulo!==x.title)errors.push("Sinopsis SQL con identidad distinta #"+x.filmId);
    if(x.status!=="pendiente_revision"||x.deployment!=="manual_only")
      errors.push("Sinopsis SQL activada sin autorización #"+x.filmId);
    return {filmId:x.filmId,title:x.title,sourceCount:x.sources?.length||0,
      openQuestions:x.openQuestions?.length||0,status:x.status,
      deploy:x.deployment,sqlContentPresent:!!film};
  });
  if(sqlDrafts.length!==5||sqlFilms.length!==5)errors.push("Esperadas 5 sinopsis SQL");
  if(sqlApprovals.approvals.length)errors.push("Aprobaciones SQL requieren verificación formal separada");
  const prod=production.production,ads=production.monetization;
  const blockers=[
    ...(e4Approvals.approvals.length<e4Rows.length?["E4: "+(e4Rows.length-e4Approvals.approvals.length)+" decisiones humanas pendientes"]:[]),
    ...(reviewed.approved.size<e5Rows.length?["E5: "+(e5Rows.length-reviewed.approved.size)+" piezas pendientes"]:[]),
    ...(sqlApprovals.approvals.length<sqlDrafts.length?["SQL: "+(sqlDrafts.length-sqlApprovals.approvals.length)+" sinopsis sin aprobación"]:[]),
    ...(production.blockers||[]),
  ];
  return {version:1,mode:"READ_ONLY",ready:errors.length===0&&blockers.length===0,
    e4:{total:e4Rows.length,approvalsRecorded:e4Approvals.approvals.length,
      rows:e4Rows,needsOriginalSqlRead:true},
    sqlSynopses:{total:sqlDrafts.length,approvalsRecorded:sqlApprovals.approvals.length,
      drafts:sqlDrafts,needsOriginalSqlRead:true},
    e5:{total:e5Rows.length,approved:reviewed.approved.size,
      high:byPriority.alta,medium:byPriority.media,low:byPriority.baja},
    production:{codeStatus:prod.status,
      cloudSqlConfiguredExternally:prod.cloudSqlConfiguredExternally,
      backupRestore:prod.backupRestore,
      emailDelivery:prod.emailDelivery,
      accountFlows:prod.accountFlows,
      publicSite:prod.publicSite.status,
      api:prod.api.status,
      mediaRightsPendingOrRestricted:production.monetization.blockers.find(x=>x.includes("archivos sin derechos"))||null,
      ads:ads.adSenseStatus,externalChecksRequired:true},
    errors,blockers,
    notice:"No aprueba textos, fechas, licencias, restauración, seguridad operativa ni anuncios."};
}
export function args(argv){
  if(argv.some(x=>!["--json","--strict"].includes(x))||
     new Set(argv).size!==argv.length)throw Error("Uso: reportParallelClosure.mjs [--json] [--strict]");
  return {json:argv.includes("--json"),strict:argv.includes("--strict")};
}
async function main(){
  const opts=args(process.argv.slice(2));
  const report=assembleClosure({
    snapshot:read("database/seeds/catalog.snapshot.json"),
    e4:read("docs/catalog-corrections-e4.json"),
    e4Approvals:read("docs/catalog-corrections-e4-approvals.json"),
    e5Issues:read("docs/editorial-issues-f2.json"),
    e5Items:inventory(),e5Approvals:read("docs/editorial-approvals-e5.json"),
    drafts:read("docs/editorial-sql-replacement-drafts-f23.json"),
    sqlApprovals:read("docs/editorial-sql-migration-approvals-f23.json"),
    production:await makeReport({online:false})
  });
  if(opts.json)console.log(JSON.stringify(report,null,2));
  else{
    console.log("CineRD / TRES FRENTES PARALELOS — SOLO LECTURA");
    console.log("E4: "+report.e4.approvalsRecorded+"/"+report.e4.total+
      " aprobaciones; cotejar original SQL antes de aplicar.");
    for(const row of report.e4.rows)
      console.log("  #"+row.filmId+" "+row.field+": "+row.status);
    console.log("Sinopsis SQL: "+report.sqlSynopses.approvalsRecorded+
      "/"+report.sqlSynopses.total+" aprobadas (sin INSERT/UPDATE).");
    console.log("E5: "+report.e5.approved+"/"+report.e5.total+
      " aprobadas; prioridad alta="+report.e5.high.length+
      ", media="+report.e5.medium.length+
      ", baja="+report.e5.low.length);
    console.log("Producción: "+report.production.codeStatus+
      ", SQL externo "+report.production.cloudSqlConfiguredExternally+
      ", restauración "+report.production.backupRestore+
      ", API "+report.production.api+
      ", anuncios "+report.production.ads);
    for(const b of report.blockers)console.log("  BLOQUEO: "+b);
    for(const e of report.errors)console.error("  ERROR: "+e);
    console.log("NO se otorgaron aprobaciones ni se ejecutaron cambios.");
  }
  if(report.errors.length||(opts.strict&&!report.ready))process.exitCode=1;
}
const invoked=process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url);
if(invoked)main().catch(e=>{console.error("✗ "+e.message);process.exitCode=1;});
