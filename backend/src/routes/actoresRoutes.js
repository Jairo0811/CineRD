const express = require('express');
const router = express.Router();

const {
    obtenerActores,
    crearActor,
    actualizarActor,
    eliminarActor
} = require('../controllers/actoresController');

router.get('/', obtenerActores);
router.post('/', crearActor);
router.put('/:id', actualizarActor);
router.delete('/:id', eliminarActor);

module.exports = router;