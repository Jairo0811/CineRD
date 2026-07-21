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

const obtenerPerfilPelicula = async (req, res) => {
  try {
    const id = Number(req.params.id);

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

    return res.json(resultado.recordset[0]);
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
