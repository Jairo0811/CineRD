const fs = require("fs");
const path = require("path");
const sql = require("mssql");
require("dotenv").config();

const REPO_ROOT = path.resolve(__dirname, "../..");
const SNAPSHOT_DIR = path.join(REPO_ROOT, "database", "seeds");
const SNAPSHOT_FILE = path.join(SNAPSHOT_DIR, "catalog.snapshot.json");
const MEDIA_DIR = path.join(SNAPSHOT_DIR, "media");
const BACKEND_ROOT = path.resolve(__dirname, "..");

const TABLES = [
  "Actores",
  "Peliculas",
  "ActoresPeliculas",
  "PeliculaTraducciones",
];

function getConfig(database = process.env.DB_DATABASE) {
  return {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database,
    options: {
      encrypt: String(process.env.DB_ENCRYPT).toLowerCase() === "true",
      trustServerCertificate: String(process.env.DB_TRUST_CERT ?? "true").toLowerCase() !== "false",
    },
  };
}

async function tableExists(pool, table) {
  const result = await pool.request()
    .input("table", sql.NVarChar, table)
    .query("SELECT CASE WHEN OBJECT_ID(N'dbo.' + @table, N'U') IS NULL THEN 0 ELSE 1 END AS Existe");
  return Boolean(result.recordset[0]?.Existe);
}

async function exportTable(pool, table) {
  if (!(await tableExists(pool, table))) {
    return [];
  }

  const result = await pool.request().query(`SELECT * FROM dbo.[${table}]`);
  return result.recordset;
}

function normalizeUploadPath(value) {
  if (!value || typeof value !== "string") return null;
  if (value.startsWith("http://") || value.startsWith("https://")) return null;

  const clean = value.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!clean.startsWith("uploads/")) return null;
  return clean;
}

function copyMediaFile(relativeUploadPath) {
  const source = path.join(BACKEND_ROOT, ...relativeUploadPath.split("/"));
  if (!fs.existsSync(source)) {
    console.warn(`⚠ Multimedia no encontrada: ${relativeUploadPath}`);
    return false;
  }

  const destination = path.join(MEDIA_DIR, ...relativeUploadPath.split("/"));
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
  return true;
}

function exportReferencedMedia(tables) {
  fs.rmSync(MEDIA_DIR, { recursive: true, force: true });
  fs.mkdirSync(MEDIA_DIR, { recursive: true });

  const paths = new Set();

  for (const actor of tables.Actores || []) {
    const foto = normalizeUploadPath(actor.Foto);
    if (foto) paths.add(foto);
  }

  for (const movie of tables.Peliculas || []) {
    for (const candidate of [movie.Foto, movie.Backdrop]) {
      const mediaPath = normalizeUploadPath(candidate);
      if (mediaPath) paths.add(mediaPath);
    }
  }

  let copied = 0;
  for (const mediaPath of paths) {
    if (copyMediaFile(mediaPath)) copied += 1;
  }

  return { referenced: paths.size, copied };
}

async function main() {
  if (!process.env.DB_SERVER || !process.env.DB_DATABASE) {
    throw new Error("Configura DB_SERVER y DB_DATABASE en backend/.env antes de exportar el catálogo.");
  }

  fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });

  const pool = await new sql.ConnectionPool(getConfig()).connect();
  try {
    const tables = {};
    for (const table of TABLES) {
      tables[table] = await exportTable(pool, table);
      console.log(`✓ ${table}: ${tables[table].length} registro(s)`);
    }

    const media = exportReferencedMedia(tables);
    const snapshot = {
      format: "CineRD.CatalogSnapshot",
      version: 1,
      generatedAtUtc: new Date().toISOString(),
      sourceDatabase: process.env.DB_DATABASE,
      tables,
      media,
    };

    fs.writeFileSync(SNAPSHOT_FILE, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");

    console.log(`\n✓ Snapshot generado: ${path.relative(REPO_ROOT, SNAPSHOT_FILE)}`);
    console.log(`✓ Multimedia copiada: ${media.copied}/${media.referenced}`);
    console.log("\nAhora revisa los cambios y súbelos a Git para que el catálogo viaje con el repositorio.");
  } finally {
    await pool.close();
  }
}

main().catch((error) => {
  console.error("\n✗ No se pudo exportar el catálogo:");
  console.error(error.message || error);
  process.exitCode = 1;
});
