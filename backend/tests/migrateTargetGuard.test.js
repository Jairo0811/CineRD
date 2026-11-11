const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  assertSafeDatabaseTarget, assertNoUseSwitch, assertTargetDatabase,
  loadMigrations, splitBatches, main
} = require("../scripts/migrate");

test("migrador bloquea un USE de la base principal al operar sobre la copia E2E", () => {
  assert.throws(
    () => assertSafeDatabaseTarget("USE CRUDPeliculas;\nGO\nSELECT 1;", "CRUDPeliculas_E2E", "015_account_security.sql"),
    /Migración bloqueada/
  );
});

test("guardia de legado acepta USE solo para base configurada, pero preflight rechaza cualquier USE", () => {
  assert.doesNotThrow(() => assertSafeDatabaseTarget("USE [CRUDPeliculas_E2E];\nGO", "CRUDPeliculas_E2E", "test.sql"));
  assert.doesNotThrow(() => assertSafeDatabaseTarget("USE CRUDPeliculas;\nGO", "CRUDPeliculas", "test.sql"));
  assert.throws(() => assertNoUseSwitch("USE CRUDPeliculas;\nGO", "test.sql"), /contiene USE/);
  assert.throws(() => assertNoUseSwitch("USE [master];\nGO", "test.sql"), /contiene USE/);
  assert.doesNotThrow(() => assertNoUseSwitch("-- USE master;\n/* USE msdb; */\nSELECT 1;", "comment.sql"));
});

test("migrador admite migraciones de esquema sin cambiar el contexto", () => {
  assert.doesNotThrow(() => assertSafeDatabaseTarget(
    "IF COL_LENGTH(N'dbo.Usuarios', N'SesionVersion') IS NULL\n ALTER TABLE dbo.Usuarios ADD SesionVersion INT DEFAULT 1;",
    "CRUDPeliculas_E2E", "016_sesion_version.sql"
  ));
});

test("auditoría offline comprueba las 15 migraciones reales sin conectar a SQL", async () => {
  const items=loadMigrations();
  assert.equal(items.length,15);
  for(const item of items) {
    assert.ok(item.batches.length>0);
    assert.doesNotThrow(()=>assertNoUseSwitch(item.content,item.file));
  }
  await assert.doesNotReject(()=>main(["--check"]));
});

test("migrador bloquea bases de sistema y divergencia DB_NAME antes de DDL", () => {
  for(const name of ["master","tempdb","model","msdb","MASTER"])
    assert.throws(()=>assertTargetDatabase(name),/base de sistema/);
  assert.doesNotThrow(()=>assertTargetDatabase("CRUDPeliculas_E2E","CRUDPeliculas_E2E"));
  assert.doesNotThrow(()=>assertTargetDatabase("CineRD_Staging","cinerd_staging"));
  assert.throws(()=>assertTargetDatabase("CineRD_Staging","CRUDPeliculas"),/DB_NAME/);
  assert.throws(()=>assertTargetDatabase("",""),/base de sistema/);
});

test("no hay opciones de ejecución silenciosa ni scripts vacíos", async () => {
  await assert.rejects(()=>main(["--apply"]),/Uso:/);
  await assert.rejects(()=>main(["--check","--apply"]),/Uso:/);
  assert.deepEqual(splitBatches("GO\n SELECT 1;\nGO\n SELECT 2;\nGO"),["SELECT 1;","SELECT 2;"]);
});

test("login local corregido tiene un CREATE LOGIN y no autoriza Azure ni secretos literales",()=>{
  const script=fs.readFileSync(path.join(__dirname,"../../Login-CRUD-Peliculas.sql"),"utf8");
  assert.equal((script.match(/CREATE LOGIN \[crud_peliculas_user\]/g)||[]).length,1);
  assert.ok(script.includes("CINERD_DB_PASSWORD"));
  assert.ok(script.includes("solo SQL Server LOCAL"));
  assert.ok(script.includes("CHECK_POLICY = ON"));
  assert.ok(script.includes("THROW 51001"));
  assert.match(script,/QUOTENAME\(@password, NCHAR\(39\)\)/);
  assert.doesNotMatch(script,/^\s*CREATE LOGIN \[crud_peliculas_user\] WITH PASSWORD = N\x27[^\$]/im);
});
