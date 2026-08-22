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
const solicitudesCreditoRoutes = require("./routes/solicitudesCreditoRoutes");

const app = express();
app.disable("x-powered-by");

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});

const origenesConfigurados = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origen) => origen.trim())
  .filter(Boolean);

const esOrigenLocalPermitido = (origin) => {
  if (!origin) return true;

  try {
    const url = new URL(origin);
    const esHttp = url.protocol === "http:" || url.protocol === "https:";
    const esPuertoFrontend = url.port === "5173" || url.port === "";
    const esLocalhost = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    const esIPv4Privada =
      /^10\./.test(url.hostname) ||
      /^192\.168\./.test(url.hostname) ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(url.hostname);

    return esHttp && esPuertoFrontend && (esLocalhost || esIPv4Privada);
  } catch {
    return false;
  }
};

app.use(cors({
  origin(origin, callback) {
    if (origenesConfigurados.includes(origin) || esOrigenLocalPermitido(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Origen no permitido por CORS"));
  },
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
app.use("/api/solicitudes-creditos", solicitudesCreditoRoutes);
app.use("/api/actores", actoresRoutes);
app.use("/api/peliculas", peliculasRoutes);
app.use("/api/actores-peliculas", actoresPeliculasRoutes);
app.use("/api/tmdb", tmdbRoutes);
app.use("/api/busqueda", busquedaRoutes);

module.exports = app;
