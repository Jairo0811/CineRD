const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tipo = req.baseUrl.includes("peliculas")
      ? "peliculas"
      : "actores";

    cb(null, `uploads/${tipo}`);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    const nombreArchivo = `${Date.now()}-${file.fieldname}${extension}`;

    cb(null, nombreArchivo);
  },
});

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