const express = require("express");

const {
  buscarPeliculasTmdb,
  obtenerPeliculaTmdb,
  buscarPersonasTmdb,
  obtenerPersonaTmdb,
  obtenerRepartoTmdb,
  vincularActorConTmdb,
} = require("../controllers/tmdbController");
const { autenticar, autorizar } = require("../middlewares/auth");

const router = express.Router();

router.get("/peliculas/buscar", buscarPeliculasTmdb);
router.get("/peliculas/:tmdbId/reparto", obtenerRepartoTmdb);
router.get("/peliculas/:tmdbId", obtenerPeliculaTmdb);
router.get("/personas/buscar", buscarPersonasTmdb);
router.get("/personas/:tmdbId", obtenerPersonaTmdb);
router.patch("/actores/:actorId/vincular", autenticar, autorizar("ADMINISTRADOR"), vincularActorConTmdb);

module.exports = router;
