const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const actoresRoutes = require("./routes/actoresRoutes");
const peliculasRoutes = require("./routes/peliculasRoutes");
const actoresPeliculasRoutes = require("./routes/actoresPeliculasRoutes");
const tmdbRoutes = require("./routes/tmdbRoutes");
const authRoutes = require("./routes/authRoutes");
const verificacionRoutes = require("./routes/verificacionRoutes");
const busquedaRoutes = require("./routes/busquedaRoutes");

const app = express();
app.disable("x-powered-by");

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.use("/uploads", express.static("uploads", { dotfiles: "deny", fallthrough: false }));

app.get("/", (req, res) => {
  res.json({ mensaje: "API de CineRD funcionando correctamente" });
});

app.use("/api/auth", authRoutes);
app.use("/api/verificaciones", verificacionRoutes);
app.use("/api/actores", actoresRoutes);
app.use("/api/peliculas", peliculasRoutes);
app.use("/api/actores-peliculas", actoresPeliculasRoutes);
app.use("/api/tmdb", tmdbRoutes);
app.use("/api/busqueda", busquedaRoutes);

module.exports = app;
