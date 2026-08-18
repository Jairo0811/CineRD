const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sql, poolPromise } = require("../config/db");

const crearAccessToken = (usuario) =>
  jwt.sign(
    { id: usuario.Id, email: usuario.Email, rol: usuario.Rol, nombre: usuario.Nombre },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m" },
  );

const registrar = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    if (!nombre?.trim() || !email?.trim() || !password || password.length < 8) {
      return res.status(400).json({ mensaje: "Nombre, email y contraseña de al menos 8 caracteres son obligatorios" });
    }

    const pool = await poolPromise;
    const emailNormalizado = email.trim().toLowerCase();
    const existente = await pool.request().input("Email", sql.NVarChar(255), emailNormalizado)
      .query("SELECT Id FROM dbo.Usuarios WHERE Email = @Email");
    if (existente.recordset.length) {
      return res.status(409).json({ mensaje: "Ya existe una cuenta con ese correo" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const resultado = await pool.request()
      .input("Nombre", sql.NVarChar(150), nombre.trim())
      .input("Email", sql.NVarChar(255), emailNormalizado)
      .input("PasswordHash", sql.NVarChar(255), passwordHash)
      .query(`INSERT INTO dbo.Usuarios (Nombre, Email, PasswordHash)
              OUTPUT INSERTED.Id, INSERTED.Nombre, INSERTED.Email, INSERTED.Rol
              VALUES (@Nombre, @Email, @PasswordHash)`);

    return res.status(201).json({ usuario: resultado.recordset[0] });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    return res.status(500).json({ mensaje: "Error al registrar usuario" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ mensaje: "Email y contraseña son obligatorios" });

    const pool = await poolPromise;
    const resultado = await pool.request().input("Email", sql.NVarChar(255), email.trim().toLowerCase())
      .query("SELECT Id, Nombre, Email, PasswordHash, Rol, Estado FROM dbo.Usuarios WHERE Email = @Email");
    const usuario = resultado.recordset[0];
    if (!usuario || !(await bcrypt.compare(password, usuario.PasswordHash))) {
      return res.status(401).json({ mensaje: "Credenciales inválidas" });
    }
    if (usuario.Estado !== "ACTIVO") return res.status(403).json({ mensaje: "La cuenta no está activa" });

    const accessToken = crearAccessToken(usuario);
    await pool.request().input("Id", sql.Int, usuario.Id)
      .query("UPDATE dbo.Usuarios SET UltimoAcceso = SYSUTCDATETIME() WHERE Id = @Id");

    return res.json({
      accessToken,
      usuario: { id: usuario.Id, nombre: usuario.Nombre, email: usuario.Email, rol: usuario.Rol },
    });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return res.status(500).json({ mensaje: "Error al iniciar sesión" });
  }
};

const perfil = async (req, res) => {
  const pool = await poolPromise;
  const resultado = await pool.request().input("Id", sql.Int, req.usuario.id)
    .query("SELECT Id, Nombre, Email, Rol, Estado, EmailVerificado, FechaRegistro, UltimoAcceso FROM dbo.Usuarios WHERE Id = @Id");
  return res.json(resultado.recordset[0]);
};

module.exports = { registrar, login, perfil };
