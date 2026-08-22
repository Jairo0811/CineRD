const fs = require("fs");
const path = require("path");
const { poolPromise, sql } = require("../config/db");

const TIPOS_PERMITIDOS = new Set([
  "FOTO_RODAJE",
  "POSTER_ALTERNATIVO",
  "BACKDROP",
  "PROMOCIONAL",
  "PRENSA",
  "EVENTO",
  "OTRO",
]);

const limpiar = (valor) => (typeof valor === "string" ? valor.trim() : valor);
const enteroOpcional = (valor) => (valor === "" || valor == null ? null : Number(valor));
const booleano = (valor) => valor === true || valor === "true" || valor === "1" || valor === 1;

const validarEntidad = ({ PeliculaId, ActorId }) => Boolean(PeliculaId) !== Boolean(ActorId);

const borrarArchivoGaleria = (archivo) => {
  if (!archivo || !archivo.startsWith("/uploads/galerias/")) return;

  const nombre = path.basename(archivo);
  const ruta = path.join(process.cwd(), "uploads", "galerias", nombre);

  try {
    if (fs.existsSync(ruta)) fs.unlinkSync(ruta);
  } catch (error) {
    console.warn("No se pudo eliminar archivo de galería:", ruta, error.message);
  }
};

const consultaBase = `
  SELECT
    G.Id,
    G.PeliculaId,
    P.Titulo AS Pelicula,
    G.ActorId,
    COALESCE(A.NombreArtistico, A.NombreCompleto) AS Talento,
    G.Tipo,
    G.Titulo,
    G.Descripcion,
    G.Archivo,
    G.FuenteUrl,
    G.Orden,
    G.EsDestacada,
    G.FechaCreacion,
    G.FechaActualizacion
  FROM GaleriaMultimedia G
  LEFT JOIN Peliculas P ON P.Id = G.PeliculaId
  LEFT JOIN Actores A ON A.Id = G.ActorId
`;

const obtenerGaleria = async (req, res) => {
  try {
    const pool = await poolPromise;
    const request = pool.request();
    const filtros = [];

    if (req.query.peliculaId) {
      request.input("PeliculaId", sql.Int, Number(req.query.peliculaId));
      filtros.push("G.PeliculaId = @PeliculaId");
    }
    if (req.query.actorId) {
      request.input("ActorId", sql.Int, Number(req.query.actorId));
      filtros.push("G.ActorId = @ActorId");
    }
    if (req.query.tipo) {
      const tipo = String(req.query.tipo).toUpperCase();
      request.input("Tipo", sql.NVarChar(40), tipo);
      filtros.push("G.Tipo = @Tipo");
    }

    const where = filtros.length ? ` WHERE ${filtros.join(" AND ")}` : "";
    const result = await request.query(
      `${consultaBase}${where} ORDER BY G.EsDestacada DESC, COALESCE(G.Orden, 2147483647), G.FechaCreacion DESC;`,
    );

    res.json(result.recordset);
  } catch (error) {
    console.error("Error al obtener galería:", error);
    res.status(500).json({ mensaje: "No fue posible obtener la galería multimedia" });
  }
};

const crearElementoGaleria = async (req, res) => {
  const PeliculaId = enteroOpcional(req.body.PeliculaId);
  const ActorId = enteroOpcional(req.body.ActorId);
  const Tipo = String(req.body.Tipo || "PROMOCIONAL").toUpperCase();

  if (!req.file?.filename) {
    return res.status(400).json({ mensaje: "La imagen es obligatoria" });
  }
  if (!validarEntidad({ PeliculaId, ActorId })) {
    borrarArchivoGaleria(`/uploads/galerias/${req.file.filename}`);
    return res.status(400).json({ mensaje: "La imagen debe pertenecer a una película o a un talento, pero no a ambos" });
  }
  if (!TIPOS_PERMITIDOS.has(Tipo)) {
    borrarArchivoGaleria(`/uploads/galerias/${req.file.filename}`);
    return res.status(400).json({ mensaje: "Tipo de imagen inválido" });
  }

  const Archivo = `/uploads/galerias/${req.file.filename}`;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("PeliculaId", sql.Int, PeliculaId)
      .input("ActorId", sql.Int, ActorId)
      .input("Tipo", sql.NVarChar(40), Tipo)
      .input("Titulo", sql.NVarChar(180), limpiar(req.body.Titulo) || null)
      .input("Descripcion", sql.NVarChar(700), limpiar(req.body.Descripcion) || null)
      .input("Archivo", sql.NVarChar(300), Archivo)
      .input("FuenteUrl", sql.NVarChar(500), limpiar(req.body.FuenteUrl) || null)
      .input("Orden", sql.Int, enteroOpcional(req.body.Orden))
      .input("EsDestacada", sql.Bit, booleano(req.body.EsDestacada))
      .query(`
        INSERT INTO GaleriaMultimedia
          (PeliculaId, ActorId, Tipo, Titulo, Descripcion, Archivo, FuenteUrl, Orden, EsDestacada)
        OUTPUT INSERTED.*
        VALUES
          (@PeliculaId, @ActorId, @Tipo, @Titulo, @Descripcion, @Archivo, @FuenteUrl, @Orden, @EsDestacada);
      `);

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    borrarArchivoGaleria(Archivo);
    if (error.number === 547) {
      return res.status(400).json({ mensaje: "La película o talento seleccionado no existe" });
    }
    console.error("Error al crear elemento de galería:", error);
    res.status(500).json({ mensaje: "No fue posible guardar la imagen" });
  }
};

const actualizarElementoGaleria = async (req, res) => {
  const Id = Number(req.params.id);
  const PeliculaId = enteroOpcional(req.body.PeliculaId);
  const ActorId = enteroOpcional(req.body.ActorId);
  const Tipo = String(req.body.Tipo || "PROMOCIONAL").toUpperCase();

  if (!validarEntidad({ PeliculaId, ActorId })) {
    if (req.file?.filename) borrarArchivoGaleria(`/uploads/galerias/${req.file.filename}`);
    return res.status(400).json({ mensaje: "La imagen debe pertenecer a una película o a un talento, pero no a ambos" });
  }
  if (!TIPOS_PERMITIDOS.has(Tipo)) {
    if (req.file?.filename) borrarArchivoGaleria(`/uploads/galerias/${req.file.filename}`);
    return res.status(400).json({ mensaje: "Tipo de imagen inválido" });
  }

  try {
    const pool = await poolPromise;
    const actual = await pool.request()
      .input("Id", sql.Int, Id)
      .query("SELECT Archivo FROM GaleriaMultimedia WHERE Id = @Id;");

    if (!actual.recordset.length) {
      if (req.file?.filename) borrarArchivoGaleria(`/uploads/galerias/${req.file.filename}`);
      return res.status(404).json({ mensaje: "Imagen no encontrada" });
    }

    const archivoAnterior = actual.recordset[0].Archivo;
    const Archivo = req.file?.filename ? `/uploads/galerias/${req.file.filename}` : archivoAnterior;

    const result = await pool.request()
      .input("Id", sql.Int, Id)
      .input("PeliculaId", sql.Int, PeliculaId)
      .input("ActorId", sql.Int, ActorId)
      .input("Tipo", sql.NVarChar(40), Tipo)
      .input("Titulo", sql.NVarChar(180), limpiar(req.body.Titulo) || null)
      .input("Descripcion", sql.NVarChar(700), limpiar(req.body.Descripcion) || null)
      .input("Archivo", sql.NVarChar(300), Archivo)
      .input("FuenteUrl", sql.NVarChar(500), limpiar(req.body.FuenteUrl) || null)
      .input("Orden", sql.Int, enteroOpcional(req.body.Orden))
      .input("EsDestacada", sql.Bit, booleano(req.body.EsDestacada))
      .query(`
        UPDATE GaleriaMultimedia
        SET PeliculaId = @PeliculaId,
            ActorId = @ActorId,
            Tipo = @Tipo,
            Titulo = @Titulo,
            Descripcion = @Descripcion,
            Archivo = @Archivo,
            FuenteUrl = @FuenteUrl,
            Orden = @Orden,
            EsDestacada = @EsDestacada,
            FechaActualizacion = SYSUTCDATETIME()
        OUTPUT INSERTED.*
        WHERE Id = @Id;
      `);

    if (req.file?.filename && archivoAnterior !== Archivo) {
      borrarArchivoGaleria(archivoAnterior);
    }

    res.json(result.recordset[0]);
  } catch (error) {
    if (req.file?.filename) borrarArchivoGaleria(`/uploads/galerias/${req.file.filename}`);
    if (error.number === 547) {
      return res.status(400).json({ mensaje: "La película o talento seleccionado no existe" });
    }
    console.error("Error al actualizar elemento de galería:", error);
    res.status(500).json({ mensaje: "No fue posible actualizar la imagen" });
  }
};

const eliminarElementoGaleria = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("Id", sql.Int, Number(req.params.id))
      .query("DELETE FROM GaleriaMultimedia OUTPUT DELETED.Archivo WHERE Id = @Id;");

    if (!result.recordset.length) {
      return res.status(404).json({ mensaje: "Imagen no encontrada" });
    }

    borrarArchivoGaleria(result.recordset[0].Archivo);
    res.status(204).send();
  } catch (error) {
    console.error("Error al eliminar elemento de galería:", error);
    res.status(500).json({ mensaje: "No fue posible eliminar la imagen" });
  }
};

module.exports = {
  obtenerGaleria,
  crearElementoGaleria,
  actualizarElementoGaleria,
  eliminarElementoGaleria,
};
