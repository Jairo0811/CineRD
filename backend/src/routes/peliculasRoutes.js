const express = require("express");
const router = express.Router();

const upload = require("../middlewares/upload");

const {
  obtenerPeliculas,
  obtenerPeliculaPorId,
  crearPelicula,
  actualizarPelicula,
  eliminarPelicula,
} = require("../controllers/peliculasController");

router.get("/", obtenerPeliculas);
router.get("/:id", obtenerPeliculaPorId);
router.post("/", upload.single("Foto"), crearPelicula);
router.put("/:id", upload.single("Foto"), actualizarPelicula);
router.delete("/:id", eliminarPelicula);

module.exports = router;