/**
 * CineRD · triage ALTA F-2.3 (read-only).
 * A recorded snapshot value is neither a SQL Server migration nor human signoff.
 * Never writes approvals, changes incident statuses or updates SQL.
 */
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const norm=(field,value)=>value==null||value===""?null:
  field==="FechaEstreno"?String(value).slice(0,10):String(value).trim();

export function triageHighIssues({matrix,corrections,snapshot,drafts,e4Approvals,e5Approvals}) {
  if(!Array.isArray(matrix?.items)||!Array.isArray(corrections?.rows)||
     !Array.isArray(snapshot?.tables?.Peliculas)||!Array.isArray(e4Approvals?.approvals)||
     !Array.isArray(e5Approvals?.approvals))
    throw Error("Documentos de entrada inválidos");
  const films=new Map(snapshot.tables.Peliculas.map(p=>[p.Id,p]));
  const high=matrix.items.filter(x=>x.priority==="alta");
  const categories={
    E4_EN_SNAPSHOT_SIN_AUTORIZACION:0,
    SINOPSIS_SQL_NUEVA_PENDIENTE:0,
    BORRADOR_ES_EN_SIN_REVISION:0,
    METADATOS_FUENTES_PENDIENTES:0
  };
  const errors=[];
  const items=[];
  for(const incident of high) {
    const id=incident.filmId;
    const film=films.get(id);
    if(!film||film.Titulo.trim()!==incident.title.trim()){
      errors.push("Identidad inconsistente: "+id+" / "+incident.kind);
      continue;
    }
    let category="METADATOS_FUENTES_PENDIENTES";
    let snapshotFields=[];
    const linked=incident.e4Proposals||[];
    if(linked.length) {
      snapshotFields=linked.map(field=>{
        const row=corrections.rows.find(x=>x.filmId===id&&x.field===field);
        if(!row) {
          errors.push("Incidencia sin fila E-4: "+id+"/"+field);
          return {field,status:"SIN_PROPUESTA"};
        }
        const current=norm(field,film[field]);
        const proposed=norm(field,row.proposed);
        const expected=norm(field,row.expected);
        const status=current===proposed?"YA_PROPUESTO_EN_SNAPSHOT":
          current===expected?"ORIGINAL_EN_SNAPSHOT":"DIVERGENCIA";
        if(status==="DIVERGENCIA") errors.push("Desviación E-4 en snapshot: "+id+"/"+field);
        return {field,status,original:expected,proposed,current};
      });
      if(snapshotFields.every(x=>x.status==="YA_PROPUESTO_EN_SNAPSHOT")) {
        category="E4_EN_SNAPSHOT_SIN_AUTORIZACION";
      }
    } else if(incident.kind==="sinopsis" && drafts?.entries?.[String(id)]) {
      category="SINOPSIS_SQL_NUEVA_PENDIENTE";
    } else if(incident.kind==="sinopsis" && id===26) {
      category="BORRADOR_ES_EN_SIN_REVISION";
    }
    categories[category]++;
    items.push({
      filmId:id,kind:incident.kind,title:incident.title,priority:incident.priority,
      incidentStatus:incident.status,
      category,
      sourceReport:incident.sourceReport,
      e4SnapshotFields:snapshotFields,
      editorialHumanApproval:"NO_VERIFICADA_POR_ESTE_REPORTE",
      nextAction:category==="E4_EN_SNAPSHOT_SIN_AUTORIZACION"?
        "Verificar estado SQL real, fuente y autorización E-4; no reaplicar automáticamente":
        category==="SINOPSIS_SQL_NUEVA_PENDIENTE"?
        "Revisar redacción ES/EN, origen, derechos y autorización humana por película":
        category==="BORRADOR_ES_EN_SIN_REVISION"?
        "Comprobar fuentes y horario narrativo; revisar ES/EN y registrar decisión atribuida":
        "Corroborar metadatos o fuentes primarias y documentar si hace falta una corrección nueva"
    });
  }
  items.sort((a,b)=>a.filmId-b.filmId||a.kind.localeCompare(b.kind));
  const result={
    version:1,readonly:true,highCount:high.length,filmCount:new Set(items.map(x=>x.filmId)).size,
    pendingHumanReview:high.filter(x=>x.status!=="resuelta").length,
    categories,
    e4Proposals:corrections.rows.length,
    e4SnapshotProposed:corrections.rows.filter(row=>{
      const f=films.get(row.filmId);
      return f && norm(row.field,f[row.field])===norm(row.field,row.proposed);
    }).length,
    e4ApprovalsRecorded:e4Approvals.approvals.length,
    e5ApprovalsRecorded:e5Approvals.approvals.length,
    errors,items,
    caveat:"El estado en el snapshot no demuestra estado SQL actual, licencia, visionado ni revisión humana."
  };
  return result;
}
export function loadHighTriage() {
  return triageHighIssues({
    matrix:read("docs/editorial-issues-f2.json"),
    corrections:read("docs/catalog-corrections-e4.json"),
    snapshot:read("database/seeds/catalog.snapshot.json"),
    drafts:read("docs/editorial-sql-replacement-drafts-f23.json"),
    e4Approvals:read("docs/catalog-corrections-e4-approvals.json"),
    e5Approvals:read("docs/editorial-approvals-e5.json")
  });
}
function main(args=process.argv.slice(2)) {
  if(args.some(a=>a!=="--json"))throw Error("Uso: node scripts/reportHighPriorityEditorial.mjs [--json]");
  const r=loadHighTriage();
  if(args.includes("--json"))console.log(JSON.stringify(r,null,2));
  else {
    console.log("CineRD · Prioridad ALTA F-2.3 / SOLO LECTURA");
    console.log(r.highCount+" observaciones en "+r.filmCount+" películas.");
    for(const [category,count] of Object.entries(r.categories))
      console.log("  "+category+": "+count);
    console.log("E-4 snapshot propuesto: "+r.e4SnapshotProposed+"/"+r.e4Proposals+
      "; autorizaciones registradas: "+r.e4ApprovalsRecorded);
    console.log("E-5 aprobaciones registradas: "+r.e5ApprovalsRecorded+
      "; incidencias altas pendientes: "+r.pendingHumanReview);
    for(const x of r.items)console.log(" - #"+x.filmId+" "+x.kind+" / "+x.category+" / "+x.title);
    if(r.errors.length)for(const e of r.errors)console.error("✗ "+e);
    console.log(r.caveat);
  }
  if(r.errors.length)process.exitCode=1;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main();
