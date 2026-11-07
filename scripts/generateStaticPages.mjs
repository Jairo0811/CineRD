/**
 * Genera HTML estático de contenido público desde el snapshot YA publicado.
 * No crea biografías ficticias ni páginas de cuentas privadas.
 * React sigue siendo el cliente interactivo; el HTML es accesible sin JS.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { HITOS, FUENTES, anioDe } from "../frontend/src/data/historiaCine.js";
import { SOBRE_CINERD } from "../frontend/src/data/sobreCineRD.js";
import { getEditorialPelicula, editorialesDestacados } from "../frontend/src/data/editorialPeliculas.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "frontend", "dist");
const snapshotPath = path.join(root, "database", "seeds", "catalog.snapshot.json");
const site = "https://cinerd.pages.dev";
const original = fs.readFileSync(path.join(out, "index.html"), "utf8");
const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
const tables = snapshot.tables || {};
for (const name of ["Peliculas", "Actores", "ActoresPeliculas"]) {
  if (!Array.isArray(tables[name])) throw new Error("No existe la tabla pública: " + name);
}
const peliculas = tables.Peliculas.filter((p) => Number.isSafeInteger(p.Id) && p.Id > 0 && p.Titulo);
const actores = tables.Actores.filter((a) => Number.isSafeInteger(a.Id) && a.Id > 0 && a.NombreCompleto);
const actoresPorId = new Map(actores.map((a) => [a.Id, a]));
const peliculasPorId = new Map(peliculas.map((p) => [p.Id, p]));
const relaciones = tables.ActoresPeliculas;
const escapar = (value) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const normalizar = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const nombreActor = (a) => String(a.NombreArtistico || a.NombreCompleto || "").trim();
const peliculaUrl = (p) => "/peliculas/" + p.Id;
const actorUrl = (a) => "/actores/" + a.Id;
const enlace = (url, label) => '<a href="' + escapar(url) + '">' + escapar(label) + "</a>";
const lista = (items) => "<ul>" + items.map((item) => "<li>" + item + "</li>").join("") + "</ul>";
const anio = (p) => anioDe(p.FechaEstreno);
const quitarHtml = (s) => String(s || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
const resumir = (s, max = 160) => {
  const plain = quitarHtml(s);
  if (plain.length <= max) return plain;
  return plain.slice(0, max - 1).replace(/\s+\S*$/, "") + "…";
};
const cabecera = (breadcrumb, titulo, intro) =>
  '<header><p><a href="/">CineRD</a> / ' + escapar(breadcrumb) + '</p><h1>' + escapar(titulo) + '</h1><p>' + escapar(intro) + '</p></header>';
const envolver = (body) =>
  '<div class="cinerd-static" style="max-width:1100px;margin:0 auto;padding:2rem 1.25rem;line-height:1.65">' +
  '<nav aria-label="Explorar CineRD">' +
  enlace("/", "Inicio") + " · " + enlace("/historia", "Historia") + " · " +
  enlace("/peliculas", "Películas") + " · " + enlace("/actores", "Talentos") + "</nav>" +
  '<main>' + body + '</main><footer><p>CineRD: archivo independiente de información del cine dominicano.</p>' +
  enlace("/contacto", "Contacto") + " · " + enlace("/privacidad", "Privacidad") + " · " +
  enlace("/terminos", "Términos") + " · " + enlace("/sobre-cinerd", "Sobre CineRD") + "</footer></div>";

function atributo(doc, etiqueta, clave, contenido) {
  const rx = new RegExp('(<meta\\s+' + etiqueta + '="' + clave.replace(/[.*+?^$()|[\]{}\\]/g, "\\$&") + '"\\s+content=")[^"]*(")', "i");
  if (!rx.test(doc)) throw new Error("Metadato base no encontrado: " + clave);
  return doc.replace(rx, (_match, before, after) => before + escapar(contenido) + after);
}

function pagina(ruta, titulo, descripcion, contenido, datos = null, noindex = false) {
  let doc = original;
  const abs = site + ruta;
  const frase = resumir(descripcion, 165);
  doc = doc.replace(/<title>[^<]*<\/title>/i, "<title>" + escapar(titulo) + "</title>");
  doc = atributo(doc, "name", "description", frase);
  doc = atributo(doc, "property", "og:title", titulo);
  doc = atributo(doc, "property", "og:description", frase);
  doc = atributo(doc, "property", "og:url", abs);
  doc = atributo(doc, "name", "twitter:title", titulo);
  doc = atributo(doc, "name", "twitter:description", frase);
  const canonical = /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i;
  if (!canonical.test(doc)) throw new Error("Canonical base no encontrado");
  doc = doc.replace(canonical, '<link rel="canonical" href="' + escapar(abs) + '" />');
  doc = doc.replace(/<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/i,
    '<meta name="robots" content="' + (noindex ? "noindex,follow" : "index,follow,max-image-preview:large") + '" />');
  // El SearchAction solo corresponde al sitio principal; nunca a una película o talento.
  if (ruta !== "/") {
    doc = doc.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i, "");
  }
  if (datos) {
    const json = JSON.stringify(datos).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
    doc = doc.replace("</head>", '<script type="application/ld+json">' + json + "</script></head>");
  }
  const target = '<div id="root"></div>';
  if (!doc.includes(target)) throw new Error("No se encontró el nodo #root tras compilar Vite");
  doc = doc.replace(target, '<div id="root">' + envolver(contenido) + "</div>");
  // Cloudflare Pages sirve foo.html como /foo, mientras foo/index.html fuerza /foo/.
  // Los enlaces de React y las URL canónicas usan rutas sin barra final.
  const dest = ruta === "/" ? path.join(out, "index.html") : path.join(out, ruta.slice(1) + ".html");
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, doc, "utf8");
}

const participacion = (p, a) => relaciones.some((r) => Number(r.PeliculaId) === p.Id && Number(r.ActorId) === a.Id);
const reparto = (p) => actores.filter((a) => participacion(p, a)).sort((a, b) => nombreActor(a).localeCompare(nombreActor(b), "es"));
const filmografia = (a) => peliculas.filter((p) => participacion(p, a)).sort((a, b) => String(b.FechaEstreno || "").localeCompare(String(a.FechaEstreno || "")));
const contenidoPelicula = (p) => {
  const participantes = reparto(p);
  const partes = [
    cabecera("Películas", p.Titulo,
      "Ficha del catálogo cinematográfico dominicano" + (anio(p) ? " · " + anio(p) : "") + "."),
    '<section><h2>Datos de la producción</h2>',
    lista([
      p.Genero ? "Género: " + escapar(p.Genero) : "Género no documentado",
      p.Director ? "Dirección: " + escapar(p.Director) : "Dirección no documentada",
      p.Productora ? "Productora: " + escapar(p.Productora) : "Productora no documentada",
      p.FechaEstreno ? "Estreno registrado: " + escapar(String(p.FechaEstreno).slice(0, 10)) : "Estreno no documentado",
    ]),
    "</section>",
  ];
  if (quitarHtml(p.Sinopsis)) partes.push("<section><h2>Sinopsis registrada</h2><p>" + escapar(quitarHtml(p.Sinopsis)) + "</p></section>");
  const editorial = getEditorialPelicula(p);
  if (editorial) {
    partes.push('<section class="film-editorial"><h2>' + escapar(editorial.es.titulo) + "</h2>" +
      editorial.es.parrafos.map((paragraph) => "<p>" + escapar(paragraph) + "</p>").join("") +
      "<h3>Fuentes y lecturas complementarias</h3>" +
      lista(editorial.fuentes.map((fuente) => '<a href="' + escapar(fuente.url) + '" rel="noopener noreferrer">' + escapar(fuente.titulo) + "</a>")) +
      "<p>Borrador editorial basado en fuentes; pendiente de revisión final del titular.</p></section>");
  }
  if (participantes.length) partes.push("<section><h2>Talentos vinculados a esta película</h2><p>Relaciones registradas en el catálogo de CineRD.</p>" +
    lista(participantes.map((a) => enlace(actorUrl(a), nombreActor(a)))) + "</section>");
  partes.push("<p>" + enlace("/peliculas", "Explorar más producciones dominicanas") +
    " · " + enlace("/historia", "Conocer la historia del cine dominicano") + "</p>");
  return partes.join("\n");
};

const contenidoActor = (a) => {
  const pelis = filmografia(a);
  const n = nombreActor(a);
  const partes = [
    cabecera("Talentos", n, "Ficha profesional del catálogo de CineRD."),
    '<section><h2>Datos registrados</h2>',
    lista([
      a.NombreArtistico && a.NombreArtistico !== a.NombreCompleto ? "Nombre completo: " + escapar(a.NombreCompleto) : "Nombre: " + escapar(a.NombreCompleto),
      a.Profesion ? "Profesión: " + escapar(a.Profesion) : "Profesión no documentada",
      a.FechaNacimiento ? "Fecha de nacimiento registrada: " + escapar(String(a.FechaNacimiento).slice(0, 10)) :
        (a.AnioNacimiento ? "Año de nacimiento registrado: " + escapar(a.AnioNacimiento) : "Nacimiento no documentado"),
    ]),
    "</section>",
  ];
  if (pelis.length) partes.push("<section><h2>Participaciones registradas</h2><p>Producciones del catálogo vinculadas a este talento.</p>" +
    lista(pelis.map((p) => enlace(peliculaUrl(p), p.Titulo + (anio(p) ? " (" + anio(p) + ")" : "")))) + "</section>");
  else partes.push("<p>Aún no hay participaciones vinculadas en este catálogo parcial. " +
    enlace("/actores", "Consultar otros talentos") + ".</p>");
  partes.push("<p>" + enlace("/actores", "Directorio de talentos") + " · " + enlace("/contacto", "Solicitar una corrección") + "</p>");
  return partes.join("\n");
};

function metadatosPelicula(p) {
  const data = { "@context": "https://schema.org", "@type": "Movie", name: p.Titulo,
    url: site + peliculaUrl(p), isPartOf: { "@type": "WebSite", name: "CineRD", url: site + "/" } };
  if (p.FechaEstreno) data.datePublished = String(p.FechaEstreno).slice(0, 10);
  if (p.Director) data.director = { "@type": "Person", name: p.Director };
  if (p.Genero) data.genre = p.Genero;
  const editorial = getEditorialPelicula(p);
  if (editorial) data.description = resumir(editorial.es.parrafos[0], 300);
  else if (quitarHtml(p.Sinopsis)) data.description = resumir(p.Sinopsis, 300);
  return data;
}
function metadatosActor(a) {
  const data = { "@context": "https://schema.org", "@type": "Person", name: a.NombreCompleto,
    url: site + actorUrl(a) };
  if (a.NombreArtistico) data.alternateName = a.NombreArtistico;
  if (a.Profesion) data.jobTitle = a.Profesion;
  if (a.FechaNacimiento) data.birthDate = String(a.FechaNacimiento).slice(0, 10);
  if (a.FechaFallecimiento) data.deathDate = String(a.FechaFallecimiento).slice(0, 10);
  return data;
}

const peliculasOrdenadas = [...peliculas].sort((a, b) => String(b.FechaEstreno || "").localeCompare(String(a.FechaEstreno || "")));
const talentosOrdenados = [...actores].sort((a, b) => nombreActor(a).localeCompare(nombreActor(b), "es"));
const descripcionInicio = "CineRD reúne fichas, filmografías y una cronología documentada del cine dominicano. Explora las producciones y los profesionales registrados.";
const homeBody = cabecera("Inicio", "El cine dominicano en un solo lugar", descripcionInicio) +
  '<section><h2>Explora el catálogo público</h2><p>Actualmente el archivo presenta ' + peliculas.length +
  " películas y " + actores.length + " talentos. Consulta los créditos y las relaciones disponibles entre películas y profesionales.</p>" +
  lista([enlace("/peliculas", "Películas dominicanas"), enlace("/actores", "Talentos del cine dominicano"),
    enlace("/historia", "Cronología del cine dominicano y fuentes históricas")]) + "</section>" +
  '<section><h2>Producciones del catálogo</h2>' +
  lista(peliculasOrdenadas.slice(0, 12).map((p) => enlace(peliculaUrl(p), p.Titulo + (anio(p) ? " (" + anio(p) + ")" : "")))) +
  "</section>" +
  '<section><h2>Lecturas y contexto del cine dominicano</h2><p>El archivo dispone de " + editorialesDestacados.length + " fichas con lecturas editoriales originales y fuentes, pendientes de revisión final por el titular.</p>' +
  lista(editorialesDestacados.map((e) => enlace("/peliculas/" + e.id, e.tituloReferencia + " (" + e.anioReferencia + "): " + e.es.titulo))) + "</section>" +
  '<section><h2>Acerca del proyecto</h2><p>CineRD es un archivo independiente y en desarrollo. El catálogo recoge información disponible y puede ampliarse o corregirse. ' +
  enlace("/contacto", "Puedes solicitar correcciones") + ".</p></section>";
pagina("/", "CineRD | Películas, talentos e historia del cine dominicano", descripcionInicio, homeBody);

const listaPeliculas = cabecera("Catálogo", "Películas dominicanas", "Explora las películas registradas en CineRD por título, año de estreno y dirección.") +
  '<p>Este archivo es un catálogo parcial y en evolución. Cada ficha muestra los datos efectivamente registrados.</p>' +
  '<section><h2>' + peliculas.length + " producciones registradas</h2>" +
  lista(peliculasOrdenadas.map((p) => enlace(peliculaUrl(p), p.Titulo + (anio(p) ? " (" + anio(p) + ")" : "") + (p.Director ? " · " + p.Director : "")))) +
  "</section>";
pagina("/peliculas", "Películas dominicanas | CineRD", "Directorio de producciones del cine dominicano con estrenos, dirección, sinopsis y reparto registrado.", listaPeliculas);

const listaTalentos = cabecera("Catálogo", "Talentos del cine dominicano", "Descubre profesionales del cine dominicano y sus participaciones registradas.") +
  '<p>El directorio reúne los perfiles disponibles; no es un censo exhaustivo de la industria.</p>' +
  '<section><h2>' + actores.length + " perfiles registrados</h2>" +
  lista(talentosOrdenados.map((a) => enlace(actorUrl(a), nombreActor(a) + (a.Profesion ? " · " + a.Profesion : "")))) + "</section>";
pagina("/actores", "Talentos del cine dominicano | CineRD", "Directorio de actores, actrices, directores y otros talentos cinematográficos dominicanos con fichas y filmografías.", listaTalentos);

const hitos = HITOS.map((h) =>
  '<article><h2 id="h-' + escapar(h.id) + '">' + escapar(h.etiquetaAnio || h.anio) + " · " + escapar(h.es.titulo) +
  "</h2><p>" + escapar(h.es.texto) + "</p></article>").join("\n");
const fuentes = FUENTES.filter((f) => /^https:\/\//.test(f.url)).map((f) =>
  '<li><a href="' + escapar(f.url) + '" rel="noopener noreferrer">' + escapar(f.nombre) + "</a></li>").join("");
const cuerpoHistoria = cabecera("Historia", "Historia del cine dominicano", "Recorrido documental desde las primeras proyecciones hasta la industria contemporánea.") +
  "<p>La cronología de CineRD contrasta hitos históricos con las fuentes señaladas al final. Cuando existen diferencias entre fuentes, el texto evita afirmaciones concluyentes.</p>" +
  hitos + "<section><h2>Fuentes consultadas</h2><ul>" + fuentes + "</ul></section>";
pagina("/historia", "Historia del cine dominicano y fuentes | CineRD", "Cronología documentada del cine dominicano, sus primeras producciones, la Ley 108-10 y la evolución de la industria.", cuerpoHistoria);

pagina("/buscar", "Buscar películas y talentos | CineRD", "Consulta el buscador del archivo CineRD.", cabecera("Buscar", "Buscar en CineRD", "Escribe al menos dos caracteres para buscar películas, directores y talentos.") +
  "<p>" + enlace("/peliculas", "Ver películas") + " · " + enlace("/actores", "Ver talentos") + "</p>", null, true);

for (const p of peliculas) {
  const editorial = getEditorialPelicula(p);
  const desc = (editorial ? editorial.es.parrafos[0] : quitarHtml(p.Sinopsis)) || (p.Titulo + ", película registrada en CineRD" +
    (anio(p) ? " (" + anio(p) + ")" : "") + (p.Director ? ", dirigida por " + p.Director : "") + ".");
  pagina(peliculaUrl(p), p.Titulo + (anio(p) ? " (" + anio(p) + ")" : "") + " | CineRD",
    desc, contenidoPelicula(p), metadatosPelicula(p));
}
for (const a of actores) {
  const nombre = nombreActor(a);
  const pelis = filmografia(a);
  const desc = nombre + (a.Profesion ? " — " + a.Profesion : "") +
    ". Perfil cinematográfico en CineRD" + (pelis.length ? " con " + pelis.length + " producciones vinculadas" : "") + ".";
  pagina(actorUrl(a), nombre + " | CineRD", desc, contenidoActor(a), metadatosActor(a));
}


const acerca = SOBRE_CINERD.es;
const acercaCuerpo = cabecera("CineRD", acerca.title, acerca.intro) +
  acerca.sections.map((s) => "<section><h2>" + escapar(s.title) + "</h2>" +
    s.paragraphs.map((p) => "<p>" + escapar(p) + "</p>").join("") + "</section>").join("\n") +
  "<p>" + enlace("/historia", acerca.history) + " · " +
  enlace("/contacto", acerca.contact) + "</p>";
pagina("/sobre-cinerd", "Sobre CineRD | Origen, alcance y metodología",
  "Descubre cómo CineRD pasó de una prueba técnica a un archivo independiente de cine dominicano, su metodología y sus límites.",
  acercaCuerpo);


const informativas = [
  {
    ruta: "/privacidad",
    titulo: "Política de Privacidad | CineRD",
    desc: "Conoce el tratamiento de la información y los canales de consulta y corrección de CineRD.",
    nombre: "Política de Privacidad",
    cuerpo: "<section><h2>Información y funcionamiento público</h2><p>CineRD publica un catálogo de consulta sobre películas y talentos. La versión de Cloudflare Pages no habilita cuentas públicas ni verificación de identidad. El idioma y tema visual pueden guardarse en el navegador.</p></section>" +
      "<section><h2>Publicidad y proveedores</h2><p>La verificación de Google AdSense no significa que haya anuncios activos. El catálogo utiliza Cloudflare Pages y puede enlazar a proveedores externos. Antes de habilitar anuncios se revisarán los requisitos de cookies y consentimiento aplicables.</p></section>" +
      "<section><h2>Correcciones y privacidad</h2><p>Para solicitar correcciones, derechos de imagen o consultas privadas, utiliza el correo temporal publicado en Contacto. No publiques información sensible en incidencias abiertas.</p></section>"
  },
  {
    ruta: "/terminos",
    titulo: "Términos de Uso | CineRD",
    desc: "Términos de uso del catálogo informativo CineRD, alcance del servicio y derechos de terceros.",
    nombre: "Términos de Uso",
    cuerpo: "<section><h2>Uso informativo</h2><p>CineRD es un catálogo independiente de referencia sobre el cine dominicano. No ofrece servicios de streaming, descargas de películas ni licencias sobre contenidos audiovisuales.</p></section>" +
      "<section><h2>Exactitud y derechos</h2><p>Los datos pueden estar incompletos y pueden corregirse. Los nombres, fotografías, carteles, marcas y materiales de terceros permanecen sujetos a sus respectivos derechos.</p></section>" +
      "<section><h2>Enlaces y contacto</h2><p>Los enlaces externos pertenecen a otros servicios. Puedes notificar un error o solicitar una corrección desde la página de contacto.</p></section>"
  },
  {
    ruta: "/contacto",
    titulo: "Contacto y correcciones | CineRD",
    desc: "Contacta a CineRD para correcciones del catálogo, privacidad y derechos de imagen.",
    nombre: "Contacto",
    cuerpo: "<section><h2>Correo de contacto temporal</h2><p>Para consultas privadas, privacidad y derechos de imagen, escribe a " +
      enlace("mailto:jairo_1829@hotmail.com", "jairo_1829@hotmail.com") + ".</p></section>" +
      "<section><h2>Incidencias públicas del catálogo</h2><p>Para correcciones que no contengan datos sensibles puedes crear una " +
      '<a href="https://github.com/Jairo0811/CineRD/issues/new" rel="noopener noreferrer">incidencia pública en GitHub</a>.' +
      " Nunca publiques documentos, datos de contacto privados ni evidencias confidenciales en un canal público.</p></section>"
  },
];
for (const info of informativas) {
  pagina(info.ruta, info.titulo, info.desc,
    cabecera("Información y contacto", info.nombre, info.desc) + info.cuerpo +
    "<p>" + enlace("/sobre-cinerd", "Sobre el proyecto") + "</p>");
}

const rutasBase = ["/", "/peliculas", "/actores", "/historia", "/sobre-cinerd", "/privacidad", "/terminos", "/contacto"];
const rutas = [...rutasBase, ...peliculas.map(peliculaUrl), ...actores.map(actorUrl)];
const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  rutas.map((r) => "  <url><loc>" + escapar(site + r) + "</loc></url>").join("\n") +
  "\n</urlset>\n";
fs.writeFileSync(path.join(out, "sitemap.xml"), xml, "utf8");
console.log("CineRD SEO: HTML estático de " + (8 + peliculas.length + actores.length) +
  " páginas indexables, buscador noindex, sitemap de " + rutas.length + " URLs generado.");
