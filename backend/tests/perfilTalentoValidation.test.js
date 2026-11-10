const test = require("node:test");
const assert = require("node:assert/strict");
const {
  validarEnlacePublico, normalizarEnlacesPublicos, validarTextoPublico,
  CAMPOS_SOCIALES, ValidacionPerfilError,
} = require("../src/utils/perfilTalentoValidation");

test("solo acepta enlaces públicos http y https completos", () => {
  assert.equal(validarEnlacePublico(" https://instagram.com/cine.rd ", "InstagramUrl"), "https://instagram.com/cine.rd");
  assert.equal(validarEnlacePublico("http://example.org/perfil", "SitioWebUrl"), "http://example.org/perfil");
  assert.equal(validarEnlacePublico("", "InstagramUrl"), null);
  for (const value of [
    "javascript:alert(1)", "data:text/html;base64,YQ==", "file:///etc/passwd",
    "https://user:password@example.org", "https://localhost/secreto",
    "http://127.0.0.1/admin", "//example.org/path", "www.example.org",
    "x".repeat(301), 12,
  ]) {
    assert.throws(() => validarEnlacePublico(value, "InstagramUrl"), ValidacionPerfilError, String(value));
  }
});

test("normalizador devuelve todos los campos, sin aceptar propiedades arbitrarias", () => {
  const r = normalizarEnlacesPublicos({ InstagramUrl: "https://instagram.com/talento", Rol: "ADMINISTRADOR" });
  assert.deepEqual(Object.keys(r), CAMPOS_SOCIALES);
  assert.equal(r.InstagramUrl, "https://instagram.com/talento");
  assert.equal(r.FacebookUrl, null);
  assert.equal(r.Rol, undefined);
});

test("textos editables respetan límites de tamaño", () => {
  assert.equal(validarTextoPublico("  Cineasta  ", "Profesión", 100), "Cineasta");
  assert.equal(validarTextoPublico(" ", "Profesión", 100), null);
  assert.throws(() => validarTextoPublico("X".repeat(101), "Profesión", 100), ValidacionPerfilError);
});
