/**
 * Reporte de estado: no solicita revisión ni simula un dictamen de Google.
 * Ejecutar: node scripts/reportAdSenseReadiness.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { EDITORIALES_PELICULAS } from "../frontend/src/data/editorialPeliculas.js";
import { readCsv, auditRows } from "./verifyMediaRightsLedger.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const snapshot=JSON.parse(fs.readFileSync(path.join(root,"database/seeds/catalog.snapshot.json"),"utf8"));
const rows=readCsv(fs.readFileSync(path.join(root,"docs/media-rights-ledger.csv"),"utf8"));
const audit=auditRows(snapshot,rows);
const films=snapshot.tables.Peliculas;
const people=snapshot.tables.Actores;
const editorial=Object.values(EDITORIALES_PELICULAS);
const pending=editorial.filter(x=>x.estado!=="publicado" && x.estado!=="aprobado");
const missing=films.filter(p=>!EDITORIALES_PELICULAS[p.Id]);
const rightsPending=rows.filter(x=>x.status!=="AUTORIZADO");
const nonEmptySynopsis=films.filter(x=>String(x.Sinopsis||"").trim()).length;
const result={
  catalogo:{peliculas:films.length,talentos:people.length,conSinopsisRegistrada:nonEmptySynopsis},
  editorial:{textos:editorial.length,pendientesRevision:pending.length,peliculasSinEditorial:missing.length},
  derechos:{total:rows.length,autorizados:audit.counts.AUTORIZADO,
    pendientes_o_restringidos:rightsPending.length,integridadDelRegistro:audit.errors.length===0},
  lanzamiento:{
    modoSeguro:"VITE_MEDIA_RIGHTS_MODE=review (opt-in)",
    produccionVerificadaEnVivo:false,
    searchConsoleVerificado:false,
    accesibilidadYEnlacesRevisados:false,
    textosEditorialesAprobadosPorTitular:pending.length===0 && editorial.length>0,
    estadoAdSenseConfirmadoEnPanel:false,
    nuevaRevisionEnviada:false,
  },
};
console.log("CineRD — Fases A–D / informe de preparación");
console.log(JSON.stringify(result,null,2));
console.log("\nNO LISTO para solicitar revisión. Hay validaciones legales/editoriales y de producción externas pendientes.");
if(audit.errors.length)process.exitCode=1;
