const { sql, poolPromise } = require("../config/db");

const PLANES = new Set(["FREE", "PRO"]);
const ESTADOS = new Set(["INACTIVA", "ACTIVA", "SUSPENDIDA", "CANCELADA"]);

const limpiar = (valor, max = 500) => {
  const texto = String(valor || "").trim();
  return texto ? texto.slice(0, max) : null;
};

const normalizarUrl = (valor) => {
  const texto = limpiar(valor);
  if (!texto) return null;
  try {
    const url = new URL(texto);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
};

const obtenerActorDelUsuario = async (pool, usuarioId) => {
  const r = await pool.request().input("UsuarioId", sql.Int, usuarioId).query(`
    SELECT TOP 1 TU.ActorId
    FROM dbo.TalentosUsuarios TU
    WHERE TU.UsuarioId=@UsuarioId AND TU.Estado=N'ACTIVO'
  `);
  return r.recordset[0]?.ActorId || null;
};

const asegurarPerfil = async (pool, actorId) => {
  await pool.request().input("ActorId", sql.Int, actorId).query(`
    IF NOT EXISTS (SELECT 1 FROM dbo.TalentoProPerfiles WHERE ActorId=@ActorId)
      INSERT INTO dbo.TalentoProPerfiles(ActorId) VALUES(@ActorId);
  `);
};

const obtenerMiPerfilPro = async (req, res) => {
  try {
    const pool = await poolPromise;
    const actorId = await obtenerActorDelUsuario(pool, req.usuario.id);
    if (!actorId) return res.status(404).json({ mensaje: "No existe un perfil verificado vinculado" });
    await asegurarPerfil(pool, actorId);

    const r = await pool.request().input("ActorId", sql.Int, actorId).query(`
      SELECT TP.*, A.NombreCompleto, A.NombreArtistico, A.Profesion
      FROM dbo.TalentoProPerfiles TP
      INNER JOIN dbo.Actores A ON A.Id=TP.ActorId
      WHERE TP.ActorId=@ActorId
    `);
    return res.json(r.recordset[0]);
  } catch (error) {
    console.error("Error al cargar CineRD Pro:", error);
    return res.status(500).json({ mensaje: "No fue posible cargar CineRD Pro" });
  }
};

const actualizarMiPerfilPro = async (req, res) => {
  try {
    const pool = await poolPromise;
    const actorId = await obtenerActorDelUsuario(pool, req.usuario.id);
    if (!actorId) return res.status(404).json({ mensaje: "No existe un perfil verificado vinculado" });
    await asegurarPerfil(pool, actorId);

    const actual = await pool.request().input("ActorId", sql.Int, actorId)
      .query("SELECT PlanCodigo, EstadoSuscripcion FROM dbo.TalentoProPerfiles WHERE ActorId=@ActorId");
    const entitlement = actual.recordset[0];
    if (entitlement?.PlanCodigo !== "PRO" || entitlement?.EstadoSuscripcion !== "ACTIVA") {
      return res.status(403).json({ mensaje: "Estas funciones requieren una suscripción CineRD Pro activa" });
    }

    const reelUrl = normalizarUrl(req.body.ReelUrl);
    const portfolioUrl = normalizarUrl(req.body.PortfolioUrl);
    if (req.body.ReelUrl && !reelUrl) return res.status(400).json({ mensaje: "La URL del reel no es válida" });
    if (req.body.PortfolioUrl && !portfolioUrl) return res.status(400).json({ mensaje: "La URL del portfolio no es válida" });

    const r = await pool.request()
      .input("ActorId", sql.Int, actorId)
      .input("Titular", sql.NVarChar(180), limpiar(req.body.TitularProfesional, 180))
      .input("Bio", sql.NVarChar(3000), limpiar(req.body.BiografiaProfesional, 3000))
      .input("Ciudad", sql.NVarChar(120), limpiar(req.body.Ciudad, 120))
      .input("Pais", sql.NVarChar(120), limpiar(req.body.Pais, 120))
      .input("Casting", sql.Bit, req.body.DisponibleCasting === true || req.body.DisponibleCasting === "true")
      .input("EmailContacto", sql.NVarChar(255), limpiar(req.body.EmailContacto, 255))
      .input("TelefonoContacto", sql.NVarChar(50), limpiar(req.body.TelefonoContacto, 50))
      .input("NombreRepresentante", sql.NVarChar(180), limpiar(req.body.NombreRepresentante, 180))
      .input("EmailRepresentante", sql.NVarChar(255), limpiar(req.body.EmailRepresentante, 255))
      .input("TelefonoRepresentante", sql.NVarChar(50), limpiar(req.body.TelefonoRepresentante, 50))
      .input("ReelUrl", sql.NVarChar(500), reelUrl)
      .input("PortfolioUrl", sql.NVarChar(500), portfolioUrl)
      .query(`
        UPDATE dbo.TalentoProPerfiles SET
          TitularProfesional=@Titular,
          BiografiaProfesional=@Bio,
          Ciudad=@Ciudad,
          Pais=@Pais,
          DisponibleCasting=@Casting,
          EmailContacto=@EmailContacto,
          TelefonoContacto=@TelefonoContacto,
          NombreRepresentante=@NombreRepresentante,
          EmailRepresentante=@EmailRepresentante,
          TelefonoRepresentante=@TelefonoRepresentante,
          ReelUrl=@ReelUrl,
          PortfolioUrl=@PortfolioUrl,
          FechaActualizacion=SYSUTCDATETIME()
        OUTPUT INSERTED.*
        WHERE ActorId=@ActorId
      `);
    return res.json({ mensaje: "Perfil CineRD Pro actualizado", perfil: r.recordset[0] });
  } catch (error) {
    console.error("Error al actualizar CineRD Pro:", error);
    return res.status(500).json({ mensaje: "No fue posible actualizar CineRD Pro" });
  }
};

const obtenerPerfilProPublico = async (req, res) => {
  try {
    const actorId = Number(req.params.actorId);
    if (!Number.isInteger(actorId) || actorId <= 0) return res.status(400).json({ mensaje: "Talento no válido" });
    const pool = await poolPromise;
    const r = await pool.request().input("ActorId", sql.Int, actorId).query(`
      SELECT TP.ActorId, TP.TitularProfesional, TP.BiografiaProfesional, TP.Ciudad, TP.Pais,
             TP.DisponibleCasting, TP.EmailContacto, TP.TelefonoContacto,
             TP.NombreRepresentante, TP.EmailRepresentante, TP.TelefonoRepresentante,
             TP.ReelUrl, TP.PortfolioUrl
      FROM dbo.TalentoProPerfiles TP
      INNER JOIN dbo.TalentosUsuarios TU ON TU.ActorId=TP.ActorId AND TU.Estado=N'ACTIVO'
      WHERE TP.ActorId=@ActorId AND TP.PlanCodigo=N'PRO' AND TP.EstadoSuscripcion=N'ACTIVA'
    `);
    if (!r.recordset.length) return res.status(404).json({ mensaje: "Este talento no tiene un perfil CineRD Pro público activo" });
    return res.json(r.recordset[0]);
  } catch (error) {
    console.error("Error al cargar perfil Pro público:", error);
    return res.status(500).json({ mensaje: "No fue posible cargar el perfil CineRD Pro" });
  }
};

const cambiarEntitlementAdmin = async (req, res) => {
  try {
    const actorId = Number(req.params.actorId);
    const plan = String(req.body.PlanCodigo || "").trim().toUpperCase();
    const estado = String(req.body.EstadoSuscripcion || "").trim().toUpperCase();
    if (!Number.isInteger(actorId) || actorId <= 0 || !PLANES.has(plan) || !ESTADOS.has(estado)) {
      return res.status(400).json({ mensaje: "Plan o estado no válido" });
    }

    const pool = await poolPromise;
    const actor = await pool.request().input("ActorId", sql.Int, actorId)
      .query("SELECT Id FROM dbo.Actores WHERE Id=@ActorId");
    if (!actor.recordset.length) return res.status(404).json({ mensaje: "Talento no encontrado" });

    await asegurarPerfil(pool, actorId);
    const r = await pool.request()
      .input("ActorId", sql.Int, actorId)
      .input("Plan", sql.NVarChar(20), plan)
      .input("Estado", sql.NVarChar(20), estado)
      .query(`
        UPDATE dbo.TalentoProPerfiles
        SET PlanCodigo=@Plan, EstadoSuscripcion=@Estado, FechaActualizacion=SYSUTCDATETIME()
        OUTPUT INSERTED.*
        WHERE ActorId=@ActorId
      `);

    await pool.request()
      .input("UsuarioId", sql.Int, req.usuario.id)
      .input("EntidadId", sql.NVarChar(80), String(actorId))
      .input("Detalle", sql.NVarChar(sql.MAX), JSON.stringify({ plan, estado }))
      .query(`INSERT INTO dbo.AuditLogs(UsuarioId,Accion,Entidad,EntidadId,Detalle)
              VALUES(@UsuarioId,N'CAMBIAR_PLAN_PRO',N'TalentoProPerfiles',@EntidadId,@Detalle)`);

    return res.json({ mensaje: "Entitlement CineRD Pro actualizado", perfil: r.recordset[0] });
  } catch (error) {
    console.error("Error al cambiar entitlement Pro:", error);
    return res.status(500).json({ mensaje: "No fue posible actualizar el entitlement CineRD Pro" });
  }
};

module.exports = {
  obtenerMiPerfilPro,
  actualizarMiPerfilPro,
  obtenerPerfilProPublico,
  cambiarEntitlementAdmin,
};
