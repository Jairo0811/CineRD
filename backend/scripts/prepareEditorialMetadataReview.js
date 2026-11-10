/**
 * CineRD F-2.8 — offline review of six release dates.
 *
 * --show: print an unsigned review packet; no disk writes
 * --create: create an UNAPPROVED private template; never overwrite
 * --check: validate a previously completed local sheet; no SQL, no Git writes
 *
 * Never applies SQL updates, grants human approval or changes editorial ledgers.
 */
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const {validateDossier}=require("./previewEditorialMetadataLive");
const root=path.resolve(__dirname,"../..");
const directory=path.join(root,"backend","backups","editorial","review-f28");
const policyPath=path.join(root,"docs","POLITICA_FECHA_ESTRENO_F27.md");
const read=rel=>JSON.parse(fs.readFileSync(path.join(root,rel),"utf8"));
const ensure=(ok,msg)=>{if(!ok)throw Error(msg);};
const hash=payload=>crypto.createHash("sha256").update(JSON.stringify(payload),"utf8").digest("hex");
const EXPECTED_IDS=[27,36,40,42,44,56];

function reviewPacket({snapshot,dossier,matrix,legacyE4,policy}) {
  const batch=validateDossier(dossier,snapshot,matrix,legacyE4);
  ensure(typeof policy==="string"&&policy.includes("primera exhibición comercial")&&
    policy.includes("pendiente de aprobación humana"),
    "Política de FechaEstreno F-2.7 ausente o inválida");
  const policyHash=crypto.createHash("sha256").update(policy,"utf8").digest("hex");
  const rows=batch.items.map(item=>{
    const original=dossier.items.find(x=>x.filmId===item.filmId);
    ensure(original&&original.proposals.length===1,"Fuente candidata F-2.6 incompleta");
    const fingerprint=hash({
      version:1,database:batch.database,
      filmId:item.filmId,title:item.title,field:"FechaEstreno",
      previous:item.previous,proposed:item.proposed,
      confidence:item.confidence,sources:[...item.sources].sort(),
      policyHash
    });
    return {
      filmId:item.filmId,title:item.title,confidence:item.confidence,
      field:"FechaEstreno",
      previous:item.previous,proposed:item.proposed,
      sources:item.sources,editorialNotes:original.notes,
      fingerprint,
      decision:"pendiente",
      reviewer:null,reviewedAt:null,policyAccepted:false,
      sourcesChecked:false,releaseDateVerified:false,
      evidence:[],notes:""
    };
  });
  ensure(JSON.stringify(rows.map(x=>x.filmId))===JSON.stringify(EXPECTED_IDS),
    "Lote de seis fechas diferente de lo esperado");
  const batchHash=hash({version:1,database:batch.database,policyHash,
    fingerprints:rows.map(x=>x.fingerprint)});
  return {
    version:1,edition:"F-2.8",database:batch.database,
    sourceDossier:"docs/editorial-metadata-candidates-f26.json",
    policy:"docs/POLITICA_FECHA_ESTRENO_F27.md",
    policyHash,batchHash,
    instructions:"HOJA SIN APROBACIONES. Para CADA película, verificar fuentes y fecha comercial RD realmente. Las firmas en esta hoja no constituyen permiso para cambiar SQL ni sustituyen respaldo restaurable. No publicar datos personales en Git.",
    sqlApplyAuthorized:false,createdAsApproval:false,
    retained:[31,47],decisions:rows
  };
}
function localFile(packet) {
  ensure(/^[a-f0-9]{64}$/.test(packet?.batchHash),"Huella de lote inválida");
  return path.join(directory,"cinerd-six-release-dates-"+packet.batchHash.slice(0,16)+".json");
}
function saveTemplate(packet,{fsApi=fs,file=localFile(packet)}={}) {
  fsApi.mkdirSync(path.dirname(file),{recursive:true,mode:0o700});
  try {
    fsApi.writeFileSync(file,JSON.stringify(packet,null,2)+"\n",{
      flag:"wx",encoding:"utf8",mode:0o600
    });
    return {path:file,created:true};
  }catch(error) {
    if(error.code!=="EEXIST")throw error;
    return {path:file,created:false};
  }
}
function checkReview(template,fresh) {
  const problems=[];
  if(!fresh || template?.version!==1||template.edition!=="F-2.8"||
    template.database!==fresh.database||
    template.policyHash!==fresh.policyHash||template.batchHash!==fresh.batchHash||
    template.sqlApplyAuthorized!==false || template.createdAsApproval!==false||
    !Array.isArray(template.decisions)||template.decisions.length!==6)
    return {ok:false,problems:["Hoja F-2.8 incompatible, huella obsoleta o autorizaciones inventadas"],approved:0,rejected:0};
  const seen=new Set();let approved=0,rejected=0;
  for(const item of template.decisions) {
    const expected=fresh.decisions.find(x=>x.filmId===item?.filmId);
    if(!expected||seen.has(item.filmId)) {
      problems.push("ID ajeno o duplicado: "+item?.filmId);continue;
    }
    seen.add(item.filmId);
    for(const field of ["title","confidence","field","previous","proposed","fingerprint"])
      if(item[field]!==expected[field]) {
        problems.push("#"+item.filmId+": dato/huella modificado ("+field+")");
        break;
      }
    if(JSON.stringify(item.sources)!==JSON.stringify(expected.sources)) {
      problems.push("#"+item.filmId+": fuentes modificadas");
    }
    if(!["aprobado","rechazado"].includes(item.decision)){
      problems.push("#"+item.filmId+": decisión pendiente o desconocida");continue;
    }
    if(typeof item.reviewer!=="string"||item.reviewer.trim().length<3||
      typeof item.reviewedAt!=="string" ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(item.reviewedAt)||
      !Number.isFinite(Date.parse(item.reviewedAt))||
      typeof item.notes!=="string"||item.notes.trim().length<20){
      problems.push("#"+item.filmId+": faltan revisor, fecha zonificada o notas sustanciales");
      continue;
    }
    if(item.decision==="aprobado"){
      if(item.policyAccepted!==true||item.sourcesChecked!==true||
        item.releaseDateVerified!==true||
        !Array.isArray(item.evidence)||item.evidence.length===0||
        !item.evidence.every(s=>typeof s==="string"&&/^https:\/\//.test(s)&&
          expected.sources.includes(s))){
        problems.push("#"+item.filmId+": la aprobación carece de política aceptada o comprobación de fuentes y evidencia");
        continue;
      }
      approved++;
    } else rejected++;
  }
  if(seen.size!==6)problems.push("Faltan decisiones de películas del lote");
  return {ok:problems.length===0,problems,approved,rejected};
}
function loadPacket(){
  return reviewPacket({
    snapshot:read("database/seeds/catalog.snapshot.json"),
    dossier:read("docs/editorial-metadata-candidates-f26.json"),
    matrix:read("docs/editorial-issues-f2.json"),
    legacyE4:read("docs/catalog-corrections-e4.json"),
    policy:fs.readFileSync(policyPath,"utf8")
  });
}
function parseArgs(argv) {
  ensure(argv.length===1&&["--show","--create","--check"].includes(argv[0]),
    "Uso: prepareEditorialMetadataReview.js --show|--create|--check");
  return argv[0];
}
function main(argv=process.argv.slice(2)){
  const mode=parseArgs(argv),packet=loadPacket();
  if(mode==="--show") {
    console.log(JSON.stringify(packet,null,2));return;
  }
  const file=localFile(packet);
  if(mode==="--create"){
    const result=saveTemplate(packet);
    console.log((result.created?"CREATED: ":"EXISTS_NO_OVERWRITE: ")+
      path.relative(root,result.path));
    console.log("F-2.8: seis decisiones PENDIENTES; 0 autorizaciones. No SQL ni Git modificados.");
    return;
  }
  const template=JSON.parse(fs.readFileSync(file,"utf8"));
  const report=checkReview(template,packet);
  if(!report.ok){
    console.error("F-2.8: "+report.problems.length+" campos de revisión pendientes/incorrectos:");
    for(const p of report.problems)console.error(" - "+p);
    process.exitCode=1;return;
  }
  console.log("✓ Se completaron "+report.approved+" propuestas aprobadas y "+
    report.rejected+" rechazadas en la hoja LOCAL.");
  console.log("No se registraron autorizaciones en Git ni se modificó SQL.");
  console.log("Se requiere revisión formal de las decisiones y respaldo restaurable antes de preparar cualquier migración.");
}
if(require.main===module){
  try{main();}catch(error){console.error("✗ "+error.message);process.exitCode=1;}
}
module.exports={reviewPacket,localFile,saveTemplate,checkReview,loadPacket,parseArgs};
