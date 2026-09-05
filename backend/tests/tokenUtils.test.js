const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const { hashToken, crearRefreshToken, crearAccessToken } = require("../src/utils/tokenUtils");

test("hashToken genera un SHA-256 determinista sin almacenar el token en claro", () => {
  const token = "refresh-token-de-prueba";
  const hash1 = hashToken(token);
  const hash2 = hashToken(token);

  assert.equal(hash1, hash2);
  assert.equal(hash1.length, 64);
  assert.notEqual(hash1, token);
});

test("crearRefreshToken genera tokens criptográficamente aleatorios y distintos", () => {
  const token1 = crearRefreshToken();
  const token2 = crearRefreshToken();

  assert.ok(token1.length >= 64);
  assert.ok(token2.length >= 64);
  assert.notEqual(token1, token2);
});

test("crearAccessToken preserva la identidad y el rol esperados", () => {
  const secret = "cine-rd-test-secret-with-enough-entropy";
  const accessToken = crearAccessToken(
    {
      Id: 42,
      Nombre: "Talento Prueba",
      Email: "talento@example.com",
      Rol: "TALENTO_VERIFICADO",
    },
    { secret, expiresIn: "5m" },
  );

  const payload = jwt.verify(accessToken, secret);
  assert.equal(payload.id, 42);
  assert.equal(payload.nombre, "Talento Prueba");
  assert.equal(payload.email, "talento@example.com");
  assert.equal(payload.rol, "TALENTO_VERIFICADO");
  assert.ok(payload.exp > payload.iat);
});

test("crearAccessToken falla si no existe un secreto JWT", () => {
  const previous = process.env.JWT_ACCESS_SECRET;
  delete process.env.JWT_ACCESS_SECRET;

  try {
    assert.throws(
      () => crearAccessToken({ id: 1 }, { secret: "" }),
      /JWT_ACCESS_SECRET es obligatorio/,
    );
  } finally {
    if (previous === undefined) delete process.env.JWT_ACCESS_SECRET;
    else process.env.JWT_ACCESS_SECRET = previous;
  }
});
