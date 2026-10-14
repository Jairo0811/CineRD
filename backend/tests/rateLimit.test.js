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


test("cada limitador tiene su propio contador (no se comparten entre rutas)", () => {
  const login = createRateLimit({ windowMs: 60_000, max: 1 });
  const refresh = createRateLimit({ windowMs: 60_000, max: 1 });
  const req = { ip: "misma-ip" };
  login(req, responseMock(), () => {});
  let refreshPaso = false;
  refresh(req, responseMock(), () => { refreshPaso = true; });
  assert.equal(refreshPaso, true);
});

test("purga las entradas vencidas del almacén", () => {
  const limiter = createRateLimit({ windowMs: 5, max: 5 });
  const realNow = Date.now;
  let now = realNow();
  Date.now = () => now;
  try {
    limiter({ ip: "a" }, responseMock(), () => {});
    limiter({ ip: "b" }, responseMock(), () => {});
    assert.equal(limiter.size(), 2);
    now += 2 * 60 * 1000;
    limiter({ ip: "c" }, responseMock(), () => {});
    assert.equal(limiter.size(), 1);
  } finally {
    Date.now = realNow;
  }
});

test("acepta un keyGenerator personalizado", () => {
  const limiter = createRateLimit({ windowMs: 60_000, max: 1, keyGenerator: (req) => req.body?.email });
  limiter({ ip: "x", body: { email: "a@a.com" } }, responseMock(), () => {});
  const res = responseMock();
  limiter({ ip: "otra-ip", body: { email: "a@a.com" } }, res, () => assert.fail("No debe continuar"));
  assert.equal(res.statusCode, 429);
});
