const express = require('express');
const router = express.Router();

const {
    obtenerPeliculas,
    crearPelicula,
    actualizarPelicula,
    eliminarPelicula
} = require('../controllers/peliculasController');

router.get('/', obtenerPeliculas);
router.post('/', crearPelicula);
router.put('/:id', actualizarPelicula);
router.delete('/:id', eliminarPelicula);

module.exports = router;