const {test}=require("node:test");
const assert=require("node:assert/strict");
const snapshot=require("../../database/seeds/catalog.snapshot.json");
const drafts=require("../../docs/editorial-sql-replacement-drafts-f23.json");
const sources=require("../../docs/editorial-sources-sql-f2.json");
const issues=require("../../docs/editorial-issues-f2.json");
const provenance=require("../../docs/editorial-provenance-sql-f23.json");
const approvals=require("../../docs/editorial-sql-migration-approvals-f23.json");
const {fingerprint,validateDraft,createBundle}=require("../scripts/prepareEditorialSqlMigration");
const {collectPackets,createReviewPacket}=require("../scripts/prepareEditorialHumanReview");

const film=snapshot.tables.Peliculas.find(x=>x.Id===6);
const draft=drafts.entries["6"];

test("F-2.3 #6: sinopsis renovada es candidata ES/EN y no modifica el SQL actual",()=>{
  assert.equal(validateDraft(film,draft),true);
  assert.equal(draft.draftOrigin,"nueva_redaccion_f23");
  assert.match(draft.es,/Bruno/);
  assert.match(draft.es,/Biembo/);
  assert.match(draft.es,/conductor de un vehículo de transporte de valores/);
  assert.match(draft.es,/primera noche/);
  assert.match(draft.en,/Bruno/);
  assert.match(draft.en,/Biembo/);
  assert.match(draft.en,/cash transport vehicle/);
  assert.match(draft.en,/robbery orchestrated from within the company/);
  assert.doesNotMatch(draft.en,/\barmored\b/i);
  assert.notEqual(draft.es,film.Sinopsis);
  assert.equal(draft.status,"pendiente_revision");
  assert.equal(draft.deployment,"manual_only");
  assert.equal(drafts.autoPublish,false);
  assert.equal(draft.reviewedBy,null);
  assert.equal(draft.reviewedAt,null);
});

test("F-2.3 #6: las nuevas referencias constan en el libro de fuentes",()=>{
  const expected=[
    "https://www.casamerica.es/cine/ladrones-domicilio",
    "https://www.diariolibre.com/amp/revista/ladrones-a-domicilio-se-estrena-14-de-agosto-AADL25057",
    "https://www.diariolibre.com/amp/revista/ladrones-a-domicilio-la-nueva-pelcula-del-director-ngel-muiz-YCDL23032"
  ];
  const registered=new Set(sources.entries["6"].fuentes.map(x=>x.url));
  assert.equal(draft.sources.length,5);
  assert.equal(new Set(draft.sources).size,draft.sources.length);
  for(const url of expected) {
    assert.ok(registered.has(url));
    assert.ok(draft.sources.includes(url));
  }
  assert.ok(draft.sources.every(url=>registered.has(url)));
});

test("F-2.3 #6: cada cambio de texto o fuentes cambia la huella de migración",()=>{
  const before=fingerprint(film,draft);
  const edited={...draft,en:draft.en+" Additional sentence."};
  const alternative={...draft,sources:draft.sources.slice(0,-1)};
  assert.match(before,/^[a-f0-9]{64}$/);
  assert.notEqual(fingerprint(film,edited),before);
  assert.notEqual(fingerprint(film,alternative),before);
});

test("F-2.3 #6: no registra permisos ni autoriza creación de SQL",()=>{
  assert.equal(provenance.entries["6"].reusePermissionStatus,"sin_evidencia_registrada");
  assert.equal(provenance.entries["6"].textOriginStatus,"por_identificar");
  assert.equal(approvals.approvals.length,0);
  assert.equal(issues.items.find(x=>x.filmId===6&&x.kind==="sinopsis").status,"pendiente_verificacion");
  assert.ok(draft.openQuestions.length>=3);
  assert.throws(()=>createBundle(film,draft,undefined,snapshot.sourceDatabase));
});

test("F-2.3 #6: expediente humano contiene fuentes y casillas sin completar",()=>{
  const packets=collectPackets(snapshot,drafts,provenance,issues,sources);
  assert.equal(packets.length,5);
  const packet=packets.find(x=>x.film.Id===6);
  assert.equal(packet.fingerprint,fingerprint(film,draft));
  const md=createReviewPacket(packet);
  assert.ok(md.includes(draft.es));
  assert.ok(md.includes(draft.en));
  assert.ok(md.includes("https://www.casamerica.es/cine/ladrones-domicilio"));
  assert.ok(md.includes("https://www.diariolibre.com/amp/revista/ladrones-a-domicilio-se-estrena-14-de-agosto-AADL25057"));
  assert.match(md,/\[PENDIENTE\]/);
  assert.match(md,/- \[ \] Contrasté la trama/);
});
