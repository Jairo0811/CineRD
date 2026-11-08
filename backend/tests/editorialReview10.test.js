const {test}=require("node:test");
const assert=require("node:assert/strict");
const snapshot=require("../../database/seeds/catalog.snapshot.json");
const drafts=require("../../docs/editorial-sql-replacement-drafts-f23.json");
const sources=require("../../docs/editorial-sources-sql-f2.json");
const issues=require("../../docs/editorial-issues-f2.json");
const provenance=require("../../docs/editorial-provenance-sql-f23.json");
const approvals=require("../../docs/editorial-sql-migration-approvals-f23.json");
const e5=require("../../docs/editorial-approvals-e5.json");
const {fingerprint,validateDraft,createBundle}=require("../scripts/prepareEditorialSqlMigration");
const {collectPackets,createReviewPacket}=require("../scripts/prepareEditorialHumanReview");

const film=snapshot.tables.Peliculas.find(x=>x.Id===10);
const draft=drafts.entries["10"];

test("F-2.3 #10: nueva sinopsis ES/EN es candidata, no SQL ni publicación",()=>{
  assert.equal(validateDraft(film,draft),true);
  assert.equal(draft.draftOrigin,"nueva_redaccion_f23");
  assert.equal(draft.status,"pendiente_revision");
  assert.equal(draft.deployment,"manual_only");
  assert.equal(draft.reviewedBy,null);
  assert.equal(draft.reviewedAt,null);
  assert.equal(drafts.autoPublish,false);
  assert.match(draft.es,/Michael, Pedro, Mateo y Antonio/);
  assert.match(draft.es,/150 millones de pesos/);
  assert.match(draft.en,/Michael, Pedro, Mateo and Antonio/);
  assert.match(draft.en,/150 million Dominican pesos/);
  assert.match(draft.en,/auditing department/);
  assert.notEqual(draft.es.trim(),film.Sinopsis.trim());
});

test("F-2.3 #10: toda fuente de la propuesta está registrada en el catálogo",()=>{
  const added=[
    "https://www.diariolibre.com/revista/vamos-de-robo-a-las-salas-de-cines-en-enero-BMDL406632",
    "https://eldia.com.do/publico-valora-filme-vamos-de-robo/",
    "https://www.diariolibre.com/amp/revista/cine/vamos-de-robo-DIDL447141"
  ];
  const registered=new Set(sources.entries["10"].fuentes.map(x=>x.url));
  assert.equal(draft.sources.length,5);
  assert.equal(new Set(draft.sources).size,draft.sources.length);
  assert.ok(draft.sources.every(u=>registered.has(u)));
  for(const u of added)assert.ok(draft.sources.includes(u));
});

test("F-2.3 #10: fecha 15 del snapshot permanece hasta decisión independiente",()=>{
  assert.equal(film.FechaEstreno.slice(0,10),"2014-01-15");
  assert.ok(draft.openQuestions.some(x=>x.includes("2014-01-16")));
  assert.equal(issues.items.find(x=>x.filmId===10&&x.kind==="sinopsis").status,"pendiente_verificacion");
});

test("F-2.3 #10: nueva huella cambia al cambiar cualquiera de los candidatos",()=>{
  const hash=fingerprint(film,draft);
  assert.match(hash,/^[a-f0-9]{64}$/);
  assert.notEqual(hash,fingerprint(film,{...draft,es:draft.es+" Ampliación."}));
  assert.notEqual(hash,fingerprint(film,{...draft,en:draft.en+" Additional sentence."}));
  assert.notEqual(hash,fingerprint(film,{...draft,sources:draft.sources.slice(0,-1)}));
});

test("F-2.3 #10: autorizaciones y derechos continúan pendientes",()=>{
  assert.equal(provenance.entries["10"].textOriginStatus,"por_identificar");
  assert.equal(provenance.entries["10"].reusePermissionStatus,"sin_evidencia_registrada");
  assert.equal(draft.sourcePermissionStatus,"sin_evidencia_registrada");
  assert.deepEqual(approvals.approvals,[]);
  assert.deepEqual(e5.approvals,[]);
  assert.throws(()=>createBundle(film,draft,undefined,snapshot.sourceDatabase));
});

test("F-2.3 #10: expediente de revisión contiene ES, EN, fuentes y casillas vacías",()=>{
  const packets=collectPackets(snapshot,drafts,provenance,issues,sources);
  assert.deepEqual(packets.map(x=>x.film.Id),[5,6,10,55,56]);
  const row=packets.find(x=>x.film.Id===10);
  assert.equal(row.fingerprint,fingerprint(film,draft));
  const packet=createReviewPacket(row);
  assert.ok(packet.includes(draft.es));
  assert.ok(packet.includes(draft.en));
  assert.ok(packet.includes(draft.sources[4]));
  assert.match(packet,/\[PENDIENTE\]/);
  assert.match(packet,/- \[ \] Contrasté la trama/);
});
