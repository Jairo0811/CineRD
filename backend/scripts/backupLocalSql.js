/**
 * CineRD — backup SQL Server local verificable.
 *
 * Vista previa, por defecto: node scripts/backupLocalSql.js
 * Creación deliberada: node scripts/backupLocalSql.js --backup
 *   --confirm-backup --database CRUDPeliculas --file "D:\SQLBackups\CineRD-2026-11-09.bak"
 *
 * BACKUP DATABASE es COPY_ONLY + CHECKSUM + NOINIT (nunca sobrescribe
 * los backup sets existentes). RESTORE VERIFYONLY comprueba legibilidad,
 * NO certifica una recuperación completa hasta ejecutar RESTORE en otra DB.
 * La ruta es del SERVIDOR SQL, no del equipo que abre el navegador.
 */
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "../..");

function assertBackupFile(filepath, { mustNotExist = false } = {}) {
  if (typeof filepath !== "string" || !filepath.trim() ||
      filepath.includes("\0") || !filepath.toLowerCase().endsWith(".bak") ||
      (!path.isAbsolute(filepath) && !path.win32.isAbsolute(filepath))) {
    throw new Error("Se requiere ruta absoluta a un archivo .bak");
  }
  if (!path.win32.isAbsolute(filepath) || filepath.startsWith("\\\\") ||
      filepath.startsWith("//")) {
    throw new Error("Por seguridad, usa una ruta absoluta local del servidor SQL, ej. D:\\SQLBackups\\CineRD-fecha.bak");
  }
  // La comparación de carpetas se hace en Windows; Linux CI solo analiza
  // la sintaxis de rutas Windows sin tocar el filesystem del usuario.
  if (process.platform === "win32") {
    const rel = path.relative(ROOT, path.resolve(filepath));
    if (rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel))) {
      throw new Error("El respaldo no puede guardarse dentro del repositorio");
    }
  }
  if (mustNotExist && fs.existsSync(filepath)) {
    throw new Error("El archivo ya existe: elige un nombre .bak nuevo para esta ejecución");
  }
  return filepath;
}

function parseArgs(argv) {
  const allowed = new Set(["--backup", "--confirm-backup", "--database", "--file"]);
  const options = { apply: false, confirm: false, database: null, file: null };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!allowed.has(arg)) throw new Error("Argumento no admitido: " + arg);
    if (arg === "--backup" || arg === "--confirm-backup") {
      if (arg === "--backup") options.apply = true;
      else options.confirm = true;
      continue;
    }
    const value = argv[++i];
    if (!value || value.startsWith("--")) throw new Error("Falta valor para " + arg);
    if (arg === "--database") options.database = value;
    if (arg === "--file") options.file = value;
  }
  return options;
}

function validateBackupGate(opts, env) {
  if (!opts.apply) return { mode: "PREVIEW" };
  if (!opts.confirm || env.CINERD_SQL_BACKUP_CONFIRM !== "YES" ||
      env.NODE_ENV === "production") {
    throw new Error("Backup bloqueado: falta confirmación explícita o NODE_ENV=production");
  }
  const expected = String(env.DB_DATABASE || "").trim();
  if (!expected || expected !== opts.database ||
      ["master", "model", "msdb", "tempdb"].includes(expected.toLowerCase())) {
    throw new Error("La base debe coincidir exactamente con DB_DATABASE y no ser de sistema");
  }
  if (!env.DB_SERVER || !env.DB_USER || !env.DB_PASSWORD) {
    throw new Error("Faltan credenciales locales SQL en backend/.env");
  }
  return { mode: "BACKUP", database: expected, file: assertBackupFile(opts.file, { mustNotExist: true }) };
}

function quoteSqlIdentifier(value) {
  if (typeof value !== "string" || !value || value.length > 128) throw new Error("Nombre de base inválido");
  return "[" + value.replace(/]/g, "]]") + "]";
}

async function runBackup(plan) {
  const { sql, poolPromise } = require("../src/config/db");
  const pool = await poolPromise;
  try {
  const db = await pool.request().query("SELECT DB_NAME() AS Nombre, DATABASEPROPERTYEX(DB_NAME(), 'Status') AS Estado");
  if (db.recordset[0]?.Nombre !== plan.database || db.recordset[0]?.Estado !== "ONLINE") {
    throw new Error("La conexión SQL no apunta a la base esperada y online");
  }

  // NOINIT añade un conjunto de backup sin destruir los anteriores.
  // Rechazar nombre existente en la PC local; la ruta debe ser accesible por
  // la cuenta del servicio SQL Server para que BACKUP no falle.
  const backupRequest = pool.request();
  backupRequest.timeout = 600000;
  await backupRequest
    .input("BackupPath", sql.NVarChar(4000), plan.file)
    .query("BACKUP DATABASE " + quoteSqlIdentifier(plan.database) +
      " TO DISK = @BackupPath WITH COPY_ONLY, CHECKSUM, NOINIT, STATS = 10");

  const headers = await pool.request()
    .input("BackupPath", sql.NVarChar(4000), plan.file)
    .query("RESTORE HEADERONLY FROM DISK = @BackupPath");
  const sets = headers.recordset || [];
  const last = sets[sets.length - 1];
  if (!last || last.DatabaseName !== plan.database || Number(last.BackupType) !== 1 ||
      !Number.isInteger(Number(last.Position)) || Number(last.Position) <= 0) {
    throw new Error("La cabecera del respaldo no corresponde a una copia completa de la base solicitada");
  }
  await pool.request()
    .input("BackupPath", sql.NVarChar(4000), plan.file)
    .input("BackupPosition", sql.Int, Number(last.Position))
    .query("RESTORE VERIFYONLY FROM DISK = @BackupPath WITH FILE = @BackupPosition, CHECKSUM");
  return { database: plan.database, verified: true, position: Number(last.Position),
    backupFile: plan.file, restoreTested: false };
  } finally {
    await pool.close();
  }
}

async function main(argv = process.argv.slice(2), env = process.env) {
  const opts = parseArgs(argv);
  const plan = validateBackupGate(opts, env);
  if (!opts.apply) {
    console.log("CineRD SQL — PREVIEW. No se conectó ni escribió nada.");
    console.log("Para respaldar: configura CINERD_SQL_BACKUP_CONFIRM=YES y usa " +
      "--backup --confirm-backup --database DB_DATABASE --file RUTA_NUEVA_ABSOLUTA.bak");
    console.log("La ruta debe existir PARA EL SERVICIO SQL y el .bak debe quedar fuera de Git.");
    return plan;
  }
  const report = await runBackup(plan);
  console.log(JSON.stringify({ status: "BACKUP_VERIFIED", ...report }, null, 2));
  console.log("PENDIENTE: probar una restauración real sobre una base aislada.");
  return report;
}

if (require.main === module) {
  require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
  main().catch(error => { console.error("CineRD SQL: " + error.message); process.exitCode = 1; });
}
module.exports = { parseArgs, validateBackupGate, quoteSqlIdentifier, assertBackupFile, runBackup, main };
