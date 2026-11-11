import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const blueprint = path.join(root, "render.yaml");

export function auditRenderBlueprint(text) {
  const checks = {
    serviceWeb: /^\s*-\s*type:\s*web\s*$/m.test(text),
    name: /^\s*name:\s*cinerd-api\s*$/m.test(text),
    runtimeNode: /^\s*runtime:\s*node\s*$/m.test(text),
    deployOff: /^\s*autoDeployTrigger:\s*off\s*$/m.test(text),
    readiness: /^\s*healthCheckPath:\s*\/ready\s*$/m.test(text),
    persistentDisk: /^\s*mountPath:\s*\/var\/data\s*$/m.test(text) && /^\s*sizeGB:\s*5\s*$/m.test(text),
    rightsGate: /buildCommand:[^\r\n]*verifyMediaRightsLedger\.mjs/.test(text),
    envGate: /startCommand:[^\r\n]*auditProductionEnv\.js --strict/.test(text),
    httpsOrigins: /value:\s*https:\/\/cinerd\.pages\.dev,https:\/\/cinerd\.netlify\.app/.test(text),
    sqlTls: /-\s*key:\s*DB_ENCRYPT\s*\r?\n\s*value:\s*["']?true["']?/m.test(text) &&
      /-\s*key:\s*DB_TRUST_CERT\s*\r?\n\s*value:\s*["']?false["']?/m.test(text),
    secretsFromProvider: [
      "DB_SERVER", "DB_DATABASE", "DB_USER", "DB_PASSWORD", "RESEND_API_KEY", "EMAIL_FROM"
    ].every(key => new RegExp("-\\s*key:\\s*" + key + "\\s*\\r?\\n\\s*sync:\\s*false\\b").test(text)),
    noFreeDiskPlan: !/^\s*plan:\s*free\s*$/m.test(text),
  };
  return {
    status: Object.values(checks).every(Boolean) ? "BLUEPRINT_STATIC_READY" : "BLOCKED",
    checks,
    disclaimer: "Esta auditoría solo analiza texto local; no crea Render, no verifica cuentas, SQL, costos ni secretos.",
  };
}

export function runCli(argv = process.argv.slice(2)) {
  if (argv.length !== 1 || argv[0] !== "--check")
    throw new Error("Uso: node scripts/auditRenderBlueprint.mjs --check");
  const result = auditRenderBlueprint(fs.readFileSync(blueprint, "utf8"));
  console.log(JSON.stringify(result, null, 2));
  if (result.status !== "BLUEPRINT_STATIC_READY") process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  runCli();
