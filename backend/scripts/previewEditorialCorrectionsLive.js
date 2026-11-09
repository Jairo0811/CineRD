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
  const hasDrift=counts.DRIFT>0||counts.MISSING>0;
  const allAlready=items.length>0 && counts.ALREADY===items.length;
  const partial=counts.ALREADY>0 && !allAlready;
  return {
    databaseRows:groups.size,items,counts,hasDrift,allAlready,partial,
    unsafeToApply:hasDrift||counts.ALREADY>0
  };
}

/**
 * Compare the CURRENT versioned snapshot against live SQL values.
 * Expected historical values in the E-4 ledger are NOT the snapshot.
 * No changes are made to either source.
 */
function compareSnapshotToLive(report, snapshot) {
  if(!report || !Array.isArray(report.items) || !Array.isArray(snapshot?.tables?.Peliculas))
    throw Error("Datos insuficientes para contraste SQL/snapshot");
  const films=new Map(snapshot.tables.Peliculas.map(f=>[Number(f.Id),f]));
  const items=report.items.map(i=>{
    const film=films.get(Number(i.filmId));
    const snapshotCurrent=film?compared(i.field,film[i.field]):null;
    const sqlCurrent=i.status==="MISSING"?null:compared(i.field,i.current);
    const identityOk=Boolean(film && normalize(film.Titulo)===normalize(i.title));
    const match=identityOk && i.status!=="MISSING" && i.status!=="DRIFT" &&
      snapshotCurrent===sqlCurrent;
    return {...i,snapshotCurrent,match};
  });
  return {
    items,
    matched:items.filter(i=>i.match).length,
    mismatched:items.filter(i=>!i.match).length,
    allAligned:items.length>0&&items.every(i=>i.match)
  };
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
  const alignment=compareSnapshotToLive(report,snapshot);
  console.log("CineRD E-4 / consulta SQL Server (SOLO LECTURA)");
  console.log("Base: "+snapshot.sourceDatabase+"; campos inspeccionados: "+report.items.length);
  for(const i of alignment.items) {
    const val=x=>x===null?"NULL":String(x);
    console.log("  ["+i.status+"] #"+i.filmId+" "+i.title+" / "+i.field+
      ": SQL="+val(i.current)+" | snapshot_actual="+val(i.snapshotCurrent)+
      " | anterior_E4="+val(i.expected)+" | propuesto="+val(i.proposed)+
      " | coinciden="+(i.match?"SI":"NO"));
  }
  console.log("Alineación SQL/snapshot: "+alignment.matched+"/"+alignment.items.length+" campos coincidentes.");
  const c=report.counts;
  console.log("Resultado: "+c.EXPECTED+" sin cambios; "+c.ALREADY+
    " ya propuestos; "+c.DRIFT+" distintos; "+c.MISSING+" ausentes.");
  if(report.hasDrift) {
    console.error("✗ Hay campos inesperados o películas ausentes en SQL. Revisar antes de sincronizar.");
    process.exitCode=1;
  } else if(!alignment.allAligned) {
    console.error("✗ SQL Server y snapshot no coinciden en "+alignment.mismatched+" campos E-4. Revisar diferencias; no aplicar ni reexportar automáticamente.");
    process.exitCode=1;
  } else if(report.allAlready) {
    console.log("✓ Los 7 cambios E-4 YA ESTÁN en SQL Server Y en el snapshot versionado. No ejecutar catalog:corrections:apply.");
    console.log("✓ No hace falta reexportar para estos 7 campos. Las aprobaciones humanas E-4 siguen pendientes de documentar.");
    console.log("Esta comprobación no concede ni registra aprobaciones humanas.");
  } else if(report.partial) {
    console.error("✗ E-4 parcialmente aplicado en SQL. No ejecutar el lote completo ni exportar sin revisar diferencias.");
    process.exitCode=1;
  } else {
    console.log("✓ SQL contiene los valores originales; las correcciones siguen pendientes y requieren aprobaciones humanas.");
    console.log("No se modificó SQL ni se autorizó ninguna corrección.");
  }
}
if(require.main===module)main().catch(e=>{console.error("✗ "+e.message);process.exitCode=1;});
module.exports={compareLiveRecords,compareSnapshotToLive,readLiveMovies};
