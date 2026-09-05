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
  path.join(REPO_ROOT, "database", "migrations", "007_pelicula_creditos.sql"),
  path.join(REPO_ROOT, "database", "migrations", "008_solicitudes_creditos.sql"),
  path.join(REPO_ROOT, "database", "migrations", "009_premios_nominaciones.sql"),
  path.join(REPO_ROOT, "database", "migrations", "010_galerias_multimedia.sql"),
  path.join(REPO_ROOT, "database", "migrations", "011_galeria_trailers_youtube.sql"),
  path.join(REPO_ROOT, "database", "migrations", "012_galeria_musica_spotify.sql"),
  path.join(REPO_ROOT, "database", "migrations", "013_galeria_musica_youtube.sql"),
  path.join(REPO_ROOT, "database", "migrations", "014_creditos_profesionales_casting.sql"),
  path.join(REPO_ROOT, "database", "migrations", "015_account_security.sql"),
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
  return content.split(/^\s*GO\s*;?\s*$/gim).map((batch) => batch.trim()).filter(Boolean);
}

async function ensureDatabase() {
  const pool = await new sql.ConnectionPool(getConfig("master")).connect();
  try {
    await pool.request().input("database", sql.NVarChar, DATABASE_NAME).query(`
      IF DB_ID(@database) IS NULL
      BEGIN
        DECLARE @statement NVARCHAR(MAX) = N'CREATE DATABASE ' + QUOTENAME(@database);
        EXEC sp_executesql @statement;
      END
    `);
    console.log(`✓ Base de datos disponible: ${DATABASE_NAME}`);
  } finally { await pool.close(); }
}

async function applySchema() {
  const pool = await new sql.ConnectionPool(getConfig(DATABASE_NAME)).connect();
  try {
    for (const file of SQL_FILES) {
      if (!fs.existsSync(file)) throw new Error(`No se encontró el script requerido: ${path.relative(REPO_ROOT, file)}`);
      const content = fs.readFileSync(file, "utf8");
      for (const batch of splitSqlBatches(content)) await pool.request().batch(batch);
      console.log(`✓ Aplicado: ${path.relative(REPO_ROOT, file)}`);
    }
  } finally { await pool.close(); }
}

async function getCatalogCounts() {
  const pool = await new sql.ConnectionPool(getConfig(DATABASE_NAME)).connect();
  try {
    const result = await pool.request().query(`SELECT (SELECT COUNT(*) FROM dbo.Actores) AS Talentos, (SELECT COUNT(*) FROM dbo.Peliculas) AS Peliculas;`);
    const row = result.recordset[0] || {};
    return { talentos: Number(row.Talentos || 0), peliculas: Number(row.Peliculas || 0) };
  } finally { await pool.close(); }
}

async function importSnapshotIfPresent() {
  const snapshot = path.join(REPO_ROOT, "database", "seeds", "catalog.snapshot.json");
  if (!fs.existsSync(snapshot)) {
    console.log("ℹ No hay snapshot versionado todavía. Se creó únicamente el esquema.");
    console.log("  En la PC principal ejecuta: npm run catalog:export");
    return;
  }
  const counts = await getCatalogCounts();
  if (counts.talentos > 0 || counts.peliculas > 0) {
    console.log(`ℹ Catálogo local existente detectado (${counts.talentos} talentos, ${counts.peliculas} películas).`);
    console.log("  Se omite la importación del snapshot para preservar los datos locales.");
    console.log("  Usa npm run catalog:import:replace únicamente si deseas reemplazarlos explícitamente.");
    return;
  }
  const validator = path.join(__dirname, "validateCatalog.js");
  const validationResult = spawnSync(process.execPath, [validator], { cwd: path.resolve(__dirname, ".."), stdio: "inherit", env: process.env });
  if (validationResult.status !== 0) throw new Error("El snapshot existe, pero falló la validación de integridad. No se importó ningún dato.");
  const script = path.join(__dirname, "importCatalog.js");
  const result = spawnSync(process.execPath, [script], { cwd: path.resolve(__dirname, ".."), stdio: "inherit", env: process.env });
  if (result.status !== 0) throw new Error("El esquema fue creado, pero la importación del catálogo no pudo completarse.");
}

async function main() {
  if (!process.env.DB_SERVER || !process.env.DB_USER || !process.env.DB_PASSWORD) throw new Error("Configura DB_SERVER, DB_USER y DB_PASSWORD en backend/.env antes de ejecutar setup:local.");
  console.log("🎬 Preparando CineRD local...\n");
  await ensureDatabase();
  await applySchema();
  await importSnapshotIfPresent();
  console.log("\n✓ CineRD local quedó preparado.");
}

main().catch((error) => {
  console.error("\n✗ Error preparando CineRD local:");
  console.error(error.message || error);
  process.exitCode = 1;
});
