const express = require('express');
const router = express.Router();

const {
    asignarActorAPelicula,
    obtenerActoresPorPelicula,
    obtenerPeliculasPorActor,
    eliminarActorDePelicula
} = require('../controllers/actoresPeliculasController');

router.post('/', asignarActorAPelicula);
router.get('/pelicula/:peliculaId/actores', obtenerActoresPorPelicula);
router.get('/actor/:actorId/peliculas', obtenerPeliculasPorActor);
router.delete('/pelicula/:peliculaId/actor/:actorId', eliminarActorDePelicula);

module.exports = router;