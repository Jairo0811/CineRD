/**
 * CineRD F-2.3: a single local decision sheet for the 5 synopsis proposals.
 * Default: create private, UNAPPROVED JSON template. --check: validate only.
 * --record-reviewed: persist 5 real, complete human approvals to the Git
 * ledger. NEVER connects to SQL Server, runs migrations or invents reviewers.
 */
const fs=require("node:fs");
const path=require("node:path");
const {collectPackets}=require("./prepareEditorialHumanReview");
const {buildBatchPacket}=require("./prepareEditorialBatchReview");
const {validateApproval}=require("./prepareEditorialSqlMigration");

const root=path.resolve(__dirname,"../..");
const approvalLedger="docs/editorial-sql-migration-approvals-f23.json";
const directory=path.join(root,"backend","backups","editorial","review-f23");
const read=rel=>JSON.parse(fs.readFileSync(path.join(root,rel),"utf8"));
const ensure=(cond,msg)=>{if(!cond)throw Error(msg);};
const FIELDS=["sourcesChecked","esReviewed","enReviewed","originalityReviewed","rightsReviewed","releaseAuthorized"];
const EXPECTED_IDS=[5,6,10,55,56];

function freshTemplate(packets, hash) {
  ensure(Array.isArray(packets)&&packets.length===5&&/^[a-f0-9]{64}$/.test(hash),
    "Paquete o huella de lote inválidos");
  const sorted=[...packets].sort((a,b)=>a.film.Id-b.film.Id);
  ensure(JSON.stringify(sorted.map(x=>x.film.Id))===JSON.stringify(EXPECTED_IDS),
    "El inventario no coincide con el lote");
  return {
    version:1,
    batchHash:hash,
    instruction:"Completar SOLO tras revisar realmente las cinco películas, fuentes, idioma y derechos. 'aprobado' no es una firma digital ni acredita licencia por sí solo.",
    decisions:sorted.map(p=>({
      filmId:p.film.Id,title:p.film.Titulo,fingerprint:p.fingerprint,
      decision:"pendiente",
      reviewer:null,reviewedAt:null,
      sourcesChecked:false,esReviewed:false,enReviewed:false,
      originalityReviewed:false,rightsReviewed:false,releaseAuthorized:false,
      evidence:[],
      notes:""
    }))
  };
}

function templatePath(hash){
  ensure(/^[a-f0-9]{64}$/.test(hash),"Huella inválida");
  return path.join(directory,"cinerd-five-decisions-"+hash.slice(0,16)+".json");
}

function saveTemplate(template,{fsApi=fs,dest=templatePath(template.batchHash)}={}) {
  fsApi.mkdirSync(path.dirname(dest),{recursive:true});
  try {
    fsApi.writeFileSync(dest,JSON.stringify(template,null,2)+"\n",{
      flag:"wx",mode:0o600,encoding:"utf8"
    });
    return {path:dest,created:true};
  } catch(error) {
    if(error.code!=="EEXIST")throw error;
    return {path:dest,created:false};
  }
}

function checkReviewedTemplate(template,packets,hash) {
  const problems=[];
  if(template?.version!==1 || template.batchHash!==hash ||
     !Array.isArray(template.decisions) || template.decisions.length!==5)
    return {ok:false,problems:["Versión, huella o número de decisiones incorrecto"],approvals:[]};
  const expected=[...packets].sort((a,b)=>a.film.Id-b.film.Id);
  const seen=new Set(),converted=[];
  for(const decision of template.decisions){
    const id=Number(decision?.filmId),row=expected.find(p=>p.film.Id===id);
    if(!Number.isInteger(id)||!row||seen.has(id)){
      problems.push("Película ID ajena o duplicada");continue;
    }
    seen.add(id);
    if(decision.title!==row.film.Titulo ||
       decision.fingerprint!==row.fingerprint){
      problems.push("Identidad o huella desactualizada para #"+id);continue;
    }
    if(decision.decision!=="aprobado"){
      problems.push("#"+id+": decisión humana pendiente o no aprobada");continue;
    }
    if(!Array.isArray(decision.evidence)||decision.evidence.length===0||
       decision.evidence.some(e=>typeof e!=="string" || !(
         /^https:\/\//i.test(e.trim()) ||
         /^\.{0,2}[\\/]/.test(e.trim()) ||
         /^[A-Za-z]:[\\/]/.test(e.trim())
       ) || /\[(PENDIENTE|TODO)\]|TEST_ONLY|EJEMPLO/i.test(e))) {
      problems.push("#"+id+": falta referencia verificable de la revisión y derechos");continue;
    }
    const approval={
      filmId:id,status:"aprobado",fingerprint:row.fingerprint,
      reviewer:decision.reviewer,
      reviewedAt:decision.reviewedAt,
      ...Object.fromEntries(FIELDS.map(f=>[f,decision[f]])),
      notes:decision.notes,
      evidence:decision.evidence
    };
    try {
      validateApproval(row.film,row.draft,approval);
      converted.push(approval);
    } catch(e) {
      problems.push("#"+id+": "+e.message);
    }
  }
  if(seen.size!==5)problems.push("No se encontraron cinco decisiones distintas");
  return {ok:problems.length===0,problems,approvals:problems.length===0?converted:[]};
}

function recordReviewed(template,packets,hash,ledger,{fsApi=fs,ledgerFile=path.join(root,approvalLedger)}={}) {
  ensure(ledger?.version===1 && Array.isArray(ledger.approvals) &&
      ledger.approvals.length===0,
    "El libro de aprobaciones ya contiene decisiones; no sobrescribir");
  const result=checkReviewedTemplate(template,packets,hash);
  ensure(result.ok,"Revisión humana incompleta:\n"+result.problems.join("\n"));
  const updated={...ledger,approvals:result.approvals};
  // We never create sample approvals without --record-reviewed.
  // No backup .bak or SQL operations in this function.
  const temp=ledgerFile+".f23."+process.pid+".tmp";
  fsApi.writeFileSync(temp,JSON.stringify(updated,null,2)+"\n",{
    flag:"wx",mode:0o600,encoding:"utf8"
  });
  try {fsApi.renameSync(temp,ledgerFile);}
  catch(e) {try{fsApi.unlinkSync(temp)}catch{}throw e;}
  return updated;
}

function parseArgs(args){
  ensure(args.length===0||(args.length===1&&["--check","--record-reviewed"].includes(args[0])),
    "Uso: catalog:synopses:review:decisions [--check|--record-reviewed]");
  return {mode:args[0]??"template"};
}

function main(args=process.argv.slice(2)){
  const {mode}=parseArgs(args);
  const packets=collectPackets(
    read("database/seeds/catalog.snapshot.json"),
    read("docs/editorial-sql-replacement-drafts-f23.json"),
    read("docs/editorial-provenance-sql-f23.json"),
    read("docs/editorial-issues-f2.json"),
    read("docs/editorial-sources-sql-f2.json")
  );
  const report=buildBatchPacket(packets);
  const file=templatePath(report.combinedHash);
  if(mode==="template"){
    const saved=saveTemplate(freshTemplate(packets,report.combinedHash));
    console.log("CineRD F-2.3 — hoja conjunta de decisiones (NO APROBADA)");
    console.log((saved.created?"CREATED: ":"EXISTS_NO_OVERWRITE: ")+
      path.relative(root,saved.path));
    console.log("Revisar y completar cada sección con hechos y evidencias reales.");
    console.log("Este comando no aprueba, no actualiza SQL y no cambia el libro de aprobaciones.");
    return;
  }
  const template=JSON.parse(fs.readFileSync(file,"utf8"));
  const checked=checkReviewedTemplate(template,packets,report.combinedHash);
  if(!checked.ok) {
    console.error("CineRD: "+checked.problems.length+" verificaciones de revisión pendientes:");
    for(const p of checked.problems)console.error(" - "+p);
    process.exitCode=1;
    return;
  }
  if(mode==="check"){
    console.log("✓ Las cinco decisiones están completas y coinciden con las huellas actuales.");
    console.log("No se registró ni ejecutó ningún cambio.");
    return;
  }
  const updated=recordReviewed(template,packets,report.combinedHash,read(approvalLedger));
  console.log("✓ Se registraron "+updated.approvals.length+
    " decisiones atribuidas en "+approvalLedger+".");
  console.log("El registro modifica un archivo controlado por Git. Revisar privacidad antes de publicar.");
  console.log("SQL Server NO modificado: falta backup restaurable y ejecución autorizada por el administrador.");
}
if(require.main===module){
  try{main()}catch(e){console.error("✗ "+e.message);process.exitCode=1;}
}
module.exports={freshTemplate,templatePath,saveTemplate,checkReviewedTemplate,recordReviewed,parseArgs};
