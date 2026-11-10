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
const f23Approval=read("docs/f23-approved-release-dates-2026-11-09.json");
const f23Second=read("docs/f23-approved-remaining-5-dates-2026-11-09.json");
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
  let dates=0,retained=0,corrected=0;
  for(const entry of dossier.items) {
    const aviso=REVISIONES_PUBLICAS[entry.filmId];
    const film=films.get(entry.filmId);
    ensure(film && normalize(aviso.titulo)===normalize(entry.title) &&
      normalize(film.Titulo)===normalize(entry.title),
      "Título o ID desactualizado en alerta pública #"+entry.filmId);
    // F-2.6 es expediente HISTORICO: sus seis observaciones siguen siendo
    // entradas válidas. La aprobación real consta por separado en F-2.3.
    // Entre SQL y Git HEAD se permite SOLO fecha antigua o fecha aprobada.
    // #36 sigue advirtiendo aunque ya se incorpore su fecha aprobada:
    // no existe corroboración primaria independiente del estreno RD en 1997.
    if(entry.proposals.length===1) {
      const first=entry.filmId===40;
      const approval=first ? f23Approval : f23Second;
      const decision=approval.decisions?.find(x=>x.filmId===entry.filmId);
      ensure((first ? approval.executableChangesApplied===true :
        approval.sqlApplied===true && approval.backupForThisBatchVerified===true) &&
        approval.executionEvidence?.affectedIds?.includes(entry.filmId) &&
        decision?.field==="FechaEstreno" &&
        decision.decision==="APROBAR_CANDIDATA" &&
        entry.state==="PENDIENTE_DECISION_HUMANA" &&
        entry.applyAuthorized===false &&
        entry.proposals.length===1 &&
        entry.proposals[0].field==="FechaEstreno" &&
        entry.proposals[0].from===decision.currentSql &&
        entry.proposals[0].to===decision.approvedNewValue &&
        aviso.tipo==="fecha" &&
        aviso.fechaActual===decision.currentSql &&
        aviso.fechaAprobada===decision.approvedNewValue &&
        (entry.filmId===36 ? aviso.evidenciaIndependientePendiente===true :
          aviso.evidenciaIndependientePendiente!==true),
        "F-2.3/F-2.6 no concuerdan con #"+entry.filmId);
      const date=String(film.FechaEstreno).slice(0,10);
      ensure(date===decision.currentSql || date===decision.approvedNewValue,
        "Fecha del catálogo fuera de transición aprobada #"+entry.filmId);
      const shouldKeepWarning=date!==decision.approvedNewValue ||
        aviso.evidenciaIndependientePendiente===true;
      if(shouldKeepWarning) {
        ensure(obtenerAvisoRevision(film,"es") &&
          obtenerAvisoRevision(film,"en"),
          "Aviso retirado antes de completar revisión editorial #"+entry.filmId);
        dates++;
      } else {
        ensure(obtenerAvisoRevision(film,"es")===null &&
          obtenerAvisoRevision(film,"en")===null,
          "Aviso de fecha corregida sigue presente #"+entry.filmId);
        corrected++;
      }
      continue;
    }
    ensure(String(film.FechaEstreno).slice(0,10)===aviso.fechaActual,
      "Fecha del catálogo cambió; revisar aviso público y fuentes #"+entry.filmId);
    ensure(entry.state==="PENDIENTE_DECISION_HUMANA" &&
      entry.applyAuthorized===false,
      "Estado editorial cambió; revisar y actualizar señal pública #"+entry.filmId);
    const expectedType=entry.filmId===31 ? "fecha_sin_confirmar" : "genero";
    ensure(aviso.tipo===expectedType,"Tipo de observación incorrecto #"+entry.filmId);
    retained++;
    ensure(obtenerAvisoRevision(film,"es") &&
      obtenerAvisoRevision(film,"en"),
      "Aviso público ausente en ES/EN #"+entry.filmId);
  }
  ensure(dates+corrected===6&&retained===2,
    "Se esperaban seis expedientes de fecha (corregidos o pendientes) y dos retenidos");
  return {warnings:dates+retained,dates,retained,corrected};
}
try {
 const result=verify();
 console.log("✓ CineRD: "+result.warnings+" avisos factuales públicos verificados ("+
   result.dates+" fechas por revisar, "+result.corrected+
   " corregidas y "+result.retained+" retenidos). Sin aprobaciones inventadas.");
}catch(error) {
 console.error("✗ Integridad de avisos editoriales: "+error.message);
 process.exitCode=1;
}
