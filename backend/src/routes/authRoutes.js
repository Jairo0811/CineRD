const express = require("express");
const { registrar, login, perfil } = require("../controllers/authController");
const { autenticar } = require("../middlewares/auth");

const router = express.Router();

router.post("/registro", registrar);
router.post("/login", login);
router.get("/perfil", autenticar, perfil);

module.exports = router;
