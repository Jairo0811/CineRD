const express = require("express");
const router = express.Router();

const upload = require("../middlewares/upload");
const { procesarImagenActor } = require("../middlewares/procesarImagen");

const {
  obtenerActores,
  obtenerActorPorId,
  crearActor,
  actualizarActor,
  eliminarActor,
} = require("../controllers/actoresController");

router.get("/", obtenerActores);
router.get("/:id", obtenerActorPorId);

router.post("/", upload.single("Foto"), procesarImagenActor, crearActor);
router.put("/:id", upload.single("Foto"), procesarImagenActor, actualizarActor);

router.delete("/:id", eliminarActor);

module.exports = router;