import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {assembleClosure,args} from "./reportParallelClosure.mjs";
import {inventory} from "./editorialReviewAudit.mjs";
import {makeReport} from "./reportProductionCommercial.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
async function input(){
  return {
    snapshot:read("database/seeds/catalog.snapshot.json"),
    e4:read("docs/catalog-corrections-e4.json"),
    e4Approvals:read("docs/catalog-corrections-e4-approvals.json"),
    e5Issues:read("docs/editorial-issues-f2.json"),
    e5Items:inventory(),
    e5Approvals:read("docs/editorial-approvals-e5.json"),
    drafts:read("docs/editorial-sql-replacement-drafts-f23.json"),
    sqlApprovals:read("docs/editorial-sql-migration-approvals-f23.json"),
    production:await makeReport({online:false})
  };
}
test("los tres frentes no confunden valores E4 aplicados con aprobación formal",async()=>{
  const report=assembleClosure(await input());
  assert.equal(report.mode,"READ_ONLY");
  assert.equal(report.ready,false);
  assert.deepEqual(report.errors,[]);
  assert.equal(report.e4.total,7);
  assert.equal(report.e4.approvalsRecorded,0);
  assert.ok(report.e4.rows.every(x=>x.status==="PROPUESTA_EN_SNAPSHOT_NO_APROBADA"));
  assert.equal(report.e4.needsOriginalSqlRead,true);
  assert.equal(report.sqlSynopses.total,5);
  assert.equal(report.sqlSynopses.approvalsRecorded,0);
  assert.equal(report.e5.total,58);
  assert.equal(report.e5.approved,0);
  assert.equal(report.e5.high.length,18);
  assert.equal(report.e5.medium.length,18);
  assert.equal(report.e5.low.length,22);
  assert.equal(report.production.codeStatus,"CODE_READY");
  assert.equal(report.production.api,"NOT_CONFIGURED");
  assert.equal(report.production.ads,"BLOCKED");
  assert.match(report.production.mediaRightsPendingOrRestricted,/128 archivos/);
  assert.ok(report.blockers.length>=4);
});
test("debe bloquear deriva de campo E4 y no inferir firma de un valor",async()=>{
  const data=await input(),modified=structuredClone(data.snapshot);
  modified.tables.Peliculas.find(x=>x.Id===9).Genero="Thriller";
  const report=assembleClosure({...data,snapshot:modified});
  assert.equal(report.ready,false);
  assert.ok(report.errors.some(x=>x.includes("E4 valor ajeno 9:Genero")));
});
test("duplicados E4 o ausencia de cinco sinopsis son errores no advertencias",async()=>{
  const data=await input();const d=structuredClone(data.e4);
  d.rows.push({...d.rows[0]});
  const report=assembleClosure({...data,e4:d});
  assert.ok(report.errors.some(x=>x.includes("E4 duplicado")));
  const plan=structuredClone(data.drafts);
  delete plan.entries["5"];
  const report2=assembleClosure({...data,drafts:plan});
  assert.ok(report2.errors.some(x=>x.includes("Esperadas 5")));
});
test("no acepta opciones de ejecución, firmas ni escritura",()=>{
  assert.deepEqual(args([]),{json:false,strict:false});
  assert.deepEqual(args(["--json","--strict"]),{json:true,strict:true});
  assert.throws(()=>args(["--apply"]));
  assert.throws(()=>args(["--json","--json"]));
});
