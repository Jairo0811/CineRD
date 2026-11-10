/**
 * Smoke test del despliegue REAL de CineRD.
 * Uso: node scripts/auditProduction.mjs
 * Uso estricto: node scripts/auditProduction.mjs --require-review
 * NO reemplaza Search Console, la revisión humana, ni la consola de AdSense.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const origin = "https://cinerd.pages.dev";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const snapshot = JSON.parse(fs.readFileSync(path.join(root,"database/seeds/catalog.snapshot.json"),"utf8"));
const errors = [];
const warnings = [];
const passed = [];
const args = process.argv.slice(2);
if(args.some(a=>!["--require-review","--skip-ads"].includes(a)))throw Error("Argumento no reconocido");
const requireReview = args.includes("--require-review");
const skipAds = args.includes("--skip-ads");

async function fetchText(relative, mime = "") {
  const controller = new AbortController();
  const timeout = setTimeout(()=>controller.abort(),12000);
  try {
    const response = await fetch(origin+relative,{signal:controller.signal,
      headers:{"User-Agent":"CineRD-ReadinessAudit/1.0"}});
    if (!response.ok) throw new Error("HTTP "+response.status);
    if (mime && !(response.headers.get("content-type")||"").includes(mime)) {
      throw new Error("Content-Type inesperado: "+response.headers.get("content-type"));
    }
    const body = await response.text();
    if (!body.trim()) throw new Error("Respuesta vacía");
    return body;
  } finally {
    clearTimeout(timeout);
  }
}
async function check(label,run) {
  try { await run(); passed.push(label); console.log("✓ "+label); }
  catch (error) { errors.push(label+": "+error.message); console.error("✗ "+label+": "+error.message); }
}
const pages = [
  ["/","El cine dominicano"],
  ["/peliculas","Películas dominicanas"],
  ["/actores","Talentos del cine dominicano"],
  ["/historia","Historia del cine dominicano"],
  ["/sobre-cinerd","Sobre CineRD"],
  ["/privacidad","Política de Privacidad"],
  ["/terminos","Términos de Uso"],
  ["/contacto","Contacto"],
  ["/peliculas/4","Sanky Panky"],
  ["/peliculas/9","Lotoman"],
  ["/peliculas/16","Nueba Yol"],
  ["/peliculas/39","Colao"],
  ["/peliculas/56","La Lucha de Ana"],
];
const actors = snapshot.tables.Actores.slice(0,2);
for(const actor of actors) pages.push(["/actores/"+actor.Id, actor.NombreArtistico||actor.NombreCompleto]);
const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;");
for(const [url,title] of pages) await check("Página "+url,async()=>{
  const html=await fetchText(url,"text/html");
  assert.ok(html.includes('<link rel="canonical" href="'+origin+url+'"'),"canonical incorrecta");
  assert.ok(html.includes("<h1>"),"sin H1 editorial en HTML inicial");
  assert.ok(html.includes(esc(title)),"contenido principal ausente: "+title);
  assert.ok(html.includes('id="root"'),"sin nodo React");
  assert.ok(!html.includes("http://localhost:3000"),"contiene localhost");
});
await check("Sitemap indexable",async()=>{
  const xml=await fetchText("/sitemap.xml","xml");
  const count=[...xml.matchAll(/<loc>/g)].length;
  assert.ok(xml.includes(origin+"/peliculas/4"),"sin fichas de cine");
  assert.ok(xml.includes(origin+"/actores/"),"sin talentos");
  assert.ok(!xml.includes(origin+"/buscar<"),"buscador accidentalmente indexado");
  assert.ok(count>=snapshot.tables.Peliculas.length+snapshot.tables.Actores.length+8,
    "sitemap incompleto: "+count);
});
await check("Robots público",async()=>{
  const robots=await fetchText("/robots.txt");
  assert.ok(robots.includes("Sitemap: "+origin+"/sitemap.xml"),"falta sitemap");
  assert.ok(!/Disallow:\s*\/\s*$/m.test(robots),"bloqueo de rastreo total");
});
await check("Buscador noindex",async()=>{
  const html=await fetchText("/buscar","text/html");
  assert.ok(/<meta\s+name="robots"\s+content="noindex,follow"/.test(html),
    "buscador indexable");
});
await check("Manifiesto de catálogo",async()=>{
  const [raw,manifest]=await Promise.all([
    fetchText("/demo/catalog.json","json"),fetchText("/demo/deploy-status.json","json"),
  ]);
  const catalog=JSON.parse(raw);
  const status=JSON.parse(manifest);
  assert.equal(catalog.tables.Peliculas.length,snapshot.tables.Peliculas.length);
  assert.equal(catalog.tables.Actores.length,snapshot.tables.Actores.length);
  assert.equal(status.format,"CineRD.PublicDemoDeploy");
  if(status.mediaRightsMode!=="review")
    warnings.push("Build público sin modo integral review: "+(status.mediaRightsMode||"no declarado"));
  if(requireReview) assert.equal(status.mediaRightsMode,"review",
    "Se necesita publicar review antes de reenvío");
  assert.ok(Number.isInteger(status.mediaFilesCopied),"Falta contador de archivos");
});
if(!skipAds) await check("AdSense ads.txt",async()=>{
  const txt=await fetchText("/ads.txt");
  assert.ok(txt.includes("google.com, pub-"),"Falta línea verificable de Google");
});
console.log("\nResumen: "+passed.length+" aprobadas; "+errors.length+" fallidas; "+
  warnings.length+" advertencias.");
for(const warning of warnings) console.warn("⚠ "+warning);
if(errors.length) {
  console.error("El despliegue no superó la auditoría. NO reenviar AdSense todavía.");
  process.exitCode=1;
} else {
  console.log("Prueba técnica de producción superada. La aprobación editorial y legal sigue pendiente.");
}
