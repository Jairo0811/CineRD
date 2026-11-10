/**
 * Fase E-4: proposed, cited SQL Server corrections.
 * Default is an OFFLINE dry-run using the versioned snapshot. No DB connection.
 * --apply --confirm-db-backup --backup-file ABSOLUTE.bak requires seven
 * attributed field approvals and an existing backup BEFORE DB connection.
 * It then verifies originals under SERIALIZABLE locks, saves a preimage, commits.
 * a transaction. Never runs automatically during build or CI.
 */
const fs = require("node:fs");
const path = require("node:path");
const sql = require("mssql");
const { assertApplyGate } = require("./e4ApprovalGate");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const root = path.resolve(__dirname,"../..");
const catalog = JSON.parse(fs.readFileSync(path.join(root,"database/seeds/catalog.snapshot.json"),"utf8"));
const spec = JSON.parse(fs.readFileSync(path.join(root,"docs/catalog-corrections-e4.json"),"utf8"));
const whitelist = new Set(["Genero","Director","FechaEstreno"]);
const normalize = text => String(text ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ").trim().toLowerCase();
function compared(field,value) {
  if(value==null || value==="") return null;
  if(field==="FechaEstreno") {
    const iso = value instanceof Date?value.toISOString():String(value);
    return iso.slice(0,10);
  }
  return String(value).trim();
}
function validate(ledger,snapshot) {
  if(ledger.version!==1 || !Array.isArray(ledger.rows)) throw Error("Registro de correcciones inválido");
  const seen=new Set();
  for(const c of ledger.rows) {
    if(!Number.isInteger(c.filmId) || !whitelist.has(c.field) || !c.title) throw Error("Campo/ID inválido");
    const key=c.filmId+":"+c.field;
    if(seen.has(key)) throw Error("Corrección duplicada: "+key);
    seen.add(key);
    const film=snapshot.tables.Peliculas.find(p=>Number(p.Id)===c.filmId);
    if(!film || normalize(film.Titulo)!==normalize(c.title)) throw Error("Identidad de película no coincide: "+key);
    const current=compared(c.field,film[c.field]);
    if(current!==compared(c.field,c.expected) && current!==compared(c.field,c.proposed)) throw Error("El snapshot difiere del valor esperado o propuesto: "+key);
    if(compared(c.field,c.expected)===compared(c.field,c.proposed)) throw Error("Cambio sin diferencia: "+key);
    if(!Array.isArray(c.sources) || c.sources.length<2 ||
       !c.sources.every(u=>{try{return new URL(u).protocol==="https:"}catch{return false}}))
      throw Error("Faltan fuentes HTTPS para: "+key);
    if(c.field==="FechaEstreno" && (!/^\d{4}-\d{2}-\d{2}$/.test(c.proposed) ||
        Number.isNaN(Date.parse(c.proposed+"T00:00:00Z")))) throw Error("Fecha inválida en "+key);
  }
  return ledger.rows;
}
const rows=validate(spec,catalog);
async function apply() {
  const approvals=JSON.parse(fs.readFileSync(path.join(root,"docs/catalog-corrections-e4-approvals.json"),"utf8"));
  const gate=assertApplyGate({
    argv:process.argv.slice(2),ledger:approvals,rows,snapshot:catalog,env:process.env
  });
  console.log("✓ Autorizaciones E-4 verificadas: "+gate.valid+"/"+gate.required+
    "; archivo .bak localizado: "+gate.backupFile);
  console.log("⚠ La existencia del .bak no demuestra que sea restaurable; el administrador debe comprobarlo.");
  for(const k of ["DB_SERVER","DB_DATABASE","DB_USER","DB_PASSWORD"]) {
    if(!process.env[k]) throw Error("Falta configurar "+k+" en backend/.env");
  }
  const pool=await sql.connect({
    server:process.env.DB_SERVER,database:process.env.DB_DATABASE,user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,options:{
      encrypt:process.env.DB_ENCRYPT==="true",
      trustServerCertificate:process.env.DB_TRUST_CERT!=="false",
    },
  });
  const transaction=new sql.Transaction(pool);
  try{
    await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);
    const existing=new Map();
    for(const filmId of new Set(rows.map(r=>r.filmId))) {
      const result=await new sql.Request(transaction).input("id",sql.Int,filmId)
        .query("SELECT Id,Titulo,Genero,Director,FechaEstreno FROM dbo.Peliculas WITH (UPDLOCK,HOLDLOCK) WHERE Id=@id");
      if(result.recordset.length!==1) throw Error("No hay exactamente una película con Id="+filmId);
      existing.set(filmId,result.recordset[0]);
    }
    for(const c of rows){
      const record=existing.get(c.filmId);
      if(normalize(record.Titulo)!==normalize(c.title) ||
         compared(c.field,record[c.field])!==compared(c.field,c.expected))
        throw Error("SQL difiere del valor esperado en "+c.title+"/"+c.field+"; no aplicar cambios.");
    }
    const backupDir=path.join(root,"backend/backups/editorial");
    fs.mkdirSync(backupDir,{recursive:true});
    const file=path.join(backupDir,"catalog-e4-preimage-"+new Date().toISOString().replace(/[:.]/g,"-")+".json");
    fs.writeFileSync(file,JSON.stringify({
      createdAt:new Date().toISOString(),database:process.env.DB_DATABASE,
      backupFile:gate.backupFile,authorizationsVerified:gate.valid,
      rows:[...existing.values()],
      corrections:rows,
    },null,2),{flag:"wx",mode:0o600});
    console.log("✓ Respaldo local pre-update creado: "+path.relative(root,file));
    for(const c of rows){
      const request=new sql.Request(transaction).input("id",sql.Int,c.filmId);
      const value=c.field==="FechaEstreno" ?
        request.input("newValue",sql.Date,new Date(c.proposed+"T00:00:00.000Z")) :
        request.input("newValue",sql.NVarChar(255),c.proposed);
      const result=await value.query("UPDATE dbo.Peliculas SET ["+c.field+"]=@newValue WHERE Id=@id");
      if(result.rowsAffected[0]!==1) throw Error("No se pudo actualizar "+c.filmId+"/"+c.field);
    }
    await transaction.commit();
    console.log("✓ "+rows.length+" campos corregidos en SQL Server. AHORA reexporta el snapshot y revisa el diff.");
  }catch(error){
    try{await transaction.rollback()}catch{ /* puede no haberse iniciado */ }
    throw error;
  }finally{await pool.close()}
}
if(require.main===module){
  console.log("CineRD E-4 — propuestas documentadas: "+rows.length+" campos de "+
    new Set(rows.map(c=>c.filmId)).size+" películas.");
  for(const c of rows) {
    const film=catalog.tables.Peliculas.find(p=>p.Id===c.filmId);
    const done=compared(c.field,film[c.field])===compared(c.field,c.proposed);
    console.log("  "+(done?"[APLICADO EN SNAPSHOT]":"[PENDIENTE]")+" #"+c.filmId+" "+c.title+" / "+c.field+": "+String(c.expected)+" -> "+String(c.proposed));
  }
  if(process.argv.includes("--apply")) apply().catch(e=>{console.error("✗ "+e.message);process.exitCode=1});
  else console.log("✓ VISTA PREVIA; no se ha modificado SQL Server. Para aplicar: las 7 autorizaciones E-4, respaldo .bak real, --apply --confirm-db-backup --backup-file RUTA_ABSOLUTA.bak");
}
module.exports={validate,compared,normalize};
