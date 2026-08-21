const multer = require("multer");

const MAX_EVIDENCE_SIZE = 10 * 1024 * 1024;
const tiposPermitidos = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

const evidenciaCreditoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_EVIDENCE_SIZE, files: 1 },
  fileFilter: (req, file, cb) => {
    if (!tiposPermitidos.has(file.mimetype)) {
      return cb(new Error("La evidencia debe ser JPG, PNG, WEBP o PDF"), false);
    }
    return cb(null, true);
  },
});

module.exports = evidenciaCreditoUpload;
