const test = require("node:test");
const assert = require("node:assert/strict");
const { assertSafeDatabaseTarget } = require("../scripts/migrate");

test("migrador bloquea un USE de la base principal al operar sobre la copia E2E", () => {
  assert.throws(
    () => assertSafeDatabaseTarget("USE CRUDPeliculas;\nGO\nSELECT 1;", "CRUDPeliculas_E2E", "015_account_security.sql"),
    /Migración bloqueada/
  );
});

test("migrador acepta USE de la base configurada y nombres entre corchetes", () => {
  assert.doesNotThrow(() => assertSafeDatabaseTarget("USE [CRUDPeliculas_E2E];\nGO", "CRUDPeliculas_E2E", "test.sql"));
  assert.doesNotThrow(() => assertSafeDatabaseTarget("USE CRUDPeliculas;\nGO", "CRUDPeliculas", "test.sql"));
});

test("migrador acepta una migracion sin cambios de base", () => {
  assert.doesNotThrow(() => assertSafeDatabaseTarget(
    "IF COL_LENGTH(N'dbo.Usuarios', N'SesionVersion') IS NULL\n ALTER TABLE dbo.Usuarios ADD SesionVersion INT DEFAULT 1;",
    "CRUDPeliculas_E2E",
    "016_sesion_version.sql"
  ));
});
