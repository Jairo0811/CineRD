const jwt = require("jsonwebtoken");

/**
 * Verifica el JWT y revalida la cuenta contra SQL Server en CADA solicitud.
 * Esto impide que cuentas bloqueadas/eliminadas o con rol cambiado sigan
 * utilizando un access token emitido antes de la modificación.
 */
const createAuthGuard = (getDb = () => require("../config/db")) => async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.substring(7)
    : req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({ mensaje: "Autenticación requerida" });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch {
    return res.status(401).json({ mensaje: "Token inválido o expirado" });
  }

  const userId = Number(payload?.id);
  if (!Number.isSafeInteger(userId) || userId <= 0 || typeof payload?.rol !== "string" ||
      !Number.isSafeInteger(payload?.sv) || payload.sv < 1) {
    return res.status(401).json({ mensaje: "Token inválido o expirado" });
  }

  let current;
  try {
    const { sql, poolPromise } = getDb();
    const pool = await poolPromise;
    const result = await pool.request().input("UsuarioId", sql.Int, userId)
      .query("SELECT Rol, Estado, SesionVersion FROM dbo.Usuarios WHERE Id=@UsuarioId");
    current = result.recordset?.[0];
  } catch (error) {
    console.error("Error verificando sesión vigente en SQL Server:", error);
    return res.status(503).json({ mensaje: "No fue posible validar la sesión" });
  }

  if (!current || current.Estado !== "ACTIVO" || current.Rol !== payload.rol ||
      current.SesionVersion !== payload.sv) {
    return res.status(403).json({ mensaje: "La sesión ya no tiene permisos vigentes" });
  }

  req.usuario = { ...payload, id: userId, rol: current.Rol };
  return next();
};

const autenticar = createAuthGuard();

/**
 * Revalida en SQL el rol/estado de una sesión antes de acciones restringidas.
 * El guard de autenticación valida también las rutas sin restricción de rol;
 * este control adicional exige que el rol continúe autorizado.
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

module.exports = { autenticar, autorizar, createAuthGuard, createRoleGuard };
