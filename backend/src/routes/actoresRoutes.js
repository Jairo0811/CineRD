const express = require("express");
const router = express.Router();

const upload = require("../middlewares/upload");
const { procesarImagenActor } = require("../middlewares/procesarImagen");
const { autenticar, autorizar } = require("../middlewares/auth");
const { autorizarEdicionTalento } = require("../middlewares/autorizarEdicionTalento");

const {
  obtenerActores,
  obtenerActorPorId,
  crearActor,
  actualizarActor,
  actualizarMiPerfilTalento,
  eliminarActor,
} = require("../controllers/actoresController");

router.get("/", obtenerActores);
router.get("/:id", obtenerActorPorId);

router.post("/", autenticar, autorizar("ADMINISTRADOR"), upload.single("Foto"), procesarImagenActor, crearActor);
router.put("/:id", autenticar, autorizarEdicionTalento, upload.single("Foto"), procesarImagenActor,
  (req, res) => req.edicionTalento === "propio"
    ? actualizarMiPerfilTalento(req, res)
    : actualizarActor(req, res));
router.delete("/:id", autenticar, autorizar("ADMINISTRADOR"), eliminarActor);

module.exports = router;
