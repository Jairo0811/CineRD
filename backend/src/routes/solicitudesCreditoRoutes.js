const express = require("express");
const router = express.Router();

const { autenticar, autorizar } = require("../middlewares/auth");
const evidenciaCreditoUpload = require("../middlewares/evidenciaCreditoUpload");
const {
  crearSolicitud,
  obtenerMisSolicitudes,
  obtenerSolicitudesAdmin,
  descargarEvidencia,
  revisarSolicitud,
} = require("../controllers/solicitudesCreditoController");

router.post(
  "/",
  autenticar,
  autorizar("TALENTO_VERIFICADO"),
  evidenciaCreditoUpload.single("Evidencia"),
  crearSolicitud,
);

router.get(
  "/mias",
  autenticar,
  autorizar("TALENTO_VERIFICADO"),
  obtenerMisSolicitudes,
);

router.get(
  "/admin",
  autenticar,
  autorizar("ADMINISTRADOR"),
  obtenerSolicitudesAdmin,
);

router.get(
  "/evidencias/:evidenciaId/archivo",
  autenticar,
  autorizar("TALENTO_VERIFICADO", "ADMINISTRADOR"),
  descargarEvidencia,
);

router.patch(
  "/:id/revision",
  autenticar,
  autorizar("ADMINISTRADOR"),
  revisarSolicitud,
);

module.exports = router;
