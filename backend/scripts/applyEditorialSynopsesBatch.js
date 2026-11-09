/**
 * CineRD F-2.3 — Five SQL synopsis replacements as ONE transaction.
 * Default: offline preview. --apply is strictly gated by FIVE attributed
 * human reviews and an existing .bak reference. SQL Server is never touched
 * during preview. EN texts remain review proposals; Peliculas.Sinopsis is ES.
 */
const fs = require("node:fs");
const path = require("node:path");
const sql = require("mssql");
const {fingerprint,validateDraft,validateApproval} = require("./prepareEditorialSqlMigration");
const root = path.resolve(__dirname, "../..");
const read = rel => JSON.parse(fs.readFileSync(path.join(root,rel),"utf8"));
const ensure = (ok,message) => {if(!ok)throw Error(message)};
const EXPECTED_IDS = [5,6,10,55,56];

function loadBatch(snapshot,drafts,ledger) {
  ensure(snapshot?.format==="CineRD.CatalogSnapshot" &&
    typeof snapshot.sourceDatabase==="string" && snapshot.sourceDatabase.trim(),
    "Snapshot inválido");
  ensure(drafts?.version===1 && drafts.autoPublish===false && drafts.entries &&
    !Array.isArray(drafts.entries) && ledger?.version===1 && Array.isArray(ledger.approvals),
    "Libros F-2.3 inválidos o publicación automática activada");
  const films=snapshot.tables?.Peliculas?.filter(f=>String(f.Sinopsis??"").trim())||[];
  const ids=films.map(f=>Number(f.Id)).sort((a,b)=>a-b);
  ensure(JSON.stringify(ids)===JSON.stringify(EXPECTED_IDS),
    "El inventario de cinco sinopsis SQL cambió");
  ensure(JSON.stringify(Object.keys(drafts.entries).map(Number).sort((a,b)=>a-b))===
    JSON.stringify(EXPECTED_IDS),"Las propuestas no coinciden con los cinco ID");
  const approvals=new Map();
  for(const a of ledger.approvals) {
    ensure(a && Number.isInteger(a.filmId) && EXPECTED_IDS.includes(a.filmId) &&
      !approvals.has(a.filmId),"Aprobación ajena o duplicada");
    approvals.set(a.filmId,a);
  }
  const items=films.sort((a,b)=>a.Id-b.Id).map(film=>{
    const draft=drafts.entries[String(film.Id)];
    validateDraft(film,draft);
    return {film,draft,approval:approvals.get(film.Id),fingerprint:fingerprint(film,draft)};
  });
  return {database:snapshot.sourceDatabase,items,approvals};
}

function parseArgs(argv) {
  const args={apply:false,show:false,confirmBackup:false,backupFile:null};
  for(let i=0;i<argv.length;i++) {
    const arg=argv[i];
    if(arg==="--apply") {ensure(!args.apply,"--apply repetido");args.apply=true;}
    else if(arg==="--show") {ensure(!args.show,"--show repetido");args.show=true;}
    else if(arg==="--confirm-db-backup") {ensure(!args.confirmBackup,"--confirm-db-backup repetido");args.confirmBackup=true;}
    else if(arg==="--backup-file") {
      ensure(!args.backupFile,"--backup-file repetido");
      args.backupFile=argv[++i];
      ensure(typeof args.backupFile==="string" && !args.backupFile.startsWith("--"),
        "Falta ruta de respaldo");
    } else throw Error("Argumento no reconocido: "+arg);
  }
  ensure(!(args.apply && args.show),"--apply y --show no se combinan");
  if(!args.apply) ensure(!args.confirmBackup && !args.backupFile,
    "El respaldo solo se recibe con --apply");
  return args;
}

function assertBatchGate({batch,options,env,statSync=fs.statSync}) {
  ensure(options?.apply===true && options.confirmBackup===true,
    "Aplicación requiere --apply --confirm-db-backup");
  ensure(env?.DB_DATABASE===batch.database,"DB_DATABASE no coincide con el snapshot");
  ensure(typeof options.backupFile==="string" &&
    path.isAbsolute(options.backupFile) && /\.bak$/i.test(options.backupFile),
    "Se requiere --backup-file RUTA_ABSOLUTA.bak");
  ensure(batch.items.length===5,"Faltan películas en el lote");
  // Full authorization BEFORE SQL connection, backup IO or SQL updates.
  for(const item of batch.items) validateApproval(item.film,item.draft,item.approval);
  let stat;
  try {stat=statSync(options.backupFile)}catch {throw Error("No se encuentra .bak: "+options.backupFile)}
  ensure(stat?.isFile() && stat.size>0,"El .bak debe existir como archivo no vacío");
  return {approved:5,backupFile:options.backupFile};
}

const asDay = value => {
  if(value instanceof Date) {
    ensure(!Number.isNaN(value.getTime()),"Fecha SQL inválida");
    return value.toISOString().slice(0,10);
  }
  return String(value??"").slice(0,10);
};
function checkPreimages(batch,results) {
  ensure(Array.isArray(results) && results.length===5,"SQL devolvió un conjunto incompleto");
  const byId=new Map();
  for(const r of results) {
    ensure(r && Number.isInteger(Number(r.Id)) && !byId.has(Number(r.Id)),
      "SQL contiene filas de identidad inválida o duplicadas");
    byId.set(Number(r.Id),r);
  }
  for(const {film,draft} of batch.items) {
    const sqlRow=byId.get(film.Id);
    ensure(sqlRow && String(sqlRow.Titulo).trim()===String(film.Titulo).trim() &&
      asDay(sqlRow.FechaEstreno)===asDay(film.FechaEstreno),
      "Identidad SQL distinta para #"+film.Id);
    ensure(typeof sqlRow.Sinopsis==="string" &&
      sqlRow.Sinopsis===film.Sinopsis,
      "Sinopsis SQL original cambió para #"+film.Id+"; no sobrescribir");
    ensure(draft.es!==sqlRow.Sinopsis,"Sinopsis idéntica a SQL #"+film.Id);
  }
  return true;
}

async function applyBatch({batch,options,env,sqlDriver=sql,fsApi=fs,logger=console}) {
  const gate=assertBatchGate({batch,options,env,statSync:fsApi.statSync});
  for(const key of ["DB_SERVER","DB_USER","DB_PASSWORD"])ensure(env[key],"Falta "+key);
  // A .bak existing on disk does NOT establish successful restore.
  logger.log("✓ Cinco revisiones atribuidas y .bak localizado. Su restaurabilidad debe verificarse externamente.");
  const pool=new sqlDriver.ConnectionPool({
    server:env.DB_SERVER,user:env.DB_USER,password:env.DB_PASSWORD,
    database:env.DB_DATABASE,port:Number(env.DB_PORT||1433),
    options:{
      encrypt:env.DB_ENCRYPT==="true",
      trustServerCertificate:env.DB_TRUST_CERT!=="false"
    }
  });
  await pool.connect();
  const tx=new sqlDriver.Transaction(pool);
  let began=false;
  try {
    await tx.begin(sqlDriver.ISOLATION_LEVEL.SERIALIZABLE);
    began=true;
    const results=[];
    for(const {film} of batch.items) {
      const r=await new sqlDriver.Request(tx).input("filmId",sqlDriver.Int,film.Id)
        .query("SELECT Id,Titulo,Sinopsis,FechaEstreno FROM dbo.Peliculas WITH (UPDLOCK,HOLDLOCK) WHERE Id=@filmId");
      ensure(r.recordset?.length===1,"Película SQL no encontrada o duplicada: "+film.Id);
      results.push(r.recordset[0]);
    }
    // Validate every old value before updating any single film.
    checkPreimages(batch,results);
    const dir=path.join(root,"backend/backups/editorial");
    fsApi.mkdirSync(dir,{recursive:true});
    const target=path.join(dir,"f23-five-preimage-"+new Date().toISOString().replace(/[:.]/g,"-")+".json");
    fsApi.writeFileSync(target,JSON.stringify({
      createdAtUtc:new Date().toISOString(),database:batch.database,
      backupFile:gate.backupFile,
      warning:"A backup file name is not proof of SQL Server restore success.",
      filmIds:EXPECTED_IDS,fingerprints:batch.items.map(({film,fingerprint})=>({filmId:film.Id,fingerprint})),
      preimages:results
    },null,2)+"\n",{flag:"wx",mode:0o600});
    logger.log("✓ Preimagen local archivada: "+path.relative(root,target));
    for(const {film,draft} of batch.items) {
      const request=new sqlDriver.Request(tx);
      const r=await request.input("filmId",sqlDriver.Int,film.Id)
        .input("newText",sqlDriver.NVarChar(sqlDriver.MAX),draft.es)
        .query("UPDATE dbo.Peliculas SET Sinopsis=@newText WHERE Id=@filmId");
      ensure(r.rowsAffected?.[0]===1,"UPDATE no afectó exactamente una fila: "+film.Id);
    }
    await tx.commit();
    began=false;
    logger.log("✓ Cinco sinopsis españolas cambiadas en UNA transacción SQL.");
    logger.log("→ Reexportar snapshot, validarlo y revisar el diff. Las propuestas EN siguen independientes.");
    return {updated:5};
  } catch(e) {
    if(began) {try {await tx.rollback()}catch {/* SQL connection may be broken */}}
    throw e;
  } finally {await pool.close()}
}

async function main(argv=process.argv.slice(2)) {
  const options=parseArgs(argv);
  const batch=loadBatch(
    read("database/seeds/catalog.snapshot.json"),
    read("docs/editorial-sql-replacement-drafts-f23.json"),
    read("docs/editorial-sql-migration-approvals-f23.json")
  );
  console.log("CineRD F-2.3 — lote de cinco sinopsis SQL");
  for(const {film,draft,approval,fingerprint:fp} of batch.items) {
    console.log("#"+film.Id+" "+film.Titulo+" | "+
      (approval?"aprobación registrada (aún no validada)":"PENDIENTE")+
      " | huella="+fp);
    if(options.show) {
      console.log("ES: "+draft.es);
      console.log("EN: "+draft.en);
      console.log("");
    }
  }
  if(!options.apply){
    console.log("✓ VISTA PREVIA: 5 propuestas ES/EN. Ningún SQL modificado ni autorización creada.");
    console.log("El modo --apply está bloqueado hasta registrar cinco revisiones reales y disponer de respaldo .bak verificado.");
    return;
  }
  require("dotenv").config({path:path.join(root,"backend/.env")});
  await applyBatch({batch,options,env:process.env});
}
if(require.main===module)main().catch(e=>{
  console.error("✗ "+e.message);process.exitCode=1;
});
module.exports={loadBatch,parseArgs,assertBatchGate,checkPreimages,applyBatch};
