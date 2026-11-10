import {test} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {buildABCReport,inspectABC} from "./verifyABCReleaseGates.mjs";
import {auditRows,readCsv} from "./verifyMediaRightsLedger.mjs";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const raw=p=>fs.readFileSync(path.join(root,p),"utf8");
const json=p=>JSON.parse(raw(p));
const sample=()=>({
  issues:json("docs/editorial-issues-f2.json"),
  e4:json("docs/catalog-corrections-e4.json"),
  e4Approvals:json("docs/catalog-corrections-e4-approvals.json"),
  drafts:json("docs/editorial-sql-replacement-drafts-f23.json"),
  sqlApprovals:json("docs/editorial-sql-migration-approvals-f23.json"),
  e5Approvals:json("docs/editorial-approvals-e5.json"),
  altaDoc:raw("docs/FASE_E5_OLEADA_ALTA_18_REVISION_2026-11-10.md"),
  restDoc:raw("docs/FASE_E5_OLEADAS_MEDIA_BAJA_40_REVISION_2026-11-10.md"),
  render:raw("render.yaml"),
  app:raw("backend/src/app.js"),
  rightsAudit:auditRows(json("database/seeds/catalog.snapshot.json"),
    readCsv(raw("docs/media-rights-ledger.csv"))),
  adGate:raw("scripts/checkAdActivation.mjs")
});

test("ABC: 7 E4, 5 SQL y 58 E5 inventariadas sin firmas ni publicación",()=>{
  const r=buildABCReport();
  assert.deepEqual(r.errors,[]);
  assert.deepEqual(r.phaseA.prepared,{
    e4:7,sql:5,editorialHigh:18,editorialMedium:18,editorialLow:22,editorialTotal:58
  });
  assert.deepEqual(r.phaseA.approvalsRecorded,{e4:0,sql:0,e5:0});
  assert.equal(r.productionReady,false);
  assert.equal(r.commercialReady,false);
});

test("ABC: Render requiere arranque con auditoría, SQL /ready y deployments manuales",()=>{
  const r=buildABCReport();
  assert.equal(r.phaseB.codeProvisioningGate,"CODE_PREPARED");
  assert.equal(r.phaseB.apiSqlOnline,"NOT_VERIFIED");
  assert.equal(r.phaseB.restoreDrill,"NOT_VERIFIED");
  assert.equal(r.phaseB.emailAndUserFlows,"NOT_VERIFIED");
  assert.equal(r.phaseC.filesWithoutEffectiveAuthorization,128);
  assert.equal(r.phaseC.ads,"DISABLED_REQUIRED");
});

test("ABC: elimina una ficha E5 y el gate detecta omisión",()=>{
  const p=sample();
  p.restDoc=p.restDoc.replace("### [ ] E5-4-sinopsis — Sanky Panky","### E5-4-sinopsis — Sanky Panky");
  const r=inspectABC(p);
  assert.ok(r.errors.some(x=>x.includes("E5: expediente ausente 4:sinopsis")));
});

test("ABC: Render no puede aislar backend del inventario común de medios",()=>{
  const p=sample();
  p.render=p.render.replace("    runtime: node","    runtime: node\n    rootDir: backend");
  const r=inspectABC(p);
  assert.ok(r.errors.some(x=>x.includes("monorepo completo")));
});

test("ABC: Render no puede activar autodeploy por defecto",()=>{
  const p=sample();
  p.render=p.render.replace("autoDeployTrigger: off","autoDeployTrigger: commit");
  const r=inspectABC(p);
  assert.ok(r.errors.some(x=>x.includes("autoDeployTrigger: off")));
});

test("ABC: rechaza sinopsis sin aprobación editorial que declara publicarse",()=>{
  const p=sample();
  p.drafts.entries["55"].deployment="automatic";
  const r=inspectABC(p);
  assert.ok(r.errors.some(x=>x.includes("publicación automática")));
});

test("ABC: derechos y AdSense no quedan aprobados por un test verde",()=>{
  const p=sample();
  p.rightsAudit={...p.rightsAudit,errors:["desincronizado"]};
  const r=inspectABC(p);
  assert.equal(r.productionReady,false);
  assert.equal(r.commercialReady,false);
  assert.ok(r.errors.some(x=>x.startsWith("C:")));
});
