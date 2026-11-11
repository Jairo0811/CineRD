const fs = require("fs");
const path = require("path");
const sql = require("mssql");
require("dotenv").config();

const repoRoot = path.resolve(__dirname, "../..");
const migrationsDir = path.join(repoRoot, "database", "migrations");
const SYSTEM_DATABASES = new Set(["master", "model", "msdb", "tempdb"]);

const splitBatches = (content) =>
  content.split(/^\s*GO\s*;?\s*$/gim).map((item) => item.trim()).filter(Boolean);

// Keep the legacy safety guard for callers that explicitly parse a SQL script.
// Actual migration files must additionally contain NO USE statements.
const assertSafeDatabaseTarget = (content, configuredDatabase, file) => {
  const useInstructions = content.matchAll(/^\s*USE\s+(?:\[([^\]]+)\]|([A-Za-z0-9_]+))\s*;?\s*$/gim);
  for (const [, bracketName, plainName] of useInstructions) {
    const selected = bracketName || plainName;
    if (selected.toLowerCase() !== configuredDatabase.toLowerCase()) {
      throw new Error(
        `Migración bloqueada: ${file} selecciona USE ${selected} pero DB_DATABASE=${configuredDatabase}. ` +
        "No se ejecutó ningún lote: adapta la migración para la base prevista."
      );
    }
  }
};

const assertNoUseSwitch = (content, file) => {
  const active = content
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/--[^\r\n]*/g, "");
  if (/^\s*USE\b/gim.test(active)) {
    throw new Error(
      `Migración bloqueada: ${file} contiene USE. El destino debe fijarse por DB_DATABASE, ` +
      "sin cambiar el contexto de conexión."
    );
  }
};

const assertTargetDatabase = (configured, connected) => {
  if (!configured || SYSTEM_DATABASES.has(String(configured).trim().toLowerCase())) {
    throw new Error("DB_DATABASE debe apuntar a una base de aplicación, no a una base de sistema.");
  }
  if (connected !== undefined &&
      String(configured).trim().toLowerCase() !== String(connected).trim().toLowerCase()) {
    throw new Error(
      "Migración bloqueada: el nombre devuelto por DB_NAME() no coincide con DB_DATABASE."
    );
  }
};

function loadMigrations() {
  const files = fs.readdirSync(migrationsDir)
    .filter((name) => /^\d{3}_.*\.sql$/i.test(name)).sort();
  if (!files.length) throw new Error("No se encontraron migraciones SQL.");
  return files.map((file) => {
    const content = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    assertNoUseSwitch(content, file);
    const batches = splitBatches(content);
    if (!batches.length) throw new Error(`Migración vacía: ${file}`);
    return { file, content, batches };
  });
}

async function main(argv = process.argv.slice(2)) {
  if (argv.length > 1 || (argv.length === 1 && argv[0] !== "--check")) {
    throw new Error("Uso: node backend/scripts/migrate.js [--check]");
  }

  // Offline preflight never opens a DB connection, never reads secrets and never writes.
  const migrations = loadMigrations();
  if (argv.includes("--check")) {
    console.log(`✓ Preflight offline: ${migrations.length} migraciones sin USE, 0 cambios SQL.`);
    return;
  }

  const required = ["DB_USER", "DB_PASSWORD", "DB_SERVER", "DB_DATABASE"];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) throw new Error(`Faltan variables de base de datos: ${missing.join(", ")}`);
  assertTargetDatabase(process.env.DB_DATABASE);

  const pool = await new sql.ConnectionPool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    port: Number(process.env.DB_PORT || 1433),
    options: {
      encrypt: String(process.env.DB_ENCRYPT).toLowerCase() === "true",
      trustServerCertificate: String(process.env.DB_TRUST_CERT).toLowerCase() === "true",
    },
  }).connect();

  try {
    // Verify actual connection target BEFORE any DDL. No guessed database names.
    const result = await pool.request().query("SELECT DB_NAME() AS activeDatabase");
    assertTargetDatabase(process.env.DB_DATABASE, result.recordset?.[0]?.activeDatabase);
    for (const { file, batches } of migrations) {
      for (const batch of batches) await pool.request().batch(batch);
      console.log(`✓ Migración aplicada/idempotente: ${file}`);
    }
  } finally {
    await pool.close();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`✗ Migración fallida: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = {
  assertSafeDatabaseTarget, assertNoUseSwitch, assertTargetDatabase,
  splitBatches, loadMigrations, main,
};
