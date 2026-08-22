const express = require("express");
const router = express.Router();

const upload = require("../middlewares/upload");
const { procesarImagenGaleria } = require("../middlewares/procesarImagen");
const { autenticar, autorizar } = require("../middlewares/auth");
const {
  obtenerGaleria,
  crearElementoGaleria,
  actualizarElementoGaleria,
  eliminarElementoGaleria,
} = require("../controllers/galeriaController");

router.get("/", obtenerGaleria);

router.post(
  "/",
  autenticar,
  autorizar("ADMINISTRADOR"),
  upload.single("Imagen"),
  procesarImagenGaleria,
  crearElementoGaleria,
);

router.put(
  "/:id",
  autenticar,
  autorizar("ADMINISTRADOR"),
  upload.single("Imagen"),
  procesarImagenGaleria,
  actualizarElementoGaleria,
);

router.delete(
  "/:id",
  autenticar,
  autorizar("ADMINISTRADOR"),
  eliminarElementoGaleria,
);

module.exports = router;
