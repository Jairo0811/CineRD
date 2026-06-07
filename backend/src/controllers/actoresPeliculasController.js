const { sql, poolPromise } = require('../config/db');

const asignarActorAPelicula = async (req, res) => {
    try {
        const { PeliculaId, ActorId, Personaje, EsPrincipal } = req.body;

        if (!PeliculaId || !ActorId) {
            return res.status(400).json({
                mensaje: 'PeliculaId y ActorId son obligatorios'
            });
        }

        const pool = await poolPromise;

        const resultado = await pool.request()
            .input('PeliculaId', sql.Int, PeliculaId)
            .input('ActorId', sql.Int, ActorId)
            .input('Personaje', sql.NVarChar(150), Personaje || null)
            .input('EsPrincipal', sql.Bit, EsPrincipal ?? false)
            .query(`
                INSERT INTO ActoresPeliculas
                (PeliculaId, ActorId, Personaje, EsPrincipal)
                OUTPUT INSERTED.*
                VALUES (@PeliculaId, @ActorId, @Personaje, @EsPrincipal)
            `);

        res.status(201).json({
            mensaje: 'Actor asignado a la película correctamente',
            relacion: resultado.recordset[0]
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al asignar actor a película',
            error: error.message
        });
    }
};

const obtenerActoresPorPelicula = async (req, res) => {
    try {
        const { peliculaId } = req.params;
        const pool = await poolPromise;

        const resultado = await pool.request()
            .input('PeliculaId', sql.Int, peliculaId)
            .query(`
                SELECT 
                    A.Id,
                    A.NombreCompleto,
                    A.NombreArtistico,
                    AP.Personaje,
                    AP.EsPrincipal,
                    A.FechaNacimiento,
                    A.Sexo,
                    A.EstaVivo,
                    A.FechaFallecimiento,
                    A.Foto
                FROM ActoresPeliculas AP
                INNER JOIN Actores A ON AP.ActorId = A.Id
                WHERE AP.PeliculaId = @PeliculaId
            `);

        res.json(resultado.recordset);

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener actores de la película',
            error: error.message
        });
    }
};

const obtenerPeliculasPorActor = async (req, res) => {
    try {
        const { actorId } = req.params;
        const pool = await poolPromise;

        const resultado = await pool.request()
            .input('ActorId', sql.Int, actorId)
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
                    AP.EsPrincipal
                FROM ActoresPeliculas AP
                INNER JOIN Peliculas P ON AP.PeliculaId = P.Id
                WHERE AP.ActorId = @ActorId
            `);

        res.json(resultado.recordset);

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener películas del actor',
            error: error.message
        });
    }
};

const eliminarActorDePelicula = async (req, res) => {
    try {
        const { peliculaId, actorId } = req.params;
        const pool = await poolPromise;

        const resultado = await pool.request()
            .input('PeliculaId', sql.Int, peliculaId)
            .input('ActorId', sql.Int, actorId)
            .query(`
                DELETE FROM ActoresPeliculas
                OUTPUT DELETED.*
                WHERE PeliculaId = @PeliculaId
                  AND ActorId = @ActorId
            `);

        if (resultado.recordset.length === 0) {
            return res.status(404).json({
                mensaje: 'Relación no encontrada'
            });
        }

        res.json({
            mensaje: 'Actor removido de la película correctamente',
            relacion: resultado.recordset[0]
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al remover actor de película',
            error: error.message
        });
    }
};

module.exports = {
    asignarActorAPelicula,
    obtenerActoresPorPelicula,
    obtenerPeliculasPorActor,
    eliminarActorDePelicula
};