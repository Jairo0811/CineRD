import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { EDITORIALES_PELICULAS } from "../frontend/src/data/editorialPeliculas.js";
import { getSinopsisEditorial } from "../frontend/src/data/sinopsisCuradasFaseE.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "frontend", "dist");
const snapshot = JSON.parse(fs.readFileSync(path.join(root, "database", "seeds", "catalog.snapshot.json"), "utf8"));
const movies = snapshot.tables.Peliculas.filter((p) => Number.isSafeInteger(p.Id) && p.Id > 0 && p.Titulo);
const people = snapshot.tables.Actores.filter((a) => Number.isSafeInteger(a.Id) && a.Id > 0 && a.NombreCompleto);
const leer = (p) => fs.readFileSync(path.join(dist, p), "utf8");
const sitemap = leer("sitemap.xml");
function exigir(ok, msg) { if (!ok) throw new Error("SEO: " + msg); }
function pagina(ruta, texto) {
  const file = ruta === "/" ? "index.html" : ruta.slice(1) + ".html";
  const html = leer(file);
  const canonical = "https://cinerd.pages.dev" + ruta;
  exigir(html.includes('<link rel="canonical" href="' + canonical + '"'), "Canonical inválido: " + ruta);
  exigir(html.includes('<h1>') && html.includes(texto.replace(/&/g, "&amp;").replace(/</g, "&lt;")), "HTML sin contenido: " + ruta);
  exigir(html.includes('id="root"'), "No hay root: " + ruta);
  exigir(!html.includes("http://localhost:3000"), "URL local encontrada: " + ruta);
  return html;
}
pagina("/", "El cine dominicano");
pagina("/historia", "Historia del cine dominicano");
pagina("/avances", "CineRD: avances del archivo de cine dominicano");
pagina("/sobre-cinerd", "Sobre CineRD");
pagina("/privacidad", "Política de Privacidad");
pagina("/terminos", "Términos de Uso");
pagina("/contacto", "Contacto");
pagina("/peliculas", "Películas dominicanas");
pagina("/actores", "Talentos del cine dominicano");
const buscar = pagina("/buscar", "Buscar en CineRD");
exigir(buscar.includes('content="noindex,follow"'), "Buscar debe estar noindex");
exigir(!sitemap.includes("<loc>https://cinerd.pages.dev/buscar</loc>"), "No incluir buscador en sitemap");
for (const p of movies) {
  const ruta = "/peliculas/" + p.Id;
  const html = pagina(ruta, p.Titulo);
  exigir(html.includes('"@type":"Movie"'), "JSON-LD Movie ausente: " + ruta);
  // Las 46 fichas deben tener una sinopsis o una explicación editorial real:
  // un H1 y dos enlaces no constituyen contenido suficiente.
  const sinopsis=String(p.Sinopsis||"").trim();
  const curada=sinopsis?null:getSinopsisEditorial(p);
  exigir(Boolean(sinopsis||curada), "Ficha sin sinopsis: "+ruta);
  if(!sinopsis) {
    exigir(html.includes("Sinopsis editorial de CineRD"),
      "Falta contexto editorial en HTML inicial: "+ruta);
    exigir(html.includes(curada.es.slice(0,52).replaceAll("&","&amp;")),
      "Sinopsis editorial no prerenderizada: "+ruta);
  }

  const editorial = EDITORIALES_PELICULAS[p.Id];
  if (editorial) {
    exigir(html.includes(editorial.es.titulo), "Título editorial ausente: " + ruta);
    exigir(html.includes(editorial.es.parrafos[0]), "Contenido editorial ausente: " + ruta);
    exigir(editorial.fuentes.every((f) => html.includes(f.url.replaceAll("&", "&amp;"))), "Fuentes editoriales ausentes: " + ruta);
  }
  exigir(sitemap.includes("<loc>https://cinerd.pages.dev" + ruta + "</loc>"), "No está en sitemap: " + ruta);
}
for (const a of people) {
  const ruta = "/actores/" + a.Id;
  const html = pagina(ruta, a.NombreArtistico || a.NombreCompleto);
  exigir(html.includes('"@type":"Person"'), "JSON-LD Person ausente: " + ruta);
  exigir(html.includes("Trayectoria documentada en CineRD"),
    "Falta resumen documental del talento en HTML inicial: "+ruta);

  exigir(sitemap.includes("<loc>https://cinerd.pages.dev" + ruta + "</loc>"), "No está en sitemap: " + ruta);
}
exigir(sitemap.includes("<loc>https://cinerd.pages.dev/avances</loc>"), "No figura /avances en sitemap");
const avancesHtml = leer("avances.html");
exigir(avancesHtml.includes('property="og:url" content="https://cinerd.pages.dev/avances"'), "Open Graph /avances incorrecto");
exigir(avancesHtml.includes('https://cinerd.pages.dev/share-cinerd-v1.jpg'), "Falta imagen social de CineRD");
const urls = [...sitemap.matchAll(/<loc>/g)].length;
exigir(urls === movies.length + people.length + 9, "Cantidad de sitemap incorrecta: " + urls);
console.log("✓ SEO: " + (movies.length + people.length) + " fichas prerenderizadas, canonical/metadatos/esquemas, buscador noindex y " + urls + " URLs.");
