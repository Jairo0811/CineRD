/**
 * Verifica que los avisos públicos coincidan EXACTAMENTE con el triaje F-2.6.
 * Fail-closed: no publicar fechas sensibles sin su correspondiente advertencia.
 * No conecta a SQL ni cambia contenido.
 */
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {REVISIONES_PUBLICAS, obtenerAvisoRevision} from "../frontend/src/data/revisionCatalogo.js";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const dossier=read("docs/editorial-metadata-candidates-f26.json");
const snapshot=read("database/seeds/catalog.snapshot.json");
const ensure=(ok,message)=>{if(!ok)throw Error(message)};
const normalize=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
  .toLowerCase().replace(/[^a-z0-9]+/g," ").trim();

function verify() {
  ensure(dossier.edition==="F-2.6" && dossier.automaticApply===false &&
    dossier.approvalsCreated===false && dossier.items.length===8,
    "Expediente F-2.6 faltante o cambió de estado");
  const keys=Object.keys(REVISIONES_PUBLICAS).map(Number).sort((a,b)=>a-b);
  const expected=dossier.items.map(x=>x.filmId).sort((a,b)=>a-b);
  ensure(JSON.stringify(keys)===JSON.stringify(expected),
    "Los avisos públicos no cubren exactamente las ocho observaciones F-2.6");
  const films=new Map(snapshot.tables.Peliculas.map(f=>[f.Id,f]));
  let dates=0,retained=0;
  for(const entry of dossier.items) {
    const aviso=REVISIONES_PUBLICAS[entry.filmId];
    const film=films.get(entry.filmId);
    ensure(film && normalize(aviso.titulo)===normalize(entry.title) &&
      normalize(film.Titulo)===normalize(entry.title),
      "Título o ID desactualizado en alerta pública #"+entry.filmId);
    ensure(String(film.FechaEstreno).slice(0,10)===aviso.fechaActual,
      "Fecha del catálogo cambió; revisar aviso público y fuentes #"+entry.filmId);
    ensure(entry.state==="PENDIENTE_DECISION_HUMANA" &&
      entry.applyAuthorized===false,
      "Estado editorial cambió; revisar y actualizar señal pública #"+entry.filmId);
    const expectedType=entry.proposals.length===1 ? "fecha" :
      entry.filmId===31 ? "fecha_sin_confirmar" : "genero";
    ensure(aviso.tipo===expectedType,"Tipo de observación incorrecto #"+entry.filmId);
    if(entry.proposals.length===1) {
      dates++;
      ensure(entry.proposals[0].field==="FechaEstreno" &&
        entry.proposals[0].from===aviso.fechaActual,
        "La fecha propuesta no coincide con el aviso #"+entry.filmId);
    }else retained++;
    ensure(obtenerAvisoRevision(film,"es") &&
      obtenerAvisoRevision(film,"en"),
      "Aviso público ausente en ES/EN #"+entry.filmId);
  }
  ensure(dates===6&&retained===2,"Se esperaban seis fechas y dos casos retenidos");
  return {warnings:keys.length,dates,retained};
}
try {
 const result=verify();
 console.log("✓ CineRD: "+result.warnings+" avisos factuales públicos verificados ("+
   result.dates+" fechas, "+result.retained+" retenidos). Sin aprobaciones inventadas.");
}catch(error) {
 console.error("✗ Integridad de avisos editoriales: "+error.message);
 process.exitCode=1;
}
