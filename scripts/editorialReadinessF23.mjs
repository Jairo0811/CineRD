/**
 * CineRD F-2.3 — read-only editorial readiness diagnostic.
 * Documentary readiness != human sign-off, copyright clearance or deployment.
 * Default exits 0 for a valid report with outstanding blockers; --strict exits 1.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { inventory, validateApprovals } from "./editorialReviewAudit.mjs";
import { validateEditorialIssueMatrix } from "./verifyEditorialIssueMatrix.mjs";
import { verifySqlProvenanceLedger } from "./verifyEditorialSqlProvenance.mjs";
import { validateSqlSynopsisDrafts } from "./verifyEditorialSqlReplacementDrafts.mjs";
import { SINOPSIS_EDITORIALES_FASE_E } from "../frontend/src/data/sinopsisCuradasFaseE.js";
import migration from "../backend/scripts/prepareEditorialSqlMigration.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = file => JSON.parse(fs.readFileSync(path.join(root,file), "utf8"));
const dateOrValue = (field,value) => field === "FechaEstreno"
  ? String(value ?? "").slice(0,10) : (value == null ? null : String(value).trim());

export function assessEditorialReadiness({
  inventoryItems, snapshot, issues, provenance, drafts,
  approvals, migrationApprovals, e4, sqlSources, curatedDrafts,
  reportExists = () => true
}) {
  const errors = [];
  if (!Array.isArray(inventoryItems) || !Array.isArray(snapshot?.tables?.Peliculas) ||
      !Array.isArray(issues?.items) || !Array.isArray(approvals?.approvals) ||
      !Array.isArray(migrationApprovals?.approvals) || !Array.isArray(e4?.rows)) {
    return { ready: false, errors: ["Documentos de control editorial incompletos"] };
  }
  const films = snapshot.tables.Peliculas;
  const sqlFilms = films.filter(x => String(x.Sinopsis ?? "").trim().length > 0);
  const byId = new Map(sqlFilms.map(x => [Number(x.Id), x]));
  const report = validateEditorialIssueMatrix(issues,inventoryItems,reportExists,
    (id,field) => e4.rows.some(row => row.filmId===id && row.field===field));
  const provenanceReport = verifySqlProvenanceLedger(provenance,films,sqlSources);
  const draftReport = validateSqlSynopsisDrafts(drafts,films,provenance,sqlSources,curatedDrafts);
  errors.push(...report.errors.map(x=>"Matriz: "+x));
  errors.push(...provenanceReport.errors.map(x=>"Procedencia SQL: "+x));
  errors.push(...draftReport.errors.map(x=>"Propuestas SQL: "+x));
  let e5Approved = 0;
  try {
    const result=validateApprovals(inventoryItems,approvals.approvals);
    errors.push(...result.failures.map(x=>"E-5: "+x));
    e5Approved=result.approved.size;
  } catch(e) { errors.push("E-5: "+e.message); }

  const migrationSeen=new Set();
  let validMigrationApprovals=0;
  for(const a of migrationApprovals.approvals) {
    if(!a || !Number.isInteger(a.filmId) || migrationSeen.has(a.filmId)) {
      errors.push("Aprobación SQL inválida o duplicada: "+String(a?.filmId));continue;
    }
    migrationSeen.add(a.filmId);
    const film=byId.get(a.filmId),draft=drafts.entries?.[String(a.filmId)];
    if(!film||!draft) {errors.push("Aprobación SQL ajena al inventario: "+a.filmId);continue;}
    try { migration.validateDraft(film,draft);migration.validateApproval(film,draft,a);
      validMigrationApprovals++;
    } catch(e) {errors.push("Aprobación SQL sin sustento: "+a.filmId+" / "+e.message);}
  }

  const e4Status={total:e4.rows.length,pending:0,appliedInSnapshot:0};
  const e4Seen=new Set();
  for(const item of e4.rows) {
    if(!item || !Number.isInteger(item.filmId) || !["Genero","Director","FechaEstreno"].includes(item.field)) {
      errors.push("E-4 contiene una fila inválida");continue;
    }
    const key=item.filmId+":"+item.field;
    if(e4Seen.has(key))errors.push("E-4 contiene campo duplicado: "+key);
    e4Seen.add(key);
    const film=films.find(x=>Number(x.Id)===item.filmId);
    if(!film || !Array.isArray(item.sources) || item.sources.length<2 ||
      film.Titulo.trim().toLowerCase()!==String(item.title||"").trim().toLowerCase()) {
      errors.push("E-4 no coincide con catálogo: "+key);continue;
    }
    const current=dateOrValue(item.field,film[item.field]);
    if(current===dateOrValue(item.field,item.expected))e4Status.pending++;
    else if(current===dateOrValue(item.field,item.proposed))e4Status.appliedInSnapshot++;
    else errors.push("E-4 ha cambiado sin coincidencia de preimagen: "+key);
  }

  const pendingIssues=issues.items.filter(i=>i.status==="pendiente_verificacion").length;
  const pendingEditorial=inventoryItems.length-e5Approved;
  const summary={
    editorial:{total:inventoryItems.length,approved:e5Approved,pending:pendingEditorial},
    issues:{total:report.total,pending:pendingIssues,priorities:report.priorities},
    sqlProvenance:{total:provenanceReport.total,withoutEvidence:provenanceReport.sinEvidencia,
      documentedPermissions:provenanceReport.acreditadas},
    sqlReplacementDrafts:{total:draftReport.total,pending:draftReport.pending,
      publishedAutomatically:draftReport.autoPublished},
    sqlMigration:{total:sqlFilms.length,validHumanReviewRecords:validMigrationApprovals,
      pending:sqlFilms.length-validMigrationApprovals},
    e4:e4Status
  };
  const blockers=[];
  if(errors.length)blockers.push("Inconsistencias en registros: "+errors.length);
  if(pendingEditorial)blockers.push("Faltan aprobaciones E-5: "+pendingEditorial);
  if(pendingIssues)blockers.push("Observaciones F-2.3 sin cerrar: "+pendingIssues);
  if(provenanceReport.sinEvidencia)blockers.push("Sinopsis SQL sin evidencia de permiso registrada: "+provenanceReport.sinEvidencia);
  if(draftReport.pending)blockers.push("Propuestas SQL en revisión: "+draftReport.pending);
  if(sqlFilms.length-validMigrationApprovals)blockers.push("Migraciones SQL sin aprobación atribuida: "+(sqlFilms.length-validMigrationApprovals));
  if(e4Status.pending)blockers.push("Ajustes E-4 pendientes en snapshot: "+e4Status.pending);
  const ready=errors.length===0 && blockers.length===0;
  return {ready,documentaryOnly:true,errors,summary,blockers};
}

function main(args=process.argv.slice(2)) {
  if(args.some(a=>!["--json","--strict"].includes(a)))throw Error("Argumento no reconocido");
  const result=assessEditorialReadiness({
    inventoryItems:inventory(),
    snapshot:read("database/seeds/catalog.snapshot.json"),
    issues:read("docs/editorial-issues-f2.json"),
    provenance:read("docs/editorial-provenance-sql-f23.json"),
    drafts:read("docs/editorial-sql-replacement-drafts-f23.json"),
    approvals:read("docs/editorial-approvals-e5.json"),
    migrationApprovals:read("docs/editorial-sql-migration-approvals-f23.json"),
    e4:read("docs/catalog-corrections-e4.json"),
    sqlSources:read("docs/editorial-sources-sql-f2.json"),
    curatedDrafts:SINOPSIS_EDITORIALES_FASE_E,
    reportExists:p=>fs.existsSync(path.join(root,p)),
  });
  if(args.includes("--json"))console.log(JSON.stringify(result,null,2));
  else {
    console.log("CineRD F-2.3 — diagnóstico documental (SOLO LECTURA)");
    const s=result.summary;
    if(s) {
      console.log(`Editorial E-5: ${s.editorial.approved}/${s.editorial.total} aprobadas; ${s.editorial.pending} pendientes.`);
      console.log(`Matriz: ${s.issues.total} observaciones; ${s.issues.pending} pendientes (${s.issues.priorities.alta} alta, ${s.issues.priorities.media} media, ${s.issues.priorities.baja} baja).`);
      console.log(`SQL: ${s.sqlReplacementDrafts.total} propuestas, ${s.sqlProvenance.withoutEvidence} sin evidencia de permiso, ${s.sqlMigration.validHumanReviewRecords} autorizaciones registradas válidas.`);
      console.log(`E-4: ${s.e4.pending} cambios pendientes; ${s.e4.appliedInSnapshot} reflejados en snapshot.`);
    }
    for(const e of result.errors)console.error("✗ "+e);
    for(const b of result.blockers)console.log("• "+b);
    console.log(result.ready?"Sin bloqueos documentales detectados; aún requiere supervisión humana.":
      "F-2.3 NO ESTA LISTA para cierre ni migración automática.");
    console.log("Ninguna revisión, licencia ni aprobación se presume a partir de este diagnóstico.");
  }
  if(result.errors.length || (args.includes("--strict")&&!result.ready))process.exitCode=1;
}

const invoked=process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url);
if(invoked) {try{main()}catch(e){console.error("✗ "+e.message);process.exitCode=1;}}
