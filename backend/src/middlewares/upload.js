const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];

  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten imágenes JPG, PNG o WEBP"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
});

module.exports = upload;