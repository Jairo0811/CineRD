/**
 * CineRD F-2.3: OFFLINE and approval-gated SQL synopsis migration.
 * It NEVER connects to SQL Server. Produces guarded UP/DOWN SQL for one
 * manually approved film, exclusively in the gitignored backend/backups dir.
 */
const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");
const root = path.resolve(__dirname,"../..");
const readJson = file => JSON.parse(fs.readFileSync(path.join(root,file),"utf8"));
const sha256 = x => createHash("sha256").update(x,"utf8").digest("hex");
const literal = x => "N'" + String(x).replace(/'/g,"''") + "'";
const ensure = (condition,message) => { if (!condition) throw Error(message); };
function fingerprint(film,draft) {
  return sha256(JSON.stringify({
    filmId:Number(film.Id),title:film.Titulo,
    year:Number(String(film.FechaEstreno).slice(0,4)),
    oldSqlSha256:sha256(String(film.Sinopsis ?? "")),
    es:draft.es,en:draft.en,sources:[...draft.sources].sort()
  }));
}
function validateDraft(film,draft) {
  ensure(film && draft,"Sinopsis o película inexistente");
  ensure(Number(film.Id)===Number(draft.filmId) && film.Titulo===draft.title &&
    Number(String(film.FechaEstreno).slice(0,4))===draft.year,"Identidad de pelicula distinta");
  ensure(String(film.Sinopsis??"").trim(),"No hay sinopsis SQL de origen");
  ensure(draft.status==="pendiente_revision" && draft.deployment==="manual_only" &&
    draft.reviewedAt===null && draft.reviewedBy===null,"La propuesta no esta en revision manual");
  ensure(typeof draft.es==="string" && draft.es.trim().length>125 &&
    typeof draft.en==="string" && draft.en.trim().length>120 &&
    draft.es!==film.Sinopsis,"No hay textos ES/EN validos y distintos a SQL");
  ensure(Array.isArray(draft.sources) && draft.sources.length &&
    draft.sources.every(u=>{try{return new URL(u).protocol==="https:"}catch{return false}}),
    "Fuentes HTTPS invalidas");
  return true;
}
function validateApproval(film,draft,approval) {
  const fp=fingerprint(film,draft);
  ensure(approval && approval.status==="aprobado" &&
    approval.filmId===Number(film.Id),"No hay aprobacion humana registrada para ID "+film.Id);
  ensure(approval.fingerprint===fp,"La huella de la aprobacion no coincide con los textos actuales");
  ensure(typeof approval.reviewer==="string" && approval.reviewer.trim().length>=3 &&
    typeof approval.reviewedAt==="string" &&
    !Number.isNaN(Date.parse(approval.reviewedAt)) &&
    /(?:Z|[+-]\d\d:\d\d)$/.test(approval.reviewedAt),
    "Falta revisor real o fecha con zona horaria");
  for(const flag of ["sourcesChecked","esReviewed","enReviewed","originalityReviewed","rightsReviewed","releaseAuthorized"])
    ensure(approval[flag]===true,"Revision humana incompleta: "+flag);
  ensure(typeof approval.notes==="string" && approval.notes.trim().length>=20,
    "Falta justificacion editorial");
  return fp;
}
function sqlScript({film,oldValue,newValue,kind,fingerprint:fp,databaseName="CRUDPeliculas"}) {
  ensure(["UP","DOWN"].includes(kind) && oldValue!==newValue,"Transicion SQL invalida");
  const id=Number(film.Id),year=Number(String(film.FechaEstreno).slice(0,4));
  ensure(Number.isInteger(id) && id>0 && Number.isInteger(year) && year>=1900 && year<=2200,
    "ID o anio SQL invalidos");
  ensure(typeof databaseName==="string" && /^[A-Za-z0-9_]+$/.test(databaseName),
    "Nombre de base de datos no seguro");
  return `-- CineRD F-2.3 / ${kind} / film ${id} / ${fp}
-- SOLO EJECUCION MANUAL CON BACKUP REAL DE SQL SERVER.
-- Esta migracion cambia solo dbo.Peliculas.Sinopsis en espanol.
SET XACT_ABORT ON;
IF DB_NAME() <> ${literal(databaseName)}
  THROW 51009, 'CineRD: base de datos incorrecta', 1;
BEGIN TRY
  SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
  BEGIN TRANSACTION;
  DECLARE @id INT=${id};
  DECLARE @expected NVARCHAR(MAX)=${literal(oldValue)};
  DECLARE @replacement NVARCHAR(MAX)=${literal(newValue)};
  DECLARE @expectedTitle NVARCHAR(MAX)=${literal(film.Titulo)};
  DECLARE @actual NVARCHAR(MAX), @actualTitle NVARCHAR(MAX), @actualYear INT;
  IF (SELECT COUNT_BIG(*) FROM dbo.Peliculas WITH(UPDLOCK,HOLDLOCK) WHERE Id=@id) <> 1
    THROW 51010, 'CineRD: pelicula no encontrada o duplicada', 1;
  SELECT @actual=CONVERT(NVARCHAR(MAX),Sinopsis),
         @actualTitle=CONVERT(NVARCHAR(MAX),Titulo),
         @actualYear=YEAR(FechaEstreno)
    FROM dbo.Peliculas WITH(UPDLOCK,HOLDLOCK) WHERE Id=@id;
  IF @actualTitle IS NULL OR @actualTitle <> @expectedTitle OR @actualYear <> ${year}
    THROW 51011, 'CineRD: identidad de pelicula distinta', 1;
  IF @actual IS NULL OR DATALENGTH(@actual) <> DATALENGTH(@expected)
    OR CONVERT(VARBINARY(MAX),@actual) <> CONVERT(VARBINARY(MAX),@expected)
    THROW 51012, 'CineRD: SQL ha cambiado; no sobrescribir', 1;
  UPDATE dbo.Peliculas SET Sinopsis=@replacement WHERE Id=@id;
  IF @@ROWCOUNT <> 1 THROW 51013, 'CineRD: UPDATE afecto cantidad incorrecta', 1;
  COMMIT TRANSACTION;
  PRINT 'CineRD F-2.3 ${kind}: una sinopsis actualizada.';
END TRY
BEGIN CATCH
  IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
  THROW;
END CATCH;
`;
}
function createBundle(film,draft,approval,databaseName="CRUDPeliculas") {
  validateDraft(film,draft);
  const fp=validateApproval(film,draft,approval);
  return {
    fingerprint:fp,
    up:sqlScript({film,oldValue:film.Sinopsis,newValue:draft.es,kind:"UP",fingerprint:fp,databaseName}),
    down:sqlScript({film,oldValue:draft.es,newValue:film.Sinopsis,kind:"DOWN",fingerprint:fp,databaseName}),
    meta:{filmId:Number(film.Id),title:film.Titulo,fingerprint:fp,
      originalHash:sha256(film.Sinopsis),replacementEsHash:sha256(draft.es),
      replacementEnHash:sha256(draft.en),
      reviewer:approval.reviewer,reviewedAt:approval.reviewedAt}
  };
}
function parseArgs(argv) {
  const opts={generate:false,filmId:null,backupFile:null};
  for(let i=0;i<argv.length;i++) {
    if(argv[i]==="--generate") opts.generate=true;
    else if(argv[i]==="--film-id") {
      const value=argv[++i];
      ensure(value && /^\d+$/.test(value) && Number(value)>0,"--film-id invalido");
      opts.filmId=Number(value);
    } else if(argv[i]==="--backup-file") {
      const value=argv[++i];ensure(value,"--backup-file requiere ruta");
      opts.backupFile=value;
    } else throw Error("Argumento desconocido: "+argv[i]);
  }
  return opts;
}
function main(argv=process.argv.slice(2)) {
  const args=parseArgs(argv);
  const snap=readJson("database/seeds/catalog.snapshot.json");
  const drafts=readJson("docs/editorial-sql-replacement-drafts-f23.json");
  const ledger=readJson("docs/editorial-sql-migration-approvals-f23.json");
  ensure(drafts.version===1 && drafts.autoPublish===false &&
    ledger.version===1 && Array.isArray(ledger.approvals),"Registros de migracion invalidos");
  const films=snap.tables.Peliculas.filter(f=>String(f.Sinopsis??"").trim());
  ensure(films.length===5 && Object.keys(drafts.entries).length===5,"Inventario SQL no coincide");
  const approvals=new Map();
  for(const a of ledger.approvals) {
    ensure(a && Number.isInteger(a.filmId) && drafts.entries[String(a.filmId)],
      "Aprobacion ajena o invalida");
    ensure(!approvals.has(a.filmId),"Aprobacion duplicada: "+a.filmId);
    approvals.set(a.filmId,a);
  }
  console.log("CineRD F-2.3 — migracion SQL OFFLINE (ninguna conexion a la base de datos)");
  console.log("Aprobaciones humanas: "+approvals.size);
  for(const film of films) {
    const draft=drafts.entries[String(film.Id)];validateDraft(film,draft);
    if(args.filmId && film.Id!==args.filmId)continue;
    console.log("  #"+film.Id+" "+film.Titulo+
      " | "+(approvals.has(film.Id)?"aprobacion registrada":"PENDIENTE")+
      " | fingerprint="+fingerprint(film,draft));
  }
  if(!args.generate){console.log("✓ VISTA PREVIA, sin archivos ni SQL ejecutado.");return;}
  ensure(args.filmId && films.some(f=>f.Id===args.filmId),
    "--generate exige --film-id de una pelicula SQL");
  const film=films.find(f=>f.Id===args.filmId);
  const draft=drafts.entries[String(film.Id)];
  // Approval and full fingerprint validation must happen BEFORE generating SQL.
  const bundle=createBundle(film,draft,approvals.get(film.Id),snap.sourceDatabase);
  ensure(typeof args.backupFile==="string" && path.isAbsolute(args.backupFile),
    "Se requiere --backup-file con ruta absoluta a un respaldo SQL Server");
  const backup=fs.statSync(args.backupFile,{throwIfNoEntry:false});
  ensure(backup?.isFile() && backup.size>0 && /\.bak$/i.test(args.backupFile),
    "El respaldo .bak no existe o esta vacio");
  const folder=path.join(root,"backend","backups","editorial","sql-f23",
    "film-"+film.Id+"-"+bundle.fingerprint.slice(0,16));
  // An existing fingerprint folder is never silently overwritten.
  fs.mkdirSync(path.dirname(folder),{recursive:true});
  fs.mkdirSync(folder);
  fs.writeFileSync(path.join(folder,"up.sql"),bundle.up,{flag:"wx",mode:0o600});
  fs.writeFileSync(path.join(folder,"down.sql"),bundle.down,{flag:"wx",mode:0o600});
  fs.writeFileSync(path.join(folder,"preimage.json"),JSON.stringify({
    ...bundle.meta,createdAtUtc:new Date().toISOString(),backupFile:args.backupFile,
    originalSql:film.Sinopsis,replacementEs:draft.es,replacementEn:draft.en
  },null,2)+"\n",{flag:"wx",mode:0o600});
  console.log("✓ Scripts UP y DOWN en carpeta gitignored: "+folder);
  console.log("⚠ SQL NO ejecutado. La persona administradora debe revisar y ejecutar manualmente.");
}
if(require.main===module) {
  try{main()}catch(error){console.error("✗ "+error.message);process.exitCode=1;}
}
module.exports={fingerprint,validateDraft,validateApproval,sqlScript,createBundle,parseArgs};
