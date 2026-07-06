const express = require("express");
const router = express.Router();

const {
  actualizarParticipacion,
  asignarActorAPelicula,
  obtenerActoresPorPelicula,
  obtenerPeliculasPorActor,
  eliminarActorDePelicula,
} = require("../controllers/actoresPeliculasController");

router.get("/pelicula/:peliculaId", obtenerActoresPorPelicula);
router.get("/actor/:actorId", obtenerPeliculasPorActor);
router.post("/", asignarActorAPelicula);
router.put("/:peliculaId/:actorId", actualizarParticipacion);
router.delete("/:peliculaId/:actorId", eliminarActorDePelicula);

module.exports = router;