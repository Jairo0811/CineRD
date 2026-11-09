const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const { createAutorizarEdicionTalento } = require("../src/middlewares/autorizarEdicionTalento");

async function probar({ usuario, actorId = "7", activo = true, dbError = false }) {
  let consultas = 0;
  let parametros = {};
  const pool = {
    request() {
      return {
        input(nombre, _tipo, valor) { parametros[nombre] = valor; return this; },
        async query(sqlText) {
          consultas += 1;
          assert.match(sqlText, /TU\.Estado = N'ACTIVO'/);
          assert.match(sqlText, /U\.Estado = N'ACTIVO'/);
          assert.match(sqlText, /TU\.UsuarioId = @UsuarioId/);
          assert.match(sqlText, /TU\.ActorId = @ActorId/);
          if (dbError) throw new Error("SQL no disponible");
          return { recordset: activo ? [{ ActorId: Number(actorId) }] : [] };
        },
      };
    },
  };
  const guard = createAutorizarEdicionTalento({
    getPool: async () => pool,
    sql: { Int: "Int" },
  });
  const app = express();
  app.put("/actores/:id", (req, res, next) => { req.usuario = usuario; next(); }, guard,
    (req, res) => res.json({ autorizado: true, modo: req.edicionTalento }));
  const server = app.listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/actores/${actorId}`, { method: "PUT" });
    return { status: response.status, data: await response.json(), consultas, parametros };
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
}

test("administrador puede editar perfiles sin consultar la tabla de vinculaciones", async () => {
  const r = await probar({ usuario: { id: 1, rol: "ADMINISTRADOR" } });
  assert.equal(r.status, 200);
  assert.equal(r.data.modo, "administrador");
  assert.equal(r.consultas, 0);
});

test("talento con vínculo activo puede editar únicamente su propio perfil", async () => {
  const r = await probar({ usuario: { id: 22, rol: "TALENTO_VERIFICADO" }, actorId: "7" });
  assert.equal(r.status, 200);
  assert.equal(r.data.modo, "propio");
  assert.equal(r.parametros.UsuarioId, 22);
  assert.equal(r.parametros.ActorId, 7);
});

test("talento sin vínculo activo se rechaza aunque presente un rol válido", async () => {
  const r = await probar({ usuario: { id: 22, rol: "TALENTO_VERIFICADO" }, activo: false });
  assert.equal(r.status, 403);
  assert.equal(r.consultas, 1);
});

test("usuario regular o anónimo no puede editar un talento", async () => {
  for (const usuario of [{ id: 22, rol: "USUARIO" }, null]) {
    const r = await probar({ usuario });
    assert.equal(r.status, 403);
    assert.equal(r.consultas, 0);
  }
});

test("identificador inválido no llega a la base de datos", async () => {
  const r = await probar({ usuario: { id: 1, rol: "TALENTO_VERIFICADO" }, actorId: "no-numerico" });
  assert.equal(r.status, 400);
  assert.equal(r.consultas, 0);
});

test("falla de SQL cierra el acceso sin filtrar información de la base", async () => {
  const prev = console.error;
  console.error = () => {};
  try {
    const r = await probar({ usuario: { id: 1, rol: "TALENTO_VERIFICADO" }, dbError: true });
    assert.equal(r.status, 503);
    assert.doesNotMatch(JSON.stringify(r.data), /SQL no disponible/);
  } finally { console.error = prev; }
});
