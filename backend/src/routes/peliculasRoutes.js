const express = require("express");
const router = express.Router();

const upload = require("../middlewares/upload");
const { procesarImagenPelicula } = require("../middlewares/procesarImagen");
const { autenticar, autorizar } = require("../middlewares/auth");
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

router.post(
  "/",
  autenticar,
  autorizar("ADMINISTRADOR"),
  upload.single("Foto"),
  procesarImagenPelicula,
  crearPelicula,
);

router.put(
  "/:id",
  autenticar,
  autorizar("ADMINISTRADOR"),
  upload.single("Foto"),
  procesarImagenPelicula,
  actualizarPelicula,
);

router.delete("/:id", autenticar, autorizar("ADMINISTRADOR"), eliminarPelicula);

module.exports = router;
