/**
 * Reparación conservadora de fotografías heredadas de talentos (450x450, barras blancas).
 *
 * Uso desde la raíz:
 *   npm --prefix backend run photos:repair:preview
 *   npm --prefix backend run photos:repair -- --apply
 *
 * Por defecto solo informa. Con --apply guarda COPIAS antes de sobrescribir,
 * conserva nombres y rutas del catálogo y omite fotos ambiguas.
 */
const fs = require("node:fs");
const path = require("node:path");
require("dotenv").config();

const { uploadsDir, privateDir } = require("../src/config/storage");
const { repararFotoTalento } = require("../src/utils/actorPhoto");

async function main() {
  const apply = process.argv.includes("--apply");
  const args = process.argv.slice(2);
  if (args.some(arg => arg !== "--apply")) {
    throw new Error("Único argumento permitido: --apply (sin argumento = vista previa).");
  }

  const carpeta = path.join(uploadsDir, "actores");
  if (!fs.existsSync(carpeta)) {
    throw new Error("No se encontró la carpeta de fotos: " + carpeta);
  }

  const archivos = fs.readdirSync(carpeta)
    .filter(nombre => /\.(jpe?g)$/i.test(nombre))
    .sort();

  const respaldo = path.join(
    privateDir,
    "backups-fotos-talentos",
    new Date().toISOString().replace(/[:.]/g, "-")
  );
  let candidatos = 0;
  let reparados = 0;
  let omitidos = 0;

  console.log(apply ? "Modo APLICAR (se guardará respaldo de cada foto)" : "Modo VISTA PREVIA (no cambia archivos)");

  for (const nombre of archivos) {
    const origen = path.join(carpeta, nombre);
    try {
      const original = fs.readFileSync(origen);
      const resultado = await repararFotoTalento(original);
      if (!resultado) {
        omitidos++;
        continue;
      }

      candidatos++;
      console.log((apply ? "REPARANDO " : "CANDIDATO ") + nombre + " " + JSON.stringify(resultado.recorte));

      if (apply) {
        fs.mkdirSync(respaldo, { recursive: true });
        fs.copyFileSync(origen, path.join(respaldo, nombre));
        fs.writeFileSync(origen, resultado.buffer);
        reparados++;
      }
    } catch (error) {
      throw new Error("No se pudo revisar " + nombre + ": " + error.message, { cause: error });
    }
  }

  console.log("Fotos inspeccionadas: " + archivos.length);
  console.log("Franjas blancas detectadas: " + candidatos);
  console.log("Omitidas por seguridad: " + omitidos);
  if (apply) {
    console.log("Reparadas: " + reparados);
    if (reparados) console.log("Respaldos privados: " + respaldo);
    console.log("Revisa visualmente las fotos y usa git diff --stat antes de publicar en GitHub.");
  } else {
    console.log("No se modificó ninguna foto. Para aplicar: npm --prefix backend run photos:repair -- --apply");
  }
  console.log("Las fotos de Netlify solo cambian al publicar los JPEG modificados en GitHub.");
}

main().catch(error => {
  console.error(error.message || error);
  process.exitCode = 1;
});
