const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  collectPackets, createReviewPacket, parseArgs
} = require("../scripts/prepareEditorialHumanReview");
const snapshot = require("../../database/seeds/catalog.snapshot.json");
const drafts = require("../../docs/editorial-sql-replacement-drafts-f23.json");
const provenance = require("../../docs/editorial-provenance-sql-f23.json");
const issues = require("../../docs/editorial-issues-f2.json");
const sources = require("../../docs/editorial-sources-sql-f2.json");
const copy = x => JSON.parse(JSON.stringify(x));

test("F-2.3: cinco expedientes coinciden con las cinco sinopsis SQL", () => {
  const rows = collectPackets(snapshot,drafts,provenance,issues,sources);
  assert.deepEqual(rows.map(x=>x.film.Id),[5,6,10,55,56]);
  assert.equal(rows.length,5);
  assert.equal(new Set(rows.map(x=>x.fingerprint)).size,5);
});

test("F-2.3: paquete de revisión contiene SQL, ES, EN y notas sin firmas falsas", () => {
  const rows = collectPackets(snapshot,drafts,provenance,issues,sources);
  const item = rows.find(x=>x.film.Id===55);
  const doc = createReviewPacket(item);
  assert.match(doc, /## A\. Sinopsis SQL existente/);
  assert.ok(doc.includes(item.film.Sinopsis.replace(/\r\n/g,"\n")));
  assert.ok(doc.includes(item.draft.es));
  assert.ok(doc.includes(item.draft.en));
  assert.ok(doc.includes(item.fingerprint));
  assert.ok(doc.includes(item.origin.researchNote));
  assert.ok(item.draft.sources.every(x=>doc.includes(x)));
  assert.match(doc, /Responsable real:\*\* \[PENDIENTE\]/);
  assert.match(doc, /- \[ \] Contrasté la trama/);
  assert.doesNotMatch(doc, /status:\s*aprobado/);
});

test("F-2.3: no genera paquetes si faltan fuentes o observación", () => {
  const m=copy(issues);m.items=m.items.filter(x=>!(x.kind==="sinopsis"&&x.filmId===5));
  assert.throws(()=>collectPackets(snapshot,drafts,provenance,m,sources),/Procedencia o incidencia/);
  const s=copy(sources);s.entries["55"].fuentes=[];
  assert.throws(()=>collectPackets(snapshot,drafts,provenance,issues,s),/Fuentes no registradas/);
});

test("F-2.3: no atribuye permiso registrado sin evidencia", () => {
  const p=copy(provenance);
  p.entries["6"].reusePermissionStatus="acreditada";
  assert.throws(()=>collectPackets(snapshot,drafts,p,issues,sources),/Procedencia o incidencia/);
});

test("F-2.3: identidad alterada o publicación automática queda rechazada", () => {
  const plan=copy(drafts);plan.entries["5"].title="Una película diferente";
  assert.throws(()=>collectPackets(snapshot,plan,provenance,issues,sources),/Identidad/);
  const published=copy(drafts);published.autoPublish=true;
  assert.throws(()=>collectPackets(snapshot,published,provenance,issues,sources),/incompletos/);
});

test("F-2.3: CLI no permite escritura masiva ni flags de aprobación", () => {
  assert.deepEqual(parseArgs([]),{filmId:null,show:false,write:false});
  assert.deepEqual(parseArgs(["--film-id","55","--show"]),
    {filmId:55,show:true,write:false});
  assert.throws(()=>parseArgs(["--write"]),/requieren --film-id/);
  assert.throws(()=>parseArgs(["--show","--write","--film-id","55"]),/no se combinan/);
  assert.throws(()=>parseArgs(["--approved"]),/Argumento desconocido/);
  assert.throws(()=>parseArgs(["--film-id","../5","--write"]),/número positivo/);
});

test("F-2.3: fingerprints varían si se modifica el texto revisable", () => {
  const one=collectPackets(snapshot,drafts,provenance,issues,sources).find(x=>x.film.Id===10);
  const altered=copy(drafts);altered.entries["10"].en+=" Translation updated.";
  const next=collectPackets(snapshot,altered,provenance,issues,sources).find(x=>x.film.Id===10);
  assert.notEqual(one.fingerprint,next.fingerprint);
});
