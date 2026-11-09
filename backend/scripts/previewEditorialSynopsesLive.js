/**
 * CineRD F-2.3 — read-only comparison of ALL five real SQL synopses against
 * the versioned preimage and editorial proposals. No SQL mutations or files.
 */
const sql=require("mssql");
const path=require("node:path");
const fs=require("node:fs");
const {loadBatch}=require("./applyEditorialSynopsesBatch");
const root=path.resolve(__dirname,"../..");
const read=rel=>JSON.parse(fs.readFileSync(path.join(root,rel),"utf8"));
const ID_FIELDS=["id0","id1","id2","id3","id4"];
const QUERY="SELECT Id,Titulo,FechaEstreno,Sinopsis FROM dbo.Peliculas WHERE Id IN (@id0,@id1,@id2,@id3,@id4)";

function calendarDay(value) {
  if(value instanceof Date) {
    if(Number.isNaN(value.getTime()))return "INVALID_DATE";
    return value.toISOString().slice(0,10);
  }
  return String(value??"").slice(0,10);
}

function compareLiveSynopses(batch,rows) {
  if(!batch || !Array.isArray(batch.items) || batch.items.length!==5 ||
     !Array.isArray(rows)) throw Error("Datos de revisión SQL incompletos");
  const ids=new Set(batch.items.map(item=>item.film.Id));
  if(ids.size!==5)throw Error("Inventario con ID duplicados");
  const seen=new Map();
  for(const row of rows) {
    const id=Number(row?.Id);
    if(!Number.isInteger(id)||!ids.has(id)||seen.has(id))
      throw Error("SQL devolvió una película ajena o duplicada");
    seen.set(id,row);
  }
  const checks=batch.items.map(({film,draft})=>{
    const actual=seen.get(film.Id);
    let status;
    if(!actual)status="MISSING";
    else if(String(actual.Titulo).trim()!==String(film.Titulo).trim() ||
            calendarDay(actual.FechaEstreno)!==calendarDay(film.FechaEstreno))
      status="DRIFT";
    else if(typeof actual.Sinopsis!=="string")status="DRIFT";
    else if(actual.Sinopsis===draft.es)status="ALREADY";
    else if(actual.Sinopsis===film.Sinopsis)status="ORIGINAL";
    else status="DRIFT";
    return {filmId:film.Id,title:film.Titulo,status};
  });
  const counts=Object.fromEntries(["ORIGINAL","ALREADY","DRIFT","MISSING"].map(s=>[
    s,checks.filter(x=>x.status===s).length
  ]));
  return {
    checks,counts,
    allOriginal:counts.ORIGINAL===5,
    allAlready:counts.ALREADY===5,
    mixed:counts.ORIGINAL>0 && counts.ALREADY>0,
    unexpected:counts.DRIFT>0 || counts.MISSING>0,
    safeToApply:counts.ORIGINAL===5
  };
}

async function selectLiveSynopses(pool,batch,driver=sql){
  if(!batch || batch.items?.length!==5)throw Error("Lote incompleto");
  let request=pool.request();
  for(let i=0;i<5;i++) {
    const id=batch.items[i].film.Id;
    if(!Number.isInteger(id)||id<1)throw Error("ID inválido");
    request=request.input(ID_FIELDS[i],driver.Int,id);
  }
  const r=await request.query(QUERY);
  if(!Array.isArray(r?.recordset))throw Error("Respuesta SQL inválida");
  return r.recordset;
}

async function main(argv=process.argv.slice(2)) {
  if(argv.length)throw Error("Este comando de solo lectura no acepta parámetros");
  const snapshot=read("database/seeds/catalog.snapshot.json");
  const batch=loadBatch(snapshot,
    read("docs/editorial-sql-replacement-drafts-f23.json"),
    read("docs/editorial-sql-migration-approvals-f23.json"));
  require("dotenv").config({path:path.join(root,"backend/.env")});
  const env=process.env;
  if(!env.DB_DATABASE || env.DB_DATABASE!==batch.database)
    throw Error("DB_DATABASE no coincide con el catálogo versionado");
  for(const key of ["DB_SERVER","DB_USER","DB_PASSWORD"])
    if(!env[key])throw Error("Falta "+key+" en backend/.env");
  const pool=new sql.ConnectionPool({
    server:env.DB_SERVER,user:env.DB_USER,password:env.DB_PASSWORD,
    database:env.DB_DATABASE,port:Number(env.DB_PORT||1433),
    options:{
      encrypt:env.DB_ENCRYPT==="true",
      trustServerCertificate:env.DB_TRUST_CERT!=="false"
    },
    requestTimeout:15000
  });
  await pool.connect();
  let report;
  try{
    const rows=await selectLiveSynopses(pool,batch);
    report=compareLiveSynopses(batch,rows);
  }finally{await pool.close();}
  console.log("CineRD F-2.3 — cinco sinopsis de SQL Server (SOLO LECTURA)");
  for(const item of report.checks)console.log("  ["+item.status+"] #"+item.filmId+" "+item.title);
  const c=report.counts;
  console.log("Resultado: "+c.ORIGINAL+" originales, "+c.ALREADY+
    " propuestas ya aplicadas, "+c.DRIFT+" discrepancias, "+c.MISSING+" ausentes.");
  if(report.unexpected || report.mixed) {
    console.error("✗ Estado inconsistente. No ejecutar sustitución por lote.");
    process.exitCode=1;
  } else if(report.allAlready) {
    console.log("✓ Las cinco propuestas ES ya están en SQL; NO volver a aplicar. Revisar snapshot.");
  } else if(report.allOriginal) {
    console.log("✓ SQL conserva las cinco sinopsis antiguas. El lote es técnicamente elegible, pero NO está autorizado.");
  } else {
    console.error("✗ Estado SQL no uniforme. Revisión humana/técnica requerida.");
    process.exitCode=1;
  }
  console.log("Esta consulta no autoriza migraciones ni concede permisos editoriales.");
}
if(require.main===module)main().catch(e=>{console.error("✗ "+e.message);process.exitCode=1;});
module.exports={compareLiveSynopses,selectLiveSynopses,QUERY};
