/**
 * Bloqueo preventivo: un CLIENT y SLOT válidos no autorizan por sí solos
 * insertar publicidad en la demo.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createReadinessReport } from "./reportAdSenseReadiness.mjs";
import { resolveMediaRightsBuildMode } from "./resolveMediaRightsBuildMode.mjs";

export function validateAdsActivation(env,report,mode){
  if(env.VITE_ADSENSE_ENABLED!=="true")return [];
  const problems=[];
  if(mode!=="review")problems.push("Compilar con los derechos en modo review.");
  if(!/^ca-pub-\d+$/.test(String(env.VITE_ADSENSE_CLIENT||"").trim()))
    problems.push("VITE_ADSENSE_CLIENT inválido o ausente.");
  if(!/^\d+$/.test(String(env.VITE_ADSENSE_SLOT||"").trim()))
    problems.push("VITE_ADSENSE_SLOT inválido o ausente.");
  if(!report.lanzamiento.aptoParaActivacionDeAnunciosSegunDocumentos)
    problems.push(...report.lanzamiento.listaDeBloqueos);
  return problems;
}
const invoked=process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url);
if(invoked){
  if(process.env.VITE_ADSENSE_ENABLED!=="true")
    console.log("✓ AdSense: anuncios desactivados. La verificación del sitio y ads.txt permanecen.");
  else {
    try{
      const problems=validateAdsActivation(process.env,createReadinessReport(),resolveMediaRightsBuildMode());
      if(problems.length)throw Error("Activación de anuncios bloqueada:\n- "+problems.join("\n- "));
      console.log("✓ Control documental de publicidad pasado; la elegibilidad definitiva depende de Google.");
    }catch(error){
      console.error("✗ "+error.message);
      process.exitCode=1;
    }
  }
}
