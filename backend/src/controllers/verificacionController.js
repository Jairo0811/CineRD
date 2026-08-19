const crypto = require("crypto");
const { sql, poolPromise } = require("../config/db");

const METODOS = new Set(["RED_SOCIAL", "CORREO_PROFESIONAL", "REPRESENTANTE", "DOCUMENTACION_PROFESIONAL"]);
const generarCodigo = () => `CINERD-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

const crearSolicitud = async (req, res) => {
  try {
    const actorId = Number(req.params.actorId);
    const { metodo, evidenciaUrl, mensaje } = req.body;
    if (!Number.isInteger(actorId) || actorId <= 0 || !METODOS.has(metodo)) return res.status(400).json({ mensaje: "Datos de verificación inválidos" });
    const pool = await poolPromise;
    const actor = await pool.request().input("ActorId", sql.Int, actorId).query("SELECT Id, NombreCompleto, NombreArtistico FROM dbo.Actores WHERE Id = @ActorId");
    if (!actor.recordset.length) return res.status(404).json({ mensaje: "Talento no encontrado" });
    const vinculacion = await pool.request().input("ActorId", sql.Int, actorId).query("SELECT Id FROM dbo.TalentosUsuarios WHERE ActorId = @ActorId AND Estado = N'ACTIVO'");
    if (vinculacion.recordset.length) return res.status(409).json({ mensaje: "Este perfil ya fue verificado por otra cuenta" });
    const pendiente = await pool.request().input("UsuarioId", sql.Int, req.usuario.id).input("ActorId", sql.Int, actorId).query("SELECT Id FROM dbo.SolicitudesVerificacion WHERE UsuarioId = @UsuarioId AND ActorId = @ActorId AND Estado = N'PENDIENTE'");
    if (pendiente.recordset.length) return res.status(409).json({ mensaje: "Ya existe una solicitud pendiente para este perfil" });
    const codigo = metodo === "RED_SOCIAL" ? generarCodigo() : null;
    const resultado = await pool.request().input("UsuarioId", sql.Int, req.usuario.id).input("ActorId", sql.Int, actorId).input("Metodo", sql.NVarChar(40), metodo).input("EvidenciaUrl", sql.NVarChar(500), evidenciaUrl?.trim() || null).input("Codigo", sql.NVarChar(30), codigo).input("Mensaje", sql.NVarChar(1000), mensaje?.trim() || null).query(`INSERT INTO dbo.SolicitudesVerificacion (UsuarioId, ActorId, Metodo, EvidenciaUrl, CodigoVerificacion, Mensaje) OUTPUT INSERTED.* VALUES (@UsuarioId, @ActorId, @Metodo, @EvidenciaUrl, @Codigo, @Mensaje)`);
    return res.status(201).json({ mensaje: "Solicitud enviada para revisión", solicitud: resultado.recordset[0], instrucciones: codigo ? `Publica temporalmente el código ${codigo} en una cuenta oficial o profesional y deja su URL como evidencia.` : "El administrador revisará la evidencia profesional proporcionada." });
  } catch (error) { console.error("Error al crear solicitud de verificación:", error); return res.status(500).json({ mensaje: "Error al crear solicitud de verificación" }); }
};

const misSolicitudes = async (req, res) => {
  const pool = await poolPromise;
  const resultado = await pool.request().input("UsuarioId", sql.Int, req.usuario.id).query(`SELECT S.*, A.NombreCompleto, A.NombreArtistico FROM dbo.SolicitudesVerificacion S INNER JOIN dbo.Actores A ON A.Id = S.ActorId WHERE S.UsuarioId = @UsuarioId ORDER BY S.FechaSolicitud DESC`);
  return res.json(resultado.recordset);
};

const miPerfilTalento = async (req, res) => {
  try {
    const pool = await poolPromise;
    const resultado = await pool.request().input("UsuarioId", sql.Int, req.usuario.id).query(`
      SELECT A.*, TU.FechaVerificacion
      FROM dbo.TalentosUsuarios TU
      INNER JOIN dbo.Actores A ON A.Id = TU.ActorId
      WHERE TU.UsuarioId = @UsuarioId AND TU.Estado = N'ACTIVO'
    `);
    if (!resultado.recordset.length) return res.status(404).json({ mensaje: "No existe un perfil artístico activo vinculado a esta cuenta" });
    return res.json(resultado.recordset[0]);
  } catch (error) {
    console.error("Error al consultar perfil de talento:", error);
    return res.status(500).json({ mensaje: "Error al consultar perfil de talento" });
  }
};

const listarPendientes = async (_req, res) => {
  const pool = await poolPromise;
  const resultado = await pool.request().query(`SELECT S.*, U.Nombre AS UsuarioNombre, U.Email, A.NombreCompleto, A.NombreArtistico FROM dbo.SolicitudesVerificacion S INNER JOIN dbo.Usuarios U ON U.Id = S.UsuarioId INNER JOIN dbo.Actores A ON A.Id = S.ActorId WHERE S.Estado = N'PENDIENTE' ORDER BY S.FechaSolicitud ASC`);
  return res.json(resultado.recordset);
};

const revisarSolicitud = async (req, res) => {
  const solicitudId = Number(req.params.id); const { decision, observaciones } = req.body;
  if (!Number.isInteger(solicitudId) || !["APROBAR", "RECHAZAR"].includes(decision)) return res.status(400).json({ mensaje: "Decisión inválida" });
  const pool = await poolPromise; const transaction = new sql.Transaction(pool);
  try {
    await transaction.begin();
    const consulta = await new sql.Request(transaction).input("Id", sql.Int, solicitudId).query("SELECT * FROM dbo.SolicitudesVerificacion WHERE Id = @Id AND Estado = N'PENDIENTE'");
    const solicitud = consulta.recordset[0];
    if (!solicitud) { await transaction.rollback(); return res.status(404).json({ mensaje: "Solicitud pendiente no encontrada" }); }
    const estado = decision === "APROBAR" ? "APROBADA" : "RECHAZADA";
    await new sql.Request(transaction).input("Id",sql.Int,solicitudId).input("Estado",sql.NVarChar(20),estado).input("Revisor",sql.Int,req.usuario.id).input("Observaciones",sql.NVarChar(1000),observaciones?.trim()||null).query(`UPDATE dbo.SolicitudesVerificacion SET Estado=@Estado, FechaRevision=SYSUTCDATETIME(), RevisadoPorUsuarioId=@Revisor, Observaciones=@Observaciones WHERE Id=@Id`);
    if (decision === "APROBAR") await new sql.Request(transaction).input("UsuarioId",sql.Int,solicitud.UsuarioId).input("ActorId",sql.Int,solicitud.ActorId).input("Revisor",sql.Int,req.usuario.id).query(`INSERT INTO dbo.TalentosUsuarios (UsuarioId, ActorId, VerificadoPorUsuarioId) VALUES (@UsuarioId,@ActorId,@Revisor); UPDATE dbo.Usuarios SET Rol=N'TALENTO_VERIFICADO' WHERE Id=@UsuarioId;`);
    await new sql.Request(transaction).input("UsuarioId",sql.Int,req.usuario.id).input("EntidadId",sql.NVarChar(80),String(solicitudId)).input("Detalle",sql.NVarChar(sql.MAX),JSON.stringify({decision,observaciones:observaciones||null})).query(`INSERT INTO dbo.AuditLogs (UsuarioId, Accion, Entidad, EntidadId, Detalle) VALUES (@UsuarioId,N'REVISAR_VERIFICACION',N'SolicitudVerificacion',@EntidadId,@Detalle)`);
    await transaction.commit(); return res.json({ mensaje: decision === "APROBAR" ? "Talento verificado correctamente" : "Solicitud rechazada" });
  } catch (error) { if (transaction._aborted !== true) await transaction.rollback().catch(()=>{}); console.error("Error al revisar solicitud:",error); return res.status(500).json({ mensaje:"Error al revisar solicitud" }); }
};

module.exports = { crearSolicitud, misSolicitudes, miPerfilTalento, listarPendientes, revisarSolicitud };