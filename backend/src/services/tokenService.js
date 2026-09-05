const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { sql, poolPromise } = require("../config/db");

const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const REFRESH_TOKEN_DAYS = Number(process.env.JWT_REFRESH_EXPIRES_DAYS || 30);

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const crearAccessToken = (usuario) =>
  jwt.sign(
    {
      id: usuario.Id ?? usuario.id,
      email: usuario.Email ?? usuario.email,
      rol: usuario.Rol ?? usuario.rol,
      nombre: usuario.Nombre ?? usuario.nombre,
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN },
  );

const crearRefreshToken = () => crypto.randomBytes(48).toString("base64url");

const guardarRefreshToken = async (usuarioId, token) => {
  const pool = await poolPromise;
  const expiraEn = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);

  await pool.request()
    .input("UsuarioId", sql.Int, usuarioId)
    .input("TokenHash", sql.NVarChar(255), hashToken(token))
    .input("ExpiraEn", sql.DateTime2, expiraEn)
    .query(`
      INSERT INTO dbo.RefreshTokens (UsuarioId, TokenHash, ExpiraEn)
      VALUES (@UsuarioId, @TokenHash, @ExpiraEn)
    `);

  return expiraEn;
};

const rotarRefreshToken = async (tokenActual) => {
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);
  await transaction.begin();

  try {
    const request = new sql.Request(transaction);
    const resultado = await request
      .input("TokenHash", sql.NVarChar(255), hashToken(tokenActual))
      .query(`
        SELECT TOP 1
          rt.Id AS RefreshTokenId,
          rt.UsuarioId,
          u.Id,
          u.Nombre,
          u.Email,
          u.Rol,
          u.Estado
        FROM dbo.RefreshTokens rt WITH (UPDLOCK, ROWLOCK)
        INNER JOIN dbo.Usuarios u ON u.Id = rt.UsuarioId
        WHERE rt.TokenHash = @TokenHash
          AND rt.RevocadoEn IS NULL
          AND rt.ExpiraEn > SYSUTCDATETIME()
      `);

    const usuario = resultado.recordset[0];
    if (!usuario || usuario.Estado !== "ACTIVO") {
      await transaction.rollback();
      return null;
    }

    await new sql.Request(transaction)
      .input("Id", sql.BigInt, usuario.RefreshTokenId)
      .query("UPDATE dbo.RefreshTokens SET RevocadoEn = SYSUTCDATETIME() WHERE Id = @Id");

    const nuevoToken = crearRefreshToken();
    const expiraEn = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);

    await new sql.Request(transaction)
      .input("UsuarioId", sql.Int, usuario.UsuarioId)
      .input("TokenHash", sql.NVarChar(255), hashToken(nuevoToken))
      .input("ExpiraEn", sql.DateTime2, expiraEn)
      .query(`
        INSERT INTO dbo.RefreshTokens (UsuarioId, TokenHash, ExpiraEn)
        VALUES (@UsuarioId, @TokenHash, @ExpiraEn)
      `);

    await transaction.commit();

    return {
      refreshToken: nuevoToken,
      refreshExpiraEn: expiraEn,
      accessToken: crearAccessToken(usuario),
      usuario: {
        id: usuario.Id,
        nombre: usuario.Nombre,
        email: usuario.Email,
        rol: usuario.Rol,
      },
    };
  } catch (error) {
    if (transaction._aborted !== true) {
      try { await transaction.rollback(); } catch { /* noop */ }
    }
    throw error;
  }
};

const revocarRefreshToken = async (token) => {
  if (!token) return;
  const pool = await poolPromise;
  await pool.request()
    .input("TokenHash", sql.NVarChar(255), hashToken(token))
    .query(`
      UPDATE dbo.RefreshTokens
      SET RevocadoEn = COALESCE(RevocadoEn, SYSUTCDATETIME())
      WHERE TokenHash = @TokenHash
    `);
};

module.exports = {
  crearAccessToken,
  crearRefreshToken,
  guardarRefreshToken,
  rotarRefreshToken,
  revocarRefreshToken,
  hashToken,
};
