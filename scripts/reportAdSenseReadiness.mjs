/**
 * CineRD F-1: preparación documental de AdSense, no una certificación de Google.
 * node scripts/reportAdSenseReadiness.mjs [--json] [--strict]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { inventory, validateApprovals } from "./editorialReviewAudit.mjs";
import { readCsv, auditRows } from "./verifyMediaRightsLedger.mjs";
import { getSinopsisEditorial } from "../frontend/src/data/sinopsisCuradasFaseE.js";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const readJson=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const clean=x=>String(x??"").trim();
const value=(field,x)=>x==null?null:field==="FechaEstreno"?String(x).slice(0,10):clean(x);

export function createReadinessReport(){
  const snapshot=readJson("database/seeds/catalog.snapshot.json");
  const films=snapshot.tables.Peliculas,people=snapshot.tables.Actores;
  const media=readCsv(fs.readFileSync(path.join(root,"docs/media-rights-ledger.csv"),"utf8"));
  const rights=auditRows(snapshot,media);
  const items=inventory();
  const ledger=readJson("docs/editorial-approvals-e5.json");
  const review=validateApprovals(items,ledger.approvals);
  const rows=readJson("docs/catalog-corrections-e4.json").rows;
  const states=rows.map(r=>{
    const film=films.find(p=>Number(p.Id)===Number(r.filmId));
    const current=value(r.field,film?.[r.field]);
    return current===value(r.field,r.proposed)?"aplicado_en_snapshot":
      current===value(r.field,r.expected)?"pendiente_sql":"requiere_revision";
  });
  const pendingSql=states.filter(s=>s==="pendiente_sql").length;
  const differentSql=states.filter(s=>s==="requiere_revision").length;
  const sqlSynopses=films.filter(f=>clean(f.Sinopsis)).length;
  const editorialSynopses=films.filter(f=>!clean(f.Sinopsis) && getSinopsisEditorial(f)).length;
  const pendingEditorial=items.length-review.approved.size;
  const signoff=readJson("docs/adsense-launch-signoff.json");
  const fields=["editorialOwnerApproval","productionAuditPassed","searchConsoleReviewed",
    "legalAndConsentReviewed","mobileAndAccessibilityReviewed","adsenseSiteApproved"];
  const signed=signoff.version===1 && fields.every(k=>signoff[k]===true) &&
    clean(signoff.reviewedBy).length>=3 &&
    /^\d{4}-\d{2}-\d{2}$/.test(clean(signoff.reviewedAt)) &&
    !Number.isNaN(Date.parse(signoff.reviewedAt+"T00:00:00Z")) &&
    clean(signoff.notes).length>=20;
  const blockers=[];
  if(rights.errors.length)blockers.push("Registro de derechos inconsistente: "+rights.errors.length);
  if(review.failures.length)blockers.push("Aprobaciones editoriales inválidas: "+review.failures.join("; "));
  if(pendingEditorial)blockers.push(pendingEditorial+" piezas editoriales pendientes de revisión humana");
  if(pendingSql)blockers.push(pendingSql+" correcciones de datos aún no aplicadas al snapshot SQL");
  if(differentSql)blockers.push(differentSql+" correcciones SQL con discrepancias");
  if(!signed)blockers.push("Falta cierre manual de Search Console, consentimiento, accesibilidad y estado de AdSense");
  return {
    catalogo:{peliculas:films.length,talentos:people.length,conSinopsisRegistrada:sqlSynopses,
      conSinopsisEditorialBorrador:editorialSynopses,
      fichasSinSinopsis:films.length-sqlSynopses-editorialSynopses},
    editorial:{sinopsis:items.filter(x=>x.kind==="sinopsis").length,
      analisis:items.filter(x=>x.kind==="contexto").length,
      total:items.length,aprobados:review.approved.size,
      pendientesRevision:pendingEditorial,errores:review.failures.length},
    datosSql:{correccionesPropuestas:rows.length,pendientes:pendingSql,
      aplicadasEnSnapshot:states.filter(s=>s==="aplicado_en_snapshot").length,
      divergentes:differentSql},
    derechos:{total:media.length,autorizados:rights.counts.AUTORIZADO,
      pendientes_o_restringidos:media.filter(x=>x.status!=="AUTORIZADO").length,
      registroValido:rights.errors.length===0,modoSeguroNecesario:"review"},
    lanzamiento:{aprobacionExternaDocumentada:signed,verificacionEnVivoPorEsteScript:false,
      listaDeBloqueos:blockers,aptoParaActivacionDeAnunciosSegunDocumentos:blockers.length===0,
      aviso:"Informe documental. No demuestra aprobación ni cumplimiento de las políticas de Google."},
  };
}
const invoked=process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url);
if(invoked){
  try{
    const state=createReadinessReport();
    if(!process.argv.includes("--json"))console.log("CineRD F-1 — informe de preparación documental para AdSense");
    console.log(JSON.stringify(state,null,2));
    if(!process.argv.includes("--json"))console.log(state.lanzamiento.listaDeBloqueos.length
      ? "\nNO LISTO: no activar anuncios ni reenviar AdSense."
      : "\nControles documentales completos; confirmar el sitio público y el panel de Google.");
    if(process.argv.includes("--strict") && !state.lanzamiento.aptoParaActivacionDeAnunciosSegunDocumentos)
      process.exitCode=1;
  }catch(error){
    console.error("✗ Fase F: "+error.message);
    process.exitCode=1;
  }
}
