const express = require("express");

const {
  buscarPeliculasTmdb,
  obtenerPeliculaTmdb,
  buscarPersonasTmdb,
  obtenerPersonaTmdb,
  obtenerRepartoTmdb,
  vincularActorConTmdb,
} = require("../controllers/tmdbController");

const router = express.Router();

// Películas
router.get("/peliculas/buscar", buscarPeliculasTmdb);
router.get("/peliculas/:tmdbId/reparto", obtenerRepartoTmdb);
router.get("/peliculas/:tmdbId", obtenerPeliculaTmdb);

// Personas
router.get("/personas/buscar", buscarPersonasTmdb);
router.get("/personas/:tmdbId", obtenerPersonaTmdb);

// Vinculación CineRD ↔ TMDb
router.patch("/actores/:actorId/vincular", vincularActorConTmdb);

module.exports = router;