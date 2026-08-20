const { sql, poolPromise } = require("../config/db");

const CAMPOS_OPCIONALES = [
  "Sinopsis",
  "DuracionMinutos",
  "Calificacion",
  "IdiomaOriginal",
  "Presupuesto",
  "Recaudacion",
  "Backdrop",
  "TrailerUrl",
  "Estado",
  "Eslogan",
];

const IDIOMAS_PERMITIDOS = new Set(["es", "en"]);

const obtenerColumnasPeliculas = async (pool) => {
  const resultado = await pool.request().query(`
    SELECT name
    FROM sys.columns
    WHERE object_id = OBJECT_ID(N'dbo.Peliculas')
  `);

  return new Set(resultado.recordset.map((columna) => columna.name));
};

const construirCamposOpcionales = (columnasDisponibles) =>
  CAMPOS_OPCIONALES.map((campo) =>
    columnasDisponibles.has(campo)
      ? `P.${campo}`
      : `NULL AS ${campo}`,
  ).join(",\n          ");

const construirGroupByOpcional = (columnasDisponibles) => {
  const campos = CAMPOS_OPCIONALES.filter((campo) =>
    columnasDisponibles.has(campo),
  ).map((campo) => `P.${campo}`);

  return campos.length > 0 ? `,\n          ${campos.join(",\n          ")}` : "";
};

const existeTablaTraducciones = async (pool) => {
  const resultado = await pool.request().query(`
    SELECT CASE WHEN OBJECT_ID(N'dbo.PeliculaTraducciones', N'U') IS NULL THEN 0 ELSE 1 END AS Existe
  `);
  return Boolean(resultado.recordset[0]?.Existe);
};

const obtenerPerfilPelicula = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const idiomaSolicitado = (req.query.lang || "es").toString().trim().toLowerCase();
    const idioma = IDIOMAS_PERMITIDOS.has(idiomaSolicitado) ? idiomaSolicitado : "es";

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        mensaje: "El identificador de la película no es válido",
      });
    }

    const pool = await poolPromise;
    const columnasDisponibles = await obtenerColumnasPeliculas(pool);
    const camposOpcionales = construirCamposOpcionales(columnasDisponibles);
    const groupByOpcional = construirGroupByOpcional(columnasDisponibles);

    const resultado = await pool
      .request()
      .input("Id", sql.Int, id)
      .query(`
        SELECT
          P.Id,
          P.TMDbId,
          P.Titulo,
          P.Genero,
          P.Director,
          P.Productora,
          P.FechaEstreno,
          P.Foto,
          ${camposOpcionales},
          COUNT(AP.ActorId) AS CantidadActores
        FROM dbo.Peliculas P
        LEFT JOIN dbo.ActoresPeliculas AP
          ON AP.PeliculaId = P.Id
        WHERE P.Id = @Id
        GROUP BY
          P.Id,
          P.TMDbId,
          P.Titulo,
          P.Genero,
          P.Director,
          P.Productora,
          P.FechaEstreno,
          P.Foto${groupByOpcional}
      `);

    if (resultado.recordset.length === 0) {
      return res.status(404).json({
        mensaje: "Película no encontrada",
      });
    }

    const pelicula = resultado.recordset[0];
    pelicula.TituloOriginal = pelicula.Titulo;
    pelicula.SinopsisOriginal = pelicula.Sinopsis || null;
    pelicula.EsloganOriginal = pelicula.Eslogan || null;
    pelicula.IdiomaContenido = pelicula.IdiomaOriginal?.toLowerCase() || "es";
    pelicula.TraduccionAplicada = false;
    pelicula.TipoFuenteTraduccion = null;

    if (idioma !== pelicula.IdiomaContenido && await existeTablaTraducciones(pool)) {
      const traduccion = await pool.request()
        .input("PeliculaId", sql.Int, id)
        .input("Idioma", sql.NVarChar(10), idioma)
        .query(`
          SELECT TOP 1 Titulo, Sinopsis, Eslogan, TipoFuente, FuenteReferencia
          FROM dbo.PeliculaTraducciones
          WHERE PeliculaId = @PeliculaId AND Idioma = @Idioma
        `);

      if (traduccion.recordset.length) {
        const localizada = traduccion.recordset[0];
        pelicula.Titulo = localizada.Titulo || pelicula.Titulo;
        pelicula.Sinopsis = localizada.Sinopsis || pelicula.Sinopsis;
        pelicula.Eslogan = localizada.Eslogan || pelicula.Eslogan;
        pelicula.TraduccionAplicada = Boolean(localizada.Titulo || localizada.Sinopsis || localizada.Eslogan);
        pelicula.TipoFuenteTraduccion = localizada.TipoFuente || null;
        pelicula.FuenteReferenciaTraduccion = localizada.FuenteReferencia || null;
      }
    }

    return res.json(pelicula);
  } catch (error) {
    console.error("Error al obtener el perfil de la película:", error);

    return res.status(500).json({
      mensaje: "Error al obtener el perfil de la película",
      error: error.message,
    });
  }
};

module.exports = {
  obtenerPerfilPelicula,
};
