const { sql, poolPromise } = require("../config/db");

const normalizarEntero = (valor) => {
  if (
    valor === null ||
    valor === undefined ||
    valor.toString().trim() === ""
  ) {
    return null;
  }

  const numero = Number.parseInt(valor, 10);

  return Number.isNaN(numero) ? null : numero;
};

const obtenerPeliculas = async (req, res) => {
  try {
    const {
      buscar = "",
      genero = "",
      orden = "estrenoDesc",
    } = req.query;

    const pool = await poolPromise;

    let query = `
      SELECT
        P.Id,
        P.TMDbId,
        P.Titulo,
        P.Genero,
        P.Director,
        P.Productora,
        P.FechaEstreno,
        P.Foto,
        COUNT(AP.ActorId) AS CantidadActores
      FROM Peliculas P
      LEFT JOIN ActoresPeliculas AP
        ON P.Id = AP.PeliculaId
      WHERE 1 = 1
    `;

    if (buscar) {
      query += `
        AND (
          P.Titulo LIKE @Buscar
          OR P.Director LIKE @Buscar
          OR P.Productora LIKE @Buscar
        )
      `;
    }

    if (genero) {
      query += `
        AND P.Genero = @Genero
      `;
    }

    query += `
      GROUP BY
        P.Id,
        P.TMDbId,
        P.Titulo,
        P.Genero,
        P.Director,
        P.Productora,
        P.FechaEstreno,
        P.Foto
    `;

    switch (orden) {
      case "estrenoAsc":
        query += `
          ORDER BY P.FechaEstreno ASC
        `;
        break;

      case "az":
        query += `
          ORDER BY P.Titulo ASC
        `;
        break;

      case "za":
        query += `
          ORDER BY P.Titulo DESC
        `;
        break;

      case "masActores":
        query += `
          ORDER BY CantidadActores DESC, P.Titulo ASC
        `;
        break;

      case "menosActores":
        query += `
          ORDER BY CantidadActores ASC, P.Titulo ASC
        `;
        break;

      default:
        query += `
          ORDER BY P.FechaEstreno DESC
        `;
        break;
    }

    const request = pool.request();

    if (buscar) {
      request.input(
        "Buscar",
        sql.NVarChar(150),
        `%${buscar.trim()}%`,
      );
    }

    if (genero) {
      request.input(
        "Genero",
        sql.NVarChar(80),
        genero.trim(),
      );
    }

    const resultado = await request.query(query);

    res.json(resultado.recordset);
  } catch (error) {
    console.error("Error al obtener las películas:", error);

    res.status(500).json({
      mensaje: "Error al obtener las películas",
      error: error.message,
    });
  }
};

const obtenerPeliculaPorId = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        mensaje: "El identificador de la película no es válido",
      });
    }

    const pool = await poolPromise;

    const resultado = await pool
      .request()
      .input("Id", sql.Int, id)
      .query(`
        SELECT
          Id,
          TMDbId,
          Titulo,
          Genero,
          Director,
          Productora,
          FechaEstreno,
          Foto
        FROM Peliculas
        WHERE Id = @Id
      `);

    if (resultado.recordset.length === 0) {
      return res.status(404).json({
        mensaje: "Película no encontrada",
      });
    }

    res.json(resultado.recordset[0]);
  } catch (error) {
    console.error("Error al obtener la película:", error);

    res.status(500).json({
      mensaje: "Error al obtener la película",
      error: error.message,
    });
  }
};

const obtenerPeliculasDirigidasPorActor = async (req, res) => {
  try {
    const nombre = req.params.nombre?.trim();

    if (!nombre) {
      return res.status(400).json({
        mensaje: "Debe indicar el nombre del director",
      });
    }

    const pool = await poolPromise;

    const resultado = await pool
      .request()
      .input(
        "Nombre",
        sql.NVarChar(150),
        `%${nombre}%`,
      )
      .query(`
        SELECT
          Id,
          TMDbId,
          Titulo,
          Genero,
          Director,
          Productora,
          FechaEstreno,
          Foto
        FROM Peliculas
        WHERE Director LIKE @Nombre
        ORDER BY FechaEstreno DESC
      `);

    res.json(resultado.recordset);
  } catch (error) {
    console.error(
      "Error al obtener películas dirigidas:",
      error,
    );

    res.status(500).json({
      mensaje: "Error al obtener películas dirigidas",
      error: error.message,
    });
  }
};

const verificarTmdbIdDisponible = async ({
  pool,
  tmdbId,
  peliculaId = null,
}) => {
  if (!tmdbId) {
    return null;
  }

  const request = pool
    .request()
    .input("TMDbId", sql.Int, tmdbId);

  let query = `
    SELECT
      Id,
      Titulo
    FROM Peliculas
    WHERE TMDbId = @TMDbId
  `;

  if (peliculaId) {
    request.input("PeliculaId", sql.Int, peliculaId);

    query += `
      AND Id <> @PeliculaId
    `;
  }

  const resultado = await request.query(query);

  return resultado.recordset[0] || null;
};

const crearPelicula = async (req, res) => {
  try {
    const {
      TMDbId,
      Titulo,
      Genero,
      Director,
      Productora,
      FechaEstreno,
    } = req.body;

    const tituloNormalizado = Titulo?.trim();
    const generoNormalizado = Genero?.trim();
    const fechaEstrenoNormalizada =
      FechaEstreno?.trim();

    if (
      !tituloNormalizado ||
      !generoNormalizado ||
      !fechaEstrenoNormalizada
    ) {
      return res.status(400).json({
        mensaje:
          "Título, género y fecha de estreno son obligatorios",
      });
    }

    const tmdbIdNormalizado = normalizarEntero(TMDbId);

    const Foto = req.file
      ? `/uploads/peliculas/${req.file.filename}`
      : null;

    const pool = await poolPromise;

    const peliculaTmdbExistente =
      await verificarTmdbIdDisponible({
        pool,
        tmdbId: tmdbIdNormalizado,
      });

    if (peliculaTmdbExistente) {
      return res.status(409).json({
        mensaje:
          "Esta película de TMDb ya está registrada en CineRD",
        pelicula: peliculaTmdbExistente,
      });
    }

    const resultado = await pool
      .request()
      .input(
        "TMDbId",
        sql.Int,
        tmdbIdNormalizado,
      )
      .input(
        "Titulo",
        sql.NVarChar(150),
        tituloNormalizado,
      )
      .input(
        "Genero",
        sql.NVarChar(80),
        generoNormalizado,
      )
      .input(
        "Director",
        sql.NVarChar(150),
        Director?.trim() || null,
      )
      .input(
        "Productora",
        sql.NVarChar(150),
        Productora?.trim() || null,
      )
      .input(
        "FechaEstreno",
        sql.Date,
        fechaEstrenoNormalizada,
      )
      .input(
        "Foto",
        sql.NVarChar(255),
        Foto,
      )
      .query(`
        INSERT INTO Peliculas
        (
          TMDbId,
          Titulo,
          Genero,
          Director,
          Productora,
          FechaEstreno,
          Foto
        )
        OUTPUT INSERTED.*
        VALUES
        (
          @TMDbId,
          @Titulo,
          @Genero,
          @Director,
          @Productora,
          @FechaEstreno,
          @Foto
        )
      `);

    res.status(201).json({
      mensaje: "Película registrada correctamente",
      pelicula: resultado.recordset[0],
    });
  } catch (error) {
    console.error("Error al registrar la película:", error);

    if (
      error.message.includes("UQ_Peliculas_Titulo") ||
      error.message.includes("UNIQUE KEY")
    ) {
      return res.status(409).json({
        mensaje: "Ya existe una película con ese título",
      });
    }

    if (
      error.message.includes("TMDbId") &&
      error.message.includes("duplicate")
    ) {
      return res.status(409).json({
        mensaje:
          "Esta película de TMDb ya está registrada",
      });
    }

    res.status(500).json({
      mensaje: "Error al registrar la película",
      error: error.message,
    });
  }
};

const actualizarPelicula = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        mensaje: "El identificador de la película no es válido",
      });
    }

    const {
      TMDbId,
      Titulo,
      Genero,
      Director,
      Productora,
      FechaEstreno,
    } = req.body;

    const tituloNormalizado = Titulo?.trim();
    const generoNormalizado = Genero?.trim();
    const fechaEstrenoNormalizada =
      FechaEstreno?.trim();

    if (
      !tituloNormalizado ||
      !generoNormalizado ||
      !fechaEstrenoNormalizada
    ) {
      return res.status(400).json({
        mensaje:
          "Título, género y fecha de estreno son obligatorios",
      });
    }

    const tmdbIdNormalizado = normalizarEntero(TMDbId);

    const pool = await poolPromise;

    const peliculaTmdbExistente =
      await verificarTmdbIdDisponible({
        pool,
        tmdbId: tmdbIdNormalizado,
        peliculaId: id,
      });

    if (peliculaTmdbExistente) {
      return res.status(409).json({
        mensaje:
          "Este perfil de TMDb ya está vinculado con otra película",
        pelicula: peliculaTmdbExistente,
      });
    }

    const peliculaActual = await pool
      .request()
      .input("Id", sql.Int, id)
      .query(`
        SELECT
          Foto,
          TMDbId
        FROM Peliculas
        WHERE Id = @Id
      `);

    if (peliculaActual.recordset.length === 0) {
      return res.status(404).json({
        mensaje: "Película no encontrada",
      });
    }

    const Foto = req.file
      ? `/uploads/peliculas/${req.file.filename}`
      : peliculaActual.recordset[0].Foto || null;

    const tmdbIdFinal =
      tmdbIdNormalizado ??
      peliculaActual.recordset[0].TMDbId ??
      null;

    const resultado = await pool
      .request()
      .input("Id", sql.Int, id)
      .input("TMDbId", sql.Int, tmdbIdFinal)
      .input(
        "Titulo",
        sql.NVarChar(150),
        tituloNormalizado,
      )
      .input(
        "Genero",
        sql.NVarChar(80),
        generoNormalizado,
      )
      .input(
        "Director",
        sql.NVarChar(150),
        Director?.trim() || null,
      )
      .input(
        "Productora",
        sql.NVarChar(150),
        Productora?.trim() || null,
      )
      .input(
        "FechaEstreno",
        sql.Date,
        fechaEstrenoNormalizada,
      )
      .input(
        "Foto",
        sql.NVarChar(255),
        Foto,
      )
      .query(`
        UPDATE Peliculas
        SET
          TMDbId = @TMDbId,
          Titulo = @Titulo,
          Genero = @Genero,
          Director = @Director,
          Productora = @Productora,
          FechaEstreno = @FechaEstreno,
          Foto = @Foto
        OUTPUT INSERTED.*
        WHERE Id = @Id
      `);

    res.json({
      mensaje: "Película actualizada correctamente",
      pelicula: resultado.recordset[0],
    });
  } catch (error) {
    console.error("Error al actualizar la película:", error);

    if (
      error.message.includes("UQ_Peliculas_Titulo") ||
      error.message.includes("UNIQUE KEY")
    ) {
      return res.status(409).json({
        mensaje: "Ya existe una película con ese título",
      });
    }

    res.status(500).json({
      mensaje: "Error al actualizar la película",
      error: error.message,
    });
  }
};

const eliminarPelicula = async (req, res) => {
  const transaction = new sql.Transaction(
    await poolPromise,
  );

  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        mensaje: "El identificador de la película no es válido",
      });
    }

    await transaction.begin();

    await new sql.Request(transaction)
      .input("PeliculaId", sql.Int, id)
      .query(`
        DELETE FROM ActoresPeliculas
        WHERE PeliculaId = @PeliculaId
      `);

    const resultado = await new sql.Request(transaction)
      .input("Id", sql.Int, id)
      .query(`
        DELETE FROM Peliculas
        OUTPUT DELETED.*
        WHERE Id = @Id
      `);

    if (resultado.recordset.length === 0) {
      await transaction.rollback();

      return res.status(404).json({
        mensaje: "Película no encontrada",
      });
    }

    await transaction.commit();

    res.json({
      mensaje: "Película eliminada correctamente",
      pelicula: resultado.recordset[0],
    });
  } catch (error) {
    if (transaction._aborted !== true) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error(
          "Error al revertir la transacción:",
          rollbackError,
        );
      }
    }

    console.error("Error al eliminar la película:", error);

    res.status(500).json({
      mensaje: "Error al eliminar la película",
      error: error.message,
    });
  }
};

module.exports = {
  obtenerPeliculas,
  obtenerPeliculaPorId,
  obtenerPeliculasDirigidasPorActor,
  crearPelicula,
  actualizarPelicula,
  eliminarPelicula,
};