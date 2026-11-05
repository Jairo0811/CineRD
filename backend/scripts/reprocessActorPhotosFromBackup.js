/**
 * Reconstruye retratos a partir de un respaldo ORIGINAL de la primera reparación,
 * evitando volver a procesar los JPEG ya ampliados.
 *
 * PowerShell desde la raíz del repo:
 *   npm --prefix backend run photos:rebuild -- --backup "backend/private/backups-fotos-talentos/<fecha>"
 *   npm --prefix backend run photos:rebuild -- --backup "backend/private/backups-fotos-talentos/<fecha>" --apply
 *
 * La primera variante solo informa. --apply guarda una NUEVA copia de las fotos
 * actuales en backend/private/ y reemplaza únicamente los casos con franjas blancas.
 */
const fs = require("node:fs");
const path = require("node:path");
require("dotenv").config();

const { uploadsDir, privateDir } = require("../src/config/storage");
const { repararFotoTalento } = require("../src/utils/actorPhoto");

const dentroDe = (base, target) => {
  const rel = path.relative(base, target);
  return rel && rel !== ".." && !rel.startsWith(".." + path.sep) && !path.isAbsolute(rel);
};

async function main() {
  const args = process.argv.slice(2);
  const backupIndex = args.indexOf("--backup");
  const apply = args.includes("--apply");
  const backupArg = backupIndex >= 0 ? args[backupIndex + 1] : undefined;

  if (!backupArg || args.filter(arg => arg === "--backup").length !== 1 ||
      args.filter(arg => arg === "--apply").length > 1 ||
      args.length !== (apply ? 3 : 2)) {
    throw new Error('Uso: npm --prefix backend run photos:rebuild -- --backup "RUTA_DEL_RESPALDO" [--apply]');
  }

  const carpetaRespaldos = path.resolve(privateDir, "backups-fotos-talentos");
  // Npm ejecuta el script con cwd=backend; las rutas relativas se interpretan
  // desde la raíz del repositorio para que el comando de PowerShell sea consistente.
  const origenBackup = path.isAbsolute(backupArg)
    ? path.resolve(backupArg)
    : path.resolve(__dirname, "../..", backupArg);
  if (!dentroDe(carpetaRespaldos, origenBackup) ||
      !fs.existsSync(origenBackup) ||
      !fs.statSync(origenBackup).isDirectory()) {
    throw new Error("Selecciona una subcarpeta de respaldo válida dentro de backend/private/backups-fotos-talentos/");
  }

  const carpetaDestino = path.join(uploadsDir, "actores");
  const archivos = fs.readdirSync(origenBackup)
    .filter(name => /^[\w-]+-Foto\.jpe?g$/i.test(name))
    .sort();

  const respaldoSeguridad = path.join(
    privateDir,
    "backups-fotos-talentos-reprocesadas",
    new Date().toISOString().replace(/[:.]/g, "-")
  );

  let candidatos = 0;
  let omitidos = 0;
  let procesados = 0;

  console.log(apply ? "Modo APLICAR: preserva foto actual antes de reemplazar" : "Modo VISTA PREVIA: no modifica archivos");
  console.log("Backup original: " + origenBackup);

  for (const name of archivos) {
    const oldPath = path.join(origenBackup, name);
    const currentPath = path.join(carpetaDestino, name);
    if (!fs.existsSync(currentPath)) {
      console.log("OMITIDO (ya no existe): " + name);
      omitidos++;
      continue;
    }

    const original = fs.readFileSync(oldPath);
    const result = await repararFotoTalento(original);
    if (!result) {
      omitidos++;
      continue;
    }
    candidatos++;
    console.log((apply ? "REPROCESAR " : "CANDIDATO ") + name + " " + JSON.stringify(result.recorte));

    if (!apply) continue;
    fs.mkdirSync(respaldoSeguridad, { recursive: true });
    fs.copyFileSync(currentPath, path.join(respaldoSeguridad, name), fs.constants.COPYFILE_EXCL);

    const temporal = currentPath + ".rebuild-tmp";
    try {
      fs.writeFileSync(temporal, result.buffer, { flag: "wx" });
      fs.renameSync(temporal, currentPath);
      procesados++;
    } finally {
      if (fs.existsSync(temporal)) fs.unlinkSync(temporal);
    }
  }

  console.log("Fotos en backup: " + archivos.length);
  console.log("Candidatas sin recorte ni ampliación del sujeto: " + candidatos);
  console.log("Omitidas: " + omitidos);
  if (apply) {
    console.log("Reprocesadas: " + procesados);
    console.log("Copia privada de las anteriores: " + respaldoSeguridad);
    console.log("Inspecciona visualmente las fotos antes de usar git add y publicar.");
  } else {
    console.log("Para ejecutar la reparación, repite el comando con --apply.");
  }
}

main().catch(error => {
  console.error(error.message || error);
  process.exitCode = 1;
});
