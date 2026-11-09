const test = require("node:test");
const assert = require("node:assert/strict");
const {
  parseArgs, validateBackupGate, assertBackupFile, quoteSqlIdentifier,
} = require("../scripts/backupLocalSql");

const env = {
  NODE_ENV: "development",
  DB_DATABASE: "CRUDPeliculas",
  DB_SERVER: "localhost", DB_USER: "example", DB_PASSWORD: "not-a-secret",
  CINERD_SQL_BACKUP_CONFIRM: "YES",
};
const request = { apply: true, confirm: true, database: "CRUDPeliculas",
  file: "D:\\SQLBackups\\CineRD-20990101-120000.bak" };

test("backup default es preview sin SQL ni archivos", () => {
  assert.deepEqual(validateBackupGate(parseArgs([]), {}), { mode: "PREVIEW" });
  assert.deepEqual(parseArgs(["--database", "CRUDPeliculas"]).apply, false);
});

test("backup no inicia sin opt-in, rol de entorno local y base exacta", () => {
  for (const [patch, envPatch] of [
    [{ confirm: false }, {}],
    [{}, { CINERD_SQL_BACKUP_CONFIRM: "" }],
    [{}, { NODE_ENV: "production" }],
    [{ database: "master" }, {}],
    [{ database: "OtraBase" }, {}],
    [{}, { DB_DATABASE: "OtraBase" }],
    [{}, { DB_PASSWORD: "" }],
    [{ file: "relative.bak" }, {}],
    [{ file: "D:\\backups\\archivo.txt" }, {}],
    [{ file: "\\\\server\\share\\abc.bak" }, {}],
  ]) {
    assert.throws(() => validateBackupGate({ ...request, ...patch }, { ...env, ...envPatch }),
      /Backup bloqueado|La base|Faltan|ruta absoluta|seguridad/i);
  }
});

test("ruta local Windows y protección ante nombres SQL maliciosos", () => {
  assert.equal(assertBackupFile("D:\\SQLBackups\\CineRD-20990101.bak"),
    "D:\\SQLBackups\\CineRD-20990101.bak");
  assert.equal(quoteSqlIdentifier("CineRD_Test"), "[CineRD_Test]");
  assert.equal(quoteSqlIdentifier("Safe]Id"), "[Safe]]Id]");
  assert.throws(() => quoteSqlIdentifier(""), /inválido/);
});

test("argumentos son explícitos y no permiten opción de restauración o destrucción", () => {
  assert.deepEqual(parseArgs([
    "--backup", "--confirm-backup", "--database", "CRUDPeliculas",
    "--file", "D:\\SQLBackups\\CineRD-20990101.bak",
  ]), { ...request, file:"D:\\SQLBackups\\CineRD-20990101.bak" });
  assert.throws(() => parseArgs(["--restore"]), /no admitido/);
  assert.throws(() => parseArgs(["--file"]), /Falta valor/);
});
