const test = require("node:test");
const assert = require("node:assert/strict");

async function withFakeDb(pool, callback) {
  const dbPath = require.resolve("../src/config/db");
  const controllerPath = require.resolve("../src/controllers/peliculasController");
  const previousDb = require.cache[dbPath], previousCtrl = require.cache[controllerPath];
  require.cache[dbPath] = {
    id: dbPath, filename: dbPath, loaded: true,
    exports: {
      sql: { Int: "INT", Date: "DATE", MAX: 9999, NVarChar: n => "NVARCHAR_" + n },
      poolPromise: Promise.resolve(pool),
    },
  };
  delete require.cache[controllerPath];
  try { return await callback(require("../src/controllers/peliculasController").actualizarPelicula); }
  finally {
    delete require.cache[controllerPath];
    if (previousDb) require.cache[dbPath] = previousDb; else delete require.cache[dbPath];
    if (previousCtrl) require.cache[controllerPath] = previousCtrl;
  }
}

function response() {
  return {
    statusCode: 200,
    data: null,
    status(n) { this.statusCode = n; return this; },
    json(data) { this.data = data; return this; },
  };
}

function form(tmdbId = "") {
  return {
    Titulo: "Sanky Panky", Genero: "Comedia", FechaEstreno: "2007-07-03",
    Director: "Director", Productora: "Productora", Sinopsis: "",
    IdiomaOriginal: "es", TMDbId: tmdbId,
  };
}

test("desvincular TMDb en edición realmente escribe NULL en SQL", async () => {
  let updatedParams;
  const pool = {
    request() {
      const params = {};
      return {
        input(name, _type, value) { params[name] = value; return this; },
        async query(sqlText) {
          if (sqlText.includes("SELECT Foto, TMDbId")) return { recordset: [{ Foto: "/uploads/peliculas/old.jpeg", TMDbId: 990 }] };
          if (sqlText.includes("UPDATE Peliculas")) {
            updatedParams = params;
            return { recordset: [{ Id: 4, TMDbId: params.TMDbId, Titulo: params.Titulo }] };
          }
          throw new Error("Consulta inesperada: " + sqlText);
        },
      };
    },
  };
  const res = response();
  await withFakeDb(pool, controller => controller({
    params: { id: "4" }, body: form(""),
  }, res));
  assert.equal(res.statusCode, 200);
  assert.equal(updatedParams.TMDbId, null);
  assert.equal(updatedParams.Foto, "/uploads/peliculas/old.jpeg");
});

test("identificador TMDb no enviado conserva vinculación antigua", async () => {
  let saved;
  const pool = {
    request() {
      const params = {};
      return {
        input(k,_t,v) { params[k]=v;return this; },
        async query(q) {
          if (q.includes("SELECT Foto, TMDbId")) return { recordset: [{ Foto: null, TMDbId: 101 }] };
          if (q.includes("UPDATE Peliculas")) { saved=params.TMDbId; return { recordset: [{ Id: 4 }] }; }
          throw new Error("Consulta inesperada");
        },
      };
    },
  };
  const data = form();
  delete data.TMDbId;
  const res = response();
  await withFakeDb(pool, controller => controller({ params:{id:"4"},body:data },res));
  assert.equal(res.statusCode,200);
  assert.equal(saved,101);
});

test("TMDb parcial se rechaza antes de modificar SQL", async () => {
  let queries = 0;
  const pool = { request() { queries++; throw new Error("No SQL"); } };
  const res = response();
  await withFakeDb(pool, controller => controller({
    params: { id: "4" }, body: form("123abc"),
  }, res));
  assert.equal(res.statusCode, 400);
  assert.equal(queries, 0);
});
