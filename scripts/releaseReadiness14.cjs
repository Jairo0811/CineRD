/**
 * CineRD — cierre integrado 1-4 (SOLO LECTURA por defecto).
 * 1. Sinopsis SQL F-2.3; 2. E-4/E-5 editorial;
 * 3. Derechos de medios; 4. Configuración y verificación de producción.
 *
 * NO crea aprobaciones, NO cambia SQL, NO publica ni activa anuncios.
 * --full corre pruebas, lint y build seguro local.
 * --live-sql consulta las cinco sinopsis reales sin modificarlas.
 * --online ejecuta la auditoría HTTP pública y opcionalmente /health + /ready
 *          si CINERD_API_ORIGIN se configura con un origen HTTPS.
 * --strict falla cuando hay bloqueos documentales o comprobaciones pendientes.
 */
const fs = require("node:fs");
const path = require("node:path");
const {spawnSync} = require("node:child_process");

const root = path.resolve(__dirname, "..");
const readJson = relative => JSON.parse(fs.readFileSync(path.join(root,relative),"utf8"));
const readText = relative => fs.readFileSync(path.join(root,relative),"utf8");
const exists = relative => fs.existsSync(path.join(root,relative));

function parseArgs(argv=[]) {
  const allowed = ["--full","--live-sql","--online","--strict","--json"];
  if(new Set(argv).size!==argv.length || argv.some(a=>!allowed.includes(a)))
    throw Error("Uso: release:check [--full] [--live-sql] [--online] [--strict] [--json]");
  if(argv.includes("--full") && argv.includes("--json"))
    throw Error("--full y --json no se combinan; la batería completa imprime resultados de npm");
  return {
    full:argv.includes("--full"),
    liveSql:argv.includes("--live-sql"),
    online:argv.includes("--online"),
    strict:argv.includes("--strict"),
    json:argv.includes("--json")
  };
}

function collectStaticEvidence(input) {
  const {app,workflow,render,backendEnvExample,rightsMode}=input;
  const checks={
    hasLiveness:app.includes('app.get("/health"'),
    hasReadiness:app.includes('app.get("/ready"') && app.includes("SELECT 1 AS ok"),
    hasPersistentStoragePlan:render.includes("/var/data") && render.includes("UPLOADS_DIR"),
    hasCloudflareCors:render.includes("https://cinerd.pages.dev") && render.includes("FRONTEND_URLS"),
    hasProductionEmailTemplate:backendEnvExample.includes("RESEND_API_KEY") &&
      backendEnvExample.includes("EMAIL_FROM"),
    hasSqlEnvironmentTemplate:backendEnvExample.includes("DB_DATABASE") &&
      backendEnvExample.includes("DB_SERVER"),
    hasCiTests:workflow.includes("npm test") && workflow.includes("npm run lint"),
    hasCiMediaReview:workflow.includes("rights-review") &&
      workflow.includes("verifyRightsReviewBuild"),
    cloudflareFailClosed:rightsMode==="review"
  };
  return {checks,errors:Object.entries(checks).filter(([,ok])=>!ok).map(([name])=>
    "Configuración base ausente o incompatible: "+name)};
}

function evaluateFourAreas({editorial,media,staticEvidence,checks=[]}) {
  const errors=[
    ...(editorial?.errors||[]).map(s=>"Editorial: "+s),
    ...(media?.errors||[]).map(s=>"Medios: "+s),
    ...(staticEvidence?.errors||[]),
    ...checks.filter(c=>c.status==="FAIL").map(c=>c.name+": "+c.detail)
  ];
  const s=editorial?.summary;
  const rights=media?.counts||{};
  const sql={
    proposed:s?.sqlReplacementDrafts?.total??null,
    pending:s?.sqlReplacementDrafts?.pending??null,
    validApprovals:s?.sqlMigration?.validHumanReviewRecords??null,
    pendingApprovals:s?.sqlMigration?.pending??null,
    withoutRightsEvidence:s?.sqlProvenance?.withoutEvidence??null,
    status:"BLOCKED"
  };
  const content={
    editorialApproved:s?.editorial?.approved??null,
    editorialTotal:s?.editorial?.total??null,
    issuesPending:s?.issues?.pending??null,
    issuesTotal:s?.issues?.total??null,
    e4SnapshotApplied:s?.e4?.appliedInSnapshot??null,
    e4Total:s?.e4 ? s.e4.appliedInSnapshot+s.e4.pending:null,
    e4Authorizations:s?.e4?.authorizations?.valid??null,
    status:"BLOCKED"
  };
  const mediaArea={
    tracked:media?.rows??null,
    effectiveAuthorized:rights.AUTORIZADO??0,
    pending:rights.PENDIENTE??0,
    restricted:rights.RESTRINGIDO??0,
    remove:rights.RETIRAR??0,
    cloudflareReviewConfigured:staticEvidence?.checks?.cloudflareFailClosed===true,
    status:"BLOCKED"
  };
  const production={
    staticChecks:staticEvidence?.checks||{},
    remoteSiteVerified:checks.some(c=>c.name==="Cloudflare production"&&c.status==="PASS"),
    apiReady:checks.some(c=>c.name==="API /health y /ready"&&c.status==="PASS"),
    realBackupRestoreProven:false,
    status:"BLOCKED"
  };
  const blockers=[];
  if(sql.pendingApprovals)blockers.push("1/SQL: "+sql.pendingApprovals+" decisiones humanas faltantes");
  if(sql.withoutRightsEvidence)blockers.push("1/SQL: "+sql.withoutRightsEvidence+" textos previos sin evidencia de derechos");
  if(content.issuesPending)blockers.push("2/Editorial: "+content.issuesPending+" incidencias sin resolver");
  if(s?.editorial?.pending)blockers.push("2/Editorial: "+s.editorial.pending+" revisiones E-5 pendientes");
  if(s?.e4?.authorizations?.pending)blockers.push("2/E-4: "+s.e4.authorizations.pending+" autorizaciones humanas pendientes");
  if(mediaArea.tracked !== null &&
     mediaArea.tracked-mediaArea.effectiveAuthorized>0)
    blockers.push("3/Medios: "+(mediaArea.tracked-mediaArea.effectiveAuthorized)+
      " archivos sin autorización comercial efectiva registrada");
  blockers.push("4/Producción: no se acredita restauración real de respaldo SQL ni operación externa completa");
  if(!production.remoteSiteVerified)blockers.push("4/Producción: despliegue Cloudflare no verificado en esta ejecución");
  if(!production.apiReady)blockers.push("4/Producción: API /health y /ready no verificadas en esta ejecución");
  const sqlProbe=checks.find(c=>c.name==="SQL Server (5 sinopsis)");
  sql.liveSqlStatus=sqlProbe?.status||"NOT_RUN";
  if(!sqlProbe)blockers.push("1/SQL: no se consultó la instancia actual en esta ejecución");
  else if(sqlProbe.status==="PASS"&&!sqlProbe.originalFive)
    blockers.push("1/SQL: la base no conserva exactamente las 5 sinopsis originales");
  const technicalOk=errors.length===0;
  return {
    version:1,
    technicalOk,
    publicationReady:technicalOk && blockers.length===0,
    areas:{sql,editorial:content,media:mediaArea,production},
    checks,
    errors,blockers,
    note:"Una validación automática NO certifica licencias, revisión humana, restore de backup, puesta en producción ni permiso de anuncios."
  };
}

/**
 * Extract TAP test failures before the npm summary; the tail of node --test
 * commonly shows only the final successful test and hides the actual failure.
 * No files or secrets are persisted to Git by this diagnostic.
 */
function summarizeCommandFailure(output, exitCode, limit=3200) {
  const lines=String(output||"").replace(/\x1B\[[0-9;]*m/g,"").split(/\r?\n/);
  const failures=[];
  for(let i=0;i<lines.length;i++) {
    if(!/^\s*(?:not ok\s+\d+\s+-|✖\s)/.test(lines[i]))continue;
    const excerpt=[];
    for(let j=i;j<lines.length && j<i+38;j++) {
      const current=lines[j];
      if(j>i && /^\s*(?:ok|not ok)\s+\d+\s+-/.test(current))break;
      excerpt.push(current);
      if(j>i && /^\s*\.\.\.\s*$/.test(current))break;
    }
    failures.push(excerpt.join("\n").trim());
    if(failures.length>=3)break;
  }
  if(failures.length)return "Código "+exitCode+" — FALLO REAL:\n"+
    failures.join("\n\n").slice(0,limit);
  const hints=lines.filter(l=>/^\s*(?:#\s*fail\b|error:|failureType:|npm error)/i.test(l));
  if(hints.length)return "Código "+exitCode+": "+hints.join("\n").slice(0,limit);
  return "Código "+exitCode+": "+lines.join("\n").slice(-Math.min(limit,1400));
}

function runCommand(name,command,args,env=process.env) {
  const p=spawnSync(command,args,{cwd:root,env,encoding:"utf8",timeout:300000,maxBuffer:4*1024*1024});
  const details=((p.stdout||"")+"\n"+(p.stderr||"")).trim();
  return {
    name,
    status:p.status===0&&!p.error?"PASS":"FAIL",
    detail:p.error?String(p.error.message):(p.status===0?"Prueba completada":
      summarizeCommandFailure(details,p.status)),
    output:details
  };
}
function npmCommand(name,parts,env) {
  if(process.platform==="win32") {
    const child=runCommand(name,"cmd.exe",["/d","/s","/c","npm "+parts.join(" ")],env);
    return child;
  }
  return runCommand(name,"npm",parts,env);
}
function runFullValidation(log=console.log) {
  const steps=[
    npmCommand("Pruebas backend",["--prefix","backend","test"]),
    npmCommand("Validación catálogo",["--prefix","backend","run","catalog:validate"]),
    npmCommand("Pruebas frontend",["--prefix","frontend","test"]),
    npmCommand("Lint frontend",["--prefix","frontend","run","lint"]),
    npmCommand("Build review",["--prefix","frontend","run","build"],{
      ...process.env,VITE_MEDIA_RIGHTS_MODE:"review"
    }),
    runCommand("Verificación artefacto review",process.execPath,
      ["scripts/verifyRightsReviewBuild.mjs"])
  ];
  for(const step of steps) {
    log((step.status==="PASS"?"✓ ":"✗ ")+step.name+" — "+step.detail);
  }
  return steps.map(({name,status,detail})=>({name,status,detail}));
}

async function runOnlineChecks(log=console.log, env=process.env) {
  const checks=[runCommand("Cloudflare production",process.execPath,
    ["scripts/auditProduction.mjs","--require-review","--skip-ads"])];
  if(env.CINERD_API_ORIGIN) {
    const raw=String(env.CINERD_API_ORIGIN).trim().replace(/\/+$/,"");
    let allowed=false;
    try{
      const u=new URL(raw);
      allowed=u.protocol==="https:"&&u.username===""&&u.password===""&&
        u.pathname==="/"&&u.search===""&&u.hash==="";
    }catch{}
    if(!allowed) {
      checks.push({name:"API /health y /ready",status:"FAIL",
        detail:"CINERD_API_ORIGIN debe ser un origen HTTPS, sin credenciales ni ruta"});
    }else{
      try{
        const results=await Promise.all(["/health","/ready"].map(async suffix=>{
          const res=await fetch(raw+suffix,{
            signal:AbortSignal.timeout(12000),redirect:"error",
            headers:{"User-Agent":"CineRD-Release-Readiness/1.0"}
          });
          return {url:suffix,status:res.status};
        }));
        const ok=results.every(x=>x.status===200);
        checks.push({name:"API /health y /ready",status:ok?"PASS":"FAIL",
          detail:results.map(x=>x.url+"="+x.status).join(", ")});
      }catch(e){
        checks.push({name:"API /health y /ready",status:"FAIL",
          detail:"No se pudieron verificar ambos endpoints: "+e.message});
      }
    }
  }
  for(const c of checks)log((c.status==="PASS"?"✓ ":"✗ ")+c.name+" — "+c.detail);
  return checks.map(({name,status,detail})=>({name,status,detail}));
}

async function loadInputs() {
  const {assessEditorialReadiness}=await import("./editorialReadinessF23.mjs");
  const {inventory}=await import("./editorialReviewAudit.mjs");
  const {validateSqlSynopsisDrafts}=await import("./verifyEditorialSqlReplacementDrafts.mjs");
  const {SINOPSIS_EDITORIALES_FASE_E}=await import("../frontend/src/data/sinopsisCuradasFaseE.js");
  const {readCsv,auditRows}=await import("./verifyMediaRightsLedger.mjs");
  const {resolveMediaRightsBuildMode}=await import("./resolveMediaRightsBuildMode.mjs");
  const snapshot=readJson("database/seeds/catalog.snapshot.json");
  const proposals=readJson("docs/editorial-sql-replacement-drafts-f23.json");
  const provenance=readJson("docs/editorial-provenance-sql-f23.json");
  const sources=readJson("docs/editorial-sources-sql-f2.json");
  const mediaRows=readCsv(readText("docs/media-rights-ledger.csv"));
  const media=auditRows(snapshot,mediaRows);
  const editorial=assessEditorialReadiness({
    inventoryItems:inventory(),snapshot,provenance,drafts:proposals,
    issues:readJson("docs/editorial-issues-f2.json"),
    approvals:readJson("docs/editorial-approvals-e5.json"),
    migrationApprovals:readJson("docs/editorial-sql-migration-approvals-f23.json"),
    e4:readJson("docs/catalog-corrections-e4.json"),
    e4Approvals:readJson("docs/catalog-corrections-e4-approvals.json"),
    sqlSources:sources,curatedDrafts:SINOPSIS_EDITORIALES_FASE_E,
    reportExists:exists
  });
  const mediaMode=resolveMediaRightsBuildMode({CF_PAGES:"1",CF_PAGES_BRANCH:"main"});
  const staticEvidence=collectStaticEvidence({
    app:readText("backend/src/app.js"),
    workflow:readText(".github/workflows/ci.yml"),
    render:readText("render.yaml"),
    backendEnvExample:readText("backend/.env.example"),
    rightsMode:mediaMode
  });
  return {editorial,media,staticEvidence};
}

async function main(argv=process.argv.slice(2)) {
  const opts=parseArgs(argv);
  const log=opts.json?()=>{}:console.log;
  const source=await loadInputs();
  const checks=[];
  if(opts.full)checks.push(...runFullValidation(log));
  if(opts.liveSql) {
    const p=runCommand("SQL Server (5 sinopsis)",process.execPath,
      ["backend/scripts/previewEditorialSynopsesLive.js"]);
    const originalFive=p.status==="PASS" &&
      /Resultado: 5 originales, 0 propuestas ya aplicadas, 0 discrepancias, 0 ausentes\./.test(p.output);
    checks.push({name:p.name,status:p.status,detail:p.detail,originalFive});
    log((p.status==="PASS"?"✓ ":"✗ ")+p.name+" — "+
      (originalFive?"Cinco sinopsis históricas verificadas":p.detail));
  }
  if(opts.online)checks.push(...await runOnlineChecks(log));
  const report=evaluateFourAreas({...source,checks});
  if(opts.json) console.log(JSON.stringify(report,null,2));
  else {
    console.log("\nCineRD — cierre integrado 1–4 (sin cambios en SQL, Git o licencias)");
    const areas=report.areas;
    console.log("1/SQL: "+areas.sql.validApprovals+"/"+areas.sql.proposed+
      " aprobaciones; consulta real="+areas.sql.liveSqlStatus);
    console.log("2/Editorial: "+areas.editorial.editorialApproved+"/"+
      areas.editorial.editorialTotal+" E-5; "+areas.editorial.issuesPending+
      " incidencias; E-4 "+areas.editorial.e4Authorizations+"/"+areas.editorial.e4Total);
    console.log("3/Medios: "+areas.media.effectiveAuthorized+"/"+areas.media.tracked+
      " autorizados; protección Cloudflare review="+areas.media.cloudflareReviewConfigured);
    console.log("4/Producción: "+Object.values(areas.production.staticChecks).filter(Boolean).length+
      "/"+Object.keys(areas.production.staticChecks).length+
      " controles estáticos; despliegue y API requieren validación real.");
    for(const err of report.errors)console.error("ERROR: "+err);
    for(const blocker of report.blockers)console.log("PENDIENTE: "+blocker);
    console.log(report.publicationReady?"LISTO SEGÚN LOS CONTROLES DISPONIBLES":
      "NO LISTO PARA CIERRE COMERCIAL. Los pendientes no equivalen a errores de código.");
  }
  if(!report.technicalOk || (opts.strict&&!report.publicationReady))
    process.exitCode=1;
  return report;
}
if(require.main===module) main().catch(err=>{
  console.error("✗ Auditoría 1–4: "+err.message);
  process.exitCode=1;
});
module.exports={parseArgs,collectStaticEvidence,evaluateFourAreas,summarizeCommandFailure,runCommand,runFullValidation,runOnlineChecks,main};
