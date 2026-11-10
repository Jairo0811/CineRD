const {test}=require("node:test");
const assert=require("node:assert/strict");
const snapshot=require("../../database/seeds/catalog.snapshot.json");
const drafts=require("../../docs/editorial-sql-replacement-drafts-f23.json");
const sources=require("../../docs/editorial-sources-sql-f2.json");
const provenance=require("../../docs/editorial-provenance-sql-f23.json");
const issues=require("../../docs/editorial-issues-f2.json");
const approvals=require("../../docs/editorial-sql-migration-approvals-f23.json");
const {fingerprint,validateDraft,createBundle}
  =require("../scripts/prepareEditorialSqlMigration");
const {collectPackets,createReviewPacket}
  =require("../scripts/prepareEditorialHumanReview");

const film=snapshot.tables.Peliculas.find(x=>x.Id===55);
const draft=drafts.entries["55"];

test("F-2.3 #55: nueva sinopsis bilingüe es una propuesta, no un texto SQL publicado",()=>{
  assert.equal(validateDraft(film,draft),true);
  assert.match(draft.es,/Don Pascual/);
  assert.match(draft.es,/contrata(?:dos)? nuevamente/);
  assert.match(draft.es,/policía/);
  assert.match(draft.en,/Don Pascual/);
  assert.match(draft.en,/(?:are rehired|rehires)/);
  assert.match(draft.en,/(?:suspected by the police|police suspicions)/);
  assert.notEqual(draft.es,film.Sinopsis);
  assert.equal(draft.status,"pendiente_revision");
  assert.equal(draft.deployment,"manual_only");
  assert.equal(draft.reviewedBy,null);
  assert.equal(draft.reviewedAt,null);
  assert.equal(drafts.autoPublish,false);
});

test("F-2.3 #55: noticia contemporánea documentada en el registro antes de citarla",()=>{
  const expected=[
    "https://lacronica.do/roberto-angel-salcedo-inicia-2017-estreno-plan-perfecto/",
    "https://eldia.com.do/el-plan-perfecto-reune-buen-elenco/",
    "https://www.elcaribe.com.do/sin-categoria/el-plan-perfecto-en-gala-premier/",
    "https://cinemadominicano.com/el-plan-perfecto-imperfecto-plan/"
  ];
  const registered=new Set(sources.entries["55"].fuentes.map(x=>x.url));
  for(const url of expected) {
    assert.ok(registered.has(url));
    assert.ok(draft.sources.includes(url));
  }
  assert.equal(new Set(draft.sources).size,draft.sources.length);
  assert.ok(draft.sources.every(url=>registered.has(url)));
  assert.equal(draft.sources.length,7);
});

test("F-2.3 #55: cambiar la redacción y las fuentes exige huella nueva y revisión",()=>{
  const changed=fingerprint(film,draft);
  const previous="63cb8e314dd7797a2e42dcb01699245677556fc7d1b5d043972111f55a904457";
  assert.match(changed,/^[a-f0-9]{64}$/);
  assert.notEqual(changed,previous);
  const other={...draft,es:draft.es+" Texto posterior."};
  assert.notEqual(fingerprint(film,other),changed);
});

test("F-2.3 #55: todas las cuestiones legales y editoriales continúan abiertas",()=>{
  assert.equal(provenance.entries["55"].reusePermissionStatus,"sin_evidencia_registrada");
  assert.equal(provenance.entries["55"].textOriginStatus,"por_identificar");
  assert.equal(provenance.entries["55"].reviewedBy,null);
  assert.equal(approvals.approvals.length,0);
  assert.ok(draft.openQuestions.length>=3);
  assert.equal(issues.items.find(x=>x.filmId===55&&x.kind==="sinopsis").status,"pendiente_verificacion");
  assert.throws(()=>createBundle(film,draft,undefined,snapshot.sourceDatabase));
});

test("F-2.3 #55: expediente humano se actualiza y conserva casillas sin firmar",()=>{
  const packets=collectPackets(snapshot,drafts,provenance,issues,sources);
  assert.equal(packets.length,5);
  const packet=packets.find(x=>x.film.Id===55);
  assert.equal(packet.fingerprint,fingerprint(film,draft));
  const text=createReviewPacket(packet);
  assert.ok(text.includes(draft.es));
  assert.ok(text.includes(draft.en));
  assert.ok(text.includes("https://eldia.com.do/el-plan-perfecto-reune-buen-elenco/"));
  assert.match(text,/\[PENDIENTE\]/);
});
