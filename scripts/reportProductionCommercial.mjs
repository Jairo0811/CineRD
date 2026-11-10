/**
 * CineRD — cierre técnico de los frentes 3 y 4.
 * No crea infraestructura, no envía correos, no cambia SQL, no activa ads.
 *   node scripts/reportProductionCommercial.mjs [--online] [--json] [--strict]
 * Para probar API real: CINERD_API_ORIGIN=https://api.example.com --online
 */
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {createReadinessReport} from "./reportAdSenseReadiness.mjs";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const origin="https://cinerd.pages.dev";
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const assert=(test,description)=>{if(!test)throw Error(description)};
const publicFields=[
  ["Actores",["Foto"]],["Peliculas",["Foto","Backdrop"]],["GaleriaMultimedia",["Archivo"]]
];
const requestOptions=()=>({
  signal:AbortSignal.timeout(12000),
  redirect:"error",
  headers:{"User-Agent":"CineRD-Production-Commercial-Audit/1.0"}
});
function validateOrigin(raw) {
  const u=new URL(String(raw||"").trim());
  assert(u.protocol==="https:"&&!u.username&&!u.password&&u.pathname==="/"&&
    !u.search&&!u.hash,"CINERD_API_ORIGIN debe ser exclusivamente un origen HTTPS sin credenciales ni ruta");
  assert(!["localhost","127.0.0.1","::1"].includes(u.hostname.toLowerCase()),
    "Se requiere un origen externo HTTPS de la API");
  return u.origin;
}
async function getJson(url,fetchImpl=fetch) {
  const response=await fetchImpl(url,requestOptions());
  assert(response.ok,"HTTP "+response.status+" en "+new URL(url).pathname);
  assert((response.headers?.get("content-type")||"").includes("json"),
    "Se esperaba JSON en "+new URL(url).pathname);
  return response.json();
}
async function inspectPublicSite({
  fetchImpl=fetch,base=origin,expectedCatalog={films:46,people:83},authorizedMedia=0
}={}) {
  const status=await getJson(base+"/demo/deploy-status.json",fetchImpl);
  const catalog=await getJson(base+"/demo/catalog.json",fetchImpl);
  assert(status.format==="CineRD.PublicDemoDeploy","Manifiesto de despliegue inválido");
  assert(status.mediaRightsMode==="review","El despliegue NO usa modo review");
  assert(Number.isInteger(status.mediaFilesCopied),"Conteo de medios inválido");
  assert(status.mediaFilesCopied<=authorizedMedia,
    "El despliegue expone más medios que las licencias efectivas registradas");
  assert(catalog.format==="CineRD.PublicDemoCatalog","Catálogo público inválido");
  assert(catalog.tables?.Peliculas?.length===expectedCatalog.films,
    "El catálogo publicado no coincide con películas versionadas");
  assert(catalog.tables?.Actores?.length===expectedCatalog.people,
    "El catálogo publicado no coincide con talentos versionados");
  let publicMedia=0;
  for(const [table,fields] of publicFields)for(const row of catalog.tables[table]||[])
    for(const field of fields)if(row[field])publicMedia++;
  assert(publicMedia===status.mediaFilesCopied,
    "Los archivos referenciados no coinciden con el manifiesto");
  return {status:"PASS",mode:"review",mediaFilesCopied:status.mediaFilesCopied,
    sourceCommit:status.sourceCommit||null,films:expectedCatalog.films,people:expectedCatalog.people};
}
async function inspectApi({url,fetchImpl=fetch}={}) {
  const apiOrigin=validateOrigin(url);
  const health=await getJson(apiOrigin+"/health",fetchImpl);
  const ready=await getJson(apiOrigin+"/ready",fetchImpl);
  assert(health.status==="ok"&&health.service==="cinerd-api",
    "API /health no corresponde a CineRD");
  assert(ready.status==="ready"&&ready.database==="ok",
    "API /ready no confirma SQL Server");
  return {status:"PASS",health:"ok",ready:"ready",database:"ok",origin:apiOrigin};
}
function offlineProductionGate(report,appSource,renderSource) {
  const evidence={
    health:appSource.includes('app.get("/health"'),
    ready:appSource.includes('app.get("/ready"')&&appSource.includes("SELECT 1 AS ok"),
    mediaFailClosed:appSource.includes('createPublicUploadGuard(), express.static'),
    persistentPlan:renderSource.includes("mountPath: /var/data")&&
      renderSource.includes("PRIVATE_STORAGE_DIR"),
    emailPlan:renderSource.includes("RESEND_API_KEY")&&renderSource.includes("EMAIL_FROM"),
  };
  return {status:Object.values(evidence).every(Boolean)?"CODE_READY":"CODE_INCOMPLETE",
    checks:evidence,cloudSqlConfiguredExternally:"NOT_VERIFIED",
    backupRestore:"NOT_VERIFIED",emailDelivery:"NOT_VERIFIED",
    accountFlows:"NOT_VERIFIED"};
}
function commercialGate(report,env={}) {
  const blockers=[...report.lanzamiento.listaDeBloqueos];
  if(report.derechos.pendientes_o_restringidos>0)
    blockers.push(report.derechos.pendientes_o_restringidos+
      " archivos sin derechos comerciales efectivos documentados");
  return {adsRequestedByEnvironment:env.VITE_ADSENSE_ENABLED==="true",
    documentaryAdSenseReadiness:report.lanzamiento.aptoParaActivacionDeAnunciosSegunDocumentos,
    googleApprovalVerifiedByThisReport:false,
    adSenseStatus:"BLOCKED",blockers};
}
export async function makeReport({env=process.env,online=false,fetchImpl=fetch,local=null}={}) {
  const readiness=local?.readiness||createReadinessReport();
  const app=local?.app||read("backend/src/app.js");
  const render=local?.render||read("render.yaml");
  const prod=offlineProductionGate(readiness,app,render);
  const advertising=commercialGate(readiness,env);
  const publicSite={status:"NOT_CHECKED"};
  const api={status:env.CINERD_API_ORIGIN?"NOT_CHECKED":"NOT_CONFIGURED"};
  if(online) {
    try{Object.assign(publicSite,await inspectPublicSite({
      fetchImpl,expectedCatalog:{films:readiness.catalogo.peliculas,
        people:readiness.catalogo.talentos},
      authorizedMedia:readiness.derechos.autorizados
    }));}
    catch(e){Object.assign(publicSite,{status:"FAIL",error:String(e.message).slice(0,500)});}
    if(env.CINERD_API_ORIGIN) {
      try{Object.assign(api,await inspectApi({url:env.CINERD_API_ORIGIN,fetchImpl}));}
      catch(e){Object.assign(api,{status:"FAIL",error:String(e.message).slice(0,500)});}
    }
  }
  const blockers=[];
  if(prod.status!=="CODE_READY")blockers.push("3/Producción: código o configuración mínima incompletos");
  if(publicSite.status!=="PASS")blockers.push("3/Producción: sitio estático no verificado online en esta ejecución");
  if(api.status!=="PASS")blockers.push("3/Producción: API real y conexión SQL no verificadas online");
  blockers.push("3/Producción: falta evidencia de backup SQL restaurado, correo y flujos completos");
  if(advertising.blockers.length)blockers.push("4/Monetización: "+advertising.blockers.length+
    " bloqueos documentales/legales");
  blockers.push("4/Monetización: estado real de Search Console y AdSense requiere verificación humana");
  return {
    version:1,checkedAtUtc:new Date().toISOString(),
    onlineRequested:online,production:{...prod,publicSite,api},
    monetization:advertising,
    currentCatalog:{films:readiness.catalogo.peliculas,people:readiness.catalogo.talentos},
    codeQuality:"Consultar GitHub Actions; no equivale a producción",
    publicationReady:false,adsEnabledByThisTool:false,
    blockers,
    note:"Consulta de solo lectura: no acredita restaurabilidad, correo, AdSense ni licencias contractuales."
  };
}
export function parseArgs(argv) {
  assert(argv.every(a=>["--online","--json","--strict"].includes(a))&&
    new Set(argv).size===argv.length,
    "Uso: reportProductionCommercial.mjs [--online] [--json] [--strict]");
  return {online:argv.includes("--online"),json:argv.includes("--json"),
    strict:argv.includes("--strict")};
}
const invoked=process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url);
if(invoked) {
  try{
    const args=parseArgs(process.argv.slice(2));
    const report=await makeReport({online:args.online});
    if(args.json)console.log(JSON.stringify(report,null,2));
    else {
      console.log("CineRD — cierre combinado 3/4 (SOLO LECTURA)");
      console.log("Código API: "+report.production.status+"; Cloudflare: "+
        report.production.publicSite.status+"; API SQL: "+report.production.api.status);
      console.log("Medios sin licencia acreditada: "+
        (report.monetization.blockers.find(x=>x.includes("archivos sin derechos"))||"sin bloqueos adicionales"));
      console.log("Anuncios: BLOCKED; publicación comercial: NO LISTA.");
      for(const b of report.blockers)console.log(" - "+b);
    }
    if(args.strict&&report.blockers.length)process.exitCode=1;
  }catch(e){console.error("✗ Auditoría 3/4: "+e.message);process.exitCode=1;}
}
export {validateOrigin,inspectPublicSite,inspectApi,offlineProductionGate,commercialGate};
