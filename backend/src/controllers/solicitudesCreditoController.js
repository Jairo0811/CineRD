const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const { sql, poolPromise } = require("../config/db");

const TIPOS_CREDITO = new Set(["ACTOR", "DIRECTOR", "PRODUCTOR", "GUIONISTA", "COMPOSITOR", "FOTOGRAFIA", "EDICION", "OTRO"]);
const TIPOS_EVIDENCIA = new Set(["CAPTURA_ESCENA", "CLIP_REFERENCIA", "CREDITOS_OFICIALES", "CALL_SHEET", "CONTRATO", "BACKSTAGE", "PUBLICACION_OFICIAL", "PERFIL_PROFESIONAL", "OTRO"]);
const ESTADOS_REVISION = new Set(["EN_REVISION", "REQUIERE_MAS_EVIDENCIA", "APROBADO", "RECHAZADO"]);
const TIME_CODE = /^\d{2}:\d{2}:\d{2}$/;
const PRIVATE_DIR = path.resolve(process.cwd(), "private", "evidencias-creditos");

const tablaDisponible = async (pool) => {
  const r = await pool.request().query("SELECT CASE WHEN OBJECT_ID(N'dbo.SolicitudesCredito', N'U') IS NULL THEN 0 ELSE 1 END AS Existe");
  return Boolean(r.recordset[0]?.Existe);
};

const obtenerTalentoDelUsuario = async (pool, usuarioId) => {
  const r = await pool.request().input("UsuarioId", sql.Int, usuarioId).query(`
    SELECT TOP 1 TU.ActorId, A.NombreCompleto, A.NombreArtistico
    FROM dbo.TalentosUsuarios TU
    INNER JOIN dbo.Actores A ON A.Id = TU.ActorId
    WHERE TU.UsuarioId = @UsuarioId AND TU.Estado = N'ACTIVO'
  `);
  return r.recordset[0] || null;
};

const normalizarUrl = (valor) => {
  if (!valor?.trim()) return null;
  try {
    const url = new URL(valor.trim());
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
};

const guardarArchivoPrivado = async (archivo) => {
  if (!archivo) return null;
  await fs.mkdir(PRIVATE_DIR, { recursive: true });
  const ext = archivo.mimetype === "application/pdf" ? ".pdf" : archivo.mimetype === "image/png" ? ".png" : archivo.mimetype === "image/webp" ? ".webp" : ".jpg";
  const nombre = `${Date.now()}-${crypto.randomUUID()}${ext}`;
  const destino = path.join(PRIVATE_DIR, nombre);
  await fs.writeFile(destino, archivo.buffer);
  return nombre;
};

const crearSolicitud = async (req, res) => {
  let archivoGuardado = null;
  try {
    const peliculaId = Number(req.body.PeliculaId);
    const tipoParticipacion = String(req.body.TipoParticipacion || "").trim().toUpperCase();
    const tipoEvidencia = String(req.body.TipoEvidencia || "").trim().toUpperCase();
    const estaAcreditado = req.body.EstaAcreditado === true || req.body.EstaAcreditado === "true";
    const minutoInicio = req.body.MinutoInicio?.trim() || null;
    const minutoFin = req.body.MinutoFin?.trim() || null;
    const descripcionEscena = req.body.DescripcionEscena?.trim() || null;
    const personajeFuncion = req.body.PersonajeFuncion?.trim() || null;
    const descripcionEvidencia = req.body.DescripcionEvidencia?.trim() || null;
    const urlExternaRaw = req.body.UrlExterna?.trim() || null;
    const urlExterna = normalizarUrl(urlExternaRaw);

    if (!Number.isInteger(peliculaId) || peliculaId <= 0) return res.status(400).json({ mensaje: "Selecciona una película válida" });
    if (!TIPOS_CREDITO.has(tipoParticipacion)) return res.status(400).json({ mensaje: "Tipo de participación no válido" });
    if (!TIPOS_EVIDENCIA.has(tipoEvidencia)) return res.status(400).json({ mensaje: "Tipo de evidencia no válido" });
    if (urlExternaRaw && !urlExterna) return res.status(400).json({ mensaje: "La URL de evidencia no es válida" });
    if (!req.file && !urlExterna) return res.status(400).json({ mensaje: "Debes adjuntar una evidencia o indicar una URL verificable" });
    if (minutoInicio && !TIME_CODE.test(minutoInicio)) return res.status(400).json({ mensaje: "El minuto inicial debe usar HH:MM:SS" });
    if (minutoFin && !TIME_CODE.test(minutoFin)) return res.status(400).json({ mensaje: "El minuto final debe usar HH:MM:SS" });
    if (!estaAcreditado && (!minutoInicio || !descripcionEscena)) return res.status(400).json({ mensaje: "Si no apareces en créditos oficiales, indica el minuto y describe la escena" });

    const pool = await poolPromise;
    if (!(await tablaDisponible(pool))) return res.status(409).json({ mensaje: "Ejecuta la migración 008_solicitudes_creditos.sql" });

    const talento = await obtenerTalentoDelUsuario(pool, req.usuario.id);
    if (!talento) return res.status(403).json({ mensaje: "Solo un talento verificado y vinculado puede reclamar créditos para sí mismo" });

    const pelicula = await pool.request().input("Id", sql.Int, peliculaId).query("SELECT Id, Titulo FROM dbo.Peliculas WHERE Id=@Id");
    if (!pelicula.recordset.length) return res.status(404).json({ mensaje: "Película no encontrada" });

    const duplicada = await pool.request()
      .input("ActorId", sql.Int, talento.ActorId)
      .input("PeliculaId", sql.Int, peliculaId)
      .input("Tipo", sql.NVarChar(40), tipoParticipacion)
      .query(`SELECT TOP 1 Id, Estado FROM dbo.SolicitudesCredito
              WHERE ActorId=@ActorId AND PeliculaId=@PeliculaId AND TipoParticipacion=@Tipo
                AND Estado IN (N'PENDIENTE',N'EN_REVISION',N'REQUIERE_MAS_EVIDENCIA')`);
    if (duplicada.recordset.length) return res.status(409).json({ mensaje: "Ya existe una reclamación activa para esta película y tipo de participación" });

    archivoGuardado = await guardarArchivoPrivado(req.file);

    const tx = new sql.Transaction(pool);
    await tx.begin();
    try {
      const solicitud = await new sql.Request(tx)
        .input("UsuarioId", sql.Int, req.usuario.id)
        .input("ActorId", sql.Int, talento.ActorId)
        .input("PeliculaId", sql.Int, peliculaId)
        .input("Tipo", sql.NVarChar(40), tipoParticipacion)
        .input("Personaje", sql.NVarChar(200), personajeFuncion)
        .input("Acreditado", sql.Bit, estaAcreditado)
        .input("MinutoInicio", sql.NVarChar(8), minutoInicio)
        .input("MinutoFin", sql.NVarChar(8), minutoFin)
        .input("Descripcion", sql.NVarChar(1500), descripcionEscena)
        .query(`INSERT INTO dbo.SolicitudesCredito(UsuarioId,ActorId,PeliculaId,TipoParticipacion,PersonajeFuncion,EstaAcreditado,MinutoInicio,MinutoFin,DescripcionEscena)
                OUTPUT INSERTED.* VALUES(@UsuarioId,@ActorId,@PeliculaId,@Tipo,@Personaje,@Acreditado,@MinutoInicio,@MinutoFin,@Descripcion)`);

      const solicitudId = solicitud.recordset[0].Id;
      await new sql.Request(tx)
        .input("SolicitudId", sql.Int, solicitudId)
        .input("TipoEvidencia", sql.NVarChar(40), tipoEvidencia)
        .input("Archivo", sql.NVarChar(500), archivoGuardado)
        .input("Url", sql.NVarChar(1000), urlExterna)
        .input("NombreOriginal", sql.NVarChar(255), req.file?.originalname || null)
        .input("MimeType", sql.NVarChar(100), req.file?.mimetype || null)
        .input("Descripcion", sql.NVarChar(1000), descripcionEvidencia)
        .query(`INSERT INTO dbo.SolicitudCreditoEvidencias(SolicitudCreditoId,TipoEvidencia,ArchivoPrivado,UrlExterna,NombreOriginal,MimeType,Descripcion)
                VALUES(@SolicitudId,@TipoEvidencia,@Archivo,@Url,@NombreOriginal,@MimeType,@Descripcion)`);

      await new sql.Request(tx)
        .input("UsuarioId", sql.Int, req.usuario.id)
        .input("EntidadId", sql.NVarChar(80), String(solicitudId))
        .input("Detalle", sql.NVarChar(sql.MAX), JSON.stringify({ peliculaId, actorId: talento.ActorId, tipoParticipacion }))
        .input("Ip", sql.NVarChar(64), req.ip || null)
        .query(`INSERT INTO dbo.AuditLogs(UsuarioId,Accion,Entidad,EntidadId,Detalle,Ip)
                VALUES(@UsuarioId,N'RECLAMAR_CREDITO',N'SolicitudesCredito',@EntidadId,@Detalle,@Ip)`);
      await tx.commit();
      return res.status(201).json({ mensaje: "Reclamación enviada para revisión", solicitud: solicitud.recordset[0] });
    } catch (error) {
      await tx.rollback();
      throw error;
    }
  } catch (error) {
    if (archivoGuardado) await fs.unlink(path.join(PRIVATE_DIR, archivoGuardado)).catch(() => {});
    console.error("Error al crear reclamación de crédito:", error);
    return res.status(500).json({ mensaje: "No fue posible registrar la reclamación" });
  }
};

const obtenerMisSolicitudes = async (req, res) => {
  try {
    const pool = await poolPromise;
    if (!(await tablaDisponible(pool))) return res.json([]);
    const resultado = await pool.request().input("UsuarioId", sql.Int, req.usuario.id).query(`
      SELECT SC.Id, SC.PeliculaId, P.Titulo, P.Foto, SC.TipoParticipacion, SC.PersonajeFuncion,
             SC.EstaAcreditado, SC.MinutoInicio, SC.MinutoFin, SC.DescripcionEscena, SC.Estado,
             SC.ComentarioAdmin, SC.FechaSolicitud, SC.FechaRevision
      FROM dbo.SolicitudesCredito SC
      INNER JOIN dbo.Peliculas P ON P.Id=SC.PeliculaId
      WHERE SC.UsuarioId=@UsuarioId
      ORDER BY SC.FechaSolicitud DESC
    `);
    return res.json(resultado.recordset);
  } catch (error) {
    console.error("Error al obtener reclamaciones:", error);
    return res.status(500).json({ mensaje: "No fue posible cargar tus reclamaciones" });
  }
};

const obtenerSolicitudesAdmin = async (req, res) => {
  try {
    const pool = await poolPromise;
    if (!(await tablaDisponible(pool))) return res.json([]);
    const estado = req.query.estado?.trim().toUpperCase() || null;
    const resultado = await pool.request().input("Estado", sql.NVarChar(30), estado).query(`
      SELECT SC.*, P.Titulo, P.Foto, A.NombreCompleto, A.NombreArtistico,
             U.Nombre AS UsuarioNombre, U.Email AS UsuarioEmail,
             E.Id AS EvidenciaId, E.TipoEvidencia, E.UrlExterna, E.NombreOriginal, E.MimeType, E.Descripcion AS EvidenciaDescripcion,
             CASE WHEN E.ArchivoPrivado IS NULL THEN 0 ELSE 1 END AS TieneArchivoPrivado
      FROM dbo.SolicitudesCredito SC
      INNER JOIN dbo.Peliculas P ON P.Id=SC.PeliculaId
      INNER JOIN dbo.Actores A ON A.Id=SC.ActorId
      INNER JOIN dbo.Usuarios U ON U.Id=SC.UsuarioId
      LEFT JOIN dbo.SolicitudCreditoEvidencias E ON E.SolicitudCreditoId=SC.Id
      WHERE @Estado IS NULL OR SC.Estado=@Estado
      ORDER BY CASE SC.Estado WHEN N'PENDIENTE' THEN 1 WHEN N'EN_REVISION' THEN 2 WHEN N'REQUIERE_MAS_EVIDENCIA' THEN 3 ELSE 9 END, SC.FechaSolicitud DESC
    `);
    return res.json(resultado.recordset);
  } catch (error) {
    console.error("Error al obtener reclamaciones administrativas:", error);
    return res.status(500).json({ mensaje: "No fue posible cargar las reclamaciones" });
  }
};

const descargarEvidencia = async (req, res) => {
  try {
    const evidenciaId = Number(req.params.evidenciaId);
    if (!Number.isInteger(evidenciaId) || evidenciaId <= 0) return res.status(400).json({ mensaje: "Evidencia no válida" });
    const pool = await poolPromise;
    const resultado = await pool.request().input("Id", sql.Int, evidenciaId).query(`
      SELECT E.ArchivoPrivado, E.NombreOriginal, E.MimeType, SC.UsuarioId
      FROM dbo.SolicitudCreditoEvidencias E
      INNER JOIN dbo.SolicitudesCredito SC ON SC.Id=E.SolicitudCreditoId
      WHERE E.Id=@Id
    `);
    const evidencia = resultado.recordset[0];
    if (!evidencia?.ArchivoPrivado) return res.status(404).json({ mensaje: "Archivo de evidencia no encontrado" });
    const esAdmin = req.usuario.rol === "ADMINISTRADOR";
    if (!esAdmin && evidencia.UsuarioId !== req.usuario.id) return res.status(403).json({ mensaje: "No tienes acceso a esta evidencia" });
    const archivo = path.join(PRIVATE_DIR, path.basename(evidencia.ArchivoPrivado));
    res.type(evidencia.MimeType || "application/octet-stream");
    return res.download(archivo, evidencia.NombreOriginal || path.basename(archivo));
  } catch (error) {
    console.error("Error al descargar evidencia:", error);
    return res.status(500).json({ mensaje: "No fue posible descargar la evidencia" });
  }
};

const revisarSolicitud = async (req, res) => {
  const solicitudId = Number(req.params.id);
  const estado = String(req.body.Estado || "").trim().toUpperCase();
  const comentario = req.body.ComentarioAdmin?.trim() || null;
  if (!Number.isInteger(solicitudId) || solicitudId <= 0) return res.status(400).json({ mensaje: "Solicitud no válida" });
  if (!ESTADOS_REVISION.has(estado)) return res.status(400).json({ mensaje: "Estado de revisión no válido" });
  if (["REQUIERE_MAS_EVIDENCIA", "RECHAZADO"].includes(estado) && !comentario) return res.status(400).json({ mensaje: "Indica el motivo o la evidencia adicional requerida" });

  const pool = await poolPromise;
  const tx = new sql.Transaction(pool);
  try {
    await tx.begin();
    const solicitudR = await new sql.Request(tx).input("Id", sql.Int, solicitudId).query("SELECT * FROM dbo.SolicitudesCredito WHERE Id=@Id");
    const solicitud = solicitudR.recordset[0];
    if (!solicitud) { await tx.rollback(); return res.status(404).json({ mensaje: "Solicitud no encontrada" }); }
    if (["APROBADO", "RECHAZADO"].includes(solicitud.Estado)) { await tx.rollback(); return res.status(409).json({ mensaje: "La solicitud ya tiene una decisión final" }); }

    if (estado === "APROBADO") {
      const existente = await new sql.Request(tx)
        .input("PeliculaId", sql.Int, solicitud.PeliculaId)
        .input("ActorId", sql.Int, solicitud.ActorId)
        .input("Tipo", sql.NVarChar(40), solicitud.TipoParticipacion)
        .query("SELECT TOP 1 Id FROM dbo.PeliculaCreditos WHERE PeliculaId=@PeliculaId AND ActorId=@ActorId AND TipoCredito=@Tipo");

      if (existente.recordset.length) {
        await new sql.Request(tx)
          .input("Id", sql.Int, existente.recordset[0].Id)
          .input("Personaje", sql.NVarChar(200), solicitud.PersonajeFuncion)
          .input("SolicitudId", sql.Int, solicitudId)
          .query(`UPDATE dbo.PeliculaCreditos
                  SET Personaje=COALESCE(@Personaje,Personaje), CreditoVerificado=1,
                      FuenteCredito=N'RECLAMACION_TALENTO', SolicitudCreditoId=@SolicitudId, FechaActualizacion=SYSUTCDATETIME()
                  WHERE Id=@Id`);
      } else {
        await new sql.Request(tx)
          .input("PeliculaId", sql.Int, solicitud.PeliculaId)
          .input("ActorId", sql.Int, solicitud.ActorId)
          .input("Tipo", sql.NVarChar(40), solicitud.TipoParticipacion)
          .input("Personaje", sql.NVarChar(200), solicitud.PersonajeFuncion)
          .input("Fuente", sql.NVarChar(300), solicitud.EstaAcreditado ? "Crédito oficial verificado por evidencia" : "Participación verificada por CineRD")
          .input("SolicitudId", sql.Int, solicitudId)
          .query(`INSERT INTO dbo.PeliculaCreditos(PeliculaId,ActorId,TipoCredito,Personaje,EsPrincipal,Fuente,CreditoVerificado,FuenteCredito,SolicitudCreditoId)
                  VALUES(@PeliculaId,@ActorId,@Tipo,@Personaje,0,@Fuente,1,N'RECLAMACION_TALENTO',@SolicitudId)`);
      }
    }

    await new sql.Request(tx)
      .input("Id", sql.Int, solicitudId)
      .input("Estado", sql.NVarChar(30), estado)
      .input("Comentario", sql.NVarChar(1500), comentario)
      .input("Revisor", sql.Int, req.usuario.id)
      .query(`UPDATE dbo.SolicitudesCredito SET Estado=@Estado, ComentarioAdmin=@Comentario,
              FechaRevision=SYSUTCDATETIME(), RevisadoPorUsuarioId=@Revisor WHERE Id=@Id`);

    await new sql.Request(tx)
      .input("UsuarioId", sql.Int, req.usuario.id)
      .input("EntidadId", sql.NVarChar(80), String(solicitudId))
      .input("Detalle", sql.NVarChar(sql.MAX), JSON.stringify({ estado, comentario }))
      .input("Ip", sql.NVarChar(64), req.ip || null)
      .query(`INSERT INTO dbo.AuditLogs(UsuarioId,Accion,Entidad,EntidadId,Detalle,Ip)
              VALUES(@UsuarioId,N'REVISAR_CREDITO',N'SolicitudesCredito',@EntidadId,@Detalle,@Ip)`);

    await tx.commit();
    return res.json({ mensaje: estado === "APROBADO" ? "Crédito aprobado y registrado" : "Solicitud actualizada correctamente" });
  } catch (error) {
    await tx.rollback().catch(() => {});
    console.error("Error al revisar reclamación:", error);
    return res.status(500).json({ mensaje: "No fue posible revisar la reclamación" });
  }
};

module.exports = { crearSolicitud, obtenerMisSolicitudes, obtenerSolicitudesAdmin, descargarEvidencia, revisarSolicitud };
