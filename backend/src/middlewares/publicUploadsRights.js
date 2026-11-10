/**
 * CineRD: guardia de medios de /uploads en producción.
 *
 * Fail-closed: un recurso no puede publicarse por el backend por el mero
 * hecho de existir en el disco. Solo se sirve si el ledger vigente contiene
 * una autorización comercial efectiva para la ruta exacta, identidad y campo.
 *
 * La auditoría de licencias sigue siendo documental: los contratos deben
 * verificarse externamente antes de registrarlos como AUTORIZADO.
 */
const fs=require("node:fs");
const path=require("node:path");
const {pathToFileURL}=require("node:url");

const root=path.resolve(__dirname,"../../..");
const ledgerFile=path.join(root,"docs/media-rights-ledger.csv");
const snapshotFile=path.join(root,"database/seeds/catalog.snapshot.json");
const parserUrl=pathToFileURL(path.join(root,"scripts/verifyMediaRightsLedger.mjs")).href;
const MEDIA_PATH=/^\/uploads\/(?:actores|peliculas|galerias)\/[A-Za-z0-9._-]+$/;

function safePath(resource) {
  return typeof resource==="string" && MEDIA_PATH.test(resource) &&
    !resource.includes("..") && !resource.includes("\\");
}

function createRightsAuthorizer({
  fsApi=fs,csvFile=ledgerFile,catalogFile=snapshotFile,
  loadTools=()=>import(parserUrl)
}={}) {
  let signature=null, cache=null;
  return async function authorized(resource) {
    if(!safePath(resource))return false;
    // Releer el expediente si cambia; comprobar expiración de licencia en cada
    // solicitud incluso si el archivo sigue cacheado.
    const a=fsApi.statSync(csvFile),b=fsApi.statSync(catalogFile);
    if(!a.isFile()||!b.isFile())return false;
    const fresh=a.mtimeMs+":"+a.size+":"+b.mtimeMs+":"+b.size;
    if(signature!==fresh || !cache) {
      const tools=await loadTools();
      const rows=tools.readCsv(fsApi.readFileSync(csvFile,"utf8"));
      const catalog=JSON.parse(fsApi.readFileSync(catalogFile,"utf8"));
      const audit=tools.auditRows(catalog,rows);
      if(audit.errors.length)throw Error("Registro de derechos inconsistente");
      // Si se detectan rutas duplicadas o fuera de catálogo, auditRows bloquea.
      cache={rows:new Map(rows.map(row=>[row.file_path,row])),
        allowed:tools.isEffectiveCommercialLicense};
      signature=fresh;
    }
    const row=cache.rows.get(resource);
    return Boolean(row && cache.allowed(row));
  };
}

function createPublicUploadGuard({
  nodeEnv=process.env.NODE_ENV, authorizePath=createRightsAuthorizer()
}={}) {
  if(nodeEnv!=="production")return (_req,_res,next)=>next();
  return function verifyRights(req,res,next) {
    const requested="/uploads"+String(req.path||"");
    Promise.resolve().then(()=>authorizePath(requested))
      .then(allowed=>allowed?next():res.status(404).end())
      .catch(()=>res.status(404).end()); // No filtrar rutas, errores ni contratos.
  };
}

module.exports={safePath,createRightsAuthorizer,createPublicUploadGuard};
