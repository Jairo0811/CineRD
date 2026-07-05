import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import api from "../services/api";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
);

function Home() {
  const [actores, setActores] = useState([]);
  const [peliculas, setPeliculas] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [actoresRes, peliculasRes] = await Promise.all([
        api.get("/actores"),
        api.get("/peliculas"),
      ]);

      setActores(actoresRes.data);
      setPeliculas(peliculasRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  const actoresVivos = actores.filter((actor) => actor.EstaVivo).length;
  const actoresFallecidos = actores.length - actoresVivos;

  const totalRepartos = peliculas.reduce(
    (total, pelicula) => total + (pelicula.CantidadActores || 0),
    0,
  );

  const ultimasPeliculas = [...peliculas]
    .sort((a, b) => b.Id - a.Id)
    .slice(0, 5);

  const ultimosActores = [...actores].sort((a, b) => b.Id - a.Id).slice(0, 5);

  const actoresConMasPeliculas = [...actores]
    .sort((a, b) => (b.CantidadPeliculas || 0) - (a.CantidadPeliculas || 0))
    .slice(0, 5);

  const peliculasConMasActores = [...peliculas]
    .sort((a, b) => (b.CantidadActores || 0) - (a.CantidadActores || 0))
    .slice(0, 10);

  const generos = peliculas.reduce((acc, pelicula) => {
    const genero = pelicula.Genero || "Sin género";
    acc[genero] = (acc[genero] || 0) + 1;
    return acc;
  }, {});

  const estrenosPorAnio = peliculas.reduce((acc, pelicula) => {
    if (!pelicula.FechaEstreno) return acc;

    const anio = pelicula.FechaEstreno.substring(0, 4);
    acc[anio] = (acc[anio] || 0) + 1;

    return acc;
  }, {});

  const datosGeneros = {
    labels: Object.keys(generos),
    datasets: [
      {
        label: "Películas",
        data: Object.values(generos),
        backgroundColor: [
          "#0057B8",
          "#CE1126",
          "#F4B400",
          "#1F2937",
          "#6C757D",
        ],
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  const datosEstrenos = {
    labels: Object.keys(estrenosPorAnio).sort(),
    datasets: [
      {
        label: "Estrenos",
        data: Object.keys(estrenosPorAnio)
          .sort()
          .map((anio) => estrenosPorAnio[anio]),
        backgroundColor: "#0057B8",
        borderColor: "#CE1126",
        borderWidth: 2,
      },
    ],
  };

  const datosTopPeliculas = {
    labels: peliculasConMasActores.map((pelicula) => pelicula.Titulo),
    datasets: [
      {
        label: "Actores",
        data: peliculasConMasActores.map(
          (pelicula) => pelicula.CantidadActores || 0,
        ),
        backgroundColor: "#CE1126",
        borderColor: "#0057B8",
        borderWidth: 2,
      },
    ],
  };

  const peliculasConReparto = peliculas.filter(
    (pelicula) => (pelicula.CantidadActores || 0) > 0,
  ).length;

  return (
    <div className="dashboard-container">
      <div className="text-center mb-5">
        <img src="/logo.png" alt="CineRD" className="home-logo" />
      </div>

      <div className="row g-4 mb-5">
        <div className="col-12 col-md-4">
          <div className="dashboard-card">
            <h2>🎬</h2>
            <h3>{peliculas.length}</h3>
            <p>Películas</p>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="dashboard-card">
            <h2>🎭</h2>
            <h3>{actores.length}</h3>
            <p>Actores</p>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="dashboard-card">
            <h2>👥</h2>
            <h3>{totalRepartos}</h3>
            <p>Repartos</p>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="dashboard-card">
            <h2>🎞️</h2>
            <h3>{peliculasConReparto}</h3>
            <p>Películas con reparto</p>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="dashboard-card">
            <h2>🟢</h2>
            <h3>{actoresVivos}</h3>
            <p>Actores vivos</p>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="dashboard-card">
            <h2>⚰️</h2>
            <h3>{actoresFallecidos}</h3>
            <p>Actores fallecidos</p>
          </div>
        </div>
      </div>

      <div className="quick-actions mb-5">
        <Link to="/peliculas" className="btn btn-primary">
          🎬 Ver Películas
        </Link>

        <Link to="/actores" className="btn btn-success">
          🎭 Ver Actores
        </Link>

        <Link to="/peliculas/nueva" className="btn btn-outline-primary">
          ➕ Nueva Película
        </Link>

        <Link to="/actores/nuevo" className="btn btn-outline-success">
          ➕ Nuevo Actor
        </Link>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-12 col-lg-6">
          <div className="card shadow h-100">
            <div className="card-header fw-bold">
              🎬 Últimas películas agregadas
            </div>

            <div className="card-body">
              {ultimasPeliculas.map((pelicula) => (
                <div className="dashboard-list-item" key={pelicula.Id}>
                  <span>{pelicula.Titulo}</span>
                  <small>{pelicula.Genero}</small>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card shadow h-100">
            <div className="card-header fw-bold">
              🎭 Últimos actores registrados
            </div>

            <div className="card-body">
              {ultimosActores.map((actor) => (
                <div className="dashboard-list-item" key={actor.Id}>
                  <span>{actor.NombreCompleto}</span>
                  <small>
                    {actor.NombreArtistico || "Sin nombre artístico"}
                  </small>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-12 col-lg-6">
          <div className="card shadow h-100">
            <div className="card-header fw-bold">
              ⭐ Actores con más participaciones
            </div>

            <div className="card-body">
              {actoresConMasPeliculas.map((actor) => (
                <div className="dashboard-list-item" key={actor.Id}>
                  <span>{actor.NombreCompleto}</span>
                  <small>{actor.CantidadPeliculas || 0} película(s)</small>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card shadow h-100">
            <div className="card-header fw-bold">
              🏆 Top películas con más actores
            </div>

            <div className="card-body">
              <Bar data={datosTopPeliculas} />
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-12 col-lg-6">
          <div className="card shadow h-100">
            <div className="card-header fw-bold">
              📈 Distribución por género
            </div>

            <div className="card-body chart-container">
              <Pie data={datosGeneros} />
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card shadow h-100">
            <div className="card-header fw-bold">📅 Estrenos por año</div>

            <div className="card-body">
              <Bar data={datosEstrenos} />
            </div>
          </div>
        </div>
      </div>

      <footer className="text-center mt-5 text-muted">
        <small>
          © {new Date().getFullYear()} CineRD | Todos los derechos reservados.
          <br />
        </small>
      </footer>
    </div>
  );
}

export default Home;
