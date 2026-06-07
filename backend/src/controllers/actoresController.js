const { sql, poolPromise } = require('../config/db');

const obtenerActores = async (req, res) => {
    try {
        const pool = await poolPromise;

        const resultado = await pool.request().query(`
            SELECT
                Id,
                NombreCompleto,
                NombreArtistico,
                FechaNacimiento,
                Sexo,
                EstaVivo,
                FechaFallecimiento,
                Foto
            FROM Actores
        `);

        res.json(resultado.recordset);

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener los actores',
            error: error.message
        });
    }
};

const obtenerActorPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const pool = await poolPromise;

        const resultado = await pool.request()
            .input('Id', sql.Int, id)
            .query(`
                SELECT
                    Id,
                    NombreCompleto,
                    NombreArtistico,
                    FechaNacimiento,
                    Sexo,
                    EstaVivo,
                    FechaFallecimiento,
                    Foto
                FROM Actores
                WHERE Id = @Id
            `);

        if (resultado.recordset.length === 0) {
            return res.status(404).json({
                mensaje: 'Actor no encontrado'
            });
        }

        res.json(resultado.recordset[0]);

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener el actor',
            error: error.message
        });
    }
};

const crearActor = async (req, res) => {
    try {
        const {
            NombreCompleto,
            NombreArtistico,
            FechaNacimiento,
            Sexo,
            EstaVivo,
            FechaFallecimiento,
            Foto
        } = req.body;

        if (!NombreCompleto || !FechaNacimiento || !Sexo) {
            return res.status(400).json({
                mensaje: 'Nombre completo, fecha de nacimiento y sexo son obligatorios'
            });
        }

        const pool = await poolPromise;

        const resultado = await pool.request()
            .input('NombreCompleto', sql.NVarChar(150), NombreCompleto)
            .input('NombreArtistico', sql.NVarChar(150), NombreArtistico || null)
            .input('FechaNacimiento', sql.Date, FechaNacimiento)
            .input('Sexo', sql.NVarChar(20), Sexo)
            .input('EstaVivo', sql.Bit, EstaVivo ?? true)
            .input('FechaFallecimiento', sql.Date, FechaFallecimiento || null)
            .input('Foto', sql.NVarChar(255), Foto || null)
            .query(`
                INSERT INTO Actores
                (
                    NombreCompleto,
                    NombreArtistico,
                    FechaNacimiento,
                    Sexo,
                    EstaVivo,
                    FechaFallecimiento,
                    Foto
                )
                OUTPUT INSERTED.*
                VALUES
                (
                    @NombreCompleto,
                    @NombreArtistico,
                    @FechaNacimiento,
                    @Sexo,
                    @EstaVivo,
                    @FechaFallecimiento,
                    @Foto
                )
            `);

        res.status(201).json({
            mensaje: 'Actor registrado correctamente',
            actor: resultado.recordset[0]
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al registrar el actor',
            error: error.message
        });
    }
};

const actualizarActor = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            NombreCompleto,
            NombreArtistico,
            FechaNacimiento,
            Sexo,
            EstaVivo,
            FechaFallecimiento,
            Foto
        } = req.body;

        const pool = await poolPromise;

        const resultado = await pool.request()
            .input('Id', sql.Int, id)
            .input('NombreCompleto', sql.NVarChar(150), NombreCompleto)
            .input('NombreArtistico', sql.NVarChar(150), NombreArtistico || null)
            .input('FechaNacimiento', sql.Date, FechaNacimiento)
            .input('Sexo', sql.NVarChar(20), Sexo)
            .input('EstaVivo', sql.Bit, EstaVivo)
            .input('FechaFallecimiento', sql.Date, FechaFallecimiento || null)
            .input('Foto', sql.NVarChar(255), Foto || null)
            .query(`
                UPDATE Actores
                SET
                    NombreCompleto = @NombreCompleto,
                    NombreArtistico = @NombreArtistico,
                    FechaNacimiento = @FechaNacimiento,
                    Sexo = @Sexo,
                    EstaVivo = @EstaVivo,
                    FechaFallecimiento = @FechaFallecimiento,
                    Foto = @Foto
                OUTPUT INSERTED.*
                WHERE Id = @Id
            `);

        if (resultado.recordset.length === 0) {
            return res.status(404).json({
                mensaje: 'Actor no encontrado'
            });
        }

        res.json({
            mensaje: 'Actor actualizado correctamente',
            actor: resultado.recordset[0]
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al actualizar el actor',
            error: error.message
        });
    }
};

const eliminarActor = async (req, res) => {
    try {
        const { id } = req.params;

        const pool = await poolPromise;

        await pool.request()
            .input('ActorId', sql.Int, id)
            .query(`
                DELETE FROM ActoresPeliculas
                WHERE ActorId = @ActorId
            `);

        const resultado = await pool.request()
            .input('Id', sql.Int, id)
            .query(`
                DELETE FROM Actores
                OUTPUT DELETED.*
                WHERE Id = @Id
            `);

        if (resultado.recordset.length === 0) {
            return res.status(404).json({
                mensaje: 'Actor no encontrado'
            });
        }

        res.json({
            mensaje: 'Actor eliminado correctamente',
            actor: resultado.recordset[0]
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al eliminar el actor',
            error: error.message
        });
    }
};

module.exports = {
    obtenerActores,
    obtenerActorPorId,
    crearActor,
    actualizarActor,
    eliminarActor
};