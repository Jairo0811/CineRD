const bcrypt = require("bcryptjs");
const { sql, poolPromise } = require("../config/db");
const { hashToken } = require("../services/tokenService");
const { emitirVerificacionEmail, emitirRecuperacion } = require("../services/accountSecurityService");

const solicitarRecuperacion = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    if (!email) return res.status(400).json({ mensaje: "Correo obligatorio" });
    const pool = await poolPromise;
    const r = await pool.request().input("Email", sql.NVarChar(255), email)
      .query("SELECT Id,Nombre,Email,EmailVerificado FROM dbo.Usuarios WHERE Email=@Email AND Estado=N'ACTIVO'");
    if (r.recordset[0]) await emitirRecuperacion(r.recordset[0]);
    return res.json({ mensaje: "Si la cuenta existe, recibirás instrucciones para restablecer la contraseña" });
  } catch (error) {
    console.error("Error solicitando recuperación:", error);
    return res.status(500).json({ mensaje: "No fue posible procesar la solicitud" });
  }
};

const restablecerPassword = async (req, res) => {
  const token = String(req.body.token || "");
  const password = String(req.body.password || "");
  if (!token || password.length < 8) return res.status(400).json({ mensaje: "Token y contraseña de al menos 8 caracteres son obligatorios" });
  const pool = await poolPromise;
  const tx = new sql.Transaction(pool);
  await tx.begin();
  try {
    const r = await new sql.Request(tx).input("TokenHash", sql.NVarChar(64), hashToken(token)).query(`
      SELECT TOP 1 T.Id,T.UsuarioId FROM dbo.PasswordResetTokens T WITH(UPDLOCK,ROWLOCK)
      INNER JOIN dbo.Usuarios U ON U.Id=T.UsuarioId
      WHERE T.TokenHash=@TokenHash AND T.UsadoEn IS NULL AND T.ExpiraEn>SYSUTCDATETIME() AND U.Estado=N'ACTIVO'`);
    const row = r.recordset[0];
    if (!row) { await tx.rollback(); return res.status(400).json({ mensaje: "El enlace es inválido o expiró" }); }
    const hash = await bcrypt.hash(password, 12);
    await new sql.Request(tx).input("UsuarioId", sql.Int, row.UsuarioId).input("Hash", sql.NVarChar(255), hash)
      .query("UPDATE dbo.Usuarios SET PasswordHash=@Hash WHERE Id=@UsuarioId; UPDATE dbo.RefreshTokens SET RevocadoEn=COALESCE(RevocadoEn,SYSUTCDATETIME()) WHERE UsuarioId=@UsuarioId;");
    await new sql.Request(tx).input("Id", sql.BigInt, row.Id).query("UPDATE dbo.PasswordResetTokens SET UsadoEn=SYSUTCDATETIME() WHERE Id=@Id");
    await new sql.Request(tx).input("UsuarioId", sql.Int, row.UsuarioId)
      .query("INSERT INTO dbo.AuditLogs(UsuarioId,Accion,Entidad,EntidadId) VALUES(@UsuarioId,N'RESET_PASSWORD',N'Usuarios',CONVERT(NVARCHAR(80),@UsuarioId))");
    await tx.commit();
    return res.json({ mensaje: "Contraseña actualizada. Inicia sesión nuevamente" });
  } catch (error) {
    try { await tx.rollback(); } catch { /* noop */ }
    console.error("Error restableciendo contraseña:", error);
    return res.status(500).json({ mensaje: "No fue posible restablecer la contraseña" });
  }
};

const reenviarVerificacion = async (req, res) => {
  try {
    const pool = await poolPromise;
    const r = await pool.request().input("Id", sql.Int, req.usuario.id)
      .query("SELECT Id,Nombre,Email,EmailVerificado FROM dbo.Usuarios WHERE Id=@Id AND Estado=N'ACTIVO'");
    const usuario = r.recordset[0];
    if (!usuario) return res.status(404).json({ mensaje: "Cuenta no encontrada" });
    if (usuario.EmailVerificado) return res.json({ mensaje: "El correo ya está verificado" });
    await emitirVerificacionEmail(usuario);
    return res.json({ mensaje: "Correo de verificación enviado" });
  } catch (error) {
    console.error("Error reenviando verificación:", error);
    return res.status(500).json({ mensaje: "No fue posible enviar la verificación" });
  }
};

const verificarEmail = async (req, res) => {
  const token = String(req.body.token || "");
  if (!token) return res.status(400).json({ mensaje: "Token obligatorio" });
  const pool = await poolPromise;
  const tx = new sql.Transaction(pool);
  await tx.begin();
  try {
    const r = await new sql.Request(tx).input("TokenHash", sql.NVarChar(64), hashToken(token)).query(`
      SELECT TOP 1 Id,UsuarioId FROM dbo.EmailVerificationTokens WITH(UPDLOCK,ROWLOCK)
      WHERE TokenHash=@TokenHash AND UsadoEn IS NULL AND ExpiraEn>SYSUTCDATETIME()`);
    const row = r.recordset[0];
    if (!row) { await tx.rollback(); return res.status(400).json({ mensaje: "El enlace es inválido o expiró" }); }
    await new sql.Request(tx).input("UsuarioId", sql.Int, row.UsuarioId).query("UPDATE dbo.Usuarios SET EmailVerificado=1 WHERE Id=@UsuarioId");
    await new sql.Request(tx).input("Id", sql.BigInt, row.Id).query("UPDATE dbo.EmailVerificationTokens SET UsadoEn=SYSUTCDATETIME() WHERE Id=@Id");
    await new sql.Request(tx).input("UsuarioId", sql.Int, row.UsuarioId)
      .query("INSERT INTO dbo.AuditLogs(UsuarioId,Accion,Entidad,EntidadId) VALUES(@UsuarioId,N'VERIFICAR_EMAIL',N'Usuarios',CONVERT(NVARCHAR(80),@UsuarioId))");
    await tx.commit();
    return res.json({ mensaje: "Correo verificado correctamente" });
  } catch (error) {
    try { await tx.rollback(); } catch { /* noop */ }
    console.error("Error verificando email:", error);
    return res.status(500).json({ mensaje: "No fue posible verificar el correo" });
  }
};

module.exports = { solicitarRecuperacion, restablecerPassword, reenviarVerificacion, verificarEmail };
