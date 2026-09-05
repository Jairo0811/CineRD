const fs = require("fs");
const path = require("path");

const resolveConfigured = (value, fallback) => value ? path.resolve(value) : path.resolve(fallback);

const defaultUploadsDir = path.resolve(process.cwd(), "uploads");
const defaultPrivateDir = path.resolve(process.cwd(), "private");
const uploadsDir = resolveConfigured(process.env.UPLOADS_DIR, defaultUploadsDir);
const privateDir = resolveConfigured(process.env.PRIVATE_STORAGE_DIR, defaultPrivateDir);
const evidenceDir = path.join(privateDir, "evidencias-creditos");

const ensureDirectory = (dir) => fs.mkdirSync(dir, { recursive: true });

const ensureCompatibilityLink = (legacyPath, targetPath) => {
  if (legacyPath === targetPath || fs.existsSync(legacyPath)) return;
  ensureDirectory(path.dirname(legacyPath));
  try {
    fs.symlinkSync(targetPath, legacyPath, process.platform === "win32" ? "junction" : "dir");
  } catch (error) {
    console.warn(JSON.stringify({ level: "warn", event: "storage.symlink_failed", legacyPath, targetPath, message: error.message }));
  }
};

const ensureStorageLayout = () => {
  ensureDirectory(uploadsDir);
  ensureDirectory(privateDir);
  ensureDirectory(evidenceDir);
  ensureCompatibilityLink(defaultPrivateDir, privateDir);
  return { uploadsDir, privateDir, evidenceDir };
};

module.exports = { uploadsDir, privateDir, evidenceDir, ensureStorageLayout };
