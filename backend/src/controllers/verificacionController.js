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
  } catch (error) {
    console.error("Error al crear solicitud de verificación:", error);
    return res.status(500).json({ mensaje: "Error al crear solicitud de verificación" });
  }
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

const listarVinculacionesActivas = async (_req, res) => {
  try {
    const pool = await poolPromise;
    const resultado = await pool.request().query(`
      SELECT
        TU.Id,
        TU.UsuarioId,
        TU.ActorId,
        TU.FechaVerificacion,
        U.Nombre AS UsuarioNombre,
        U.Email,
        A.NombreCompleto,
        A.NombreArtistico,
        A.Profesion,
        A.Foto
      FROM dbo.TalentosUsuarios TU
      INNER JOIN dbo.Usuarios U ON U.Id = TU.UsuarioId
      INNER JOIN dbo.Actores A ON A.Id = TU.ActorId
      WHERE TU.Estado = N'ACTIVO'
      ORDER BY TU.FechaVerificacion DESC
    `);
    return res.json(resultado.recordset);
  } catch (error) {
    console.error("Error al listar vinculaciones activas:", error);
    return res.status(500).json({ mensaje: "Error al cargar talentos verificados" });
  }
};

const revisarSolicitud = async (req, res) => {
  const solicitudId = Number(req.params.id);
  const { decision, observaciones } = req.body;
  if (!Number.isInteger(solicitudId) || !["APROBAR", "RECHAZAR"].includes(decision)) return res.status(400).json({ mensaje: "Decisión inválida" });
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);
  try {
    await transaction.begin();
    const consulta = await new sql.Request(transaction).input("Id", sql.Int, solicitudId).query("SELECT * FROM dbo.SolicitudesVerificacion WHERE Id = @Id AND Estado = N'PENDIENTE'");
    const solicitud = consulta.recordset[0];
    if (!solicitud) {
      await transaction.rollback();
      return res.status(404).json({ mensaje: "Solicitud pendiente no encontrada" });
    }

    const estado = decision === "APROBAR" ? "APROBADA" : "RECHAZADA";
    await new sql.Request(transaction)
      .input("Id", sql.Int, solicitudId)
      .input("Estado", sql.NVarChar(20), estado)
      .input("Revisor", sql.Int, req.usuario.id)
      .input("Observaciones", sql.NVarChar(1000), observaciones?.trim() || null)
      .query(`UPDATE dbo.SolicitudesVerificacion SET Estado=@Estado, FechaRevision=SYSUTCDATETIME(), RevisadoPorUsuarioId=@Revisor, Observaciones=@Observaciones WHERE Id=@Id`);

    if (decision === "APROBAR") {
      const vinculacionExistente = await new sql.Request(transaction)
        .input("UsuarioId", sql.Int, solicitud.UsuarioId)
        .input("ActorId", sql.Int, solicitud.ActorId)
        .query(`SELECT Id, UsuarioId, ActorId, Estado FROM dbo.TalentosUsuarios WHERE UsuarioId=@UsuarioId OR ActorId=@ActorId`);

      const conflicto = vinculacionExistente.recordset.find((v) => v.Estado === "ACTIVO" && (v.UsuarioId !== solicitud.UsuarioId || v.ActorId !== solicitud.ActorId));
      if (conflicto) {
        await transaction.rollback();
        return res.status(409).json({ mensaje: "El usuario o el talento ya tiene una vinculación activa diferente" });
      }

      const mismaVinculacion = vinculacionExistente.recordset.find((v) => v.UsuarioId === solicitud.UsuarioId && v.ActorId === solicitud.ActorId);
      if (mismaVinculacion) {
        await new sql.Request(transaction)
          .input("Id", sql.Int, mismaVinculacion.Id)
          .input("Revisor", sql.Int, req.usuario.id)
          .query(`UPDATE dbo.TalentosUsuarios SET Estado=N'ACTIVO', FechaVerificacion=SYSUTCDATETIME(), VerificadoPorUsuarioId=@Revisor WHERE Id=@Id`);
      } else {
        await new sql.Request(transaction)
          .input("UsuarioId", sql.Int, solicitud.UsuarioId)
          .input("ActorId", sql.Int, solicitud.ActorId)
          .input("Revisor", sql.Int, req.usuario.id)
          .query(`INSERT INTO dbo.TalentosUsuarios (UsuarioId, ActorId, VerificadoPorUsuarioId) VALUES (@UsuarioId,@ActorId,@Revisor)`);
      }

      await new sql.Request(transaction)
        .input("UsuarioId", sql.Int, solicitud.UsuarioId)
        .query(`UPDATE dbo.Usuarios SET Rol=N'TALENTO_VERIFICADO' WHERE Id=@UsuarioId`);
    }

    await new sql.Request(transaction)
      .input("UsuarioId", sql.Int, req.usuario.id)
      .input("EntidadId", sql.NVarChar(80), String(solicitudId))
      .input("Detalle", sql.NVarChar(sql.MAX), JSON.stringify({ decision, observaciones: observaciones || null }))
      .query(`INSERT INTO dbo.AuditLogs (UsuarioId, Accion, Entidad, EntidadId, Detalle) VALUES (@UsuarioId,N'REVISAR_VERIFICACION',N'SolicitudVerificacion',@EntidadId,@Detalle)`);

    await transaction.commit();
    return res.json({ mensaje: decision === "APROBAR" ? "Talento verificado correctamente" : "Solicitud rechazada" });
  } catch (error) {
    if (transaction._aborted !== true) await transaction.rollback().catch(() => {});
    console.error("Error al revisar solicitud:", error);
    return res.status(500).json({ mensaje: "Error al revisar solicitud" });
  }
};

const revocarVinculacion = async (req, res) => {
  const vinculacionId = Number(req.params.id);
  const motivo = req.body?.motivo?.trim() || "Revocación administrativa";
  if (!Number.isInteger(vinculacionId) || vinculacionId <= 0) return res.status(400).json({ mensaje: "Vinculación inválida" });

  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);
  try {
    await transaction.begin();
    const consulta = await new sql.Request(transaction)
      .input("Id", sql.Int, vinculacionId)
      .query(`SELECT * FROM dbo.TalentosUsuarios WHERE Id=@Id AND Estado=N'ACTIVO'`);
    const vinculacion = consulta.recordset[0];
    if (!vinculacion) {
      await transaction.rollback();
      return res.status(404).json({ mensaje: "Vinculación activa no encontrada" });
    }

    await new sql.Request(transaction)
      .input("Id", sql.Int, vinculacionId)
      .query(`UPDATE dbo.TalentosUsuarios SET Estado=N'REVOCADO' WHERE Id=@Id`);

    await new sql.Request(transaction)
      .input("UsuarioId", sql.Int, vinculacion.UsuarioId)
      .query(`UPDATE dbo.Usuarios SET Rol=N'USUARIO' WHERE Id=@UsuarioId AND Rol=N'TALENTO_VERIFICADO'`);

    await new sql.Request(transaction)
      .input("UsuarioId", sql.Int, vinculacion.UsuarioId)
      .input("ActorId", sql.Int, vinculacion.ActorId)
      .input("Revisor", sql.Int, req.usuario.id)
      .input("Motivo", sql.NVarChar(1000), motivo)
      .query(`
        UPDATE dbo.SolicitudesVerificacion
        SET Estado=N'REVOCADA', FechaRevision=SYSUTCDATETIME(), RevisadoPorUsuarioId=@Revisor, Observaciones=@Motivo
        WHERE Id = (
          SELECT TOP 1 Id FROM dbo.SolicitudesVerificacion
          WHERE UsuarioId=@UsuarioId AND ActorId=@ActorId AND Estado=N'APROBADA'
          ORDER BY FechaRevision DESC, Id DESC
        )
      `);

    await new sql.Request(transaction)
      .input("UsuarioId", sql.Int, req.usuario.id)
      .input("EntidadId", sql.NVarChar(80), String(vinculacionId))
      .input("Detalle", sql.NVarChar(sql.MAX), JSON.stringify({ usuarioId: vinculacion.UsuarioId, actorId: vinculacion.ActorId, motivo }))
      .query(`INSERT INTO dbo.AuditLogs (UsuarioId, Accion, Entidad, EntidadId, Detalle) VALUES (@UsuarioId,N'REVOCAR_VERIFICACION',N'TalentoUsuario',@EntidadId,@Detalle)`);

    await transaction.commit();
    return res.json({ mensaje: "Vinculación revocada correctamente" });
  } catch (error) {
    if (transaction._aborted !== true) await transaction.rollback().catch(() => {});
    console.error("Error al revocar vinculación:", error);
    return res.status(500).json({ mensaje: "Error al revocar la vinculación" });
  }
};

module.exports = {
  crearSolicitud,
  misSolicitudes,
  miPerfilTalento,
  listarPendientes,
  listarVinculacionesActivas,
  revisarSolicitud,
  revocarVinculacion,
};