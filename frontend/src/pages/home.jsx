import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
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

const COLORES_GRAFICOS = [
  "#0057B8",
  "#CE1126",
  "#F4B400",
  "#198754",
  "#6F42C1",
  "#FD7E14",
  "#1F2937",
  "#6C757D",
];

function Home() {
  const [actores, setActores] = useState([]);
  const [peliculas, setPeliculas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);

      const [actoresRes, peliculasRes] = await Promise.all([
        api.get("/actores"),
        api.get("/peliculas"),
      ]);

      setActores(actoresRes.data || []);
      setPeliculas(peliculasRes.data || []);
    } catch (error) {
      console.error("Error al cargar el dashboard:", error);
    } finally {
      setCargando(false);
    }
  };

  const estadisticas = useMemo(() => {
    const actoresVivos = actores.filter((actor) =>
      Boolean(actor.EstaVivo),
    ).length;

    const actoresFallecidos = actores.length - actoresVivos;

    const totalDirectores = actores.filter((actor) =>
      actor.Profesion?.includes("Director"),
    ).length;

    const totalProductores = actores.filter((actor) =>
      actor.Profesion?.includes("Productor"),
    ).length;

    const totalGuionistas = actores.filter((actor) =>
      actor.Profesion?.includes("Guionista"),
    ).length;

    const totalRepartos = peliculas.reduce(
      (total, pelicula) => total + Number(pelicula.CantidadActores || 0),
      0,
    );

    const peliculasConReparto = peliculas.filter(
      (pelicula) => Number(pelicula.CantidadActores || 0) > 0,
    ).length;

    return {
      actoresVivos,
      actoresFallecidos,
      totalDirectores,
      totalProductores,
      totalGuionistas,
      totalRepartos,
      peliculasConReparto,
    };
  }, [actores, peliculas]);

  const ultimasPeliculas = useMemo(
    () =>
      [...peliculas].sort((a, b) => Number(b.Id) - Number(a.Id)).slice(0, 5),
    [peliculas],
  );

  const ultimosActores = useMemo(
    () => [...actores].sort((a, b) => Number(b.Id) - Number(a.Id)).slice(0, 5),
    [actores],
  );

  const actoresConMasPeliculas = useMemo(
    () =>
      [...actores]
        .sort(
          (a, b) =>
            Number(b.CantidadPeliculas || 0) - Number(a.CantidadPeliculas || 0),
        )
        .slice(0, 5),
    [actores],
  );

  const peliculasConMasActores = useMemo(
    () =>
      [...peliculas]
        .sort(
          (a, b) =>
            Number(b.CantidadActores || 0) - Number(a.CantidadActores || 0),
        )
        .slice(0, 10),
    [peliculas],
  );

  const generos = useMemo(
    () =>
      peliculas.reduce((acumulador, pelicula) => {
        const genero = pelicula.Genero || "Sin género";

        acumulador[genero] = (acumulador[genero] || 0) + 1;

        return acumulador;
      }, {}),
    [peliculas],
  );

  const profesiones = useMemo(() => {
    const acumulador = {};

    actores.forEach((actor) => {
      if (!actor.Profesion) {
        acumulador["Sin profesión"] = (acumulador["Sin profesión"] || 0) + 1;

        return;
      }

      actor.Profesion.split("/")
        .map((profesion) => profesion.trim())
        .filter(Boolean)
        .forEach((profesion) => {
          acumulador[profesion] = (acumulador[profesion] || 0) + 1;
        });
    });

    return acumulador;
  }, [actores]);

  const estrenosPorAnio = useMemo(
    () =>
      peliculas.reduce((acumulador, pelicula) => {
        if (!pelicula.FechaEstreno) {
          return acumulador;
        }

        const anio = pelicula.FechaEstreno.substring(0, 4);

        acumulador[anio] = (acumulador[anio] || 0) + 1;

        return acumulador;
      }, {}),
    [peliculas],
  );

  const datosGeneros = {
    labels: Object.keys(generos),
    datasets: [
      {
        label: "Películas",
        data: Object.values(generos),
        backgroundColor: COLORES_GRAFICOS,
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  const datosProfesiones = {
    labels: Object.keys(profesiones),
    datasets: [
      {
        label: "Talentos",
        data: Object.values(profesiones),
        backgroundColor: COLORES_GRAFICOS,
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  const aniosOrdenados = Object.keys(estrenosPorAnio).sort();

  const datosEstrenos = {
    labels: aniosOrdenados,
    datasets: [
      {
        label: "Estrenos",
        data: aniosOrdenados.map((anio) => estrenosPorAnio[anio]),
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
        backgroundColor: "#0057B8",
        borderColor: "#CE1126",
        borderWidth: 2,
      },
    ],
  };

  const opcionesGrafico = {
    responsive: true,
    maintainAspectRatio: false,
  };

  const tarjetas = [
    {
      icono: "🎬",
      valor: peliculas.length,
      texto: "Películas",
      enlace: "/peliculas",
    },
    {
      icono: "🎭",
      valor: actores.length,
      texto: "Actores",
      enlace: "/actores",
    },
    {
      icono: "👥",
      valor: estadisticas.totalRepartos,
      texto: "Participaciones",
    },
    {
      icono: "🎞️",
      valor: estadisticas.peliculasConReparto,
      texto: "Películas con reparto",
    },
    {
      icono: "🟢",
      valor: estadisticas.actoresVivos,
      texto: "Actores vivos",
    },
    {
      icono: "⚰️",
      valor: estadisticas.actoresFallecidos,
      texto: "Actores fallecidos",
    },
    {
      icono: "🎬",
      valor: estadisticas.totalDirectores,
      texto: "Directores",
    },
    {
      icono: "🎥",
      valor: estadisticas.totalProductores,
      texto: "Productores",
    },
    {
      icono: "✍️",
      valor: estadisticas.totalGuionistas,
      texto: "Guionistas",
    },
  ];

  if (cargando) {
    return (
      <div className="dashboard-loading">
        <div className="spinner-border text-primary" role="status" />

        <p className="mt-3 mb-0">Cargando información de CineRD...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <section className="dashboard-hero">
        <div>
          <span className="dashboard-eyebrow">
            Catálogo del cine dominicano
          </span>

          <h1>Bienvenido a CineRD</h1>

          <p>
            Administra películas, actores, directores y repartos desde un solo
            lugar.
          </p>
        </div>

        <img
          src="/logo.png"
          alt="Logo de CineRD"
          className="dashboard-hero-logo"
        />
      </section>

      <section className="dashboard-actions">
        <Link to="/peliculas/nueva" className="dashboard-action-primary">
          <span>➕</span>

          <div>
            <strong>Nueva película</strong>
            <small>Registrar o importar desde TMDb</small>
          </div>
        </Link>

        <Link to="/actores/nuevo" className="dashboard-action-secondary">
          <span>🎭</span>

          <div>
            <strong>Nuevo actor</strong>
            <small>Agregar un nuevo talento</small>
          </div>
        </Link>

        <Link to="/peliculas" className="dashboard-action-secondary">
          <span>🔎</span>

          <div>
            <strong>Explorar catálogo</strong>
            <small>Consultar películas registradas</small>
          </div>
        </Link>
      </section>

      <section className="dashboard-stat-grid">
        {tarjetas.map((tarjeta) => {
          const contenido = (
            <>
              <span className="dashboard-stat-icon">{tarjeta.icono}</span>

              <strong className="dashboard-stat-value">{tarjeta.valor}</strong>

              <span className="dashboard-stat-label">{tarjeta.texto}</span>
            </>
          );

          return tarjeta.enlace ? (
            <Link
              to={tarjeta.enlace}
              className="dashboard-stat-card dashboard-stat-link"
              key={tarjeta.texto}
            >
              {contenido}
            </Link>
          ) : (
            <article className="dashboard-stat-card" key={tarjeta.texto}>
              {contenido}
            </article>
          );
        })}
      </section>

      <section className="row g-4 mb-4">
        <div className="col-12 col-xl-5">
          <div className="dashboard-panel h-100">
            <div className="dashboard-panel-header">
              <div>
                <span className="dashboard-panel-eyebrow">Talentos</span>

                <h2>Actores con más participaciones</h2>
              </div>

              <Link to="/actores">Ver todos</Link>
            </div>

            <div className="dashboard-list">
              {actoresConMasPeliculas.map((actor, indice) => (
                <Link
                  to={`/actores/${actor.Id}`}
                  className="dashboard-list-item"
                  key={actor.Id}
                >
                  <span className="dashboard-list-position">{indice + 1}</span>

                  <div className="dashboard-list-content">
                    <strong>{actor.NombreCompleto}</strong>
                    <small>{actor.Profesion || "Sin profesión"}</small>
                  </div>

                  <span className="dashboard-list-total">
                    {actor.CantidadPeliculas || 0}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-7">
          <div className="dashboard-panel h-100">
            <div className="dashboard-panel-header">
              <div>
                <span className="dashboard-panel-eyebrow">Producciones</span>

                <h2>Películas con más actores</h2>
              </div>
            </div>

            <div className="dashboard-chart dashboard-chart-bar">
              <Bar data={datosTopPeliculas} options={opcionesGrafico} />
            </div>
          </div>
        </div>
      </section>

      <section className="row g-4 mb-4">
        <div className="col-12 col-lg-6">
          <div className="dashboard-panel h-100">
            <div className="dashboard-panel-header">
              <div>
                <span className="dashboard-panel-eyebrow">Catálogo</span>

                <h2>Distribución por género</h2>
              </div>
            </div>

            <div className="dashboard-chart dashboard-chart-pie">
              <Pie data={datosGeneros} options={opcionesGrafico} />
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="dashboard-panel h-100">
            <div className="dashboard-panel-header">
              <div>
                <span className="dashboard-panel-eyebrow">Cronología</span>

                <h2>Estrenos por año</h2>
              </div>
            </div>

            <div className="dashboard-chart dashboard-chart-bar">
              <Bar data={datosEstrenos} options={opcionesGrafico} />
            </div>
          </div>
        </div>
      </section>

      <section className="row g-4 mb-4">
        <div className="col-12 col-lg-6">
          <div className="dashboard-panel h-100">
            <div className="dashboard-panel-header">
              <div>
                <span className="dashboard-panel-eyebrow">Profesiones</span>

                <h2>Distribución de talentos</h2>
              </div>
            </div>

            <div className="dashboard-chart dashboard-chart-pie">
              <Pie data={datosProfesiones} options={opcionesGrafico} />
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="dashboard-panel h-100">
            <div className="dashboard-panel-header">
              <div>
                <span className="dashboard-panel-eyebrow">Resumen</span>

                <h2>Profesiones registradas</h2>
              </div>
            </div>

            <div className="dashboard-list dashboard-list-compact">
              {Object.entries(profesiones)
                .sort((a, b) => b[1] - a[1])
                .map(([profesion, total]) => (
                  <div className="dashboard-list-item" key={profesion}>
                    <div className="dashboard-list-content">
                      <strong>{profesion}</strong>
                    </div>

                    <span className="dashboard-list-total">{total}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      <section className="row g-4">
        <div className="col-12 col-lg-6">
          <div className="dashboard-panel h-100">
            <div className="dashboard-panel-header">
              <div>
                <span className="dashboard-panel-eyebrow">Recientes</span>

                <h2>Últimas películas</h2>
              </div>

              <Link to="/peliculas">Ver todas</Link>
            </div>

            <div className="dashboard-list">
              {ultimasPeliculas.map((pelicula) => (
                <div className="dashboard-list-item" key={pelicula.Id}>
                  <div className="dashboard-list-content">
                    <strong>{pelicula.Titulo}</strong>
                    <small>{pelicula.Genero || "Sin género"}</small>
                  </div>

                  <span className="dashboard-list-total">
                    {pelicula.CantidadActores || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="dashboard-panel h-100">
            <div className="dashboard-panel-header">
              <div>
                <span className="dashboard-panel-eyebrow">Recientes</span>

                <h2>Últimos actores</h2>
              </div>

              <Link to="/actores">Ver todos</Link>
            </div>

            <div className="dashboard-list">
              {ultimosActores.map((actor) => (
                <Link
                  to={`/actores/${actor.Id}`}
                  className="dashboard-list-item"
                  key={actor.Id}
                >
                  <div className="dashboard-list-content">
                    <strong>{actor.NombreCompleto}</strong>
                    <small>{actor.Profesion || "Sin profesión"}</small>
                  </div>

                  <span className="dashboard-list-arrow">→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
