const { sql, poolPromise } = require("../config/db");

const {
  buscarPeliculas,
  obtenerDetallesPelicula,
  obtenerCreditosPelicula,
  buscarPersonas,
  obtenerDetallesPersona,
} = require("../services/tmdbService");

const normalizarTexto = (texto = "") => {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
};

const obtenerActoresRegistrados = async () => {
  const pool = await poolPromise;

  const resultado = await pool.request().query(`
    SELECT
      Id,
      TMDbId,
      Nombres,
      Apellidos,
      NombreCompleto,
      NombreArtistico,
      Profesion,
      FechaNacimiento,
      AnioNacimiento,
      Sexo,
      EstaVivo,
      FechaFallecimiento,
      Foto
    FROM Actores
    ORDER BY NombreCompleto ASC
  `);

  return resultado.recordset;
};

const compararPersonaConActores = (personaTmdb, actoresCineRD) => {
  const nombreTmdbNormalizado = normalizarTexto(
    personaTmdb.NombreCompleto,
  );

  // 1. Coincidencia definitiva mediante TMDbId
  const coincidenciaTmdbId = actoresCineRD.find(
    (actor) =>
      actor.TMDbId &&
      Number(actor.TMDbId) === Number(personaTmdb.TmdbId),
  );

  if (coincidenciaTmdbId) {
    return {
      EstadoCoincidencia: "existente",
      NivelCoincidencia: "tmdb-id",
      CampoCoincidencia: "TMDbId",
      ActorCoincidente: coincidenciaTmdbId,
    };
  }

  // 2. Coincidencia exacta con el nombre completo
  const coincidenciaNombreCompleto = actoresCineRD.find(
    (actor) =>
      normalizarTexto(actor.NombreCompleto) === nombreTmdbNormalizado,
  );

  if (coincidenciaNombreCompleto) {
    return {
      EstadoCoincidencia: "existente",
      NivelCoincidencia: "nombre-exacto",
      CampoCoincidencia: "NombreCompleto",
      ActorCoincidente: coincidenciaNombreCompleto,
    };
  }

  // 3. Coincidencia exacta con el nombre artístico
  const coincidenciaNombreArtistico = actoresCineRD.find(
    (actor) =>
      actor.NombreArtistico &&
      normalizarTexto(actor.NombreArtistico) === nombreTmdbNormalizado,
  );

  if (coincidenciaNombreArtistico) {
    return {
      EstadoCoincidencia: "existente",
      NivelCoincidencia: "nombre-artistico-exacto",
      CampoCoincidencia: "NombreArtistico",
      ActorCoincidente: coincidenciaNombreArtistico,
    };
  }

  // 4. Coincidencias parciales por nombre completo o artístico
  const palabrasTmdb = nombreTmdbNormalizado
    .split(" ")
    .filter(Boolean);

  const posiblesCoincidencias = actoresCineRD.filter((actor) => {
    const nombresComparables = [
      actor.NombreCompleto,
      actor.NombreArtistico,
    ]
      .filter(Boolean)
      .map(normalizarTexto);

    return nombresComparables.some((nombreComparable) => {
      const palabrasActor = nombreComparable
        .split(" ")
        .filter(Boolean);

      const coincidencias = palabrasTmdb.filter((palabra) =>
        palabrasActor.includes(palabra),
      );

      return coincidencias.length >= 2;
    });
  });

  if (posiblesCoincidencias.length > 0) {
    return {
      EstadoCoincidencia: "posible",
      NivelCoincidencia: "nombre-parcial",
      CampoCoincidencia: "NombreCompleto/NombreArtistico",
      ActorCoincidente: posiblesCoincidencias[0],
      PosiblesCoincidencias: posiblesCoincidencias,
    };
  }

  return {
    EstadoCoincidencia: "nuevo",
    NivelCoincidencia: "sin-coincidencia",
    CampoCoincidencia: null,
    ActorCoincidente: null,
  };
};

const buscarPeliculasTmdb = async (req, res) => {
  try {
    const titulo = req.query.titulo?.trim();
    const anio = req.query.anio?.trim();

    if (!titulo || titulo.length < 2) {
      return res.status(400).json({
        mensaje:
          "Debe indicar un título de al menos 2 caracteres",
      });
    }

    const resultados = await buscarPeliculas({
      titulo,
      anio: anio || null,
    });

    res.json(resultados.slice(0, 10));
  } catch (error) {
    console.error(
      "Error al buscar películas en TMDb:",
      error.response?.data || error.message,
    );

    res.status(502).json({
      mensaje: "No fue posible consultar TMDb",
      error:
        error.response?.data?.status_message ||
        error.message,
    });
  }
};

const obtenerPeliculaTmdb = async (req, res) => {
  try {
    const tmdbId = Number(req.params.tmdbId);

    if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
      return res.status(400).json({
        mensaje:
          "El identificador de TMDb no es válido",
      });
    }

    const pelicula = await obtenerDetallesPelicula(tmdbId);

    res.json(pelicula);
  } catch (error) {
    console.error(
      "Error al obtener película de TMDb:",
      error.response?.data || error.message,
    );

    res.status(502).json({
      mensaje:
        "No fue posible obtener la película desde TMDb",
      error:
        error.response?.data?.status_message ||
        error.message,
    });
  }
};

const buscarPersonasTmdb = async (req, res) => {
  try {
    const nombre = req.query.nombre?.trim();

    if (!nombre || nombre.length < 2) {
      return res.status(400).json({
        mensaje:
          "Debe indicar un nombre de al menos 2 caracteres",
      });
    }

    const [personasTmdb, actoresCineRD] =
      await Promise.all([
        buscarPersonas(nombre),
        obtenerActoresRegistrados(),
      ]);

    const resultados = personasTmdb
      .slice(0, 10)
      .map((persona) => ({
        ...persona,
        ...compararPersonaConActores(
          persona,
          actoresCineRD,
        ),
      }));

    res.json(resultados);
  } catch (error) {
    console.error(
      "Error al buscar personas en TMDb:",
      error.response?.data || error.message,
    );

    res.status(502).json({
      mensaje:
        "No fue posible buscar personas en TMDb",
      error:
        error.response?.data?.status_message ||
        error.message,
    });
  }
};

const obtenerPersonaTmdb = async (req, res) => {
  try {
    const tmdbId = Number(req.params.tmdbId);

    if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
      return res.status(400).json({
        mensaje:
          "El identificador de la persona no es válido",
      });
    }

    const [persona, actoresCineRD] =
      await Promise.all([
        obtenerDetallesPersona(tmdbId),
        obtenerActoresRegistrados(),
      ]);

    const comparacion = compararPersonaConActores(
      persona,
      actoresCineRD,
    );

    res.json({
      ...persona,
      ...comparacion,
    });
  } catch (error) {
    console.error(
      "Error al obtener persona desde TMDb:",
      error.response?.data || error.message,
    );

    res.status(502).json({
      mensaje:
        "No fue posible obtener la persona desde TMDb",
      error:
        error.response?.data?.status_message ||
        error.message,
    });
  }
};

const obtenerRepartoTmdb = async (req, res) => {
  try {
    const tmdbId = Number(req.params.tmdbId);

    if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
      return res.status(400).json({
        mensaje:
          "El identificador de la película no es válido",
      });
    }

    const [creditos, actoresCineRD] =
      await Promise.all([
        obtenerCreditosPelicula(tmdbId),
        obtenerActoresRegistrados(),
      ]);

    const repartoComparado = creditos.Reparto.map(
      (persona) => ({
        ...persona,
        ...compararPersonaConActores(
          persona,
          actoresCineRD,
        ),
      }),
    );

    const resumen = repartoComparado.reduce(
      (acumulador, persona) => {
        acumulador.Total += 1;

        if (
          persona.EstadoCoincidencia === "existente"
        ) {
          acumulador.Existentes += 1;
        }

        if (
          persona.EstadoCoincidencia === "posible"
        ) {
          acumulador.Posibles += 1;
        }

        if (persona.EstadoCoincidencia === "nuevo") {
          acumulador.Nuevos += 1;
        }

        return acumulador;
      },
      {
        Total: 0,
        Existentes: 0,
        Posibles: 0,
        Nuevos: 0,
      },
    );

    res.json({
      TmdbId: tmdbId,
      Resumen: resumen,
      Reparto: repartoComparado,
      Equipo: creditos.Equipo,
    });
  } catch (error) {
    console.error(
      "Error al obtener reparto desde TMDb:",
      error.response?.data || error.message,
    );

    res.status(502).json({
      mensaje:
        "No fue posible obtener el reparto desde TMDb",
      error:
        error.response?.data?.status_message ||
        error.message,
    });
  }
};

const vincularActorConTmdb = async (req, res) => {
  try {
    const actorId = Number(req.params.actorId);
    const tmdbId = Number(req.body.TMDbId);

    if (!Number.isInteger(actorId) || actorId <= 0) {
      return res.status(400).json({
        mensaje: "El identificador del actor no es válido",
      });
    }

    if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
      return res.status(400).json({
        mensaje: "El identificador de TMDb no es válido",
      });
    }

    const pool = await poolPromise;

    const tmdbOcupado = await pool
      .request()
      .input("ActorId", sql.Int, actorId)
      .input("TMDbId", sql.Int, tmdbId)
      .query(`
        SELECT
          Id,
          NombreCompleto
        FROM Actores
        WHERE TMDbId = @TMDbId
          AND Id <> @ActorId
      `);

    if (tmdbOcupado.recordset.length > 0) {
      return res.status(409).json({
        mensaje:
          "Este perfil de TMDb ya está vinculado con otro actor de CineRD",
        actor: tmdbOcupado.recordset[0],
      });
    }

    const resultado = await pool
      .request()
      .input("ActorId", sql.Int, actorId)
      .input("TMDbId", sql.Int, tmdbId)
      .query(`
        UPDATE Actores
        SET TMDbId = @TMDbId
        OUTPUT
          INSERTED.Id,
          INSERTED.TMDbId,
          INSERTED.NombreCompleto
        WHERE Id = @ActorId
      `);

    if (resultado.recordset.length === 0) {
      return res.status(404).json({
        mensaje: "Actor no encontrado",
      });
    }

    res.json({
      mensaje:
        "Actor vinculado correctamente con TMDb",
      actor: resultado.recordset[0],
    });
  } catch (error) {
    console.error(
      "Error al vincular actor con TMDb:",
      error,
    );

    res.status(500).json({
      mensaje:
        "No fue posible vincular el actor con TMDb",
      error: error.message,
    });
  }
};

module.exports = {
  buscarPeliculasTmdb,
  obtenerPeliculaTmdb,
  buscarPersonasTmdb,
  obtenerPersonaTmdb,
  obtenerRepartoTmdb,
  vincularActorConTmdb,
};