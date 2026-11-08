/**
 * CineRD E-4 — read-only verification against the ACTUAL SQL Server catalog.
 *
 * No UPDATE/INSERT/DELETE/DDL, no backup creation, no approval mutation.
 * This does not authorize applying any correction.
 */
const sql = require("mssql");
const path = require("node:path");
require("dotenv").config({ path: path.resolve(__dirname,"../.env") });
const fs = require("node:fs");
const root = path.resolve(__dirname,"../..");
const { validate, compared, normalize } = require("./applyEditorialCorrections");

const read = rel => JSON.parse(fs.readFileSync(path.join(root,rel),"utf8"));

function compareLiveRecords(rows, records) {
  if (!Array.isArray(rows) || !Array.isArray(records)) throw Error("Datos de consulta E-4 invalidos");
  const groups = new Map();
  for (const record of records) {
    if (!record || !Number.isInteger(Number(record.Id))) throw Error("Fila SQL invalida");
    const id=Number(record.Id);
    if(groups.has(id))throw Error("Identificador SQL duplicado: "+id);
    groups.set(id,record);
  }
  const items = [];
  for (const row of rows) {
    const actual=groups.get(Number(row.filmId));
    let status, value=null, description;
    if(!actual) {
      status="MISSING";description="Película ausente en SQL Server";
    } else if(normalize(actual.Titulo)!==normalize(row.title)) {
      status="DRIFT";description="Título de la película cambió";
      value=actual[row.field];
    } else {
      value=actual[row.field];
      const current=compared(row.field,value);
      if(current===compared(row.field,row.expected)) {
        status="EXPECTED";description="Coincide con la preimagen; falta decisión humana";
      } else if(current===compared(row.field,row.proposed)) {
        status="ALREADY";description="SQL ya contiene el valor propuesto; no reaplicar";
      } else {
        status="DRIFT";description="SQL difiere del valor anterior y del propuesto";
      }
    }
    items.push({
      filmId:row.filmId,title:row.title,field:row.field,
      expected:row.expected,proposed:row.proposed,
      current:value instanceof Date?value.toISOString().slice(0,10):value,
      status,description
    });
  }
  const counts=Object.fromEntries(["EXPECTED","ALREADY","DRIFT","MISSING"].map(s=>[
    s,items.filter(item=>item.status===s).length]));
  return {databaseRows:groups.size,items,counts,hasDrift:counts.DRIFT>0||counts.MISSING>0||counts.ALREADY>0};
}

async function readLiveMovies(pool, ids) {
  const results=[];
  for (const id of ids) {
    if(!Number.isInteger(id) || id<1)throw Error("ID no seguro");
    // A static, parameterized SELECT; no SQL mutation.
    const found=await pool.request().input("id",sql.Int,id)
      .query("SELECT Id,Titulo,Genero,Director,FechaEstreno FROM dbo.Peliculas WHERE Id=@id");
    if(!Array.isArray(found.recordset))throw Error("Respuesta SQL invalida");
    results.push(...found.recordset);
  }
  return results;
}

async function main() {
  const snapshot=read("database/seeds/catalog.snapshot.json");
  const ledger=read("docs/catalog-corrections-e4.json");
  const rows=validate(ledger,snapshot);
  if(!process.env.DB_DATABASE || process.env.DB_DATABASE!==snapshot.sourceDatabase)
    throw Error("DB_DATABASE no coincide con la base del snapshot; no se consultará SQL");
  for(const key of ["DB_SERVER","DB_USER","DB_PASSWORD"]) {
    if(!process.env[key])throw Error("Falta configurar "+key+" en backend/.env");
  }
  const pool=new sql.ConnectionPool({
    server:process.env.DB_SERVER,
    database:process.env.DB_DATABASE,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    port:Number(process.env.DB_PORT||1433),
    options:{
      encrypt:process.env.DB_ENCRYPT==="true",
      trustServerCertificate:process.env.DB_TRUST_CERT!=="false"
    },
    // SQL Server only receives static SELECT statements.
    requestTimeout:15000
  });
  await pool.connect();
  let report;
  try {
    const ids=[...new Set(rows.map(r=>r.filmId))];
    const records=await readLiveMovies(pool,ids);
    report=compareLiveRecords(rows,records);
  } finally {
    await pool.close();
  }
  console.log("CineRD E-4 / consulta SQL Server (SOLO LECTURA)");
  console.log("Base: "+snapshot.sourceDatabase+"; campos inspeccionados: "+report.items.length);
  for(const i of report.items) {
    const val=x=>x===null?"NULL":String(x);
    console.log("  ["+i.status+"] #"+i.filmId+" "+i.title+" / "+i.field+
      ": SQL="+val(i.current)+" | snapshot="+val(i.expected)+" | propuesto="+val(i.proposed));
  }
  const c=report.counts;
  console.log("Resultado: "+c.EXPECTED+" sin cambios; "+c.ALREADY+
    " ya propuestos; "+c.DRIFT+" distintos; "+c.MISSING+" ausentes.");
  if(report.hasDrift) {
    console.error("✗ SQL no coincide completamente con la preimagen E-4. No ejecutar la actualización sin revisar.");
    process.exitCode=1;
  } else {
    console.log("✓ Lectura terminada. No se modificó SQL ni se autorizaron correcciones.");
    if(c.ALREADY>0)
      console.log("⚠ Parte del catálogo ya difiere de la preimagen. La aplicación E-4 actual fallará y debe replantearse antes de proceder.");
  }
}
if(require.main===module)main().catch(e=>{console.error("✗ "+e.message);process.exitCode=1;});
module.exports={compareLiveRecords,readLiveMovies};
