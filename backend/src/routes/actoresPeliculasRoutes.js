const express = require("express");
const router = express.Router();
const { autenticar, autorizar } = require("../middlewares/auth");

const {
  actualizarParticipacion,
  asignarActorAPelicula,
  obtenerActoresPorPelicula,
  obtenerPeliculasPorActor,
  eliminarActorDePelicula,
} = require("../controllers/actoresPeliculasController");

router.get("/pelicula/:peliculaId", obtenerActoresPorPelicula);
router.get("/actor/:actorId", obtenerPeliculasPorActor);
router.post("/", autenticar, autorizar("ADMINISTRADOR"), asignarActorAPelicula);
router.put("/:peliculaId/:actorId", autenticar, autorizar("ADMINISTRADOR"), actualizarParticipacion);
router.delete("/:peliculaId/:actorId", autenticar, autorizar("ADMINISTRADOR"), eliminarActorDePelicula);

module.exports = router;
