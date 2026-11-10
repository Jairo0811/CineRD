/**
 * CineRD A/B/C: verificación offline de expedientes, permisos y plan de despliegue.
 * La CLI no cambia aprobaciones, SQL, infraestructura ni publicidad.
 * --strict falla hasta contar con autorizaciones y verificaciones externas reales.
 */
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {readCsv,auditRows} from "./verifyMediaRightsLedger.mjs";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const json=p=>JSON.parse(read(p));
const id=i=>i.filmId+":"+i.kind;

export function inspectABC({issues,e4,e4Approvals,drafts,sqlApprovals,e5Approvals,
                           altaDoc,restDoc,render,app,rightsAudit,adGate}) {
  const errors=[];
  const requireThat=(ok,reason)=>{if(!ok)errors.push(reason);};
  const groups={alta:[],media:[],baja:[]};
  const known=new Set();
  for(const entry of issues.items||[]){
    const k=id(entry);
    requireThat(!known.has(k),"E5: ficha duplicada "+k);
    known.add(k);
    if(!groups[entry.priority])errors.push("E5: prioridad desconocida "+k);
    else groups[entry.priority].push(entry);
  }
  requireThat(known.size===58,"E5: inventario debe tener 58 piezas");
  for(const [p,n] of [["alta",18],["media",18],["baja",22]])
    requireThat(groups[p].length===n,"E5: conteo incorrecto en "+p);
  for(const [p,doc] of [["alta",altaDoc],["media",restDoc],["baja",restDoc]]){
    for(const entry of groups[p]){
      const header="### [ ] E5-"+entry.filmId+"-"+entry.kind+" — "+entry.title;
      requireThat(doc.includes(header),"E5: expediente ausente "+id(entry));
    }
  }
  requireThat(Array.isArray(e4.rows)&&e4.rows.length===7,"E4: deben existir 7 decisiones");
  requireThat(new Set((e4.rows||[]).map(r=>r.filmId+":"+r.field)).size===7,
    "E4: claves duplicadas");
  requireThat(Object.keys(drafts.entries||{}).sort().join(",")==="10,5,55,56,6",
    "SQL: deben existir exactamente cinco propuestas");
  requireThat(drafts.autoPublish===false,"SQL: autoPublish no debe activarse");
  requireThat(Object.values(drafts.entries||{}).every(d=>
    d.status==="pendiente_revision"&&d.deployment==="manual_only"&&
    d.reviewedBy===null&&d.reviewedAt===null),
  "SQL: un borrador pretende aprobación/publicación automática");
  requireThat(Array.isArray(e4Approvals.approvals)&&
    Array.isArray(sqlApprovals.approvals)&&Array.isArray(e5Approvals.approvals),
    "A: libros de aprobaciones inválidos");
  const amounts={
    e4:e4Approvals.approvals?.length??-1,
    sql:sqlApprovals.approvals?.length??-1,
    e5:e5Approvals.approvals?.length??-1
  };
  // El estado aquí es exclusivamente informativo: presencia de una firma
  // NO implica su validez. Los gates especializados validan su huella.
  requireThat(render.includes("autoDeployTrigger: off"),
    "B: Render debe mantener autoDeployTrigger: off hasta verificar infraestructura");
  requireThat(!/^\s*rootDir:\s*backend\s*$/m.test(render) &&
    render.includes("npm --prefix backend ci --omit=dev") &&
    render.includes("node scripts/verifyMediaRightsLedger.mjs") &&
    render.includes("npm --prefix backend start"),
    "B: Render necesita acceso al monorepo completo en build y runtime");
  requireThat(render.includes("node backend/scripts/auditProductionEnv.js --strict"),
    "B: falta validar 15 variables antes de arrancar API");
  requireThat(render.includes("healthCheckPath: /ready"),
    "B: el health check debe exigir SQL Server");
  requireThat(render.includes("mountPath: /var/data")&&
    render.includes("PRIVATE_STORAGE_DIR")&&render.includes("UPLOADS_DIR"),
    "B: faltan dos rutas persistentes distintas");
  requireThat(app.includes('app.get("/health"')&&app.includes('app.get("/ready"'),
    "B: endpoints HTTP no localizados");
  requireThat(app.includes("createPublicUploadGuard(), express.static"),
    "C: uploads carecen de filtro de derechos antes de express.static");
  requireThat(adGate.includes('env.VITE_ADSENSE_ENABLED!=="true"') &&
    adGate.includes("listaDeBloqueos"),
    "C: falta bloqueo documental de publicidad");
  requireThat(rightsAudit.errors.length===0,"C: el ledger de medios no coincide con catálogo");
  const totalMedia=rightsAudit.rows;
  const authorized=rightsAudit.counts.AUTORIZADO||0;
  const lacking=totalMedia-authorized;
  const humanRequired=amounts.e4<7||amounts.sql<5||amounts.e5<58;
  const externalRequired=[
    "API HTTPS pública con /health y /ready verificados contra SQL real",
    "SQL Server persistente con autenticación TLS, backups y restauración aislada",
    "Prueba real de email, almacenamiento y flujos de cuentas",
    "Verificación humana editorial, fuentes y procedencia original de textos",
    "Revisión legal, derechos de medios, Search Console y decisión de AdSense"
  ];
  return {
    version:1,mode:"OFFLINE_READ_ONLY",
    phaseA:{prepared:{e4:7,sql:5,editorialHigh:18,editorialMedium:18,
      editorialLow:22,editorialTotal:58},approvalsRecorded:amounts,
      humanReviewPending:humanRequired,
      note:"Un conteo de firmas no certifica legitimidad; gates especializados validan huellas."},
    phaseB:{codeProvisioningGate:errors.some(e=>e.startsWith("B:"))?"FAIL":"CODE_PREPARED",
      apiSqlOnline:"NOT_VERIFIED",restoreDrill:"NOT_VERIFIED",
      emailAndUserFlows:"NOT_VERIFIED"},
    phaseC:{rightsLedger:rightsAudit.errors.length?"FAIL":"IN_SYNC",
      filesTracked:totalMedia,filesWithoutEffectiveAuthorization:lacking,
      ads:"DISABLED_REQUIRED",searchConsoleAdSense:"NOT_VERIFIED"},
    externalRequired,errors,
    productionReady:false,commercialReady:false,
    note:"No ejecuta cambios. Nunca considera un checklist o una prueba un permiso comercial."
  };
}

export function buildABCReport(){
  const catalog=json("database/seeds/catalog.snapshot.json");
  const rightsAudit=auditRows(catalog,readCsv(read("docs/media-rights-ledger.csv")));
  return inspectABC({
    issues:json("docs/editorial-issues-f2.json"),
    e4:json("docs/catalog-corrections-e4.json"),
    e4Approvals:json("docs/catalog-corrections-e4-approvals.json"),
    drafts:json("docs/editorial-sql-replacement-drafts-f23.json"),
    sqlApprovals:json("docs/editorial-sql-migration-approvals-f23.json"),
    e5Approvals:json("docs/editorial-approvals-e5.json"),
    altaDoc:read("docs/FASE_E5_OLEADA_ALTA_18_REVISION_2026-11-10.md"),
    restDoc:read("docs/FASE_E5_OLEADAS_MEDIA_BAJA_40_REVISION_2026-11-10.md"),
    render:read("render.yaml"),app:read("backend/src/app.js"),
    rightsAudit,adGate:read("scripts/checkAdActivation.mjs")
  });
}

const invoked=process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url);
if(invoked){
  try{
    const argv=process.argv.slice(2);
    if(argv.some(a=>!["--json","--strict"].includes(a))||
      new Set(argv).size!==argv.length)throw Error("Uso: verifyABCReleaseGates.mjs [--json] [--strict]");
    const r=buildABCReport();
    if(argv.includes("--json"))console.log(JSON.stringify(r,null,2));
    else{
      console.log("CineRD A/B/C — expediente completo / solo lectura");
      console.log("A: 7 E4 + 5 SQL + 58 E5; aprobaciones registradas "+
        r.phaseA.approvalsRecorded.e4+"/"+r.phaseA.approvalsRecorded.sql+
        "/"+r.phaseA.approvalsRecorded.e5);
      console.log("B: "+r.phaseB.codeProvisioningGate+"; API y restore sin verificar");
      console.log("C: "+r.phaseC.filesWithoutEffectiveAuthorization+
        " medios sin derecho efectivo documentado; AdSense apagado");
      for(const e of r.errors)console.error("✗ "+e);
      console.log("No se declara Production Ready ni Commercial Ready.");
    }
    if(r.errors.length||(argv.includes("--strict")&&
      (!r.productionReady||!r.commercialReady)))process.exitCode=1;
  }catch(e){console.error("✗ ABC: "+e.message);process.exitCode=1;}
}
