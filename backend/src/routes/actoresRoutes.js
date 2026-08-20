const express = require("express");
const router = express.Router();

const upload = require("../middlewares/upload");
const { procesarImagenActor } = require("../middlewares/procesarImagen");
const { autenticar, autorizar } = require("../middlewares/auth");

const {
  obtenerActores,
  obtenerActorPorId,
  crearActor,
  actualizarActor,
  eliminarActor,
} = require("../controllers/actoresController");

router.get("/", obtenerActores);
router.get("/:id", obtenerActorPorId);

router.post("/", autenticar, autorizar("ADMINISTRADOR"), upload.single("Foto"), procesarImagenActor, crearActor);
router.put("/:id", autenticar, autorizar("ADMINISTRADOR"), upload.single("Foto"), procesarImagenActor, actualizarActor);
router.delete("/:id", autenticar, autorizar("ADMINISTRADOR"), eliminarActor);

module.exports = router;
