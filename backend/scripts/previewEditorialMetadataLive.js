/**
 * CineRD F-2.7 — six date candidates F-2.6, STRICTLY READ-ONLY.
 * This script never applies, approves, exports, or modifies records.
 *
 * --offline: validate versioned snapshot/dossier/issue matrix without SQL.
 * default: compare candidates against dbo.Peliculas using a single SELECT.
 */
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "../..");
const read = relative => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const QUERY = "SELECT Id,Titulo,FechaEstreno FROM dbo.Peliculas WHERE Id IN (@id0,@id1,@id2,@id3,@id4,@id5)";
const EXPECTED_IDS = [27, 36, 40, 42, 44, 56];

function day(value) {
  if (value == null) return null;
  if (value instanceof Date) {
    if (!Number.isFinite(value.getTime())) return null;
    return value.toISOString().slice(0, 10);
  }
  return String(value).slice(0, 10);
}

function validDate(s) {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const date = new Date(s + "T00:00:00.000Z");
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === s;
}

function normalizedTitle(s) {
  return String(s ?? "").trim().replace(/\s+/g, " ");
}

function assert(ok, message) { if (!ok) throw Error(message); }

/** Validate all eight dossier entries and each of the six proposed changes.
 * Keep the existing human and legal approval gates independent from this tool.
 */
function validateDossier(dossier, snapshot, matrix, legacyE4) {
  assert(dossier && dossier.version === 1 && dossier.edition === "F-2.6" &&
    dossier.automaticApply === false && dossier.approvalsCreated === false &&
    Array.isArray(dossier.items) && dossier.items.length === 8,
    "F-2.6: expediente alterado o incompleto");
  assert(snapshot && typeof snapshot.sourceDatabase === "string" &&
    Array.isArray(snapshot.tables?.Peliculas), "F-2.6: snapshot inválido");
  assert(matrix && Array.isArray(matrix.items) &&
    legacyE4 && Array.isArray(legacyE4.rows), "F-2.6: matriz/E-4 inválidos");
  const films = new Map(snapshot.tables.Peliculas.map(f => [Number(f.Id), f]));
  const seen = new Set();
  const proposals = [];
  for (const entry of dossier.items) {
    assert(Number.isInteger(entry.filmId) && !seen.has(entry.filmId),
      "F-2.6: película duplicada/ID inválido");
    seen.add(entry.filmId);
    const film = films.get(entry.filmId);
    assert(film && normalizedTitle(film.Titulo) === normalizedTitle(entry.title),
      "F-2.6: identidad ajena al snapshot: " + entry.filmId);
    assert(entry.applyAuthorized === false && entry.state === "PENDIENTE_DECISION_HUMANA",
      "F-2.6: autorización no atribuida/prohibida: " + entry.filmId);
    assert(["alta", "media", "mixta", "insuficiente"].includes(entry.confidence) &&
      Array.isArray(entry.sources) && entry.sources.length >= 2 &&
      entry.sources.every(url => {
        try { return new URL(url).protocol === "https:"; }
        catch { return false; }
      }), "F-2.6: fuentes o confianza inválidas en " + entry.filmId);
    assert(Array.isArray(entry.proposals) && entry.proposals.length <= 1,
      "F-2.6: solo un cambio de fecha como máximo por película");
    const issue = matrix.items.find(x => x.filmId === entry.filmId &&
      x.kind === entry.kind && x.priority === "alta");
    assert(issue && normalizedTitle(issue.title) === normalizedTitle(entry.title) &&
      issue.status === "pendiente_verificacion",
      "F-2.6: observación alta faltante o cerrada indebidamente: " + entry.filmId);
    for (const p of entry.proposals) {
      assert(p.field === "FechaEstreno" && validDate(p.from) &&
        validDate(p.to) && p.from !== p.to, "F-2.6: modificación de fecha inválida");
      const snapshotDay = day(film.FechaEstreno);
      assert(snapshotDay === p.from || snapshotDay === p.to,
        "F-2.6: fecha distinta en snapshot: " + entry.filmId);
      assert(!legacyE4.rows.some(r => r.filmId === entry.filmId && r.field === p.field),
        "F-2.6: colisión con corrección E-4 histórica: " + entry.filmId);
      proposals.push({
        filmId:entry.filmId, title:normalizedTitle(entry.title),
        previous:p.from, proposed:p.to, snapshotCurrent:snapshotDay,
        confidence:entry.confidence, approval:"PENDIENTE_DECISION_HUMANA",
        sources:entry.sources.slice()
      });
    }
  }
  assert(proposals.length === 6 &&
    EXPECTED_IDS.every(id => proposals.some(p => p.filmId === id)) &&
    EXPECTED_IDS.every(id => seen.has(id)),
    "F-2.6: los seis candidatos de fecha no coinciden con el lote");
  proposals.sort((a, b) => a.filmId - b.filmId);
  return {database:snapshot.sourceDatabase, items:proposals,
    retained:dossier.items.filter(x => x.proposals.length === 0).map(x => x.filmId),
    humanApprovals:0, applyAuthorized:false};
}

function compareLiveDateCandidates(batch, records) {
  assert(batch && Array.isArray(batch.items) && batch.items.length === 6 &&
    Array.isArray(records), "F-2.6: consulta SQL inválida");
  const expectedIds = new Set(batch.items.map(x => x.filmId));
  const found = new Map();
  for (const r of records) {
    const id = Number(r?.Id);
    assert(Number.isInteger(id) && expectedIds.has(id) && !found.has(id),
      "F-2.6: SQL devolvió un registro ajeno o duplicado");
    found.set(id, r);
  }
  const items = batch.items.map(item => {
    const record = found.get(item.filmId);
    const sqlCurrent = record ? day(record.FechaEstreno) : null;
    let status;
    if (!record) status = "MISSING";
    else if (normalizedTitle(record.Titulo) !== item.title || !validDate(sqlCurrent))
      status = "DRIFT";
    else if (sqlCurrent === item.previous) status = "ORIGINAL";
    else if (sqlCurrent === item.proposed) status = "ALREADY";
    else status = "DRIFT";
    return {...item, sqlCurrent, status,
      matchesSnapshot:status !== "MISSING" && status !== "DRIFT" &&
        sqlCurrent === item.snapshotCurrent};
  });
  const counts = Object.fromEntries(["ORIGINAL", "ALREADY", "DRIFT", "MISSING"]
    .map(status => [status, items.filter(i => i.status === status).length]));
  const snapshotMismatch = items.filter(i => !i.matchesSnapshot).length;
  return {items, counts, snapshotMismatch, hasDrift:counts.DRIFT + counts.MISSING > 0,
    allOriginal:counts.ORIGINAL === 6, allAlready:counts.ALREADY === 6,
    mixed:counts.ORIGINAL > 0 && counts.ALREADY > 0,
    safeToApplyAutomatically:false,
    note:"Solo lectura. Las seis fechas son propuestas, no cambios aprobados."};
}

async function selectLiveDates(pool, batch, sqlDriver) {
  assert(batch?.items?.length === 6, "F-2.6: lote incompleto");
  let request = pool.request();
  for (let i = 0; i < 6; i++) {
    const id = batch.items[i].filmId;
    assert(Number.isInteger(id) && id > 0, "F-2.6: ID no seguro");
    request = request.input("id" + i, sqlDriver.Int, id);
  }
  const result = await request.query(QUERY);
  assert(Array.isArray(result?.recordset), "F-2.6: SQL devolvió una respuesta inválida");
  return result.recordset;
}

async function main(argv = process.argv.slice(2)) {
  assert(argv.length <= 1 && (!argv.length || argv[0] === "--offline"),
    "Uso: previewEditorialMetadataLive.js [--offline] (sin --apply)");
  const batch = validateDossier(
    read("docs/editorial-metadata-candidates-f26.json"),
    read("database/seeds/catalog.snapshot.json"),
    read("docs/editorial-issues-f2.json"),
    read("docs/catalog-corrections-e4.json")
  );
  if (argv[0] === "--offline") {
    console.log("✓ F-2.6 validado sin SQL: seis fechas candidatas, dos expedientes retenidos.");
    console.log("  IDs: " + batch.items.map(x => x.filmId).join(", ") +
      "; base: " + batch.database + "; permisos: 0/6");
    console.log("  Política FechaEstreno: propuesta documental; no se autoriza ningún UPDATE.");
    return;
  }
  require("dotenv").config({path:path.join(root, "backend/.env")});
  const sql = require("mssql");
  const env = process.env;
  assert(env.DB_DATABASE === batch.database, "DB_DATABASE diferente al snapshot, no consultar");
  for (const key of ["DB_SERVER", "DB_USER", "DB_PASSWORD"])
    assert(env[key], "Variable faltante en backend/.env: " + key);
  const pool = new sql.ConnectionPool({
    server:env.DB_SERVER, user:env.DB_USER, password:env.DB_PASSWORD,
    database:env.DB_DATABASE, port:Number(env.DB_PORT || 1433),
    options:{encrypt:env.DB_ENCRYPT === "true",
      trustServerCertificate:env.DB_TRUST_CERT !== "false"},
    requestTimeout:15000
  });
  await pool.connect();
  let comparison;
  try {
    const rows = await selectLiveDates(pool,batch,sql);
    comparison = compareLiveDateCandidates(batch,rows);
  } finally { await pool.close(); }
  console.log("CineRD F-2.7 / comparación de seis fechas SQL (SOLO LECTURA)");
  for (const x of comparison.items) console.log("  ["+x.status+"] #"+x.filmId+" "+
    x.title+": SQL="+(x.sqlCurrent ?? "NULL")+" | snapshot="+x.snapshotCurrent+
    " | anterior="+x.previous+" | candidato="+x.proposed+
    " | coinciden="+(x.matchesSnapshot?"SI":"NO")+" | revisión=PENDIENTE");
  const c=comparison.counts;
  console.log("Resultado: "+c.ORIGINAL+" anteriores; "+c.ALREADY+
    " propuestas presentes; "+c.DRIFT+" diferencias; "+c.MISSING+
    " ausentes; "+comparison.snapshotMismatch+" desacuerdos SQL/snapshot.");
  console.log("NO ejecutar UPDATE, importaciones ni exportaciones automáticas. Las seis decisiones y el respaldo restaurable siguen pendientes.");
  if(comparison.hasDrift || comparison.snapshotMismatch)
    process.exitCode=1;
}
if(require.main===module) main().catch(err=>{
  console.error("✗ F-2.7: "+err.message);
  process.exitCode=1;
});
module.exports={QUERY,validDate,day,validateDossier,compareLiveDateCandidates,selectLiveDates};
