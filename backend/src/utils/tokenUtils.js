const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const crearRefreshToken = () => crypto.randomBytes(48).toString("base64url");

const crearAccessToken = (usuario, { secret, expiresIn = "15m" } = {}) => {
  const jwtSecret = secret || process.env.JWT_ACCESS_SECRET;
  if (!jwtSecret) throw new Error("JWT_ACCESS_SECRET es obligatorio");

  return jwt.sign(
    {
      id: usuario.Id ?? usuario.id,
      email: usuario.Email ?? usuario.email,
      rol: usuario.Rol ?? usuario.rol,
      nombre: usuario.Nombre ?? usuario.nombre,
    },
    jwtSecret,
    { expiresIn },
  );
};

module.exports = { hashToken, crearRefreshToken, crearAccessToken };
