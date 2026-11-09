const jwt = require("jsonwebtoken");

const autenticar = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.substring(7)
    : req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({ mensaje: "Autenticación requerida" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.usuario = payload;
    next();
  } catch {
    return res.status(401).json({ mensaje: "Token inválido o expirado" });
  }
};

/**
 * Revalida en SQL el rol/estado de una sesión antes de TODA acción protegida.
 * Un JWT todavía vigente no autoriza una cuenta bloqueada ni un rol revocado.
 * El JWT sigue exigiéndose en autenticar; los datos SQL son autoridad actual.
 */
const createRoleGuard = (rolesPermitidos, getDb = () => require("../config/db")) => async (req, res, next) => {
  const tokenRole = req.usuario?.rol;
  const userId = Number(req.usuario?.id);
  if (!rolesPermitidos.includes(tokenRole) || !Number.isSafeInteger(userId) || userId <= 0) {
    return res.status(403).json({ mensaje: "No tiene permisos para realizar esta acción" });
  }
  try {
    const { sql, poolPromise } = getDb();
    const pool = await poolPromise;
    const result = await pool.request().input("UsuarioId", sql.Int, userId)
      .query("SELECT Rol, Estado FROM dbo.Usuarios WHERE Id=@UsuarioId");
    const current = result.recordset?.[0];
    if (!current || current.Estado !== "ACTIVO" ||
        current.Rol !== tokenRole || !rolesPermitidos.includes(current.Rol)) {
      return res.status(403).json({ mensaje: "La sesión ya no tiene permisos vigentes" });
    }
    req.usuario.rol = current.Rol;
    return next();
  } catch (error) {
    console.error("Error verificando rol vigente en SQL Server:", error);
    return res.status(503).json({ mensaje: "No fue posible validar los permisos de la sesión" });
  }
};

const autorizar = (...rolesPermitidos) => createRoleGuard(rolesPermitidos);

module.exports = { autenticar, autorizar, createRoleGuard };
