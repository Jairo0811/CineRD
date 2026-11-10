const {test}=require("node:test");
const assert=require("node:assert/strict");
const path=require("node:path");
const ledger=require("../../docs/catalog-corrections-e4.json");
const snapshot=require("../../database/seeds/catalog.snapshot.json");
const approvals=require("../../docs/catalog-corrections-e4-approvals.json");
const {fingerprint,verifyApprovalLedger,parseApplyArgs,assertApplyGate}
  =require("../scripts/e4ApprovalGate");
const fakeBackup=path.resolve("test-fixtures","cinerd-restorable-not-actually-verified.bak");
const review=row=>({
  filmId:row.filmId,field:row.field,status:"aprobado",
  fingerprint:fingerprint(row,snapshot),
  reviewer:"Revisor de ejemplo exclusivo de pruebas",
  reviewedAt:"2026-11-08T00:00:00-04:00",
  sourcesChecked:true,fieldMeaningReviewed:true,changeAuthorized:true,
  notes:"Registro SINTETICO exclusivamente para probar el control, no una autorización humana real.",
  evidenceUrls:[row.sources[0]],
});
const synthetic=()=>({version:1,approvals:ledger.rows.map(review)});
const args=["--apply","--confirm-db-backup","--backup-file",fakeBackup];
const gate=o=>assertApplyGate({
  argv:args,ledger:o??synthetic(),rows:ledger.rows,snapshot,
  env:{DB_DATABASE:snapshot.sourceDatabase},
  statSync:()=>({size:1024,isFile:()=>true})
});

test("E-4: libro real inicia vacío; no se inventa firma de los 7 campos",()=>{
  assert.equal(approvals.version,1);
  assert.deepEqual(approvals.approvals,[]);
  const r=verifyApprovalLedger(approvals,ledger.rows,snapshot,{requireAll:false});
  assert.deepEqual(r,{valid:0,required:7,pending:7});
  assert.throws(()=>gate(approvals),/Faltan 7 autorizaciones/);
});

test("E-4: vincula cada autorización sintética al contenido exacto y fuentes",()=>{
  const records=synthetic();
  assert.deepEqual(verifyApprovalLedger(records,ledger.rows,snapshot),{
    valid:7,required:7,pending:0
  });
  assert.equal(new Set(records.approvals.map(x=>x.fingerprint)).size,7);
  assert.equal(gate(records).backupFile,fakeBackup);
});

test("E-4: rechaza firma con huella obsoleta y evidencia ajena",()=>{
  const doc=synthetic();
  doc.approvals[0].fingerprint="f".repeat(64);
  assert.throws(()=>gate(doc),/propuesta vigente/);
  doc.approvals[0]=review(ledger.rows[0]);
  doc.approvals[0].evidenceUrls=["https://example.org/ajeno"];
  assert.throws(()=>gate(doc),/Evidencia HTTPS/);
});

test("E-4: bloquea cambio de valor, identidad o base de datos",()=>{
  const doc=synthetic();
  const row={...ledger.rows[0],proposed:"Genero distinto"};
  assert.throws(()=>verifyApprovalLedger(doc,[row,...ledger.rows.slice(1)],snapshot),/propuesta vigente/);
  assert.throws(()=>assertApplyGate({
    argv:args,ledger:doc,rows:ledger.rows,snapshot,env:{DB_DATABASE:"OtraBD"},
    statSync:()=>({size:1024,isFile:()=>true})
  }),/base configurada/);
});

test("E-4: exige los siete campos una vez, sin duplicados ni firmas incompletas",()=>{
  const doc=synthetic();doc.approvals.pop();
  assert.throws(()=>gate(doc),/Faltan 1 autorizaciones/);
  doc.approvals=synthetic().approvals;
  doc.approvals.push(doc.approvals[0]);
  assert.throws(()=>gate(doc),/duplicada/);
  doc.approvals=synthetic().approvals;
  doc.approvals[1].changeAuthorized=false;
  assert.throws(()=>gate(doc),/changeAuthorized/);
});

test("E-4: antes de conectar exige archivo .bak absoluto no vacío",()=>{
  assert.deepEqual(parseApplyArgs(args),{backupFile:fakeBackup});
  assert.throws(()=>parseApplyArgs(["--apply","--confirm-db-backup"]),/backup-file/);
  assert.throws(()=>parseApplyArgs(["--apply","--confirm-db-backup","--backup-file","falso.bak"]),/absoluta/);
  assert.throws(()=>parseApplyArgs(["--apply","--confirm-db-backup","--backup-file",fakeBackup,"--force"]),/desconocido/);
  assert.throws(()=>assertApplyGate({
    argv:args,ledger:synthetic(),rows:ledger.rows,snapshot,
    env:{DB_DATABASE:snapshot.sourceDatabase},statSync:()=>({size:0,isFile:()=>true})
  }),/no estar vacio/);
});

test("E-4: la falta de respaldo físico bloquea aunque existan firmas sintéticas",()=>{
  assert.throws(()=>assertApplyGate({
    argv:args,ledger:synthetic(),rows:ledger.rows,snapshot,
    env:{DB_DATABASE:snapshot.sourceDatabase},
    statSync:()=>{throw Error("ENOENT");}
  }),/No se encuentra respaldo/);
});
