const express = require('express');
const router = express.Router();

const {
    obtenerActores,
    obtenerActorPorId,
    crearActor,
    actualizarActor,
    eliminarActor
} = require('../controllers/actoresController');

router.get('/', obtenerActores);
router.get('/:id', obtenerActorPorId);
router.post('/', crearActor);
router.put('/:id', actualizarActor);
router.delete('/:id', eliminarActor);

module.exports = router;