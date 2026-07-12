const { sql, poolPromise } = require("../config/db");

const asignarActorAPelicula = async (req, res) => {
  try {
    const {
      PeliculaId,
      ActorId,
      Personaje,
      TipoParticipacion = "Secundario",
    } = req.body;

    if (!PeliculaId || !ActorId) {
      return res.status(400).json({
        mensaje: "PeliculaId y ActorId son obligatorios",
      });
    }

    const esPrincipal = TipoParticipacion === "Principal";

    const pool = await poolPromise;

    const resultado = await pool
      .request()
      .input("PeliculaId", sql.Int, PeliculaId)
      .input("ActorId", sql.Int, ActorId)
      .input("Personaje", sql.NVarChar(150), Personaje || null)
      .input("EsPrincipal", sql.Bit, esPrincipal)
      .input("TipoParticipacion", sql.NVarChar(50), TipoParticipacion)
      .query(`
        INSERT INTO ActoresPeliculas
        (
          PeliculaId,
          ActorId,
          Personaje,
          EsPrincipal,
          TipoParticipacion
        )
        OUTPUT INSERTED.*
        VALUES
        (
          @PeliculaId,
          @ActorId,
          @Personaje,
          @EsPrincipal,
          @TipoParticipacion
        )
      `);

    res.status(201).json({
      mensaje: "Actor asignado a la película correctamente",
      relacion: resultado.recordset[0],
    });
  } catch (error) {
    if (
      error.message.includes("PRIMARY KEY") ||
      error.message.includes("duplicate")
    ) {
      return res.status(400).json({
        mensaje: "Este actor ya pertenece al reparto de esta película",
      });
    }

    res.status(500).json({
      mensaje: "Error al asignar actor a película",
      error: error.message,
    });
  }
};

const obtenerActoresPorPelicula = async (req, res) => {
  try {
    const { peliculaId } = req.params;
    const pool = await poolPromise;

    const resultado = await pool
      .request()
      .input("PeliculaId", sql.Int, peliculaId)
      .query(`
        SELECT 
          A.Id,
          A.NombreCompleto,
          A.NombreArtistico,
          A.Profesion,
          AP.Personaje,
          AP.EsPrincipal,
          AP.TipoParticipacion,
          A.FechaNacimiento,
          A.Sexo,
          A.EstaVivo,
          A.FechaFallecimiento,
          A.Foto
        FROM ActoresPeliculas AP
        INNER JOIN Actores A ON AP.ActorId = A.Id
        WHERE AP.PeliculaId = @PeliculaId
        ORDER BY
CASE
    WHEN AP.TipoParticipacion='Principal' THEN 1
    WHEN AP.TipoParticipacion='Secundario' THEN 2
    WHEN AP.TipoParticipacion='Reparto' THEN 3
    WHEN AP.TipoParticipacion='Cameo' THEN 4
    WHEN AP.TipoParticipacion='Especial' THEN 5
    WHEN AP.TipoParticipacion='Flashback' THEN 6
    WHEN AP.TipoParticipacion='Flashforward' THEN 7
    WHEN AP.TipoParticipacion='Versión joven' THEN 8
    WHEN AP.TipoParticipacion='Versión adulta' THEN 9
    WHEN AP.TipoParticipacion='Versión anciana' THEN 10
    WHEN AP.TipoParticipacion='Niño(a)' THEN 11
    WHEN AP.TipoParticipacion='Voz' THEN 12
    WHEN AP.TipoParticipacion='Narrador' THEN 13
    WHEN AP.TipoParticipacion='Archivo' THEN 14
    WHEN AP.TipoParticipacion='Fotografía' THEN 15
    WHEN AP.TipoParticipacion='Escena postcréditos' THEN 16
    WHEN AP.TipoParticipacion='Sin acreditar' THEN 17
    ELSE 18
END,
A.NombreCompleto ASC
      `);

    res.json(resultado.recordset);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener actores de la película",
      error: error.message,
    });
  }
};

const obtenerPeliculasPorActor = async (req, res) => {
  try {
    const { actorId } = req.params;
    const pool = await poolPromise;

    const resultado = await pool
      .request()
      .input("ActorId", sql.Int, actorId)
      .query(`
        SELECT
          P.Id,
          P.Titulo,
          P.Genero,
          P.Director,
          P.Productora,
          P.FechaEstreno,
          P.Foto,
          AP.Personaje,
          AP.EsPrincipal,
          AP.TipoParticipacion
        FROM ActoresPeliculas AP
        INNER JOIN Peliculas P ON AP.PeliculaId = P.Id
        WHERE AP.ActorId = @ActorId
        ORDER BY P.FechaEstreno DESC
      `);

    res.json(resultado.recordset);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener películas del actor",
      error: error.message,
    });
  }
};

const eliminarActorDePelicula = async (req, res) => {
  try {
    const { peliculaId, actorId } = req.params;
    const pool = await poolPromise;

    const resultado = await pool
      .request()
      .input("PeliculaId", sql.Int, peliculaId)
      .input("ActorId", sql.Int, actorId)
      .query(`
        DELETE FROM ActoresPeliculas
        OUTPUT DELETED.*
        WHERE PeliculaId = @PeliculaId
          AND ActorId = @ActorId
      `);

    if (resultado.recordset.length === 0) {
      return res.status(404).json({
        mensaje: "Relación no encontrada",
      });
    }

    res.json({
      mensaje: "Actor removido de la película correctamente",
      relacion: resultado.recordset[0],
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al remover actor de película",
      error: error.message,
    });
  }
};

const actualizarParticipacion = async (req, res) => {
  try {

    const { peliculaId, actorId } = req.params;

    const {
      Personaje,
      TipoParticipacion
    } = req.body;

    const esPrincipal = TipoParticipacion === "Principal";

    const pool = await poolPromise;

    const resultado = await pool.request()

      .input("PeliculaId", sql.Int, peliculaId)
      .input("ActorId", sql.Int, actorId)
      .input("Personaje", sql.NVarChar(150), Personaje || null)
      .input("EsPrincipal", sql.Bit, esPrincipal)
      .input("TipoParticipacion", sql.NVarChar(50), TipoParticipacion)

      .query(`
        UPDATE ActoresPeliculas
        SET

            Personaje=@Personaje,
            EsPrincipal=@EsPrincipal,
            TipoParticipacion=@TipoParticipacion

        OUTPUT INSERTED.*

        WHERE

            PeliculaId=@PeliculaId
            AND ActorId=@ActorId
      `);

    if (resultado.recordset.length === 0) {
      return res.status(404).json({
        mensaje: "Participación no encontrada"
      });
    }

    res.json({
      mensaje: "Participación actualizada correctamente",
      participacion: resultado.recordset[0]
    });

  } catch (error) {

    res.status(500).json({
      mensaje: "Error al actualizar participación",
      error: error.message
    });

  }
};

module.exports = {
  asignarActorAPelicula,
  obtenerActoresPorPelicula,
  obtenerPeliculasPorActor,
  actualizarParticipacion,
  eliminarActorDePelicula,
};