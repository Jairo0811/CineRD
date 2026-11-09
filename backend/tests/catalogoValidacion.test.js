const test = require("node:test");
const assert = require("node:assert/strict");
const {
  ErrorValidacionCatalogo, normalizarTmdbId, resolverTmdbIdEdicion,
} = require("../src/utils/catalogoValidacion");

test("TMDb acepta solo enteros positivos del rango de SQL INT", () => {
  assert.equal(normalizarTmdbId(" 123 "), 123);
  assert.equal(normalizarTmdbId(123), 123);
  assert.equal(normalizarTmdbId(""), null);
  assert.equal(normalizarTmdbId(null), null);
  for (const valor of ["123abc", "-1", "0", "1.1", "NaN", "999999999999999", {}, "x", "1e2"]) {
    assert.throws(() => normalizarTmdbId(valor), ErrorValidacionCatalogo, String(valor));
  }
});

test("editar TMDb distingue no enviado (conservar) de vacío (desvincular)", () => {
  assert.equal(resolverTmdbIdEdicion(undefined, 42), 42);
  assert.equal(resolverTmdbIdEdicion("", 42), null);
  assert.equal(resolverTmdbIdEdicion(null, 42), null);
  assert.equal(resolverTmdbIdEdicion(" 48 ", 42), 48);
});
