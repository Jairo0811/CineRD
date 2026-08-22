const express = require("express");
const router = express.Router();

const { autenticar, autorizar } = require("../middlewares/auth");
const {
  obtenerPremios,
  obtenerPremioPorId,
  crearPremio,
  actualizarPremio,
  eliminarPremio,
  obtenerNominaciones,
  crearNominacion,
  actualizarNominacion,
  eliminarNominacion,
} = require("../controllers/premiosController");

router.get("/", obtenerPremios);
router.get("/nominaciones", obtenerNominaciones);
router.get("/:id", obtenerPremioPorId);

router.post("/", autenticar, autorizar("ADMINISTRADOR"), crearPremio);
router.put("/:id", autenticar, autorizar("ADMINISTRADOR"), actualizarPremio);
router.delete("/:id", autenticar, autorizar("ADMINISTRADOR"), eliminarPremio);

router.post(
  "/nominaciones",
  autenticar,
  autorizar("ADMINISTRADOR"),
  crearNominacion,
);
router.put(
  "/nominaciones/:id",
  autenticar,
  autorizar("ADMINISTRADOR"),
  actualizarNominacion,
);
router.delete(
  "/nominaciones/:id",
  autenticar,
  autorizar("ADMINISTRADOR"),
  eliminarNominacion,
);

module.exports = router;
