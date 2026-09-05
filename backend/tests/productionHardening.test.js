const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const clearModule = (modulePath) => delete require.cache[require.resolve(modulePath)];

test("storage layout creates configured uploads directory", () => {
  const previousUploads = process.env.UPLOADS_DIR;
  const previousPrivate = process.env.PRIVATE_STORAGE_DIR;
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "cinerd-storage-"));
  process.env.UPLOADS_DIR = path.join(temp, "uploads");
  process.env.PRIVATE_STORAGE_DIR = path.resolve(process.cwd(), "private");
  clearModule("../src/config/storage");
  const storage = require("../src/config/storage");
  storage.ensureStorageLayout();
  assert.equal(fs.existsSync(path.join(temp, "uploads")), true);
  fs.rmSync(temp, { recursive: true, force: true });
  if (previousUploads === undefined) delete process.env.UPLOADS_DIR; else process.env.UPLOADS_DIR = previousUploads;
  if (previousPrivate === undefined) delete process.env.PRIVATE_STORAGE_DIR; else process.env.PRIVATE_STORAGE_DIR = previousPrivate;
  clearModule("../src/config/storage");
});

test("email service calls Resend API without exposing credentials in payload", async () => {
  const previousKey = process.env.RESEND_API_KEY;
  const previousFrom = process.env.EMAIL_FROM;
  const previousFetch = global.fetch;
  process.env.RESEND_API_KEY = "test-key";
  process.env.EMAIL_FROM = "CineRD <test@example.com>";
  let request;
  global.fetch = async (url, options) => {
    request = { url, options };
    return { ok: true, json: async () => ({ id: "email-test" }) };
  };
  clearModule("../src/services/emailService");
  const { enviarEmail } = require("../src/services/emailService");
  await enviarEmail({ to: "user@example.com", subject: "Prueba", html: "<p>Hola</p>" });
  assert.equal(request.url, "https://api.resend.com/emails");
  assert.equal(request.options.headers.Authorization, "Bearer test-key");
  const body = JSON.parse(request.options.body);
  assert.deepEqual(body.to, ["user@example.com"]);
  assert.equal(body.from, "CineRD <test@example.com>");
  assert.equal(request.options.body.includes("test-key"), false);
  global.fetch = previousFetch;
  if (previousKey === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = previousKey;
  if (previousFrom === undefined) delete process.env.EMAIL_FROM; else process.env.EMAIL_FROM = previousFrom;
  clearModule("../src/services/emailService");
});

test("observability assigns a request id and emits it to the response", () => {
  const { requestContext } = require("../src/middlewares/observability");
  let finishHandler;
  const headers = {};
  const req = { get: () => undefined, method: "GET", originalUrl: "/health", ip: "127.0.0.1" };
  const res = {
    statusCode: 200,
    setHeader: (key, value) => { headers[key] = value; },
    on: (event, handler) => { if (event === "finish") finishHandler = handler; },
  };
  requestContext(req, res, () => {});
  assert.match(req.requestId, /^[0-9a-f-]{36}$/i);
  assert.equal(headers["X-Request-ID"], req.requestId);
  const originalInfo = console.info;
  console.info = () => {};
  finishHandler();
  console.info = originalInfo;
});
