const path = require("path");

const resolveConfigured = (value, fallback) => value ? path.resolve(value) : path.resolve(fallback);

const uploadsDir = resolveConfigured(process.env.UPLOADS_DIR, path.join(process.cwd(), "uploads"));
const privateDir = resolveConfigured(process.env.PRIVATE_STORAGE_DIR, path.join(process.cwd(), "private"));
const evidenceDir = path.join(privateDir, "evidencias-creditos");

module.exports = { uploadsDir, privateDir, evidenceDir };
