const test = require("node:test");
const assert = require("node:assert/strict");
const { createRateLimit } = require("../src/middlewares/rateLimit");

function responseMock() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

test("permite solicitudes dentro del límite", () => {
  const limiter = createRateLimit({ windowMs: 60_000, max: 2 });
  let nextCalls = 0;
  const req = { ip: "test-allow" };

  limiter(req, responseMock(), () => { nextCalls += 1; });
  limiter(req, responseMock(), () => { nextCalls += 1; });

  assert.equal(nextCalls, 2);
});

test("responde 429 al superar el límite", () => {
  const limiter = createRateLimit({ windowMs: 60_000, max: 1 });
  const req = { ip: "test-block" };
  limiter(req, responseMock(), () => {});

  const res = responseMock();
  limiter(req, res, () => assert.fail("No debe continuar"));

  assert.equal(res.statusCode, 429);
  assert.match(res.body.mensaje, /Demasiados intentos/);
  assert.ok(Number(res.headers["Retry-After"]) >= 1);
});
