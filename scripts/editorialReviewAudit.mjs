/**
 * E-5: editorial inventory and accountable review gate.
 * Never self-approves content. Text can be approved only through a manual,
 * attributed entry whose SHA-256 matches the current version and source list.
 * --strict fails while editorial review is incomplete (for AdSense preflight).
 */
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getEditorialPelicula } from "../frontend/src/data/editorialPeliculas.js";
import { getSinopsisEditorial } from "../frontend/src/data/sinopsisCuradasFaseE.js";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const snap=JSON.parse(fs.readFileSync(path.join(root,"database/seeds/catalog.snapshot.json"),"utf8"));
const ledger=JSON.parse(fs.readFileSync(path.join(root,"docs/editorial-approvals-e5.json"),"utf8"));
const clean=x=>String(x??"").replace(/\s+/g," ").trim();
const sha256=x=>createHash("sha256").update(JSON.stringify(x)).digest("hex");
const sourceUrls=refs=>(refs||[]).map(x=>x.url).filter(Boolean).sort();
function makeItem(film,kind,textEs,textEn,urls=[],origin="EDITORIAL") {
  const base={filmId:Number(film.Id),kind,es:clean(textEs),en:clean(textEn),sources:[...urls].sort()};
  return {
    filmId:Number(film.Id),titulo:film.Titulo,kind,origin,
    fingerprint:sha256(base),
    caracteresEs:base.es.length,caracteresEn:base.en.length,
    fuentes:base.sources.length,
    faltanFuentes:base.sources.length===0,
    fuenteInvalida:base.sources.some(url=>{try{return new URL(url).protocol!=="https:"}catch{return true}}),
  };
}
export function validateApprovals(items,approvals) {
  if(!Array.isArray(approvals))throw Error("Se esperaba el arreglo approvals");
  const index=new Map(items.map(i=>[i.kind+":"+i.filmId,i]));
  const seen=new Set();
  const failures=[];
  const approved=new Set();
  for(const a of approvals) {
    const key=a.kind+":"+a.filmId;
    if(seen.has(key)){failures.push("Aprobación duplicada "+key);continue}
    seen.add(key);
    const item=index.get(key);
    if(!item){failures.push("Ítem ajeno al inventario "+key);continue}
    if(a.status!=="aprobado" || !a.reviewer || typeof a.reviewer!=="string" ||
      !a.reviewedAt || Number.isNaN(Date.parse(a.reviewedAt)) ||
      !a.sourcesChecked || typeof a.notes!=="string" || !a.notes.trim()) {
      failures.push("Revisión humana incompleta "+key);continue;
    }
    if(a.fingerprint!==item.fingerprint){failures.push("Contenido modificado tras la aprobación "+key);continue}
    approved.add(key);
  }
  return {approved,failures};
}
function inventory() {
  const items=[];
  for(const film of snap.tables.Peliculas) {
    const sql=clean(film.Sinopsis);
    const curated=sql?null:getSinopsisEditorial(film);
    if(sql) items.push(makeItem(film,"sinopsis",sql,"",[], "SQL"));
    else if(curated) items.push(makeItem(film,"sinopsis",curated.es,curated.en,sourceUrls(curated.fuentes)));
    else throw Error("Sin sinopsis visible: "+film.Id);
    const editorial=getEditorialPelicula(film);
    if(editorial) items.push(makeItem(film,"contexto",
      editorial.es.parrafos.join("\n\n"),editorial.en.parrafos.join("\n\n"),sourceUrls(editorial.fuentes)));
  }
  return items;
}
function main() {
  const items=inventory();
  if(ledger.version!==1 || !Array.isArray(ledger.approvals))throw Error("Libro de revisiones inválido");
  const {approved,failures}=validateApprovals(items,ledger.approvals);
  const warnings=[];
  const missingSources=items.filter(x=>x.faltanFuentes).map(x=>x.kind+":"+x.filmId);
  const invalidSources=items.filter(x=>x.fuenteInvalida).map(x=>x.kind+":"+x.filmId);
  const short=items.filter(x=>x.caracteresEs<100).map(x=>x.kind+":"+x.filmId);
  if(invalidSources.length)failures.push("URLs de fuente inválidas: "+invalidSources.join(", "));
  if(short.length)warnings.push("Textos muy cortos: "+short.join(", "));
  if(missingSources.length)warnings.push("Sin URL de fuente registrada: "+missingSources.join(", "));
  const report={
    total:items.length,sinopsis:items.filter(x=>x.kind==="sinopsis").length,
    contextos:items.filter(x=>x.kind==="contexto").length,
    pendientes:items.length-approved.size,aprobados:approved.size,
    warnings,failures,items:items.map(i=>({...i,status:approved.has(i.kind+":"+i.filmId)?"aprobado":"pendiente_revision"})),
  };
  if(process.argv.includes("--json"))console.log(JSON.stringify(report,null,2));
  else {
    console.log("CineRD E-5 / auditoría de revisión editorial");
    console.log(report.sinopsis+" sinopsis + "+report.contextos+" contextos = "+report.total+" piezas");
    console.log("Aprobadas con revisión atribuida y huella vigente: "+report.aprobados+
      "; pendientes: "+report.pendientes);
    for(const m of warnings)console.warn("⚠ "+m);
    for(const m of failures)console.error("✗ "+m);
    console.log("Ningún texto se aprueba de manera automática.");
  }
  if(failures.length || (process.argv.includes("--strict") && report.pendientes>0))process.exitCode=1;
}
const invoked=process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url);
if(invoked) main();
export {makeItem, inventory};
