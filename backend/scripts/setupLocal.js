const fs = require("fs");
const path = require("path");
const sql = require("mssql");
const { spawnSync } = require("child_process");
require("dotenv").config();

const REPO_ROOT = path.resolve(__dirname, "../..");
const DATABASE_NAME = process.env.DB_DATABASE || "CRUDPeliculas";

const SQL_FILES = [
  path.join(REPO_ROOT, "CRUD-Peliculas.sql"),
  path.join(REPO_ROOT, "database", "migrations", "002_peliculas_metadatos.sql"),
  path.join(REPO_ROOT, "database", "migrations", "003_usuarios_roles_verificacion.sql"),
  path.join(REPO_ROOT, "database", "migrations", "004_actores_redes_sociales.sql"),
  path.join(REPO_ROOT, "database", "migrations", "005_verificacion_indices_activos.sql"),
  path.join(REPO_ROOT, "database", "migrations", "006_peliculas_traducciones.sql"),
];

function getConfig(database) {
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

function splitSqlBatches(content) {
  return content
    .split(/^\s*GO\s*;?\s*$/gim)
    .map((batch) => batch.trim())
    .filter(Boolean);
}

async function ensureDatabase() {
  const pool = await new sql.ConnectionPool(getConfig("master")).connect();
  try {
    await pool.request()
      .input("database", sql.NVarChar, DATABASE_NAME)
      .query(`
        IF DB_ID(@database) IS NULL
        BEGIN
          DECLARE @statement NVARCHAR(MAX) = N'CREATE DATABASE ' + QUOTENAME(@database);
          EXEC sp_executesql @statement;
        END
      `);
    console.log(`✓ Base de datos disponible: ${DATABASE_NAME}`);
  } finally {
    await pool.close();
  }
}

async function applySchema() {
  const pool = await new sql.ConnectionPool(getConfig(DATABASE_NAME)).connect();
  try {
    for (const file of SQL_FILES) {
      if (!fs.existsSync(file)) {
        throw new Error(`No se encontró el script requerido: ${path.relative(REPO_ROOT, file)}`);
      }

      const content = fs.readFileSync(file, "utf8");
      const batches = splitSqlBatches(content);
      for (const batch of batches) {
        await pool.request().batch(batch);
      }
      console.log(`✓ Aplicado: ${path.relative(REPO_ROOT, file)}`);
    }
  } finally {
    await pool.close();
  }
}

function importSnapshotIfPresent() {
  const snapshot = path.join(REPO_ROOT, "database", "seeds", "catalog.snapshot.json");
  if (!fs.existsSync(snapshot)) {
    console.log("ℹ No hay snapshot versionado todavía. Se creó únicamente el esquema.");
    console.log("  En la PC principal ejecuta: npm run catalog:export");
    return;
  }

  const script = path.join(__dirname, "importCatalog.js");
  const result = spawnSync(process.execPath, [script], {
    cwd: path.resolve(__dirname, ".."),
    stdio: "inherit",
    env: process.env,
  });

  if (result.status !== 0) {
    throw new Error("El esquema fue creado, pero la importación del catálogo no pudo completarse.");
  }
}

async function main() {
  if (!process.env.DB_SERVER || !process.env.DB_USER || !process.env.DB_PASSWORD) {
    throw new Error("Configura DB_SERVER, DB_USER y DB_PASSWORD en backend/.env antes de ejecutar setup:local.");
  }

  console.log("🎬 Preparando CineRD local...\n");
  await ensureDatabase();
  await applySchema();
  importSnapshotIfPresent();
  console.log("\n✓ CineRD local quedó preparado.");
}

main().catch((error) => {
  console.error("\n✗ Error preparando CineRD local:");
  console.error(error.message || error);
  process.exitCode = 1;
});
