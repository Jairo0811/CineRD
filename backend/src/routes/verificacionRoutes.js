const express = require("express");
const {
  crearSolicitud,
  misSolicitudes,
  miPerfilTalento,
  listarPendientes,
  listarVinculacionesActivas,
  revisarSolicitud,
  revocarVinculacion,
} = require("../controllers/verificacionController");
const { autenticar, autorizar } = require("../middlewares/auth");

const router = express.Router();

router.post("/actor/:actorId", autenticar, autorizar("USUARIO"), crearSolicitud);
router.get("/mis-solicitudes", autenticar, misSolicitudes);
router.get("/mi-perfil", autenticar, autorizar("TALENTO_VERIFICADO"), miPerfilTalento);
router.get("/admin/pendientes", autenticar, autorizar("ADMINISTRADOR"), listarPendientes);
router.get("/admin/vinculaciones", autenticar, autorizar("ADMINISTRADOR"), listarVinculacionesActivas);
router.patch("/admin/:id/revisar", autenticar, autorizar("ADMINISTRADOR"), revisarSolicitud);
router.patch("/admin/vinculaciones/:id/revocar", autenticar, autorizar("ADMINISTRADOR"), revocarVinculacion);

module.exports = router;