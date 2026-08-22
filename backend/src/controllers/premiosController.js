const { poolPromise, sql } = require("../config/db");

const limpiar = (valor) => (typeof valor === "string" ? valor.trim() : valor);

const validarEntidadNominacion = ({ PeliculaId, ActorId }) => {
  const tienePelicula = Boolean(PeliculaId);
  const tieneActor = Boolean(ActorId);
  return tienePelicula !== tieneActor;
};

const obtenerPremios = async (_req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT
        P.Id,
        P.Nombre,
        P.Organizacion,
        P.Pais,
        P.SitioWeb,
        COUNT(N.Id) AS CantidadNominaciones,
        SUM(CASE WHEN N.Resultado = N'GANADOR' THEN 1 ELSE 0 END) AS CantidadGanadores
      FROM Premios P
      LEFT JOIN Nominaciones N ON N.PremioId = P.Id
      GROUP BY P.Id, P.Nombre, P.Organizacion, P.Pais, P.SitioWeb
      ORDER BY P.Nombre;
    `);

    res.json(result.recordset);
  } catch (error) {
    console.error("Error al obtener premios:", error);
    res.status(500).json({ mensaje: "No fue posible obtener los premios" });
  }
};

const obtenerPremioPorId = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("Id", sql.Int, Number(req.params.id))
      .query(`
        SELECT Id, Nombre, Organizacion, Pais, SitioWeb, FechaCreacion, FechaActualizacion
        FROM Premios
        WHERE Id = @Id;
      `);

    if (!result.recordset.length) {
      return res.status(404).json({ mensaje: "Premio no encontrado" });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error("Error al obtener premio:", error);
    res.status(500).json({ mensaje: "No fue posible obtener el premio" });
  }
};

const crearPremio = async (req, res) => {
  const Nombre = limpiar(req.body.Nombre);
  const Organizacion = limpiar(req.body.Organizacion) || null;
  const Pais = limpiar(req.body.Pais) || null;
  const SitioWeb = limpiar(req.body.SitioWeb) || null;

  if (!Nombre) {
    return res.status(400).json({ mensaje: "El nombre del premio es obligatorio" });
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("Nombre", sql.NVarChar(160), Nombre)
      .input("Organizacion", sql.NVarChar(200), Organizacion)
      .input("Pais", sql.NVarChar(100), Pais)
      .input("SitioWeb", sql.NVarChar(300), SitioWeb)
      .query(`
        INSERT INTO Premios (Nombre, Organizacion, Pais, SitioWeb)
        OUTPUT INSERTED.*
        VALUES (@Nombre, @Organizacion, @Pais, @SitioWeb);
      `);

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    if (error.number === 2601 || error.number === 2627) {
      return res.status(409).json({ mensaje: "Ya existe un premio con ese nombre" });
    }
    console.error("Error al crear premio:", error);
    res.status(500).json({ mensaje: "No fue posible crear el premio" });
  }
};

const actualizarPremio = async (req, res) => {
  const Nombre = limpiar(req.body.Nombre);
  if (!Nombre) {
    return res.status(400).json({ mensaje: "El nombre del premio es obligatorio" });
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("Id", sql.Int, Number(req.params.id))
      .input("Nombre", sql.NVarChar(160), Nombre)
      .input("Organizacion", sql.NVarChar(200), limpiar(req.body.Organizacion) || null)
      .input("Pais", sql.NVarChar(100), limpiar(req.body.Pais) || null)
      .input("SitioWeb", sql.NVarChar(300), limpiar(req.body.SitioWeb) || null)
      .query(`
        UPDATE Premios
        SET Nombre = @Nombre,
            Organizacion = @Organizacion,
            Pais = @Pais,
            SitioWeb = @SitioWeb,
            FechaActualizacion = SYSUTCDATETIME()
        OUTPUT INSERTED.*
        WHERE Id = @Id;
      `);

    if (!result.recordset.length) {
      return res.status(404).json({ mensaje: "Premio no encontrado" });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    if (error.number === 2601 || error.number === 2627) {
      return res.status(409).json({ mensaje: "Ya existe un premio con ese nombre" });
    }
    console.error("Error al actualizar premio:", error);
    res.status(500).json({ mensaje: "No fue posible actualizar el premio" });
  }
};

const eliminarPremio = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("Id", sql.Int, Number(req.params.id))
      .query("DELETE FROM Premios OUTPUT DELETED.Id WHERE Id = @Id;");

    if (!result.recordset.length) {
      return res.status(404).json({ mensaje: "Premio no encontrado" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error al eliminar premio:", error);
    res.status(500).json({ mensaje: "No fue posible eliminar el premio" });
  }
};

const consultaNominacionesBase = `
  SELECT
    N.Id,
    N.PremioId,
    P.Nombre AS Premio,
    P.Organizacion,
    N.Categoria,
    N.Anio,
    N.PeliculaId,
    PE.Titulo AS Pelicula,
    N.ActorId,
    COALESCE(A.NombreArtistico, A.NombreCompleto) AS Talento,
    N.Resultado,
    N.Detalle,
    N.FuenteUrl,
    N.FechaCreacion,
    N.FechaActualizacion
  FROM Nominaciones N
  INNER JOIN Premios P ON P.Id = N.PremioId
  LEFT JOIN Peliculas PE ON PE.Id = N.PeliculaId
  LEFT JOIN Actores A ON A.Id = N.ActorId
`;

const obtenerNominaciones = async (req, res) => {
  try {
    const pool = await poolPromise;
    const request = pool.request();
    const filtros = [];

    if (req.query.peliculaId) {
      request.input("PeliculaId", sql.Int, Number(req.query.peliculaId));
      filtros.push("N.PeliculaId = @PeliculaId");
    }
    if (req.query.actorId) {
      request.input("ActorId", sql.Int, Number(req.query.actorId));
      filtros.push("N.ActorId = @ActorId");
    }
    if (req.query.premioId) {
      request.input("PremioId", sql.Int, Number(req.query.premioId));
      filtros.push("N.PremioId = @PremioId");
    }
    if (req.query.anio) {
      request.input("Anio", sql.SmallInt, Number(req.query.anio));
      filtros.push("N.Anio = @Anio");
    }
    if (req.query.resultado) {
      request.input("Resultado", sql.NVarChar(20), String(req.query.resultado).toUpperCase());
      filtros.push("N.Resultado = @Resultado");
    }

    const where = filtros.length ? ` WHERE ${filtros.join(" AND ")}` : "";
    const result = await request.query(`${consultaNominacionesBase}${where} ORDER BY N.Anio DESC, P.Nombre, N.Categoria;`);
    res.json(result.recordset);
  } catch (error) {
    console.error("Error al obtener nominaciones:", error);
    res.status(500).json({ mensaje: "No fue posible obtener las nominaciones" });
  }
};

const crearNominacion = async (req, res) => {
  const PremioId = Number(req.body.PremioId);
  const Categoria = limpiar(req.body.Categoria);
  const Anio = Number(req.body.Anio);
  const PeliculaId = req.body.PeliculaId ? Number(req.body.PeliculaId) : null;
  const ActorId = req.body.ActorId ? Number(req.body.ActorId) : null;
  const Resultado = String(req.body.Resultado || "NOMINADO").toUpperCase();

  if (!PremioId || !Categoria || !Number.isInteger(Anio)) {
    return res.status(400).json({ mensaje: "Premio, categoría y año son obligatorios" });
  }
  if (!validarEntidadNominacion({ PeliculaId, ActorId })) {
    return res.status(400).json({ mensaje: "La nominación debe pertenecer a una película o a un talento, pero no a ambos" });
  }
  if (!["NOMINADO", "GANADOR"].includes(Resultado)) {
    return res.status(400).json({ mensaje: "Resultado inválido" });
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("PremioId", sql.Int, PremioId)
      .input("Categoria", sql.NVarChar(180), Categoria)
      .input("Anio", sql.SmallInt, Anio)
      .input("PeliculaId", sql.Int, PeliculaId)
      .input("ActorId", sql.Int, ActorId)
      .input("Resultado", sql.NVarChar(20), Resultado)
      .input("Detalle", sql.NVarChar(500), limpiar(req.body.Detalle) || null)
      .input("FuenteUrl", sql.NVarChar(500), limpiar(req.body.FuenteUrl) || null)
      .query(`
        INSERT INTO Nominaciones
          (PremioId, Categoria, Anio, PeliculaId, ActorId, Resultado, Detalle, FuenteUrl)
        OUTPUT INSERTED.*
        VALUES
          (@PremioId, @Categoria, @Anio, @PeliculaId, @ActorId, @Resultado, @Detalle, @FuenteUrl);
      `);

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error("Error al crear nominación:", error);
    res.status(500).json({ mensaje: "No fue posible crear la nominación" });
  }
};

const actualizarNominacion = async (req, res) => {
  const PremioId = Number(req.body.PremioId);
  const Categoria = limpiar(req.body.Categoria);
  const Anio = Number(req.body.Anio);
  const PeliculaId = req.body.PeliculaId ? Number(req.body.PeliculaId) : null;
  const ActorId = req.body.ActorId ? Number(req.body.ActorId) : null;
  const Resultado = String(req.body.Resultado || "NOMINADO").toUpperCase();

  if (!PremioId || !Categoria || !Number.isInteger(Anio)) {
    return res.status(400).json({ mensaje: "Premio, categoría y año son obligatorios" });
  }
  if (!validarEntidadNominacion({ PeliculaId, ActorId })) {
    return res.status(400).json({ mensaje: "La nominación debe pertenecer a una película o a un talento, pero no a ambos" });
  }
  if (!["NOMINADO", "GANADOR"].includes(Resultado)) {
    return res.status(400).json({ mensaje: "Resultado inválido" });
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("Id", sql.Int, Number(req.params.id))
      .input("PremioId", sql.Int, PremioId)
      .input("Categoria", sql.NVarChar(180), Categoria)
      .input("Anio", sql.SmallInt, Anio)
      .input("PeliculaId", sql.Int, PeliculaId)
      .input("ActorId", sql.Int, ActorId)
      .input("Resultado", sql.NVarChar(20), Resultado)
      .input("Detalle", sql.NVarChar(500), limpiar(req.body.Detalle) || null)
      .input("FuenteUrl", sql.NVarChar(500), limpiar(req.body.FuenteUrl) || null)
      .query(`
        UPDATE Nominaciones
        SET PremioId = @PremioId,
            Categoria = @Categoria,
            Anio = @Anio,
            PeliculaId = @PeliculaId,
            ActorId = @ActorId,
            Resultado = @Resultado,
            Detalle = @Detalle,
            FuenteUrl = @FuenteUrl,
            FechaActualizacion = SYSUTCDATETIME()
        OUTPUT INSERTED.*
        WHERE Id = @Id;
      `);

    if (!result.recordset.length) {
      return res.status(404).json({ mensaje: "Nominación no encontrada" });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error("Error al actualizar nominación:", error);
    res.status(500).json({ mensaje: "No fue posible actualizar la nominación" });
  }
};

const eliminarNominacion = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("Id", sql.Int, Number(req.params.id))
      .query("DELETE FROM Nominaciones OUTPUT DELETED.Id WHERE Id = @Id;");

    if (!result.recordset.length) {
      return res.status(404).json({ mensaje: "Nominación no encontrada" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error al eliminar nominación:", error);
    res.status(500).json({ mensaje: "No fue posible eliminar la nominación" });
  }
};

module.exports = {
  obtenerPremios,
  obtenerPremioPorId,
  crearPremio,
  actualizarPremio,
  eliminarPremio,
  obtenerNominaciones,
  crearNominacion,
  actualizarNominacion,
  eliminarNominacion,
};
