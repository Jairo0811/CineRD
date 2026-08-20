const express = require("express");
const { registrar, login, perfil } = require("../controllers/authController");
const { autenticar } = require("../middlewares/auth");
const { createRateLimit } = require("../middlewares/rateLimit");

const router = express.Router();
const authRateLimit = createRateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

router.post("/registro", authRateLimit, registrar);
router.post("/login", authRateLimit, login);
router.get("/perfil", autenticar, perfil);

module.exports = router;
