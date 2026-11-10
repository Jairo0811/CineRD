/**
 * CineRD F-2.3 — Generate ONE local, private review dossier for all five
 * pending SQL synopses. It NEVER grants approval, updates SQL, or changes
 * any ledger. Existing human notes are never silently overwritten.
 *
 * Default: creates exactly one gitignored Markdown file.
 * --show: display the full review dossier without writing files.
 */
const fs=require("node:fs");
const path=require("node:path");
const {createHash}=require("node:crypto");
const {collectPackets,createReviewPacket}=require("./prepareEditorialHumanReview");

const root=path.resolve(__dirname,"../..");
const folder=path.join(root,"backend","backups","editorial","review-f23");
const read=rel=>JSON.parse(fs.readFileSync(path.join(root,rel),"utf8"));
const IDS=[5,6,10,55,56];
const tick=String.fromCharCode(96);
function ensure(ok,message){if(!ok)throw Error(message);}

function buildBatchPacket(packets) {
  ensure(Array.isArray(packets)&&packets.length===IDS.length,"Se requieren cinco expedientes");
  const sorted=[...packets].sort((a,b)=>a.film.Id-b.film.Id);
  ensure(JSON.stringify(sorted.map(p=>p.film.Id))===JSON.stringify(IDS),
    "Los ID del expediente no coinciden con el lote");
  ensure(sorted.every(p=>/^[a-f0-9]{64}$/.test(p.fingerprint)),
    "Huella de película inválida");
  const unique=new Set(sorted.map(p=>p.fingerprint));
  ensure(unique.size===5,"Hay huellas repetidas");
  const combinedHash=createHash("sha256")
    .update(sorted.map(p=>p.film.Id+":"+p.fingerprint).join("|"),"utf8").digest("hex");
  const table=sorted.map(p=>
    "| "+p.film.Id+" | "+p.film.Titulo+" | "+tick+p.fingerprint+tick+" | PENDIENTE |"
  ).join("\n");
  const intro=[
    "# CineRD — expediente conjunto F-2.3 para cinco sinopsis SQL",
    "",
    "**Alcance:** 5 películas · 5 originales SQL · 5 candidatos ES · 5 traducciones candidatas EN.",
    "**Estado:** pendiente de revisión humana. **Este documento NO aprueba textos, licencias, derechos ni migraciones.**",
    "**Consolidado SHA-256:** "+tick+combinedHash+tick,
    "",
    "## Índice de revisiones — SIN FIRMAS",
    "",
    "| ID | Película | Huella de candidato | Decisión humana |",
    "|---:|---|---|---|",
    table,
    "",
    "Las huellas dependen de la sinopsis SQL preexistente, los candidatos ES/EN y las fuentes.",
    "Si cambia cualquier candidato o fuente, generar un dossier nuevo; no reutilizar decisiones antiguas.",
    "",
    "## Decisión conjunta — COMPLETAR SOLO TRAS UNA REVISIÓN REAL",
    "",
    "- [ ] Revisé cada una de las cinco fichas, sus fuentes y sus preguntas abiertas.",
    "- [ ] Comparé los cinco textos ES y EN con el argumento y comprobé la exactitud.",
    "- [ ] Documenté la autoría/originalidad de cada candidato y la procedencia de los textos antiguos.",
    "- [ ] Verifiqué las condiciones de uso de contenido y medios; no equiparé URL pública con licencia.",
    "- [ ] Registré una decisión separada por película (aprobar, rechazar o solicitar cambios).",
    "- [ ] Comprobé el respaldo SQL Server y una restauración real antes de cualquier operación de datos.",
    "",
    "**Responsable real:** [PENDIENTE]",
    "**Fecha y zona horaria:** [PENDIENTE]",
    "**Justificación conjunta:** [PENDIENTE]",
    "**Evidencias legales/editoriales:** [PENDIENTE]",
    "",
    "### Decisiones individuales (NO COMPLETADAS)",
    "",
    "| ID | Decisión | Autor/revisor | Fecha con zona | Evidencia de revisión y derechos |",
    "|---:|---|---|---|---|",
    ...sorted.map(p=>"| "+p.film.Id+" | [PENDIENTE] | [PENDIENTE] | [PENDIENTE] | [PENDIENTE] |"),
    "",
    "**Advertencia:** rellenar o firmar este archivo NO altera los libros de aprobación.",
    "La aplicación SQL comprueba 5 autorizaciones atribuibles con huellas vigentes por separado.",
    "No ejecutar --apply antes de que existan y se haya probado el respaldo restaurable.",
    "",
    "---",
    ""
  ].join("\n");
  const chapters=sorted.map(({film,...p})=>[
    "## Revisión de película #"+film.Id,
    "",
    createReviewPacket({film,...p}),
    ""
  ].join("\n"));
  return {content:intro+chapters,combinedHash,films:sorted.map(p=>p.film.Id)};
}

function savePacket(report,{fsApi=fs,directory=folder}={}) {
  ensure(report&&typeof report.content==="string"&&/^[a-f0-9]{64}$/.test(report.combinedHash),
    "Expediente vacío o mal formado");
  const dest=path.join(directory,"cinerd-five-"+report.combinedHash.slice(0,16)+".md");
  fsApi.mkdirSync(directory,{recursive:true});
  try {
    fsApi.writeFileSync(dest,report.content,{flag:"wx",mode:0o600,encoding:"utf8"});
    return {path:dest,status:"CREATED"};
  } catch(err) {
    if(err.code!=="EEXIST")throw err;
    // Allow reruns, but never overwrite human annotations.
    return {path:dest,status:"EXISTS_NO_OVERWRITE"};
  }
}

function parseArgs(argv) {
  ensure(argv.length===0 || argv.length===1&&argv[0]==="--show",
    "Uso: catalog:synopses:review:packet [--show]");
  return {show:argv[0]==="--show"};
}

function main(argv=process.argv.slice(2)) {
  const opts=parseArgs(argv);
  const packets=collectPackets(
    read("database/seeds/catalog.snapshot.json"),
    read("docs/editorial-sql-replacement-drafts-f23.json"),
    read("docs/editorial-provenance-sql-f23.json"),
    read("docs/editorial-issues-f2.json"),
    read("docs/editorial-sources-sql-f2.json")
  );
  const report=buildBatchPacket(packets);
  if(opts.show) {
    console.log(report.content);
    console.log("✓ Cinco fichas impresas; no se escribió ningún archivo.");
  } else {
    const output=savePacket(report);
    console.log("CineRD F-2.3 — expediente único para 5 sinopsis");
    console.log(output.status+": "+path.relative(root,output.path));
    console.log("Incluye versiones SQL anteriores, ES/EN, fuentes, preguntas y casillas SIN COMPLETAR.");
    console.log("El archivo está en backend/backups/, excluido de Git; guardarlo de forma privada.");
  }
  console.log("No se generaron aprobaciones ni se modificó SQL Server.");
}
if(require.main===module) {
  try {main()}catch(e){console.error("✗ "+e.message);process.exitCode=1;}
}
module.exports={buildBatchPacket,savePacket,parseArgs};
