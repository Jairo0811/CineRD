const test = require("node:test");
const assert = require("node:assert/strict");

async function controladorConPool(pool, fn) {
  const dbPath = require.resolve("../src/config/db");
  const controllerPath = require.resolve("../src/controllers/actoresController");
  const previousDb = require.cache[dbPath];
  const previousController = require.cache[controllerPath];
  const mssqlStub = {
    Int: "Int", Bit: "Bit", Date: "Date", NVarChar: n => "NVarChar(" + n + ")",
  };
  require.cache[dbPath] = {
    id: dbPath, filename: dbPath, loaded: true,
    exports: { sql: mssqlStub, poolPromise: Promise.resolve(pool) },
  };
  delete require.cache[controllerPath];
  try {
    return await fn(require("../src/controllers/actoresController").actualizarMiPerfilTalento);
  } finally {
    delete require.cache[controllerPath];
    if (previousDb) require.cache[dbPath] = previousDb;
    else delete require.cache[dbPath];
    if (previousController) require.cache[controllerPath] = previousController;
  }
}

function resFake() {
  return {
    statusCode: 200, data: null,
    status(code) { this.statusCode = code; return this; },
    json(data) { this.data = data; return this; },
  };
}

test("titular verificado puede modificar solo su perfil profesional, nunca identidad/rol/TMDb", async () => {
  const sqlConsultas = [];
  let updateParams;
  const pool = {
    request() {
      const params = {};
      return {
        input(name, _type, value) { params[name] = value; return this; },
        async query(sqlText) {
          sqlConsultas.push(sqlText);
          if (sqlText.includes("SELECT Id,Foto")) return { recordset: [{ Id: 7, Foto: "/uploads/actores/previo.jpeg" }] };
          updateParams = params;
          return { recordset: [{ Id: 7, NombreArtistico: "Nombre Nuevo", Foto: params.Foto }] };
        },
      };
    },
  };
  const req = {
    usuario: { id: 32, rol: "TALENTO_VERIFICADO" },
    edicionTalento: "propio",
    params: { id: "7" },
    body: {
      NombreArtistico: "Nombre Nuevo",
      Profesion: "Actor",
      InstagramUrl: "https://instagram.com/talento",
      Nombres: "IDENTIDAD ADULTERADA", FechaNacimiento: "2001-01-01",
      TMDbId: "123456", Rol: "ADMINISTRADOR", EstaVivo: "false",
    },
  };
  const res = resFake();
  await controladorConPool(pool, controller => controller(req, res));

  assert.equal(res.statusCode, 200);
  assert.equal(res.data.actor.Foto, "/uploads/actores/previo.jpeg");
  assert.equal(updateParams.Id, 7);
  assert.equal(updateParams.UsuarioId, 32);
  assert.equal(updateParams.NombreArtistico, "Nombre Nuevo");
  assert.equal(updateParams.InstagramUrl, "https://instagram.com/talento");
  for (const campo of ["Nombres", "FechaNacimiento", "TMDbId", "Rol", "EstaVivo"]) {
    assert.equal(Object.hasOwn(updateParams, campo), false, campo + " no debe editarse");
    const setClause = sqlConsultas[1].split("OUTPUT INSERTED.*")[0];
    assert.doesNotMatch(setClause, new RegExp("\\b" + campo + "\\s*="));
  }
  assert.match(sqlConsultas[1], /EXISTS\s*\(/);
  assert.match(sqlConsultas[1], /TU\.Estado=N'ACTIVO'/);
});

test("si se revoca la vinculación durante la edición, el UPDATE no modifica el perfil", async () => {
  const pool = {
    request() {
      return {
        input() { return this; },
        async query(text) {
          return { recordset: text.includes("SELECT Id,Foto") ? [{ Id: 7, Foto: null }] : [] };
        },
      };
    },
  };
  const res = resFake();
  await controladorConPool(pool, controller => controller({
    edicionTalento: "propio", usuario: { id: 10 }, params: { id: "7" },
    body: { NombreArtistico: "Prueba", Profesion: "Actor" },
  }, res));
  assert.equal(res.statusCode, 403);
});

test("actualizar perfil propio no admite URLs javascript: incluso con sesión activa", async () => {
  let queries = 0;
  const pool = { request() { queries++; throw new Error("No debería consultar SQL"); } };
  const res = resFake();
  await controladorConPool(pool, controller => controller({
    edicionTalento: "propio", usuario: { id: 10 }, params: { id: "7" },
    body: { InstagramUrl: "javascript:alert(1)" },
  }, res));
  assert.equal(res.statusCode, 400);
  assert.equal(queries, 0);
});

test("sin autorización del middleware no se puede ejecutar el controlador", async () => {
  const res = resFake();
  await controladorConPool({}, controller => controller({
    edicionTalento: "administrador", usuario: { id: 10 }, params: { id: "7" }, body: {},
  }, res));
  assert.equal(res.statusCode, 403);
});
