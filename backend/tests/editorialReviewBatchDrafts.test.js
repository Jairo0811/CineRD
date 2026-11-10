const {test}=require("node:test");
const assert=require("node:assert/strict");
const snapshot=require("../../database/seeds/catalog.snapshot.json");
const drafts=require("../../docs/editorial-sql-replacement-drafts-f23.json");
const sources=require("../../docs/editorial-sources-sql-f2.json");
const permissions=require("../../docs/editorial-provenance-sql-f23.json");
const approvals=require("../../docs/editorial-sql-migration-approvals-f23.json");
const {validateDraft,fingerprint,createBundle}=require("../scripts/prepareEditorialSqlMigration");
const {collectPackets}=require("../scripts/prepareEditorialHumanReview");
const issues=require("../../docs/editorial-issues-f2.json");

const entries=Object.entries(drafts.entries);
test("F-2.3 lote: todas las cinco tramas están redactadas de nuevo en ES/EN",()=>{
  assert.deepEqual(entries.map(([key])=>Number(key)),[5,6,10,55,56]);
  for(const [id,draft] of entries) {
    const film=snapshot.tables.Peliculas.find(x=>x.Id===Number(id));
    assert.equal(validateDraft(film,draft),true);
    assert.equal(draft.draftOrigin,"nueva_redaccion_f23");
    assert.equal(draft.status,"pendiente_revision");
    assert.equal(draft.deployment,"manual_only");
    assert.equal(draft.reviewedBy,null);
    assert.equal(draft.reviewedAt,null);
    assert.notEqual(draft.es,film.Sinopsis);
    assert.ok(draft.es.length>125 && draft.en.length>120);
  }
  assert.equal(drafts.autoPublish,false);
});

test("F-2.3 #5: la redacción evita la cifra de encierro debatida",()=>{
  const d=drafts.entries["5"];
  assert.match(d.es,/tres hombres/);
  assert.match(d.es,/güira, un tambor y un acordeón/);
  assert.doesNotMatch(d.es,/\b(siete|diez|7|10) años\b/i);
  assert.match(d.en,/güira, a drum and an accordion/);
  assert.ok(d.openQuestions.some(x=>x.includes("siete o diez")));
});

test("F-2.3 #56: asesinato y búsqueda legal sin causalidad inventada",()=>{
  const d=drafts.entries["56"];
  assert.match(d.es,/Mercado Nuevo/);
  assert.match(d.es,/asesinado/);
  assert.match(d.es,/vías legales/);
  assert.match(d.en,/Mercado Nuevo/);
  assert.match(d.en,/murdered/);
  assert.doesNotMatch(d.es,/\baccidente fortuito\b/i);
  assert.ok(d.openQuestions.some(x=>x.includes("24 de mayo")));
});

test("F-2.3 lote: todas las fuentes están registradas, ningún permiso inventado",()=>{
  for(const [id,d] of entries) {
    const reg=new Set(sources.entries[id].fuentes.map(x=>x.url));
    assert.equal(new Set(d.sources).size,d.sources.length);
    assert.ok(d.sources.every(x=>x.startsWith("https://") && reg.has(x)));
    assert.equal(d.sourcePermissionStatus,"sin_evidencia_registrada");
    assert.equal(permissions.entries[id].reusePermissionStatus,"sin_evidencia_registrada");
  }
  assert.deepEqual(approvals.approvals,[]);
});

test("F-2.3 lote: cinco nuevos expedientes únicos, todos sin autorización SQL",()=>{
  const packets=collectPackets(snapshot,drafts,permissions,issues,sources);
  assert.equal(packets.length,5);
  assert.equal(new Set(packets.map(x=>x.fingerprint)).size,5);
  for(const r of packets) {
    assert.equal(fingerprint(r.film,r.draft),r.fingerprint);
    assert.throws(()=>createBundle(r.film,r.draft,undefined,snapshot.sourceDatabase));
  }
});
