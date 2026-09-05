const express = require("express");
const { registrar, login, refresh, logout, perfil } = require("../controllers/authController");
const { autenticar } = require("../middlewares/auth");
const { createRateLimit } = require("../middlewares/rateLimit");

const router = express.Router();
const authRateLimit = createRateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
const refreshRateLimit = createRateLimit({ windowMs: 5 * 60 * 1000, max: 60 });

router.post("/registro", authRateLimit, registrar);
router.post("/login", authRateLimit, login);
router.post("/refresh", refreshRateLimit, refresh);
router.post("/logout", logout);
router.get("/perfil", autenticar, perfil);

module.exports = router;
