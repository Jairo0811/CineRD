const {test}=require('node:test');
const assert=require('node:assert/strict');
const {reportConfig,isHttpsOrigin,parse}=require('../scripts/auditProductionEnv');

const valid=()=>({
  NODE_ENV:'production',
  FRONTEND_URLS:'https://cinerd.pages.dev,https://cinerd.netlify.app',
  PUBLIC_APP_URL:'https://cinerd.pages.dev',
  DB_SERVER:'sql.cinerd.internal',
  DB_PORT:'1433',DB_DATABASE:'CRUDPeliculas',DB_USER:'cinerd_rw',
  DB_PASSWORD:'EXAMPLE_REDACTED_STRONG_PASSWORD_123456',
  DB_ENCRYPT:'true',DB_TRUST_CERT:'false',
  JWT_ACCESS_SECRET:'EXAMPLE_REDACTED_LONG_RANDOM_TOKEN_LENGTH_123456789',
  RESEND_API_KEY:'re_example_dummy_long_key_123456789',
  EMAIL_FROM:'CineRD <notificaciones@cinerd.org>',
  UPLOADS_DIR:'/var/data/uploads',PRIVATE_STORAGE_DIR:'/var/data/private'
});
test('audita variables sin exponer contraseñas ni tokens',()=>{
  const env=valid(),out=reportConfig(env);
  assert.equal(out.status,'CONFIG_REVIEW_READY');
  assert.equal(out.problems.length,0);
  assert.equal(out.missingKeys.length,0);
  assert.equal(out.secretsPrinted,false);
  for(const secret of [env.DB_PASSWORD,env.JWT_ACCESS_SECRET,env.RESEND_API_KEY])
    assert.ok(!JSON.stringify(out).includes(secret));
  assert.ok(out.externalVerifications.some(x=>x.includes('restore')));
});
test('bloquea ausencias, secretos de ejemplo, SQL de tests y cifrado débil',()=>{
  const x=valid();x.DB_PASSWORD='your_password';x.DB_DATABASE='CRUDPeliculas_E2E';
  x.DB_ENCRYPT='false';x.DB_TRUST_CERT='true';delete x.RESEND_API_KEY;
  const out=reportConfig(x);
  assert.equal(out.status,'BLOCKED');
  assert.ok(out.missingKeys.includes('RESEND_API_KEY'));
  assert.ok(out.problems.some(x=>x.includes('DB_ENCRYPT')));
  assert.ok(out.problems.some(x=>x.includes('DB_TRUST_CERT')));
  assert.ok(out.problems.some(x=>x.includes('DB_DATABASE')));
  assert.ok(out.problems.some(x=>x.includes('DB_PASSWORD')));
});
test('bloquea origen HTTP, localhost y rutas con secretos',()=>{
  for(const url of ['http://cinerd.pages.dev','https://localhost:5173',
    'https://user:password@cinerd.pages.dev','https://cinerd.pages.dev/api',
    'https://cinerd.pages.dev?token=ABC','https://192.168.1.2']){
    assert.equal(isHttpsOrigin(url),false,url);
  }
  const x=valid();x.FRONTEND_URLS='https://cinerd.pages.dev,http://localhost:5173';
  assert.equal(reportConfig(x).status,'BLOCKED');
});
test('storage privado y publico requieren rutas separadas',()=>{
  const x=valid();x.PRIVATE_STORAGE_DIR='/var/data/uploads/private';
  assert.ok(reportConfig(x).problems.some(x=>x.startsWith('STORAGE:')));
  x.PRIVATE_STORAGE_DIR='relative/private';
  assert.ok(reportConfig(x).problems.some(x=>x.startsWith('PRIVATE_STORAGE_DIR:')));
});
test('no acepta opciones de deploy, cambios o secret printing',()=>{
  assert.deepEqual(parse([]),{strict:false,json:false});
  assert.deepEqual(parse(['--strict','--json']),{strict:true,json:true});
  assert.throws(()=>parse(['--apply']));
  assert.throws(()=>parse(['--json','--json']));
});
