/**
 * Protege edición de fichas: administradores o titular verificado ACTIVO.
 * El cliente nunca decide a qué ActorId pertenece una cuenta.
 * Todas las consultas usan parámetros SQL (y validación de roles en servidor).
 */
function createAutorizarEdicionTalento(options = {}) {
  return async (req, res, next) => {
    const rol = req.usuario?.rol;
    if (rol === "ADMINISTRADOR") {
      req.edicionTalento = "administrador";
      return next();
    }
    if (rol !== "TALENTO_VERIFICADO") {
      return res.status(403).json({ mensaje: "No tiene permisos para editar este talento" });
    }

    const actorId = Number(req.params.id);
    const usuarioId = Number(req.usuario?.id);
    if (!Number.isSafeInteger(actorId) || actorId <= 0 ||
        !Number.isSafeInteger(usuarioId) || usuarioId <= 0) {
      return res.status(400).json({ mensaje: "Identificador de perfil inválido" });
    }

    try {
      // Cargar el driver solo durante una petición real, no al importar
      // este módulo en CI sin credenciales SQL configuradas.
      const db = options.getPool && options.sql ? null : require("../config/db");
      const pool = await (options.getPool ? options.getPool() : db.poolPromise);
      const sql = options.sql || db.sql;
      const result = await pool.request()
        .input("UsuarioId", sql.Int, usuarioId)
        .input("ActorId", sql.Int, actorId)
        .query(`
          SELECT TOP (1) TU.ActorId
          FROM dbo.TalentosUsuarios TU
          INNER JOIN dbo.Usuarios U ON U.Id = TU.UsuarioId
          WHERE TU.UsuarioId = @UsuarioId
            AND TU.ActorId = @ActorId
            AND TU.Estado = N'ACTIVO'
            AND U.Estado = N'ACTIVO'
            AND U.Rol = N'TALENTO_VERIFICADO'
        `);

      if (!result.recordset?.length) {
        return res.status(403).json({ mensaje: "No tiene una vinculación activa con este perfil" });
      }
      req.edicionTalento = "propio";
      return next();
    } catch (error) {
      console.error("Error verificando vinculación de talento:", error);
      return res.status(503).json({ mensaje: "No fue posible verificar los permisos de edición" });
    }
  };
}

module.exports = {
  createAutorizarEdicionTalento,
  autorizarEdicionTalento: createAutorizarEdicionTalento(),
};
