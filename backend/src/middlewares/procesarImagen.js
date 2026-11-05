const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const { uploadsDir } = require("../config/storage");
const { normalizarFotoTalento } = require("../utils/actorPhoto");
const { normalizarPosterPelicula } = require("../utils/moviePoster");

const procesarImagenActor = async (req, res, next) => {
  try {
    if (!req.file) return next();
    const nombreArchivo = `${Date.now()}-Foto.jpeg`;
    const carpetaDestino = path.join(uploadsDir, "actores");
    const rutaDestino = path.join(carpetaDestino, nombreArchivo);
    if (!fs.existsSync(carpetaDestino)) fs.mkdirSync(carpetaDestino, { recursive: true });
    // El formato anterior (450x450, fit: contain) incorporaba franjas blancas al JPEG.
    // Marco 450x560: sujeto completo y sin ampliación; fondo difuminado en el área sobrante.
    const imagen = await normalizarFotoTalento(req.file.buffer);
    fs.writeFileSync(rutaDestino, imagen);
    req.file.filename = nombreArchivo;
    next();
  } catch (error) { next(error); }
};

const procesarImagenPelicula = async (req, res, next) => {
  try {
    if (!req.file) return next();
    const nombreArchivo = `${Date.now()}-Foto.jpeg`;
    const carpetaDestino = path.join(uploadsDir, "peliculas");
    const rutaDestino = path.join(carpetaDestino, nombreArchivo);
    if (!fs.existsSync(carpetaDestino)) fs.mkdirSync(carpetaDestino, { recursive: true });
    // El método anterior añadía franjas blancas cuando el cartel no medía 450x650.
    // Mantener el póster completo, sin ampliar ni recortar textos o ilustraciones.
    const imagen = await normalizarPosterPelicula(req.file.buffer);
    fs.writeFileSync(rutaDestino, imagen);
    req.file.filename = nombreArchivo;
    next();
  } catch (error) { next(error); }
};

const procesarImagenGaleria = async (req, res, next) => {
  try {
    if (!req.file) return next();
    const nombreArchivo = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
    const carpetaDestino = path.join(uploadsDir, "galerias");
    const rutaDestino = path.join(carpetaDestino, nombreArchivo);
    if (!fs.existsSync(carpetaDestino)) fs.mkdirSync(carpetaDestino, { recursive: true });
    await sharp(req.file.buffer).rotate().resize(1800, 1200, {
      fit: "inside",
      withoutEnlargement: true,
    }).webp({ quality: 88 }).toFile(rutaDestino);
    req.file.filename = nombreArchivo;
    next();
  } catch (error) { next(error); }
};

module.exports = { procesarImagenActor, procesarImagenPelicula, procesarImagenGaleria };
