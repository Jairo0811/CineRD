const {test}=require("node:test");
const assert=require("node:assert/strict");
const {parseArgs,collectStaticEvidence,evaluateFourAreas,summarizeCommandFailure}=require("./releaseReadiness14.cjs");

const editorial={
  errors:[],
  summary:{
    editorial:{total:58,approved:0,pending:58},
    issues:{total:58,pending:58,resolved:0,priorities:{alta:18,media:18,baja:22}},
    sqlReplacementDrafts:{total:5,pending:5,publishedAutomatically:0},
    sqlMigration:{total:5,validHumanReviewRecords:0,pending:5},
    sqlProvenance:{withoutEvidence:5},
    e4:{pending:0,appliedInSnapshot:7,authorizations:{valid:0,pending:7,required:7}}
  }
};
const media={errors:[],rows:128,counts:{AUTORIZADO:0,PENDIENTE:128,RESTRINGIDO:0,RETIRAR:0}};
const staticEvidence={
  checks:{hasLiveness:true,hasReadiness:true,hasPersistentStoragePlan:true,
    hasCloudflareCors:true,hasProductionEmailTemplate:true,hasSqlEnvironmentTemplate:true,
    hasCiTests:true,hasCiMediaReview:true,cloudflareFailClosed:true},
  errors:[]
};
const inputs=()=>({editorial,media,staticEvidence,checks:[]});

test("1–4: reconoce estados reales sin fingir aprobaciones",()=>{
  const r=evaluateFourAreas(inputs());
  assert.equal(r.technicalOk,true);
  assert.equal(r.publicationReady,false);
  assert.deepEqual([r.areas.sql.proposed,r.areas.sql.validApprovals],[5,0]);
  assert.deepEqual([r.areas.editorial.editorialTotal,r.areas.editorial.issuesPending],[58,58]);
  assert.deepEqual([r.areas.editorial.e4SnapshotApplied,r.areas.editorial.e4Authorizations],[7,0]);
  assert.deepEqual([r.areas.media.tracked,r.areas.media.effectiveAuthorized],[128,0]);
  assert.equal(r.areas.media.cloudflareReviewConfigured,true);
  assert.equal(r.areas.production.realBackupRestoreProven,false);
  assert.ok(r.blockers.some(b=>b.includes("5 decisiones")));
  assert.ok(r.blockers.some(b=>b.includes("128 archivos")));
});

test("1–4: diferencia error técnico de bloqueo editorial",()=>{
  const a=evaluateFourAreas(inputs());
  assert.equal(a.errors.length,0);
  assert.ok(a.blockers.length>0);
  const b=evaluateFourAreas({...inputs(),media:{...media,errors:["Licencia inválida"]}});
  assert.equal(b.technicalOk,false);
  assert.ok(b.errors.some(s=>s.includes("Licencia inválida")));
});

test("1–4: nunca da por completado un restore solo por pasar las pruebas",()=>{
  const checks=[
    {name:"SQL Server (5 sinopsis)",status:"PASS",detail:"solo lectura",originalFive:true},
    {name:"Cloudflare production",status:"PASS",detail:"Auditoría HTTP"},
    {name:"API /health y /ready",status:"PASS",detail:"Ambos 200"}
  ];
  const a=evaluateFourAreas({...inputs(),checks});
  assert.equal(a.areas.production.remoteSiteVerified,true);
  assert.equal(a.areas.production.apiReady,true);
  assert.equal(a.areas.sql.liveSqlStatus,"PASS");
  assert.equal(a.publicationReady,false);
  assert.ok(a.blockers.some(b=>b.includes("restauración real")));
  assert.ok(!a.blockers.some(b=>b.includes("no se consultó la instancia")));
});

test("1–4: fallo SQL remoto o artefacto no seguro se registra como error",()=>{
  const checks=[{name:"SQL Server (5 sinopsis)",status:"FAIL",detail:"Base inaccesible"}];
  const r=evaluateFourAreas({...inputs(),checks});
  assert.equal(r.technicalOk,false);
  assert.ok(r.errors.some(x=>x.includes("Base inaccesible")));
  const bad=evaluateFourAreas({...inputs(),staticEvidence:{
    ...staticEvidence,
    checks:{...staticEvidence.checks,cloudflareFailClosed:false},
    errors:["Configuración base ausente o incompatible: cloudflareFailClosed"]
  }});
  assert.equal(bad.technicalOk,false);
});

test("1–4: argumentos CLI impiden combinaciones equivocadas",()=>{
  assert.deepEqual(parseArgs([]),{
    full:false,liveSql:false,online:false,strict:false,json:false
  });
  assert.deepEqual(parseArgs(["--full","--live-sql","--online","--strict"]),{
    full:true,liveSql:true,online:true,strict:true,json:false
  });
  assert.throws(()=>parseArgs(["--full","--json"]),/no se combinan/);
  assert.throws(()=>parseArgs(["--apply"]),/Uso/);
  assert.throws(()=>parseArgs(["--strict","--strict"]),/Uso/);
});

test("1–4: verifica controles estáticos, sin consultar secretos",()=>{
  const ok=collectStaticEvidence({
    app:'app.get("/health"); app.get("/ready"); SELECT 1 AS ok',
    workflow:"npm test npm run lint rights-review verifyRightsReviewBuild",
    render:"/var/data UPLOADS_DIR FRONTEND_URLS https://cinerd.pages.dev",
    backendEnvExample:"RESEND_API_KEY EMAIL_FROM DB_DATABASE DB_SERVER",
    rightsMode:"review"
  });
  assert.equal(ok.errors.length,0);
  const no=collectStaticEvidence({
    app:"",workflow:"",render:"",backendEnvExample:"",rightsMode:""
  });
  assert.equal(no.errors.length,9);
});

test("1–4: informa el fallo real de TAP aunque el resumen termine en pruebas correctas",()=>{
  const log=[
    "TAP version 13",
    "ok 1 - primera",
    "not ok 2 - falla en Windows",
    "  ---",
    "  duration_ms: 3.5",
    "  failureType: 'testCodeFailure'",
    "  error: 'Expected values to be strictly equal:'",
    "  expected: 1",
    "  actual: 2",
    "  ...",
    "ok 111 - crearAccessToken preserva la identidad",
    "ok 112 - crearAccessToken falla sin secreto",
    "# tests 112",
    "# pass 111",
    "# fail 1"
  ].join("\n");
  const summary=summarizeCommandFailure(log,1);
  assert.match(summary,/not ok 2 - falla en Windows/);
  assert.match(summary,/expected: 1/);
  assert.doesNotMatch(summary,/crearAccessToken/);
});

test("1–4: error no-TAP también se refleja, sin ocultarlo tras el final del log",()=>{
  assert.match(summarizeCommandFailure("npm error Error: ECONNRESET\nnpm error code ENETUNREACH",1),/npm error/);
  assert.match(summarizeCommandFailure("fallo sin formato conocido",1),/fallo sin formato conocido/);
});
