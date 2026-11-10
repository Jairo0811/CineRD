/**
 * CineRD — visor EXCLUSIVAMENTE LOCAL de fotografías y carteles históricos.
 *
 * Acceso: node scripts/previewLocalMedia.mjs
 * Abre: http://127.0.0.1:4348
 *
 * No copia archivos al frontend, no escribe SQL, no activa publicidad, y solo
 * escucha en loopback. No usar como servidor público ni con proxy/túnel.
 * Las imágenes sin autorización comercial no deben distribuirse públicamente.
 */
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SNAPSHOT = path.join(ROOT, "database/seeds/catalog.snapshot.json");
const MEDIA_ROOT = path.join(ROOT, "backend");
const LOOPBACK = "127.0.0.1";
const DEFAULT_PORT = 4348;
const SAFE_IMAGE = /^\/uploads\/(actores|peliculas)\/[A-Za-z0-9._-]+\.(jpe?g|png|webp)$/i;
const MIME = Object.freeze({ ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" });

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
}

export function readLocalMediaItems(snapshot) {
  if (snapshot?.format !== "CineRD.CatalogSnapshot" ||
      !Array.isArray(snapshot.tables?.Actores) ||
      !Array.isArray(snapshot.tables?.Peliculas)) {
    throw new Error("El snapshot de CineRD no contiene las tablas requeridas.");
  }
  const items = [];
  for (const [type, rows, label, name] of [
    ["talentos", snapshot.tables.Actores, "actores", item => item.NombreArtistico || item.NombreCompleto],
    ["peliculas", snapshot.tables.Peliculas, "peliculas", item => item.Titulo],
  ]) {
    for (const row of rows) {
      const ruta = row.Foto;
      if (!ruta) continue;
      if (!SAFE_IMAGE.test(ruta) || !ruta.startsWith("/uploads/" + label + "/") || ruta.includes("..")) {
        throw new Error("Ruta multimedia inválida para " + type + ": " + ruta);
      }
      items.push({
        type, id: Number(row.Id), name: String(name(row) || "Sin nombre"),
        file: ruta, hasFile: fs.existsSync(path.join(MEDIA_ROOT, ruta.slice(1))),
      });
    }
  }
  return items;
}

export function renderLocalMediaPage(items, section = "todos") {
  const groups = { talentos: items.filter(x => x.type === "talentos"),
    peliculas: items.filter(x => x.type === "peliculas") };
  const selected = section === "talentos" || section === "peliculas" ? section : "todos";
  const shown = selected === "todos" ? items : groups[selected];
  const links = [["todos", "Todos", items.length], ["talentos", "Talentos", groups.talentos.length],
    ["peliculas", "Películas", groups.peliculas.length]]
    .map(([id,label,count]) => `<a href="/?tipo=${id}"${selected === id ? ' aria-current="page"' : ""}>${label} · ${count}</a>`).join("");
  const cards = shown.map(item => `<article class="tile">
    <div class="photo">${item.hasFile
      ? `<img src="${escapeHtml(item.file)}" alt="${escapeHtml(item.name)}" loading="lazy">`
      : '<div class="absent">Archivo no encontrado en backend/uploads</div>'}</div>
    <div class="info"><span class="kind">${item.type === "talentos" ? "Talento" : "Película"} #${item.id}</span>
    <strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.file)}</small></div>
  </article>`).join("");
  return `<!doctype html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>CineRD | Revisión de medios local</title>
<style>
:root{color-scheme:dark;font-family:system-ui,-apple-system,Segoe UI,sans-serif;background:#080f1b;color:#e7edf8}
*{box-sizing:border-box}body{margin:0;padding:28px max(18px,4vw);max-width:1600px;margin-inline:auto}
header{border-bottom:1px solid #34445d;padding-bottom:22px}h1{font-size:clamp(1.6rem,3vw,2.6rem);margin:.25em 0}
p{line-height:1.55;color:#c4d3e9;max-width:900px}.warning{border:1px solid #a58545;background:#292316;border-radius:12px;padding:15px 18px}
nav{display:flex;flex-wrap:wrap;gap:12px;margin:24px 0}nav a{color:#d8e9ff;text-decoration:none;padding:10px 16px;border:1px solid #34445d;border-radius:30px}nav a[aria-current]{background:#236ad1;border-color:#236ad1;color:white}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(175px,1fr));gap:17px}.tile{border:1px solid #2c3a4c;background:#111d30;border-radius:15px;overflow:hidden}
.photo{height:242px;background:#1c2b41;display:flex;align-items:center;justify-content:center}
.photo img{width:100%;height:100%;object-fit:contain}.absent{text-align:center;padding:12px;color:#ffc7ae}
.info{padding:12px}.info strong{display:block;overflow-wrap:anywhere;margin:6px 0}.info small{display:block;overflow-wrap:anywhere;color:#90a6c6;font-size:.65rem}
.kind{color:#82b7ff;font-size:.72rem;text-transform:uppercase;letter-spacing:.07em}
footer{margin-top:22px;color:#90a6c6;font-size:.85rem}
</style></head><body>
<header><small>CINERD · HERRAMIENTA DE REVISIÓN INTERNA</small><h1>Fotografías y pósteres originales</h1>
<p class="warning"><strong>Solo revisión en esta computadora.</strong> Estos archivos continúan
sin licencia comercial documentada. No los subas a Cloudflare/Netlify, no compartas
este visor mediante túneles o servidores proxy y no los uses para anuncios.</p>
<p>Las imágenes se leen directamente de <code>backend/uploads</code>. Este visor no requiere
SQL Server y no reemplaza las cubiertas editoriales seguras del sitio público.</p></header>
<nav aria-label="Filtrar galería">${links}</nav>
<main class="grid">${cards}</main>
<footer>${shown.length} recursos mostrados · CineRD · Vista previa local sin publicación</footer>
</body></html>`;
}

export function createLocalMediaServer(snapshot = JSON.parse(fs.readFileSync(SNAPSHOT, "utf8"))) {
  const items = readLocalMediaItems(snapshot);
  const allowed = new Map(items.map(item => [item.file, item]));
  const server = http.createServer((request, response) => {
    const send = (status, contentType, body) => {
      response.writeHead(status, {
        "Content-Type": contentType, "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff", "X-Frame-Options": "DENY",
        "Content-Security-Policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
      });
      response.end(body);
    };
    if (request.method !== "GET" && request.method !== "HEAD") {
      send(405,"text/plain; charset=utf-8","Método no permitido"); return;
    }
    let url;
    try { url = new URL(request.url, "http://127.0.0.1"); }
    catch { send(400,"text/plain; charset=utf-8","URL inválida"); return; }
    if (url.pathname === "/") {
      send(200, "text/html; charset=utf-8",request.method === "HEAD" ? undefined :
        renderLocalMediaPage(items,url.searchParams.get("tipo")));
      return;
    }
    // El archivo solo se puede solicitar si figura EXACTAMENTE en el snapshot.
    // No aceptar rutas ajenas, escapadas, carpetas, evidencias privadas ni query tricks.
    const item = allowed.get(url.pathname);
    if (!item || !SAFE_IMAGE.test(url.pathname) || url.pathname.includes("..")) {
      send(404,"text/plain; charset=utf-8","No encontrado"); return;
    }
    const file = path.resolve(MEDIA_ROOT, url.pathname.slice(1));
    const expectedRoot = path.resolve(MEDIA_ROOT,"uploads") + path.sep;
    if (!file.startsWith(expectedRoot)) {
      send(404,"text/plain; charset=utf-8","No encontrado"); return;
    }
    try {
      const realRoot = fs.realpathSync(path.join(MEDIA_ROOT,"uploads")) + path.sep;
      if (!fs.realpathSync(file).startsWith(realRoot)) {
        send(404,"text/plain; charset=utf-8","No encontrado"); return;
      }
      const stat = fs.statSync(file);
      if (!stat.isFile()) { send(404,"text/plain; charset=utf-8","No encontrado"); return; }
      response.writeHead(200,{
        "Content-Type": MIME[path.extname(file).toLowerCase()], "Content-Length": stat.size,
        "Cache-Control":"no-store", "X-Content-Type-Options":"nosniff",
        "Content-Security-Policy":"default-src 'none'",
      });
      if (request.method === "HEAD") { response.end(); return; }
      fs.createReadStream(file).on("error",()=>response.destroy()).pipe(response);
    } catch {
      send(404,"text/plain; charset=utf-8","Archivo no encontrado");
    }
  });
  return { server, items };
}

const invoked = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invoked) {
  const { server, items } = createLocalMediaServer();
  server.on("error",error=>{ console.error("No se puede abrir la galería local: " + error.message);process.exitCode=1; });
  server.listen(DEFAULT_PORT,LOOPBACK,()=>{
    console.log("CineRD — galería LOCAL: http://" + LOOPBACK + ":" + DEFAULT_PORT);
    console.log(items.filter(x=>x.type==="talentos").length + " retratos / " +
      items.filter(x=>x.type==="peliculas").length + " pósteres del snapshot.");
    console.log("Solo accesible desde este equipo. Ctrl+C para cerrar.");
  });
}
