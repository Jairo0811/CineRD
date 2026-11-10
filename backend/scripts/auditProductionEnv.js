/**
 * CineRD F-3 — control de configuración ANTES de desplegar API real.
 * No realiza red, no imprime valores de secretos, no crea infraestructura.
 *
 * Ejecutar SOLO en el entorno de destino (o una terminal de staging configurada)
 * con: node backend/scripts/auditProductionEnv.js
 * --json: salida estructurada SIN valores; --strict: fallo si falta configuración.
 * Las variables ausentes NO deben copiarse con valores reales a Git o chats.
 */
const path=require("node:path");
const {pathToFileURL}=require("node:url");
const required=["NODE_ENV","FRONTEND_URLS","PUBLIC_APP_URL",
  "DB_SERVER","DB_PORT","DB_DATABASE","DB_USER","DB_PASSWORD",
  "DB_ENCRYPT","DB_TRUST_CERT","JWT_ACCESS_SECRET","RESEND_API_KEY",
  "EMAIL_FROM","UPLOADS_DIR","PRIVATE_STORAGE_DIR"];
const nonsecretKeys=new Set(["NODE_ENV","FRONTEND_URLS","PUBLIC_APP_URL",
  "DB_PORT","DB_ENCRYPT","DB_TRUST_CERT"]);
function isHttpsOrigin(value){
  try{
    const u=new URL(value);
    if(u.protocol!=="https:"||u.username||u.password||
       u.pathname!=="/"||u.search||u.hash||u.origin!==value.replace(/\/$/,""))return false;
    const host=u.hostname.toLowerCase();
    if(["localhost","127.0.0.1","::1","[::1]"].includes(host))return false;
    if(/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(host))return false;
    return true;
  }catch{return false;}
}
function isAbs(v){return path.isAbsolute(v)||path.win32.isAbsolute(v);}
function reportConfig(env){
  const problems=[];
  const value=k=>String(env?.[k]??"").trim();
  for(const name of required)if(!value(name))problems.push(name+": AUSENTE");
  if(value("NODE_ENV") && value("NODE_ENV")!=="production")
    problems.push("NODE_ENV: se espera production");
  const list=value("FRONTEND_URLS").split(",").map(x=>x.trim()).filter(Boolean);
  if(value("FRONTEND_URLS") &&
     (!list.length||new Set(list).size!==list.length||!list.every(isHttpsOrigin)))
    problems.push("FRONTEND_URLS: solo orígenes HTTPS públicos, exactos y sin duplicados");
  if(value("PUBLIC_APP_URL") &&
     (!isHttpsOrigin(value("PUBLIC_APP_URL")) ||
      !list.includes(value("PUBLIC_APP_URL").replace(/\/$/,""))))
    problems.push("PUBLIC_APP_URL: debe figurar en FRONTEND_URLS y ser HTTPS público");
  if(value("DB_SERVER") &&
     (/^(localhost|127\.0\.0\.1|::1|\[::1\])$/i.test(value("DB_SERVER"))||
      /\b(example|placeholder|your_)/i.test(value("DB_SERVER"))))
    problems.push("DB_SERVER: host SQL externo válido requerido");
  const port=Number(value("DB_PORT"));
  if(value("DB_PORT")&&(!Number.isInteger(port)||port<1||port>65535))
    problems.push("DB_PORT: puerto inválido");
  if(value("DB_DATABASE") &&
     (/(_E2E|_TEST)$/i.test(value("DB_DATABASE")) ||
      /^(master|tempdb|model|msdb)$/i.test(value("DB_DATABASE"))))
    problems.push("DB_DATABASE: no usar bases de prueba o de sistema");
  for(const k of ["DB_USER","DB_PASSWORD"])
    if(value(k)&&(/^(your_|change_|placeholder|example)/i.test(value(k))))
      problems.push(k+": sustituir valor de ejemplo");
  if(value("DB_ENCRYPT")&&value("DB_ENCRYPT").toLowerCase()!=="true")
    problems.push("DB_ENCRYPT: producción requiere true");
  if(value("DB_TRUST_CERT")&&value("DB_TRUST_CERT").toLowerCase()!=="false")
    problems.push("DB_TRUST_CERT: producción requiere false");
  const jwt=value("JWT_ACCESS_SECRET");
  if(jwt && (jwt.length<32||/^(change|your_|secret|placeholder|example)/i.test(jwt)))
    problems.push("JWT_ACCESS_SECRET: se requiere secreto real de longitud >=32");
  const resend=value("RESEND_API_KEY");
  if(resend && (/^(your_|change_|placeholder|example)/i.test(resend)||resend.length<12))
    problems.push("RESEND_API_KEY: no usar ejemplo/incompleto");
  const from=value("EMAIL_FROM");
  if(from && (!/^[^<>\s@]+@[^<>\s@]+\.[^<>\s@]+$/.test(
       from.replace(/^.*<([^<>]+)>$/,"$1"))||
       /example\.(com|org|net)/i.test(from)))
    problems.push("EMAIL_FROM: remitente verificable, no de ejemplo");
  const uploads=value("UPLOADS_DIR"),privateStorage=value("PRIVATE_STORAGE_DIR");
  if(uploads&&!isAbs(uploads))problems.push("UPLOADS_DIR: ruta absoluta persistente");
  if(privateStorage&&!isAbs(privateStorage))
    problems.push("PRIVATE_STORAGE_DIR: ruta absoluta persistente");
  if(uploads&&privateStorage&&
    (uploads===privateStorage||privateStorage.startsWith(uploads.replace(/[\\/]+$/,"")+"/")||
      uploads.startsWith(privateStorage.replace(/[\\/]+$/,"")+"/")))
    problems.push("STORAGE: los directorios público y privado deben ser independientes");
  const missing=required.filter(k=>!value(k));
  return {version:1,status:problems.length?"BLOCKED":"CONFIG_REVIEW_READY",
    validatedKeys:required.length,missingKeys:missing,
    problems,externalVerifications:[
      "SQL Server persistente con certificados TLS y acceso mínimo",
      "Disco persistente realmente montado y respaldado",
      "Backup/restore drill real en servidor aislado",
      "Dominio de correo aprobado y prueba de entrega",
      "HTTPS API desplegada: /health /ready y usuarios/roles/cookies",
      "Licencias de medios y revisión jurídica antes de monetizar"
    ],secretsPrinted:false,
    disclaimer:"CONFIG_REVIEW_READY no demuestra despliegue ni permisos comerciales."};
}
function parse(argv){
  if(argv.some(x=>!["--strict","--json"].includes(x))||
    new Set(argv).size!==argv.length)
    throw Error("Uso: auditProductionEnv.js [--strict] [--json]");
  return {strict:argv.includes("--strict"),json:argv.includes("--json")};
}
function main(argv=process.argv.slice(2),env=process.env){
  const opts=parse(argv),result=reportConfig(env);
  if(opts.json)console.log(JSON.stringify(result,null,2));
  else{
    console.log("CineRD F-3 — validación de variables (sin imprimir secretos)");
    console.log("Estado: "+result.status+" / "+result.validatedKeys+" claves requeridas");
    for(const issue of result.problems)console.log("  "+issue);
    console.log("Pruebas externas aún requeridas: "+result.externalVerifications.length);
  }
  if(opts.strict&&result.status!=="CONFIG_REVIEW_READY")process.exitCode=1;
}
if(require.main===module){try{main()}catch(e){console.error("✗ "+e.message);process.exitCode=1;}}
module.exports={reportConfig,isHttpsOrigin,parse};
