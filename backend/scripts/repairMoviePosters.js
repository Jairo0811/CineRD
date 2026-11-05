/**
 * CineRD: auditoría y reparación SEGURA de pósteres antiguos 450x650 con
 * franjas blancas del procesamiento 'contain' anterior.
 *
 * Desde la raíz:
 *   npm --prefix backend run posters:repair:preview
 *   npm --prefix backend run posters:repair -- --apply
 *   npm --prefix backend run posters:repair -- --apply --only 123456789-Foto.jpeg
 *
 * Vista previa: genera HTML comparativo en backend/private, sin alterar pósteres.
 * Aplicación: guarda cada original en backend/private antes de reemplazarlo.
 * Los casos con bordes ambiguos se omiten automáticamente.
 */
const fs = require("node:fs");
const path = require("node:path");
require("dotenv").config();

const { uploadsDir, privateDir } = require("../src/config/storage");
const { repararPosterPelicula } = require("../src/utils/moviePoster");

const escaparHtml = texto => String(texto)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

function leerOpciones(args) {
  const apply = args.includes("--apply");
  const onlyIndex = args.indexOf("--only");
  const only = onlyIndex >= 0 ? args[onlyIndex + 1] : undefined;
  const validos = args.filter(x => x === "--apply").length === (apply ? 1 : 0)
    && args.filter(x => x === "--only").length === (only ? 1 : 0)
    && args.length === (apply ? 1 : 0) + (only ? 2 : 0);
  if (!validos || (only && !/^\d+-Foto\.jpe?g$/i.test(only))) {
    throw new Error("Uso: posters:repair [--apply] [--only NOMBRE-Foto.jpeg]");
  }
  return { apply, only };
}

async function main() {
  const { apply, only } = leerOpciones(process.argv.slice(2));
  const carpeta = path.join(uploadsDir, "peliculas");
  if (!fs.existsSync(carpeta)) throw new Error("No existe la carpeta de pósteres: " + carpeta);

  const archivos = fs.readdirSync(carpeta)
    .filter(name => /^\d+-Foto\.jpe?g$/i.test(name))
    .filter(name => !only || name === only)
    .sort();

  if (only && archivos.length === 0) throw new Error("No se encuentra el archivo solicitado: " + only);

  const marca = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.join(privateDir, "backups-posters", marca);
  const reportDir = path.join(privateDir, "informes-posters");
  let candidatos = 0;
  let omitidos = 0;
  let reparados = 0;
  const cards = [];

  console.log(apply ? "Modo APLICAR con respaldo privado" : "Modo VISTA PREVIA sin modificar pósteres");

  for (const nombre of archivos) {
    const archivo = path.join(carpeta, nombre);
    const original = fs.readFileSync(archivo);
    const resultado = await repararPosterPelicula(original);
    if (!resultado) {
      omitidos++;
      continue;
    }

    candidatos++;
    console.log((apply ? "REPARANDO " : "CANDIDATO ") + nombre + " " + JSON.stringify(resultado.recorte));

    if (!apply) {
      cards.push(`<article><h2>${escaparHtml(nombre)}</h2><div class="pair">
        <figure><img src="data:image/jpeg;base64,${original.toString("base64")}" alt="Original"><figcaption>ANTES</figcaption></figure>
        <figure><img src="data:image/jpeg;base64,${resultado.buffer.toString("base64")}" alt="Vista propuesta"><figcaption>PROPUESTA, SIN ZOOM</figcaption></figure>
      </div></article>`);
      continue;
    }

    fs.mkdirSync(backupDir, { recursive: true });
    fs.copyFileSync(archivo, path.join(backupDir, nombre), fs.constants.COPYFILE_EXCL);
    const temporal = archivo + ".repair-tmp";
    try {
      fs.writeFileSync(temporal, resultado.buffer, { flag: "wx" });
      fs.renameSync(temporal, archivo);
      reparados++;
    } finally {
      if (fs.existsSync(temporal)) fs.unlinkSync(temporal);
    }
  }

  if (!apply && cards.length) {
    fs.mkdirSync(reportDir, { recursive: true });
    const report = path.join(reportDir, "vista-previa-" + marca + ".html");
    fs.writeFileSync(report, `<!doctype html><html lang="es"><head><meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1"><title>CineRD · Pósteres</title>
      <style>
      body{background:#071426;color:#fff;font-family:Arial,sans-serif;margin:0;padding:20px}
      article{max-width:900px;margin:16px auto;padding:18px;background:#10243d;border-radius:14px}
      h2{font-size:15px;overflow-wrap:anywhere}.pair{display:grid;grid-template-columns:1fr 1fr;gap:16px}
      figure{margin:0;text-align:center}img{max-width:100%;height:300px;object-fit:contain;background:#14243c}
      figcaption{color:#dfbc6c;font-weight:bold;padding:8px}
      @media(max-width:600px){.pair{grid-template-columns:1fr}}
      </style></head><body><h1>CineRD · Pósteres antes y después</h1>
      <p>Solo vista previa: ningún póster fue modificado.</p>${cards.join("\n")}</body></html>`, "utf8");
    console.log("Comparación visual privada: " + report);
  }

  console.log("Pósteres inspeccionados: " + archivos.length);
  console.log("Con franjas blancas detectadas: " + candidatos);
  console.log("Omitidos por seguridad: " + omitidos);
  if (apply) {
    console.log("Reparados: " + reparados);
    if (reparados) console.log("Respaldos privados: " + backupDir);
  } else {
    console.log("Revisa el informe antes de ejecutar posters:repair -- --apply.");
  }
  console.log("Netlify no cambia hasta subir a GitHub los JPEG corregidos.");
}

main().catch(error => { console.error(error.message || error); process.exitCode = 1; });
