const express = require("express");
const router = express.Router();

const upload = require("../middlewares/upload");
const { procesarImagenPelicula } = require("../middlewares/procesarImagen");
const {
  obtenerPerfilPelicula,
} = require("../controllers/peliculasPerfilController");

const {
  obtenerPeliculas,
  obtenerPeliculaPorId,
  obtenerPeliculasDirigidasPorActor,
  crearPelicula,
  actualizarPelicula,
  eliminarPelicula,
} = require("../controllers/peliculasController");

router.get("/", obtenerPeliculas);

router.get("/director/:nombre", obtenerPeliculasDirigidasPorActor);
router.get("/:id/perfil", obtenerPerfilPelicula);
router.get("/:id", obtenerPeliculaPorId);

router.post("/", upload.single("Foto"), procesarImagenPelicula, crearPelicula);

router.put(
  "/:id",
  upload.single("Foto"),
  procesarImagenPelicula,
  actualizarPelicula,
);

router.delete("/:id", eliminarPelicula);

module.exports = router;
