/**
 * CineRD E-4 — Verify that a newly exported SQL snapshot contains ONLY
 * the seven documented E-4 changes and the export timestamp.
 *
 * Read-only. Compares working copy to Git HEAD; never modifies files, Git
 * index, SQL Server, approvals, publication status or media-rights flags.
 */
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { isDeepStrictEqual } = require("node:util");

const repoRoot = path.resolve(__dirname, "..");
const snapshotPath = "database/seeds/catalog.snapshot.json";
const e4Path = "docs/catalog-corrections-e4.json";

const isDate = x => typeof x === "string" &&
  /^\d{4}-\d{2}-\d{2}(?:T00:00:00(?:\.000)?Z)?$/.test(x) &&
  !Number.isNaN(Date.parse(x.slice(0, 10)+"T00:00:00.000Z"));
const val = (field, value) => {
  if (value === null || value === undefined || value === "") return null;
  if (field === "FechaEstreno") {
    if (!isDate(value)) throw Error("Fecha de estreno con formato inesperado");
    return value.slice(0, 10);
  }
  return typeof value === "string" ? value.trim() : String(value);
};
const isoTimestamp = value => typeof value === "string" &&
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) &&
  Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;

function diffPaths(a, b, prefix = "$", limit = 20, changes = []) {
  if (changes.length >= limit || isDeepStrictEqual(a,b)) return changes;
  if (a && b && typeof a === "object" && typeof b === "object" &&
      Array.isArray(a) === Array.isArray(b)) {
    const keys = [...new Set([...Object.keys(a),...Object.keys(b)])].sort();
    for (const key of keys) {
      if(changes.length >= limit)break;
      diffPaths(a[key], b[key], prefix + (Array.isArray(a) ? "["+key+"]" : "."+key), limit, changes);
    }
  } else changes.push(prefix);
  return changes;
}

function auditExport(before, after, ledger) {
  const problems = [];
  if (!before || !after || !ledger || before.format !== "CineRD.CatalogSnapshot" ||
      !Array.isArray(before.tables?.Peliculas) || !Array.isArray(after.tables?.Peliculas) ||
      !Array.isArray(ledger.rows) || ledger.rows.length !== 7 ||
      ledger.version !== 1) {
    return {ok:false,problems:["Estructura E-4 o snapshot inválido"]};
  }
  if (before.sourceDatabase !== "CRUDPeliculas" || after.sourceDatabase !== before.sourceDatabase)
    problems.push("La base de datos origen cambió o no es CRUDPeliculas");
  if (!isoTimestamp(after.generatedAtUtc) ||
      Date.parse(after.generatedAtUtc) <= Date.parse(before.generatedAtUtc))
    problems.push("La fecha UTC de exportación no avanzó o es inválida");
  const known = new Set();
  const patched = structuredClone(before);
  patched.generatedAtUtc = after.generatedAtUtc;
  const changes = [];
  for (const row of ledger.rows) {
    if (!row || !Number.isInteger(row.filmId) ||
        !["Genero","Director","FechaEstreno"].includes(row.field)) {
      problems.push("Registro E-4 de tipo no permitido");
      continue;
    }
    const key = row.filmId + ":" + row.field;
    if (known.has(key)) { problems.push("Campo E-4 duplicado: "+key); continue; }
    known.add(key);
    const oldFilm=before.tables.Peliculas.find(x=>Number(x.Id)===row.filmId);
    const newFilm=after.tables.Peliculas.find(x=>Number(x.Id)===row.filmId);
    const targetFilm=patched.tables.Peliculas.find(x=>Number(x.Id)===row.filmId);
    if (!oldFilm || !newFilm || !targetFilm ||
        String(oldFilm.Titulo).trim() !== row.title ||
        String(newFilm.Titulo).trim() !== row.title) {
      problems.push("Identidad de la película cambió: "+key);
      continue;
    }
    try {
      if (val(row.field,oldFilm[row.field]) !== val(row.field,row.expected))
        problems.push("La versión HEAD ya no tiene el valor original E-4: "+key);
      if (val(row.field,newFilm[row.field]) !== val(row.field,row.proposed))
        problems.push("La exportación no contiene el valor propuesto E-4: "+key);
      else {
        targetFilm[row.field]=newFilm[row.field];
        changes.push(key);
      }
    } catch (err) {problems.push("Dato E-4 no válido "+key+": "+err.message);}
  }
  if (changes.length !== 7) problems.push("No se comprobaron las siete correcciones");
  if (!isDeepStrictEqual(patched,after)) {
    const unexpected=diffPaths(patched,after);
    problems.push("Diferencias fuera de E-4: "+unexpected.join(", "));
  }
  return {
    ok:problems.length===0,problems,
    expectedChanges:7,verifiedChanges:changes.length,
    verifiedKeys:changes,
    timestampFrom:before.generatedAtUtc,timestampTo:after.generatedAtUtc
  };
}

function main() {
  const known=["--json"];
  if(process.argv.slice(2).some(x=>!known.includes(x))) throw Error("Parámetro desconocido");
  const original=JSON.parse(execFileSync("git",["show","HEAD:"+snapshotPath],{
    cwd:repoRoot,encoding:"utf8",maxBuffer:16*1024*1024
  }));
  const local=JSON.parse(fs.readFileSync(path.join(repoRoot,snapshotPath),"utf8"));
  const ledger=JSON.parse(fs.readFileSync(path.join(repoRoot,e4Path),"utf8"));
  const result=auditExport(original,local,ledger);
  if(process.argv.includes("--json")) console.log(JSON.stringify(result,null,2));
  else {
    console.log("CineRD E-4 — comparación HEAD contra snapshot local (SOLO LECTURA)");
    console.log("Campos validados: "+result.verifiedChanges+"/7.");
    for(const k of result.verifiedKeys||[])console.log("  ✓ "+k);
    for(const p of result.problems)console.error("  ✗ "+p);
    if(result.ok){
      console.log("✓ Solo cambian las 7 correcciones E-4 y generatedAtUtc.");
      console.log("Revisar git diff y, si estás de acuerdo, incluir SOLO database/seeds/catalog.snapshot.json.");
    } else console.error("✗ NO hacer commit del snapshot; hay diferencias que revisar.");
    console.log("Esta comprobación NO aprueba cambios E-4 ni derechos o contenido editorial.");
  }
  if(!result.ok)process.exitCode=1;
}
if(require.main===module) {
  try{main()}catch(err){console.error("✗ "+err.message);process.exitCode=1;}
}
module.exports={auditExport,diffPaths};
