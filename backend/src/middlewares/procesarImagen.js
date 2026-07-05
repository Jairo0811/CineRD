const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

const procesarImagenActor = async (req, res, next) => {
  try {
    if (!req.file) return next();

    const nombreArchivo = `${Date.now()}-Foto.jpeg`;
    const carpetaDestino = path.join(process.cwd(), "uploads", "actores");
    const rutaDestino = path.join(carpetaDestino, nombreArchivo);

    if (!fs.existsSync(carpetaDestino)) {
      fs.mkdirSync(carpetaDestino, { recursive: true });
    }

    await sharp(req.file.buffer)
      .rotate()
      .resize(450, 450, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .jpeg({ quality: 90 })
      .toFile(rutaDestino);

    req.file.filename = nombreArchivo;

    next();
  } catch (error) {
    next(error);
  }
};

const procesarImagenPelicula = async (req, res, next) => {
  try {
    if (!req.file) return next();

    const nombreArchivo = `${Date.now()}-Foto.jpeg`;
    const carpetaDestino = path.join(process.cwd(), "uploads", "peliculas");
    const rutaDestino = path.join(carpetaDestino, nombreArchivo);

    if (!fs.existsSync(carpetaDestino)) {
      fs.mkdirSync(carpetaDestino, { recursive: true });
    }

    await sharp(req.file.buffer)
      .rotate()
      .resize(450, 650, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .jpeg({ quality: 90 })
      .toFile(rutaDestino);

    req.file.filename = nombreArchivo;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  procesarImagenActor,
  procesarImagenPelicula,
};