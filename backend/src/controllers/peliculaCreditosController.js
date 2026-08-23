const { sql, poolPromise } = require("../config/db");

const TIPOS = new Set([
  "ACTOR",
  "DIRECTOR",
  "DIRECTOR_CASTING",
  "PRODUCTOR",
  "GUIONISTA",
  "COMPOSITOR",
  "FOTOGRAFIA",
  "EDICION",
  "OTRO",
]);

async function tablaDisponible(pool) {
  const r = await pool.request().query("SELECT CASE WHEN OBJECT_ID(N'dbo.PeliculaCreditos', N'U') IS NULL THEN 0 ELSE 1 END AS Existe");
  return Boolean(r.recordset[0]?.Existe);
}

async function obtenerColumnasVerificacion(pool) {
  const r = await pool.request().query("SELECT CASE WHEN COL_LENGTH(N'dbo.PeliculaCreditos', N'CreditoVerificado') IS NULL THEN 0 ELSE 1 END AS Existe");
  return Boolean(r.recordset[0]?.Existe)
    ? ", PC.CreditoVerificado, PC.FuenteCredito, PC.SolicitudCreditoId"
    : ", CAST(0 AS bit) AS CreditoVerificado, CAST(NULL AS nvarchar(40)) AS FuenteCredito, CAST(NULL AS int) AS SolicitudCreditoId";
}

const obtenerCreditosPelicula = async (req, res) => {
  try {
    const peliculaId = Number(req.params.id);
    if (!Number.isInteger(peliculaId) || peliculaId <= 0) return res.status(400).json({ mensaje: "Película no válida" });
    const pool = await poolPromise;
    if (!(await tablaDisponible(pool))) return res.json([]);
    const columnasVerificacion = await obtenerColumnasVerificacion(pool);

    const resultado = await pool.request().input("PeliculaId", sql.Int, peliculaId).query(`
      SELECT PC.Id, PC.PeliculaId, PC.ActorId, PC.TipoCredito, PC.Personaje, PC.Orden, PC.EsPrincipal, PC.Fuente
             ${columnasVerificacion},
             A.NombreCompleto, A.NombreArtistico, A.Profesion, A.Foto
      FROM dbo.PeliculaCreditos PC
      INNER JOIN dbo.Actores A ON A.Id = PC.ActorId
      WHERE PC.PeliculaId = @PeliculaId
      ORDER BY CASE PC.TipoCredito
                 WHEN N'DIRECTOR' THEN 1
                 WHEN N'ACTOR' THEN 2
                 WHEN N'DIRECTOR_CASTING' THEN 3
                 WHEN N'PRODUCTOR' THEN 4
                 WHEN N'GUIONISTA' THEN 5
                 ELSE 9
               END,
               COALESCE(PC.Orden, 9999), A.NombreCompleto
    `);
    res.json(resultado.recordset);
  } catch (error) {
    console.error("Error al obtener créditos:", error);
    res.status(500).json({ mensaje: "Error al obtener créditos profesionales", error: error.message });
  }
};

const obtenerCreditosActor = async (req, res) => {
  try {
    const actorId = Number(req.params.actorId);
    if (!Number.isInteger(actorId) || actorId <= 0) return res.status(400).json({ mensaje: "Talento no válido" });
    const pool = await poolPromise;
    if (!(await tablaDisponible(pool))) return res.json([]);
    const columnasVerificacion = await obtenerColumnasVerificacion(pool);
    const resultado = await pool.request().input("ActorId", sql.Int, actorId).query(`
      SELECT PC.Id, PC.PeliculaId AS Id, PC.ActorId, PC.TipoCredito, PC.Personaje, PC.Orden, PC.EsPrincipal, PC.Fuente
             ${columnasVerificacion},
             P.Titulo, P.Foto, P.Genero, P.FechaEstreno
      FROM dbo.PeliculaCreditos PC
      INNER JOIN dbo.Peliculas P ON P.Id = PC.PeliculaId
      WHERE PC.ActorId=@ActorId
      ORDER BY P.FechaEstreno DESC, P.Titulo ASC,
               CASE PC.TipoCredito WHEN N'DIRECTOR' THEN 1 WHEN N'DIRECTOR_CASTING' THEN 2 ELSE 9 END,
               COALESCE(PC.Orden, 9999)
    `);
    return res.json(resultado.recordset);
  } catch (error) {
    console.error("Error al obtener créditos del talento:", error);
    return res.status(500).json({ mensaje: "Error al obtener créditos del talento", error: error.message });
  }
};

const guardarCreditoPelicula = async (req, res) => {
  try {
    const peliculaId = Number(req.params.id);
    const actorId = Number(req.body.ActorId);
    const tipo = String(req.body.TipoCredito || "").trim().toUpperCase();
    if (!Number.isInteger(peliculaId) || peliculaId <= 0 || !Number.isInteger(actorId) || actorId <= 0) return res.status(400).json({ mensaje: "Película o talento no válido" });
    if (!TIPOS.has(tipo)) return res.status(400).json({ mensaje: "Tipo de crédito no válido" });

    const pool = await poolPromise;
    if (!(await tablaDisponible(pool))) return res.status(409).json({ mensaje: "Ejecuta la migración 007_pelicula_creditos.sql antes de administrar créditos" });

    const existente = await pool.request()
      .input("PeliculaId", sql.Int, peliculaId)
      .input("ActorId", sql.Int, actorId)
      .input("TipoCredito", sql.NVarChar(40), tipo)
      .query("SELECT TOP 1 Id FROM dbo.PeliculaCreditos WHERE PeliculaId=@PeliculaId AND ActorId=@ActorId AND TipoCredito=@TipoCredito");

    const personaje = req.body.Personaje?.toString().trim() || null;
    const orden = Number.isFinite(Number(req.body.Orden)) ? Number(req.body.Orden) : null;
    const principal = req.body.EsPrincipal === true || req.body.EsPrincipal === "true";
    const fuente = req.body.Fuente?.toString().trim() || null;
    const creditoVerificado = req.body.CreditoVerificado === true || req.body.CreditoVerificado === "true";
    const fuenteCredito = req.body.FuenteCredito?.toString().trim() || null;

    let resultado;
    if (existente.recordset.length) {
      resultado = await pool.request().input("Id", sql.Int, existente.recordset[0].Id)
        .input("Personaje", sql.NVarChar(200), personaje).input("Orden", sql.Int, orden)
        .input("EsPrincipal", sql.Bit, principal).input("Fuente", sql.NVarChar(300), fuente)
        .input("CreditoVerificado", sql.Bit, creditoVerificado).input("FuenteCredito", sql.NVarChar(40), fuenteCredito)
        .query(`UPDATE dbo.PeliculaCreditos SET Personaje=@Personaje, Orden=@Orden, EsPrincipal=@EsPrincipal, Fuente=@Fuente, CreditoVerificado=@CreditoVerificado, FuenteCredito=@FuenteCredito, FechaActualizacion=SYSUTCDATETIME() OUTPUT INSERTED.* WHERE Id=@Id`);
    } else {
      resultado = await pool.request().input("PeliculaId", sql.Int, peliculaId).input("ActorId", sql.Int, actorId)
        .input("TipoCredito", sql.NVarChar(40), tipo).input("Personaje", sql.NVarChar(200), personaje).input("Orden", sql.Int, orden)
        .input("EsPrincipal", sql.Bit, principal).input("Fuente", sql.NVarChar(300), fuente)
        .input("CreditoVerificado", sql.Bit, creditoVerificado).input("FuenteCredito", sql.NVarChar(40), fuenteCredito)
        .query(`INSERT INTO dbo.PeliculaCreditos(PeliculaId,ActorId,TipoCredito,Personaje,Orden,EsPrincipal,Fuente,CreditoVerificado,FuenteCredito) OUTPUT INSERTED.* VALUES(@PeliculaId,@ActorId,@TipoCredito,@Personaje,@Orden,@EsPrincipal,@Fuente,@CreditoVerificado,@FuenteCredito)`);
    }

    res.json({ mensaje: "Crédito guardado correctamente", credito: resultado.recordset[0] });
  } catch (error) {
    console.error("Error al guardar crédito:", error);
    res.status(500).json({ mensaje: "Error al guardar crédito profesional", error: error.message });
  }
};

const eliminarCreditoPelicula = async (req, res) => {
  try {
    const creditoId = Number(req.params.creditoId);
    if (!Number.isInteger(creditoId) || creditoId <= 0) return res.status(400).json({ mensaje: "Crédito no válido" });
    const pool = await poolPromise;
    if (!(await tablaDisponible(pool))) return res.status(404).json({ mensaje: "Crédito no encontrado" });
    await pool.request().input("Id", sql.Int, creditoId).query("DELETE FROM dbo.PeliculaCreditos WHERE Id=@Id");
    res.json({ mensaje: "Crédito eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar crédito:", error);
    res.status(500).json({ mensaje: "Error al eliminar crédito profesional", error: error.message });
  }
};

module.exports = { obtenerCreditosPelicula, obtenerCreditosActor, guardarCreditoPelicula, eliminarCreditoPelicula };
