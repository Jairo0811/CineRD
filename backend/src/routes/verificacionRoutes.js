const express = require("express");
const {
  crearSolicitud,
  misSolicitudes,
  miPerfilTalento,
  listarPendientes,
  revisarSolicitud,
} = require("../controllers/verificacionController");
const { autenticar, autorizar } = require("../middlewares/auth");

const router = express.Router();

router.post("/actor/:actorId", autenticar, autorizar("USUARIO", "TALENTO_VERIFICADO"), crearSolicitud);
router.get("/mis-solicitudes", autenticar, misSolicitudes);
router.get("/mi-perfil", autenticar, autorizar("TALENTO_VERIFICADO"), miPerfilTalento);
router.get("/admin/pendientes", autenticar, autorizar("ADMINISTRADOR"), listarPendientes);
router.patch("/admin/:id/revisar", autenticar, autorizar("ADMINISTRADOR"), revisarSolicitud);

module.exports = router;