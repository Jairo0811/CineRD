const express = require("express");
const { registrar, login, refresh, logout, perfil } = require("../controllers/authController");
const {
  solicitarRecuperacion,
  restablecerPassword,
  reenviarVerificacion,
  verificarEmail,
} = require("../controllers/accountSecurityController");
const { autenticar } = require("../middlewares/auth");
const { createRateLimit } = require("../middlewares/rateLimit");

const router = express.Router();
const authRateLimit = createRateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
const refreshRateLimit = createRateLimit({ windowMs: 5 * 60 * 1000, max: 60 });
const recoveryRateLimit = createRateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

router.post("/registro", authRateLimit, registrar);
router.post("/login", authRateLimit, login);
router.post("/refresh", refreshRateLimit, refresh);
router.post("/logout", logout);
router.get("/perfil", autenticar, perfil);
router.post("/password/solicitar", recoveryRateLimit, solicitarRecuperacion);
router.post("/password/restablecer", recoveryRateLimit, restablecerPassword);
router.post("/email/reenviar-verificacion", recoveryRateLimit, autenticar, reenviarVerificacion);
router.post("/email/verificar", recoveryRateLimit, verificarEmail);

module.exports = router;
