const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const sharp = require("sharp");
const { uploadsDir } = require("../config/storage");
const { normalizarFotoTalento } = require("../utils/actorPhoto");
const { normalizarPosterPelicula } = require("../utils/moviePoster");

const generarNombreMedia = (extension) => `${Date.now()}-${crypto.randomUUID()}${extension}`;

/**
 * La imagen se escribe antes del INSERT/UPDATE en SQL. Si el controlador
 * rechaza la operación o el cliente desconecta, borrar solo el archivo nuevo.
 * Las fotos históricas del catálogo nunca se eliminan aquí.
 */
const registrarLimpiezaEnFallo = (res, ruta) => {
  let finalizado = false;
  const finalizar = () => {
    if (finalizado) return;
    finalizado = true;
    if (res.statusCode < 400 && res.writableEnded) return;
    fs.promises.rm(ruta, { force: true }).catch(error => {
      console.error("Error limpiando imagen temporal:", error);
    });
  };
  res.once("finish", finalizar);
  res.once("close", finalizar);
};

const procesarImagenActor = async (req, res, next) => {
  try {
    if (!req.file) return next();
    const nombreArchivo = generarNombreMedia(".jpeg");
    const carpetaDestino = path.join(uploadsDir, "actores");
    const rutaDestino = path.join(carpetaDestino, nombreArchivo);
    if (!fs.existsSync(carpetaDestino)) fs.mkdirSync(carpetaDestino, { recursive: true });
    // El formato anterior (450x450, fit: contain) incorporaba franjas blancas al JPEG.
    // Marco 450x560: sujeto completo y sin ampliación; fondo difuminado en el área sobrante.
    const imagen = await normalizarFotoTalento(req.file.buffer);
    fs.writeFileSync(rutaDestino, imagen);
    registrarLimpiezaEnFallo(res, rutaDestino);
    req.file.filename = nombreArchivo;
    next();
  } catch (error) { next(error); }
};

const procesarImagenPelicula = async (req, res, next) => {
  try {
    if (!req.file) return next();
    const nombreArchivo = generarNombreMedia(".jpeg");
    const carpetaDestino = path.join(uploadsDir, "peliculas");
    const rutaDestino = path.join(carpetaDestino, nombreArchivo);
    if (!fs.existsSync(carpetaDestino)) fs.mkdirSync(carpetaDestino, { recursive: true });
    // El método anterior añadía franjas blancas cuando el cartel no medía 450x650.
    // Mantener el póster completo, sin ampliar ni recortar textos o ilustraciones.
    const imagen = await normalizarPosterPelicula(req.file.buffer);
    fs.writeFileSync(rutaDestino, imagen);
    registrarLimpiezaEnFallo(res, rutaDestino);
    req.file.filename = nombreArchivo;
    next();
  } catch (error) { next(error); }
};

const procesarImagenGaleria = async (req, res, next) => {
  try {
    if (!req.file) return next();
    const nombreArchivo = generarNombreMedia(".webp");
    const carpetaDestino = path.join(uploadsDir, "galerias");
    const rutaDestino = path.join(carpetaDestino, nombreArchivo);
    if (!fs.existsSync(carpetaDestino)) fs.mkdirSync(carpetaDestino, { recursive: true });
    await sharp(req.file.buffer).rotate().resize(1800, 1200, {
      fit: "inside",
      withoutEnlargement: true,
    }).webp({ quality: 88 }).toFile(rutaDestino);
    registrarLimpiezaEnFallo(res, rutaDestino);
    req.file.filename = nombreArchivo;
    next();
  } catch (error) { next(error); }
};

module.exports = { procesarImagenActor, procesarImagenPelicula, procesarImagenGaleria, generarNombreMedia, registrarLimpiezaEnFallo };
