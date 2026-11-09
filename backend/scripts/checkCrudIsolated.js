/**
 * CineRD CRUD transaccional en base AISLADA (nunca CRUDPeliculas principal).
 *
 * Vista previa: node scripts/checkCrudIsolated.js
 * Prueba real:    CINERD_E2E_CONFIRM=CRUDPeliculas_E2E
 *                 node scripts/checkCrudIsolated.js --run
 *                   --confirm-isolated-db CRUDPeliculas_E2E
 *
 * Requisito: backend/.env debe apuntar a DB_DATABASE=CRUDPeliculas_E2E.
 * Preparar primero una copia aislada mediante SSMS y verificar el nombre.
 * El script realiza escrituras DENTRO de una transacción y ROLLBACK SIEMPRE.
 * No prueba endpoints HTTP, permisos ni correo; para roles hay otra suite.
 */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const ROOT = path.resolve(__dirname, "../..");
const SNAPSHOT = path.join(ROOT,"database/seeds/catalog.snapshot.json");

function requireIsolatedDatabase({ argv, env, sourceDatabase } = {}) {
  if (!argv?.includes("--run")) {
    if (argv?.length) throw new Error("Parámetros inválidos: usa --run --confirm-isolated-db NOMBRE");
    return { mode: "PREVIEW" };
  }
  if (argv.length !== 3 || argv[0] !== "--run" || argv[1] !== "--confirm-isolated-db") {
    throw new Error("Falta confirmación: --run --confirm-isolated-db CRUDPeliculas_E2E");
  }
  const expected = argv[2];
  if (!/^CRUDPeliculas_E2E(?:_[A-Za-z0-9]+)?$/i.test(expected) ||
      !env.DB_DATABASE || env.DB_DATABASE !== expected || expected === sourceDatabase ||
      env.CINERD_E2E_CONFIRM !== expected || env.NODE_ENV === "production") {
    throw new Error("Protección E2E: DB_DATABASE y CINERD_E2E_CONFIRM deben coincidir con una base *_E2E aislada");
  }
  return { mode: "ROLLBACK_E2E", database: expected };
}

async function runIsolatedCrud(plan, { getDb = () => require("../src/config/db") } = {}) {
  if (plan.mode !== "ROLLBACK_E2E") throw new Error("No se permiten escrituras sin gate E2E");
  const { sql, poolPromise } = getDb();
  const pool = await poolPromise;
  const identity = await pool.request().query("SELECT DB_NAME() AS Nombre");
  if (identity.recordset[0]?.Nombre !== plan.database) {
    throw new Error("El pool apunta a otra base: la prueba E2E se cancela");
  }
  const tx = new sql.Transaction(pool);
  let started = false;
  const suffix = crypto.randomUUID().slice(0,12);
  const checks = [];
  const request = () => new sql.Request(tx);
  const expectOne = (result,label) => {
    if (result.recordset?.length !== 1) throw new Error("No se encontró una fila: " + label);
    checks.push(label);
    return result.recordset[0];
  };
  try {
    await tx.begin(sql.ISOLATION_LEVEL.READ_COMMITTED);
    started = true;

    const actor = expectOne(await request()
      .input("Nombres",sql.NVarChar(150),"E2E")
      .input("NombreCompleto",sql.NVarChar(150),"CineRD E2E "+suffix)
      .input("Sexo",sql.NVarChar(20),"Masculino")
      .query("INSERT INTO dbo.Actores (Nombres,NombreCompleto,Sexo,EstaVivo) OUTPUT INSERTED.Id VALUES (@Nombres,@NombreCompleto,@Sexo,1)"),"crear talento");

    const film = expectOne(await request()
      .input("Titulo",sql.NVarChar(150),"CineRD E2E "+suffix)
      .input("Genero",sql.NVarChar(80),"Drama")
      .input("FechaEstreno",sql.Date,new Date("2020-01-02T00:00:00Z"))
      .query("INSERT INTO dbo.Peliculas (Titulo,Genero,FechaEstreno) OUTPUT INSERTED.Id VALUES (@Titulo,@Genero,@FechaEstreno)"),"crear película");

    const updatedActor = expectOne(await request()
      .input("Id",sql.Int,actor.Id)
      .query("UPDATE dbo.Actores SET Profesion=N'Actor' OUTPUT INSERTED.Id,INSERTED.Profesion WHERE Id=@Id"),"editar talento");
    if (updatedActor.Profesion !== "Actor") throw new Error("No persistió la edición del talento");

    const updatedFilm = expectOne(await request()
      .input("Id",sql.Int,film.Id)
      .query("UPDATE dbo.Peliculas SET Genero=N'Comedia' OUTPUT INSERTED.Id,INSERTED.Genero WHERE Id=@Id"),"editar película");
    if (updatedFilm.Genero !== "Comedia") throw new Error("No persistió la edición de película");

    expectOne(await request()
      .input("PeliculaId",sql.Int,film.Id).input("ActorId",sql.Int,actor.Id)
      .query("INSERT INTO dbo.ActoresPeliculas (PeliculaId,ActorId,TipoParticipacion,Personaje) OUTPUT INSERTED.PeliculaId,INSERTED.ActorId VALUES (@PeliculaId,@ActorId,N'Reparto',N'E2E')"),"crear reparto");

    expectOne(await request()
      .input("PeliculaId",sql.Int,film.Id).input("ActorId",sql.Int,actor.Id)
      .query("INSERT INTO dbo.PeliculaCreditos (PeliculaId,ActorId,TipoCredito) OUTPUT INSERTED.Id VALUES (@PeliculaId,@ActorId,N'ACTOR')"),"crear crédito");

    const gallery = expectOne(await request()
      .input("PeliculaId",sql.Int,film.Id)
      .input("Archivo",sql.NVarChar(300),"/uploads/galerias/e2e-no-publicar-"+suffix+".webp")
      .query("INSERT INTO dbo.GaleriaMultimedia (PeliculaId,Tipo,Titulo,Archivo) OUTPUT INSERTED.Id VALUES (@PeliculaId,N'OTRO',N'E2E',@Archivo)"),"crear galería");

    expectOne(await request()
      .input("Id",sql.Int,gallery.Id)
      .query("UPDATE dbo.GaleriaMultimedia SET Titulo=N'E2E ACTUALIZADO' OUTPUT INSERTED.Id WHERE Id=@Id"),"editar galería");

    expectOne(await request().input("Id",sql.Int,gallery.Id)
      .query("DELETE FROM dbo.GaleriaMultimedia OUTPUT DELETED.Id WHERE Id=@Id"),"eliminar galería");

    expectOne(await request()
      .input("PeliculaId",sql.Int,film.Id).input("ActorId",sql.Int,actor.Id)
      .query("DELETE FROM dbo.PeliculaCreditos OUTPUT DELETED.Id WHERE PeliculaId=@PeliculaId AND ActorId=@ActorId"),"eliminar crédito");
    expectOne(await request()
      .input("PeliculaId",sql.Int,film.Id).input("ActorId",sql.Int,actor.Id)
      .query("DELETE FROM dbo.ActoresPeliculas OUTPUT DELETED.PeliculaId WHERE PeliculaId=@PeliculaId AND ActorId=@ActorId"),"eliminar reparto");

    expectOne(await request().input("Id",sql.Int,film.Id)
      .query("DELETE FROM dbo.Peliculas OUTPUT DELETED.Id WHERE Id=@Id"),"eliminar película");
    expectOne(await request().input("Id",sql.Int,actor.Id)
      .query("DELETE FROM dbo.Actores OUTPUT DELETED.Id WHERE Id=@Id"),"eliminar talento");
  } finally {
    if (started) await tx.rollback();
  }
  // No confundir ROLLBACK con certificación de restauración de un .bak.
  return { status: "CRUD_TX_ROLLBACK_PASS", database: plan.database,
    operations: checks, rolledBack: true, productionUntouched: true };
}

async function main(argv=process.argv.slice(2),env=process.env) {
  const snapshot=JSON.parse(fs.readFileSync(SNAPSHOT,"utf8"));
  const plan=requireIsolatedDatabase({argv,env,sourceDatabase:snapshot.sourceDatabase});
  if (plan.mode === "PREVIEW") {
    console.log("CineRD CRUD — PREVIEW; sin conexión SQL ni escrituras.");
    console.log("Para probar se requiere una copia separada CRUDPeliculas_E2E, backend/.env apuntando a esa base y confirmación explícita.");
    console.log("Nunca ejecutar contra CRUDPeliculas principal. No modifica ficheros ni sincroniza Cloudflare.");
    return plan;
  }
  const report=await runIsolatedCrud(plan);
  console.log(JSON.stringify(report,null,2));
  return report;
}

if (require.main===module) {
  require("dotenv").config({path:path.resolve(__dirname,"../.env")});
  main().catch(e=>{console.error("E2E CRUD: "+e.message);process.exitCode=1;});
}
module.exports={requireIsolatedDatabase,runIsolatedCrud,main};
