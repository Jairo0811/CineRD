const express = require("express");
const router = express.Router();

const {
  obtenerPeliculas,
  obtenerPeliculaPorId,
  crearPelicula,
  actualizarPelicula,
  eliminarPelicula
} = require("../controllers/peliculasController");

router.get("/", obtenerPeliculas);
router.get("/:id", obtenerPeliculaPorId);
router.post("/", crearPelicula);
router.put("/:id", actualizarPelicula);
router.delete("/:id", eliminarPelicula);

module.exports = router;