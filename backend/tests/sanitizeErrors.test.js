const test = require("node:test");
const assert = require("node:assert/strict");
const { sanitizeErrorResponses } = require("../src/middlewares/sanitizeErrors");

function responseMock(statusCode = 500) {
  return {
    statusCode,
    body: null,
    json(body) { this.body = body; return this; },
  };
}

test("elimina detalles internos de respuestas 5xx y agrega requestId", () => {
  const req = { requestId: "req-123" };
  const res = responseMock(500);
  sanitizeErrorResponses(req, res, () => {});
  res.json({ mensaje: "Error interno", error: "SQL password leaked" });
  assert.deepEqual(res.body, { mensaje: "Error interno", requestId: "req-123" });
});

test("no altera respuestas 4xx", () => {
  const req = { requestId: "req-123" };
  const res = responseMock(400);
  sanitizeErrorResponses(req, res, () => {});
  res.json({ mensaje: "Solicitud inválida", error: "detalle útil" });
  assert.deepEqual(res.body, { mensaje: "Solicitud inválida", error: "detalle útil" });
});
