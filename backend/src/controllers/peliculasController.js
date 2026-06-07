const { sql, poolPromise } = require('../config/db');

const obtenerPeliculas = async (req, res) => {
    try {
        const pool = await poolPromise;

        const resultado = await pool.request().query(`
            SELECT Id, Titulo, Genero, Director, Productora, FechaEstreno, Foto
            FROM Peliculas
        `);

        res.json(resultado.recordset);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener las películas',
            error: error.message
        });
    }
};

const crearPelicula = async (req, res) => {
    try {
        const { Titulo, Genero, Director, Productora, FechaEstreno, Foto } = req.body;

        if (!Titulo || !Genero || !FechaEstreno) {
            return res.status(400).json({
                mensaje: 'Título, género y fecha de estreno son obligatorios'
            });
        }

        const pool = await poolPromise;

        const resultado = await pool.request()
            .input('Titulo', sql.NVarChar(150), Titulo)
            .input('Genero', sql.NVarChar(80), Genero)
            .input('Director', sql.NVarChar(150), Director || null)
            .input('Productora', sql.NVarChar(150), Productora || null)
            .input('FechaEstreno', sql.Date, FechaEstreno)
            .input('Foto', sql.NVarChar(255), Foto || null)
            .query(`
                INSERT INTO Peliculas
                (Titulo, Genero, Director, Productora, FechaEstreno, Foto)
                OUTPUT INSERTED.*
                VALUES
                (@Titulo, @Genero, @Director, @Productora, @FechaEstreno, @Foto)
            `);

        res.status(201).json({
            mensaje: 'Película registrada correctamente',
            pelicula: resultado.recordset[0]
        });

    } catch (error) {
        if (error.message.includes('UQ_Peliculas_Titulo')) {
            return res.status(400).json({
                mensaje: 'Ya existe una película con ese título'
            });
        }

        res.status(500).json({
            mensaje: 'Error al registrar la película',
            error: error.message
        });
    }
};

const actualizarPelicula = async (req, res) => {
    try {
        const { id } = req.params;
        const { Titulo, Genero, Director, Productora, FechaEstreno, Foto } = req.body;

        if (!Titulo || !Genero || !FechaEstreno) {
            return res.status(400).json({
                mensaje: 'Título, género y fecha de estreno son obligatorios'
            });
        }

        const pool = await poolPromise;

        const resultado = await pool.request()
            .input('Id', sql.Int, id)
            .input('Titulo', sql.NVarChar(150), Titulo)
            .input('Genero', sql.NVarChar(80), Genero)
            .input('Director', sql.NVarChar(150), Director || null)
            .input('Productora', sql.NVarChar(150), Productora || null)
            .input('FechaEstreno', sql.Date, FechaEstreno)
            .input('Foto', sql.NVarChar(255), Foto || null)
            .query(`
                UPDATE Peliculas
                SET Titulo = @Titulo,
                    Genero = @Genero,
                    Director = @Director,
                    Productora = @Productora,
                    FechaEstreno = @FechaEstreno,
                    Foto = @Foto
                OUTPUT INSERTED.*
                WHERE Id = @Id
            `);

        if (resultado.recordset.length === 0) {
            return res.status(404).json({
                mensaje: 'Película no encontrada'
            });
        }

        res.json({
            mensaje: 'Película actualizada correctamente',
            pelicula: resultado.recordset[0]
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al actualizar la película',
            error: error.message
        });
    }
};

const eliminarPelicula = async (req, res) => {
    try {
        const { id } = req.params;

        const pool = await poolPromise;

        // Primero eliminar relaciones de la película con actores
        await pool.request()
            .input('PeliculaId', sql.Int, id)
            .query(`
                DELETE FROM ActoresPeliculas
                WHERE PeliculaId = @PeliculaId
            `);

        // Luego eliminar la película
        const resultado = await pool.request()
            .input('Id', sql.Int, id)
            .query(`
                DELETE FROM Peliculas
                OUTPUT DELETED.*
                WHERE Id = @Id
            `);

        if (resultado.recordset.length === 0) {
            return res.status(404).json({
                mensaje: 'Película no encontrada'
            });
        }

        res.json({
            mensaje: 'Película eliminada correctamente',
            pelicula: resultado.recordset[0]
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al eliminar la película',
            error: error.message
        });
    }
};

const obtenerPeliculaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await poolPromise;

    const resultado = await pool.request()
      .input("Id", sql.Int, id)
      .query(`
        SELECT Id, Titulo, Genero, Director, Productora, FechaEstreno, Foto
        FROM Peliculas
        WHERE Id = @Id
      `);

    if (resultado.recordset.length === 0) {
      return res.status(404).json({
        mensaje: "Película no encontrada"
      });
    }

    res.json(resultado.recordset[0]);

  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener la película",
      error: error.message
    });
  }
};
module.exports = {
  obtenerPeliculas,
  obtenerPeliculaPorId,
  crearPelicula,
  actualizarPelicula,
  eliminarPelicula
};