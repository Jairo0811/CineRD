const express = require("express");
const { buscarGlobal } = require("../controllers/busquedaController");

const router = express.Router();
router.get("/", buscarGlobal);

module.exports = router;
