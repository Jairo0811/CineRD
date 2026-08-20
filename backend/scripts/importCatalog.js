const fs = require("fs");
const path = require("path");
const sql = require("mssql");
require("dotenv").config();

const REPO_ROOT = path.resolve(__dirname, "../..");
const SNAPSHOT_DIR = path.join(REPO_ROOT, "database", "seeds");
const SNAPSHOT_FILE = path.join(SNAPSHOT_DIR, "catalog.snapshot.json");
const BACKUP_DIR = path.join(SNAPSHOT_DIR, "backups");

const INSERT_ORDER = [
  "Actores",
  "Peliculas",
  "ActoresPeliculas",
  "PeliculaCreditos",
  "PeliculaTraducciones",
];

const DELETE_ORDER = [...INSERT_ORDER].reverse();

function getConfig(database = process.env.DB_DATABASE) {
  return {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database,
    options: {
      encrypt: String(process.env.DB_ENCRYPT).toLowerCase() === "true",
      trustServerCertificate: String(process.env.DB_TRUST_CERT ?? "true").toLowerCase() !== "false",
    },
  };
}

function quoteIdentifier(value) {
  return `[${String(value).replace(/]/g, "]]" )}]`;
}

function toSqlLiteral(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "boolean") return value ? "1" : "0";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error(`Valor numérico inválido: ${value}`);
    return String(value);
  }
  return `N'${String(value).replace(/'/g, "''")}'`;
}

async function tableExists(connection, table) {
  const request = connection instanceof sql.Transaction ? new sql.Request(connection) : connection.request();
  const result = await request
    .input("table", sql.NVarChar, table)
    .query("SELECT CASE WHEN OBJECT_ID(N'dbo.' + @table, N'U') IS NULL THEN 0 ELSE 1 END AS Existe");
  return Boolean(result.recordset[0]?.Existe);
}

async function getIdentityColumn(transaction, table) {
  const request = new sql.Request(transaction);
  const result = await request
    .input("table", sql.NVarChar, table)
    .query(`SELECT TOP 1 c.name AS Nombre FROM sys.identity_columns c WHERE c.object_id = OBJECT_ID(N'dbo.' + @table)`);
  return result.recordset[0]?.Nombre || null;
}

async function countRows(pool, table) {
  if (!(await tableExists(pool, table))) return 0;
  const result = await pool.request().query(`SELECT COUNT_BIG(1) AS Total FROM dbo.${quoteIdentifier(table)}`);
  return Number(result.recordset[0]?.Total || 0);
}

async function backupExistingCatalog(pool) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const tables = {};
  for (const table of INSERT_ORDER) {
    if (!(await tableExists(pool, table))) {
      tables[table] = [];
      continue;
    }
    const result = await pool.request().query(`SELECT * FROM dbo.${quoteIdentifier(table)}`);
    tables[table] = result.recordset;
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const file = path.join(BACKUP_DIR, `catalog.backup.${stamp}.json`);
  fs.writeFileSync(file, `${JSON.stringify({
    format: "CineRD.CatalogBackup",
    version: 1,
    generatedAtUtc: new Date().toISOString(),
    sourceDatabase: process.env.DB_DATABASE,
    tables,
  }, null, 2)}\n`, "utf8");
  console.log(`✓ Backup previo creado: ${path.relative(REPO_ROOT, file)}`);
}

async function deleteExistingCatalog(transaction) {
  for (const table of DELETE_ORDER) {
    if (!(await tableExists(transaction, table))) continue;
    await new sql.Request(transaction).query(`DELETE FROM dbo.${quoteIdentifier(table)}`);
  }
}

async function insertRows(transaction, table, rows) {
  if (!rows.length || !(await tableExists(transaction, table))) return;
  const columns = Object.keys(rows[0]);
  const identityColumn = await getIdentityColumn(transaction, table);
  const shouldEnableIdentity = identityColumn && columns.includes(identityColumn);
  const qualifiedTable = `dbo.${quoteIdentifier(table)}`;

  if (shouldEnableIdentity) await new sql.Request(transaction).query(`SET IDENTITY_INSERT ${qualifiedTable} ON`);
  try {
    for (const row of rows) {
      const rowColumns = Object.keys(row);
      const names = rowColumns.map(quoteIdentifier).join(", ");
      const values = rowColumns.map((column) => toSqlLiteral(row[column])).join(", ");
      await new sql.Request(transaction).query(`INSERT INTO ${qualifiedTable} (${names}) VALUES (${values})`);
    }
  } finally {
    if (shouldEnableIdentity) await new sql.Request(transaction).query(`SET IDENTITY_INSERT ${qualifiedTable} OFF`);
  }
}

async function main() {
  if (!fs.existsSync(SNAPSHOT_FILE)) {
    throw new Error("No existe database/seeds/catalog.snapshot.json. Ejecuta primero npm run catalog:export en la PC que tiene el catálogo completo.");
  }
  if (!process.env.DB_SERVER || !process.env.DB_DATABASE) {
    throw new Error("Configura DB_SERVER y DB_DATABASE en backend/.env antes de importar el catálogo.");
  }

  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_FILE, "utf8"));
  if (snapshot.format !== "CineRD.CatalogSnapshot") throw new Error("El archivo de snapshot no corresponde al formato de CineRD.");

  const pool = await new sql.ConnectionPool(getConfig()).connect();
  const replace = process.argv.includes("--replace");

  try {
    const existingActors = await countRows(pool, "Actores");
    const existingMovies = await countRows(pool, "Peliculas");
    if ((existingActors > 0 || existingMovies > 0) && !replace) {
      throw new Error(`La base ya contiene datos (${existingActors} talentos, ${existingMovies} películas). Usa npm run catalog:import:replace solo si deseas reemplazar el catálogo local.`);
    }

    if (replace && (existingActors > 0 || existingMovies > 0)) await backupExistingCatalog(pool);

    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    try {
      if (replace) await deleteExistingCatalog(transaction);

      for (const table of INSERT_ORDER) {
        const rows = snapshot.tables?.[table] || [];
        await insertRows(transaction, table, rows);
        console.log(`✓ ${table}: ${rows.length} registro(s) importado(s)`);
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

    const missingMedia = snapshot.media?.missing || [];
    if (missingMedia.length) console.warn(`⚠ El snapshot reporta ${missingMedia.length} archivo(s) multimedia faltante(s) en la PC de origen.`);

    console.log("\n✓ Catálogo de CineRD restaurado correctamente.");
    console.log("✓ Las imágenes se sirven desde backend/uploads, que debe estar sincronizado mediante Git.");
  } finally {
    await pool.close();
  }
}

main().catch((error) => {
  console.error("\n✗ No se pudo importar el catálogo:");
  console.error(error.message || error);
  process.exitCode = 1;
});
