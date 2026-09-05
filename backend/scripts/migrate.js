const fs = require("fs");
const path = require("path");
const sql = require("mssql");
require("dotenv").config();

const repoRoot = path.resolve(__dirname, "../..");
const migrationsDir = path.join(repoRoot, "database", "migrations");

const splitBatches = (content) => content.split(/^\s*GO\s*;?\s*$/gim).map((item) => item.trim()).filter(Boolean);

async function main() {
  const required = ["DB_USER", "DB_PASSWORD", "DB_SERVER", "DB_DATABASE"];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) throw new Error(`Faltan variables de base de datos: ${missing.join(", ")}`);

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
    const files = fs.readdirSync(migrationsDir).filter((name) => /^\d{3}_.*\.sql$/i.test(name)).sort();
    for (const file of files) {
      const content = fs.readFileSync(path.join(migrationsDir, file), "utf8");
      for (const batch of splitBatches(content)) await pool.request().batch(batch);
      console.log(`✓ Migración aplicada/idempotente: ${file}`);
    }
  } finally {
    await pool.close();
  }
}

main().catch((error) => {
  console.error(`✗ Migración fallida: ${error.message}`);
  process.exitCode = 1;
});
