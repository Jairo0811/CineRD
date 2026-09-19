const express = require("express");
const {
  obtenerMiPerfilPro,
  actualizarMiPerfilPro,
  obtenerPerfilProPublico,
  cambiarEntitlementAdmin,
} = require("../controllers/cinerdProController");
const { autenticar, autorizar } = require("../middlewares/auth");

const router = express.Router();

router.get("/actor/:actorId", obtenerPerfilProPublico);
router.get("/me", autenticar, autorizar("TALENTO_VERIFICADO"), obtenerMiPerfilPro);
router.put("/me", autenticar, autorizar("TALENTO_VERIFICADO"), actualizarMiPerfilPro);
router.patch("/admin/actor/:actorId", autenticar, autorizar("ADMINISTRADOR"), cambiarEntitlementAdmin);

module.exports = router;
