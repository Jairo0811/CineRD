import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { auditRenderBlueprint } from "./auditRenderBlueprint.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const original = fs.readFileSync(path.join(root, "render.yaml"), "utf8");

test("Render: blueprint has manual deploy, rights gate, TLS, /ready, persistent disk", () => {
  const report = auditRenderBlueprint(original);
  assert.equal(report.status, "BLUEPRINT_STATIC_READY");
  assert.ok(Object.values(report.checks).every(Boolean));
  assert.match(report.disclaimer,/no crea Render/);
});

test("Render: prevent unsafe auto deploy or missing rights gate", () => {
  const auto = original.replace("autoDeployTrigger: off", "autoDeployTrigger: on");
  assert.equal(auditRenderBlueprint(auto).status, "BLOCKED");
  const without = original.replace("node scripts/verifyMediaRightsLedger.mjs", "echo no-rights-check");
  assert.equal(auditRenderBlueprint(without).status, "BLOCKED");
});

test("Render: block SQL without TLS and hardcoded fake secrets", () => {
  const weak = original.replace("key: DB_TRUST_CERT\n        value: \"false\"", "key: DB_TRUST_CERT\n        value: \"true\"");
  assert.equal(auditRenderBlueprint(weak).status, "BLOCKED");
  const credential = original.replace("key: DB_PASSWORD\n        sync: false", "key: DB_PASSWORD\n        value: pw-in-yaml");
  assert.equal(auditRenderBlueprint(credential).status, "BLOCKED");
});
