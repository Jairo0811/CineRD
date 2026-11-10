const fs = require("fs");
const path = require("path");
const sql = require("mssql");
require("dotenv").config();

const repoRoot = path.resolve(__dirname, "../..");
const migrationsDir = path.join(repoRoot, "database", "migrations");

const splitBatches = (content) => content.split(/^\s*GO\s*;?\s*$/gim).map((item) => item.trim()).filter(Boolean);

// Reject USE instructions that would silently redirect migrations to another
// database (especially dangerous when DB_DATABASE is an isolated E2E copy).
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

async function main() {
  const required = ["DB_USER", "DB_PASSWORD", "DB_SERVER", "DB_DATABASE"];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) throw new Error(`Faltan variables de base de datos: ${missing.join(", ")}`);

  // Inspect ALL files before opening SQL or running any batch; otherwise an
  // earlier migration could already have been applied to the wrong database.
  const files = fs.readdirSync(migrationsDir).filter((name) => /^\d{3}_.*\.sql$/i.test(name)).sort();
  for (const file of files) {
    const content = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    assertSafeDatabaseTarget(content, process.env.DB_DATABASE, file);
  }

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
    for (const file of files) {
      const content = fs.readFileSync(path.join(migrationsDir, file), "utf8");
      for (const batch of splitBatches(content)) await pool.request().batch(batch);
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

module.exports = { assertSafeDatabaseTarget, splitBatches, main };
