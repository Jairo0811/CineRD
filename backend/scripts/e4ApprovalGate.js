/**
 * CineRD E-4 — Offline authorization gate for the seven cited SQL corrections.
 * No DB connection and no mutation of editorial approval ledgers.
 * A checked approval record is NOT a cryptographic signature or proof of review.
 */
const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");

function ensure(ok, message) { if (!ok) throw Error(message); }
function correctionKey(row) { return String(row.filmId) + ":" + row.field; }
function fingerprint(row, snapshot) {
  ensure(row && Number.isInteger(row.filmId) && ["Genero","Director","FechaEstreno"].includes(row.field), "Fila E-4 invalida");
  ensure(snapshot && typeof snapshot.sourceDatabase === "string" && Array.isArray(snapshot.tables?.Peliculas),
    "Snapshot SQL invalido para autorizacion E-4");
  ensure(Array.isArray(row.sources) && row.sources.length >= 2, "No hay fuentes suficientes para autorizar E-4");
  const film = snapshot.tables.Peliculas.find(f => Number(f.Id) === row.filmId);
  ensure(film && String(film.Titulo).trim() === row.title, "Identidad E-4 distinta del snapshot: "+correctionKey(row));
  const canonical = {
    version:1,database:snapshot.sourceDatabase,filmId:row.filmId,
    title:row.title,field:row.field,expected:row.expected,
    proposed:row.proposed,sources:[...row.sources].sort()
  };
  return createHash("sha256").update(JSON.stringify(canonical),"utf8").digest("hex");
}
function verifyApprovalLedger(ledger,rows,snapshot,{requireAll=true}={}) {
  ensure(ledger && ledger.version===1 && Array.isArray(ledger.approvals),
    "Libro de autorizaciones E-4 invalido");
  ensure(Array.isArray(rows) && rows.length>0, "No se encontraron cambios E-4");
  const known=new Map(rows.map(row=>[correctionKey(row),row]));
  ensure(known.size===rows.length, "Hay correcciones E-4 duplicadas");
  const seen=new Set();
  for(const a of ledger.approvals) {
    ensure(a && Number.isInteger(a.filmId) && ["Genero","Director","FechaEstreno"].includes(a.field),
      "Autorizacion E-4 con ID/campo invalido");
    const key=correctionKey(a),row=known.get(key);
    ensure(row && !seen.has(key), "Autorizacion E-4 ajena o duplicada: "+key);
    seen.add(key);
    ensure(a.status==="aprobado" && a.fingerprint===fingerprint(row,snapshot),
      "Autorizacion E-4 no corresponde a la propuesta vigente: "+key);
    ensure(typeof a.reviewer==="string" && a.reviewer.trim().length>=3,
      "Falta un revisor humano atribuido: "+key);
    ensure(typeof a.reviewedAt==="string" &&
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(a.reviewedAt) &&
      !Number.isNaN(Date.parse(a.reviewedAt)),
      "Fecha de revision sin zona horaria o invalida: "+key);
    for(const flag of ["sourcesChecked","fieldMeaningReviewed","changeAuthorized"])
      ensure(a[flag]===true,"Aprobacion E-4 incompleta ("+flag+"): "+key);
    ensure(typeof a.notes==="string" && a.notes.trim().length>=40,
      "Falta justificacion de la decision E-4: "+key);
    ensure(Array.isArray(a.evidenceUrls) && a.evidenceUrls.length>0 &&
      new Set(a.evidenceUrls).size===a.evidenceUrls.length &&
      a.evidenceUrls.every(url => {
        try { return typeof url==="string" && new URL(url).protocol==="https:"; }
        catch { return false; }
      }) && a.evidenceUrls.some(url=>row.sources.includes(url)),
      "Evidencia HTTPS insuficiente o no vinculada al campo: "+key);
  }
  if(requireAll) {
    const missing=[...known.keys()].filter(key=>!seen.has(key));
    ensure(missing.length===0,
      "Faltan "+missing.length+" autorizaciones humanas E-4: "+missing.join(", "));
  }
  return {valid:seen.size,required:rows.length,pending:rows.length-seen.size};
}

function parseApplyArgs(argv) {
  ensure(Array.isArray(argv),"Argumentos E-4 invalidos");
  let apply=false, confirmed=false, backupFile=null;
  for(let i=0;i<argv.length;i++) {
    const arg=argv[i];
    if(arg==="--apply") {
      ensure(!apply,"--apply duplicado");apply=true;
    } else if(arg==="--confirm-db-backup") {
      ensure(!confirmed,"--confirm-db-backup duplicado");confirmed=true;
    } else if(arg==="--backup-file") {
      ensure(backupFile===null,"--backup-file duplicado");
      const value=argv[++i];
      ensure(value && !value.startsWith("--"),"Falta ruta --backup-file");
      backupFile=value;
    } else throw Error("Parametro E-4 desconocido: "+arg);
  }
  ensure(apply,"Falta --apply");
  ensure(confirmed,"Falta --confirm-db-backup");
  ensure(backupFile!==null,"Se requiere --backup-file");
  ensure(path.isAbsolute(backupFile) && /\.bak$/i.test(backupFile),
    "La ruta del respaldo SQL debe ser absoluta y terminar en .bak");
  return {backupFile};
}
function assertApplyGate({argv,ledger,rows,snapshot,env,statSync=fs.statSync}) {
  const opts=parseApplyArgs(argv);
  ensure(env && env.DB_DATABASE===snapshot?.sourceDatabase,
    "La base configurada no coincide con sourceDatabase del snapshot");
  // Check all seven human decisions and the backup BEFORE opening any DB connection.
  const review=verifyApprovalLedger(ledger,rows,snapshot,{requireAll:true});
  let stat;
  try {stat=statSync(opts.backupFile);} catch {throw Error("No se encuentra respaldo SQL: "+opts.backupFile);}
  ensure(stat?.isFile() && stat.size>0,
    "El respaldo SQL debe existir, ser un archivo y no estar vacio");
  return {backupFile:opts.backupFile,...review};
}

function main() {
  const root=path.resolve(__dirname,"../..");
  const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),"utf8"));
  const snapshot=read("database/seeds/catalog.snapshot.json");
  const ledger=read("docs/catalog-corrections-e4.json");
  const approvals=read("docs/catalog-corrections-e4-approvals.json");
  const result=verifyApprovalLedger(approvals,ledger.rows,snapshot,{requireAll:false});
  console.log("CineRD E-4 / autorizaciones (SOLO LECTURA)");
  console.log("Aprobadas con registro atribuible: "+result.valid+"/"+result.required+"; pendientes: "+result.pending+".");
  for(const row of ledger.rows) {
    const key=correctionKey(row);
    console.log("  #"+key+" "+row.title+" | fingerprint="+fingerprint(row,snapshot));
  }
  console.log("Estas huellas no autorizan cambios. Validar respaldo SQL restaurable y revisión humana real.");
}
if(require.main===module) {
  try{main();}catch(e){console.error("✗ "+e.message);process.exitCode=1;}
}
module.exports={fingerprint,verifyApprovalLedger,parseApplyArgs,assertApplyGate};
