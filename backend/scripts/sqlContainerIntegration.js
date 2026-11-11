"use strict";

/**
 * SQL Server 2022 ephemeral integration smoke test.
 * Runs ONLY within GitHub Actions CI, against a loopback port reserved for
 * a disposable SQL Server Developer Docker container.
 * Never accepts a database host or database name from the user.
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const sql = require("mssql");
const { splitBatches, main: migrate } = require("./migrate");

const HOST = "127.0.0.1";
const PORT = 14333;
const TARGET = "CineRD_CI_Staging";
const PASS = process.env.CINERD_SQL_CI_PASSWORD;

if (process.env.GITHUB_ACTIONS !== "true" || process.env.CINERD_EPHEMERAL_SQL_TEST !== "yes")
  throw new Error("SQL isolated smoke: solo puede ejecutarse en CI explícita.");
if (!PASS || PASS.length < 20) throw new Error("Falta contraseña efímera de SQL CI.");

const connectOptions = (database) => ({
  user: "sa",
  password: PASS,
  server: HOST,
  port: PORT,
  database,
  options: {
    encrypt: true,
    // Exception allowed ONLY for a disposable loopback self-signed SQL container.
    trustServerCertificate: true,
  },
  connectionTimeout: 4000,
  requestTimeout: 30000,
});

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function readyMaster() {
  let last = "unavailable";
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      const pool = await new sql.ConnectionPool(connectOptions("master")).connect();
      await pool.request().query("SELECT 1 AS ok");
      return pool;
    } catch (error) {
      last = error.code || error.name;
      await sleep(2000);
    }
  }
  throw new Error("Contenedor SQL no disponible tras intentos de conexión: " + last);
}

async function bootstrap(pool) {
  const content = fs.readFileSync(
    path.join(__dirname, "../../database/scripts/azure_schema_bootstrap.sql"), "utf8"
  );
  for (const batch of splitBatches(content)) await pool.request().batch(batch);
  console.log("✓ Bootstrap aislado aplicado: Actores, Peliculas, ActoresPeliculas.");
}

async function smokeDml(pool) {
  const transaction = new sql.Transaction(pool);
  await transaction.begin();
  try {
    const request = () => new sql.Request(transaction);
    const a = await request().query(
      "INSERT dbo.Actores (NombreCompleto, Sexo) OUTPUT INSERTED.Id " +
      "VALUES (N'CineRD CI Actor Sintetico', N'Otro');"
    );
    const p = await request().query(
      "INSERT dbo.Peliculas (Titulo, Genero, FechaEstreno) OUTPUT INSERTED.Id " +
      "VALUES (N'CineRD CI Pelicula Sintetica', N'Prueba', '2020-01-01');"
    );
    const actorId = a.recordset[0].Id;
    const filmId = p.recordset[0].Id;
    await request()
      .input("movie", sql.Int, filmId)
      .input("person", sql.Int, actorId)
      .query(
        "INSERT dbo.ActoresPeliculas (PeliculaId, ActorId, Personaje) " +
        "VALUES (@movie, @person, N'CI');"
      );
    const rows = await request()
      .input("movie", sql.Int, filmId)
      .input("person", sql.Int, actorId)
      .query(
        "SELECT COUNT(*) AS total FROM dbo.ActoresPeliculas " +
        "WHERE PeliculaId = @movie AND ActorId = @person"
      );
    assert.equal(rows.recordset[0].total, 1);
  } finally {
    await transaction.rollback();
  }
  const persisted = await pool.request().query(
    "SELECT COUNT(*) AS total FROM dbo.Peliculas WHERE Titulo = N'CineRD CI Pelicula Sintetica'"
  );
  assert.equal(persisted.recordset[0].total, 0);
  console.log("✓ Operaciones relacionales CRUD de prueba; transacción revertida.");
}

async function main() {
  const master = await readyMaster();
  try {
    const meta = await master.request().query(
      "SELECT CONVERT(NVARCHAR(100), SERVERPROPERTY('Edition')) AS edition, " +
      "DB_ID(N'CineRD_CI_Staging') AS existing"
    );
    const edition = meta.recordset[0].edition || "";
    assert.match(edition, /Developer/i, "Solo SQL Server Developer efímero");
    assert.equal(meta.recordset[0].existing, null, "La base de CI ya existía: abortar sin tocarla");
    await master.request().batch("CREATE DATABASE [CineRD_CI_Staging]");
    console.log("✓ Base efímera creada para esta ejecución CI.");
  } finally {
    await master.close();
  }

  const pool = await new sql.ConnectionPool(connectOptions(TARGET)).connect();
  try {
    const identity = await pool.request().query("SELECT DB_NAME() AS databaseName");
    assert.equal(identity.recordset[0].databaseName, TARGET);
    await bootstrap(pool);

    // These variables exist only inside the GitHub runner and are discarded.
    process.env.DB_SERVER = HOST;
    process.env.DB_PORT = String(PORT);
    process.env.DB_DATABASE = TARGET;
    process.env.DB_USER = "sa";
    process.env.DB_PASSWORD = PASS;
    process.env.DB_ENCRYPT = "true";
    process.env.DB_TRUST_CERT = "true";

    await migrate(["--check"]);
    await migrate([]);
    console.log("✓ Primera ejecución completa de 15 migraciones.");
    await migrate([]);
    console.log("✓ Segunda ejecución idempotente.");

    const count = await pool.request().query(
      "SELECT COUNT(*) AS total FROM sys.tables WHERE is_ms_shipped = 0"
    );
    assert.ok(count.recordset[0].total >= 6, "El esquema de la aplicación no se creó");
    await smokeDml(pool);
    console.log("✓ SQL Server 2022 integration PASS (solo DB efímera, sin datos reales).");
  } finally {
    await pool.close();
  }
}

main().catch(error => {
  console.error("✗ Falló la prueba aislada SQL:", error.message);
  process.exitCode = 1;
});
