const crypto = require("crypto");
const { sql, poolPromise } = require("../config/db");
const { hashToken } = require("./tokenService");
const { enviarVerificacionEmail, enviarRecuperacionPassword } = require("./emailService");

const crearToken = () => crypto.randomBytes(32).toString("base64url");

const emitirVerificacionEmail = async (usuario) => {
  if (!usuario || usuario.EmailVerificado) return;
  const token = crearToken();
  const pool = await poolPromise;
  await pool.request().input("UsuarioId", sql.Int, usuario.Id)
    .query("UPDATE dbo.EmailVerificationTokens SET UsadoEn=COALESCE(UsadoEn,SYSUTCDATETIME()) WHERE UsuarioId=@UsuarioId AND UsadoEn IS NULL");
  await pool.request()
    .input("UsuarioId", sql.Int, usuario.Id)
    .input("TokenHash", sql.NVarChar(64), hashToken(token))
    .query(`INSERT INTO dbo.EmailVerificationTokens(UsuarioId,TokenHash,ExpiraEn)
            VALUES(@UsuarioId,@TokenHash,DATEADD(HOUR,24,SYSUTCDATETIME()))`);
  await enviarVerificacionEmail(usuario.Email, usuario.Nombre, token);
};

const emitirRecuperacion = async (usuario) => {
  const token = crearToken();
  const pool = await poolPromise;
  await pool.request().input("UsuarioId", sql.Int, usuario.Id)
    .query("UPDATE dbo.PasswordResetTokens SET UsadoEn=COALESCE(UsadoEn,SYSUTCDATETIME()) WHERE UsuarioId=@UsuarioId AND UsadoEn IS NULL");
  await pool.request()
    .input("UsuarioId", sql.Int, usuario.Id)
    .input("TokenHash", sql.NVarChar(64), hashToken(token))
    .query(`INSERT INTO dbo.PasswordResetTokens(UsuarioId,TokenHash,ExpiraEn)
            VALUES(@UsuarioId,@TokenHash,DATEADD(MINUTE,30,SYSUTCDATETIME()))`);
  await enviarRecuperacionPassword(usuario.Email, usuario.Nombre, token);
};

module.exports = { emitirVerificacionEmail, emitirRecuperacion };
