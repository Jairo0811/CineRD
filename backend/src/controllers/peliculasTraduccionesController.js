const { sql, poolPromise } = require("../config/db");

const IDIOMAS_PERMITIDOS = new Set(["es", "en"]);
const TIPOS_FUENTE = new Set(["OFICIAL", "DISTRIBUCION", "EDITORIAL"]);

const normalizarTexto = (valor) => {
  if (valor === null || valor === undefined) return null;
  const texto = valor.toString().trim();
  return texto || null;
};

const validarIdioma = (idioma) => {
  const valor = idioma?.toLowerCase().trim();
  return IDIOMAS_PERMITIDOS.has(valor) ? valor : null;
};

const obtenerTraduccionesPelicula = async (req, res) => {
  try {
    const peliculaId = Number(req.params.id);
    if (!Number.isInteger(peliculaId) || peliculaId <= 0) {
      return res.status(400).json({ mensaje: "El identificador de la película no es válido" });
    }

    const pool = await poolPromise;
    const resultado = await pool.request()
      .input("PeliculaId", sql.Int, peliculaId)
      .query(`
        SELECT Id, PeliculaId, Idioma, Titulo, Sinopsis, Eslogan,
               TipoFuente, FuenteReferencia, FechaCreacion, FechaActualizacion
        FROM dbo.PeliculaTraducciones
        WHERE PeliculaId = @PeliculaId
        ORDER BY Idioma
      `);

    res.json(resultado.recordset);
  } catch (error) {
    console.error("Error al obtener traducciones de película:", error);
    res.status(500).json({ mensaje: "Error al obtener traducciones de la película", error: error.message });
  }
};

const guardarTraduccionPelicula = async (req, res) => {
  try {
    const peliculaId = Number(req.params.id);
    const idioma = validarIdioma(req.params.idioma);

    if (!Number.isInteger(peliculaId) || peliculaId <= 0) {
      return res.status(400).json({ mensaje: "El identificador de la película no es válido" });
    }
    if (!idioma) {
      return res.status(400).json({ mensaje: "Idioma de traducción no permitido" });
    }

    const titulo = normalizarTexto(req.body.Titulo);
    const sinopsis = normalizarTexto(req.body.Sinopsis);
    const eslogan = normalizarTexto(req.body.Eslogan);
    const tipoFuente = (req.body.TipoFuente || "EDITORIAL").toString().trim().toUpperCase();
    const fuenteReferencia = normalizarTexto(req.body.FuenteReferencia);

    if (!TIPOS_FUENTE.has(tipoFuente)) {
      return res.status(400).json({ mensaje: "Tipo de fuente de traducción no válido" });
    }
    if (!titulo && !sinopsis && !eslogan) {
      return res.status(400).json({ mensaje: "Debe registrar al menos un campo traducido" });
    }

    const pool = await poolPromise;
    const pelicula = await pool.request().input("Id", sql.Int, peliculaId)
      .query("SELECT Id FROM dbo.Peliculas WHERE Id = @Id");
    if (!pelicula.recordset.length) {
      return res.status(404).json({ mensaje: "Película no encontrada" });
    }

    const resultado = await pool.request()
      .input("PeliculaId", sql.Int, peliculaId)
      .input("Idioma", sql.NVarChar(10), idioma)
      .input("Titulo", sql.NVarChar(200), titulo)
      .input("Sinopsis", sql.NVarChar(sql.MAX), sinopsis)
      .input("Eslogan", sql.NVarChar(300), eslogan)
      .input("TipoFuente", sql.NVarChar(30), tipoFuente)
      .input("FuenteReferencia", sql.NVarChar(500), fuenteReferencia)
      .query(`
        MERGE dbo.PeliculaTraducciones AS destino
        USING (SELECT @PeliculaId AS PeliculaId, @Idioma AS Idioma) AS origen
          ON destino.PeliculaId = origen.PeliculaId AND destino.Idioma = origen.Idioma
        WHEN MATCHED THEN
          UPDATE SET Titulo=@Titulo, Sinopsis=@Sinopsis, Eslogan=@Eslogan,
                     TipoFuente=@TipoFuente, FuenteReferencia=@FuenteReferencia,
                     FechaActualizacion=SYSUTCDATETIME()
        WHEN NOT MATCHED THEN
          INSERT (PeliculaId, Idioma, Titulo, Sinopsis, Eslogan, TipoFuente, FuenteReferencia)
          VALUES (@PeliculaId, @Idioma, @Titulo, @Sinopsis, @Eslogan, @TipoFuente, @FuenteReferencia)
        OUTPUT inserted.*;
      `);

    res.json({ mensaje: "Traducción guardada correctamente", traduccion: resultado.recordset[0] });
  } catch (error) {
    console.error("Error al guardar traducción de película:", error);
    res.status(500).json({ mensaje: "Error al guardar la traducción", error: error.message });
  }
};

module.exports = { obtenerTraduccionesPelicula, guardarTraduccionPelicula };
