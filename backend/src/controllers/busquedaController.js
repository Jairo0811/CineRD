const { sql, poolPromise } = require("../config/db");

const buscarGlobal = async (req, res) => {
  try {
    const termino = (req.query.q || "").toString().trim();
    if (termino.length < 2) return res.json({ peliculas: [], talentos: [] });

    const pool = await poolPromise;
    const request = pool.request().input("Buscar", sql.NVarChar(180), `%${termino}%`);
    const [peliculas, talentos] = await Promise.all([
      request.query(`
        SELECT TOP 10 Id, Titulo, Genero, Director, Productora, FechaEstreno, Foto
        FROM dbo.Peliculas
        WHERE Titulo LIKE @Buscar OR Director LIKE @Buscar OR Productora LIKE @Buscar OR Genero LIKE @Buscar
        ORDER BY CASE WHEN Titulo LIKE @Buscar THEN 0 ELSE 1 END, FechaEstreno DESC, Titulo ASC
      `),
      pool.request().input("Buscar", sql.NVarChar(180), `%${termino}%`).query(`
        SELECT TOP 10 Id, NombreCompleto, NombreArtistico, Profesion, Foto, EstaVivo
        FROM dbo.Actores
        WHERE NombreCompleto LIKE @Buscar OR NombreArtistico LIKE @Buscar OR Profesion LIKE @Buscar
        ORDER BY CASE WHEN NombreArtistico LIKE @Buscar OR NombreCompleto LIKE @Buscar THEN 0 ELSE 1 END, NombreCompleto ASC
      `),
    ]);

    res.json({ peliculas: peliculas.recordset, talentos: talentos.recordset });
  } catch (error) {
    console.error("Error en búsqueda global:", error);
    res.status(500).json({ mensaje: "No fue posible realizar la búsqueda", error: error.message });
  }
};

module.exports = { buscarGlobal };
