const express = require('express');
const cors = require('cors');

const actoresRoutes = require('./routes/actoresRoutes');
const peliculasRoutes = require('./routes/peliculasRoutes');
const actoresPeliculasRoutes = require('./routes/actoresPeliculasRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Servir imágenes subidas
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
    res.json({
        mensaje: 'API CRUD de Películas funcionando correctamente'
    });
});

app.use('/api/actores', actoresRoutes);
app.use('/api/peliculas', peliculasRoutes);
app.use('/api/actores-peliculas', actoresPeliculasRoutes);

module.exports = app;