import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import { formatearFecha } from "../utils/fechas";

const API_URL = "http://localhost:3000";

function PerfilPelicula() {
  const { id } = useParams();

  const [pelicula, setPelicula] = useState(null);
  const [reparto, setReparto] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        setCargando(true);
        setError("");

        const [peliculaResponse, repartoResponse] = await Promise.all([
          api.get(`/peliculas/${id}`),
          api.get(`/actores-peliculas/pelicula/${id}`),
        ]);

        setPelicula(peliculaResponse.data);
        setReparto(repartoResponse.data || []);
      } catch (requestError) {
        console.error(requestError);
        setError(
          requestError.response?.data?.mensaje ||
            "No fue posible cargar el perfil de la película.",
        );
      } finally {
        setCargando(false);
      }
    };

    cargarPerfil();
  }, [id]);

  const repartoOrdenado = useMemo(
    () =>
      [...reparto].sort((a, b) => {
        const prioridad = {
          Principal: 1,
          Secundario: 2,
          Reparto: 3,
          Cameo: 4,
          Flashback: 5,
        };

        return (
          (prioridad[a.TipoParticipacion] || 99) -
          (prioridad[b.TipoParticipacion] || 99)
        );
      }),
    [reparto],
  );

  if (cargando) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="text-muted mt-3 mb-0">Cargando película...</p>
      </div>
    );
  }

  if (error || !pelicula) {
    return (
      <div className="text-center py-5">
        <div className="alert alert-danger">{error || "Película no encontrada"}</div>
        <Link to="/peliculas" className="btn btn-primary">
          Volver a películas
        </Link>
      </div>
    );
  }

  return (
    <div className="table-page-container">
      <div className="d-flex flex-wrap gap-2 mb-4">
        <Link to="/peliculas" className="btn btn-secondary">
          ← Volver a películas
        </Link>

        <Link
          to={`/peliculas/editar/${pelicula.Id}`}
          className="btn btn-warning"
        >
          ✏️ Editar película
        </Link>

        <Link
          to={`/peliculas/${pelicula.Id}/reparto`}
          className="btn btn-primary"
        >
          👥 Administrar reparto
        </Link>
      </div>

      <section className="card shadow overflow-hidden mb-4">
        <div className="card-body p-4 p-lg-5">
          <div className="row g-4 align-items-center">
            <div className="col-12 col-md-4 col-lg-3 text-center">
              {pelicula.Foto ? (
                <img
                  src={`${API_URL}${pelicula.Foto}`}
                  alt={`Póster de ${pelicula.Titulo}`}
                  className="img-fluid rounded-4 shadow"
                  style={{ maxHeight: "420px", objectFit: "cover" }}
                />
              ) : (
                <div
                  className="bg-light border rounded-4 d-grid place-items-center mx-auto"
                  style={{ maxWidth: "280px", minHeight: "390px" }}
                >
                  <span style={{ fontSize: "4rem" }}>🎬</span>
                </div>
              )}
            </div>

            <div className="col-12 col-md-8 col-lg-9">
              <span className="badge bg-primary mb-3">
                Cine dominicano
              </span>

              <h1 className="display-5 fw-bold mb-3">{pelicula.Titulo}</h1>

              <div className="d-flex flex-wrap gap-2 mb-4">
                <span className="badge bg-secondary">
                  🎭 {pelicula.Genero || "Sin género"}
                </span>

                <span className="badge bg-light text-dark border">
                  📅 {pelicula.FechaEstreno
                    ? formatearFecha(pelicula.FechaEstreno)
                    : "Sin fecha"}
                </span>

                <span className="badge bg-light text-dark border">
                  👥 {reparto.length} integrante(s) del reparto
                </span>

                {pelicula.TMDbId && (
                  <span className="badge bg-success">
                    TMDb #{pelicula.TMDbId}
                  </span>
                )}
              </div>

              <dl className="row mb-0">
                <dt className="col-sm-3">Director</dt>
                <dd className="col-sm-9">
                  {pelicula.Director || "No registrado"}
                </dd>

                <dt className="col-sm-3">Productora</dt>
                <dd className="col-sm-9">
                  {pelicula.Productora || "No registrada"}
                </dd>

                <dt className="col-sm-3">Género</dt>
                <dd className="col-sm-9">
                  {pelicula.Genero || "No registrado"}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </section>

      <section className="card shadow">
        <div className="card-header bg-white d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 p-3">
          <div>
            <h2 className="h5 fw-bold mb-1">🎭 Reparto</h2>
            <p className="text-muted small mb-0">
              Talentos y personajes registrados en CineRD.
            </p>
          </div>

          <Link
            to={`/peliculas/${pelicula.Id}/reparto`}
            className="btn btn-outline-primary btn-sm"
          >
            Gestionar reparto
          </Link>
        </div>

        <div className="card-body">
          {repartoOrdenado.length === 0 ? (
            <div className="text-center py-5">
              <div className="fs-1 mb-2">🎭</div>
              <p className="text-muted">Esta película todavía no tiene reparto registrado.</p>
              <Link
                to={`/peliculas/${pelicula.Id}/reparto`}
                className="btn btn-primary"
              >
                Agregar reparto
              </Link>
            </div>
          ) : (
            <div className="row g-3">
              {repartoOrdenado.map((actor) => (
                <div
                  className="col-12 col-sm-6 col-lg-4"
                  key={actor.Id}
                >
                  <Link
                    to={`/actores/${actor.Id}`}
                    className="card h-100 border shadow-sm text-dark"
                  >
                    <div className="card-body d-flex align-items-center gap-3">
                      {actor.Foto ? (
                        <img
                          src={`${API_URL}${actor.Foto}`}
                          alt={actor.NombreCompleto}
                          className="rounded-circle flex-shrink-0"
                          style={{
                            width: "72px",
                            height: "72px",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          className="rounded-circle bg-light border d-grid flex-shrink-0"
                          style={{
                            width: "72px",
                            height: "72px",
                            placeItems: "center",
                            fontSize: "1.8rem",
                          }}
                        >
                          🎭
                        </div>
                      )}

                      <div className="min-width-0">
                        <h3 className="h6 fw-bold mb-1">
                          {actor.NombreCompleto}
                        </h3>
                        <p className="text-muted small mb-1">
                          {actor.Personaje || "Personaje no registrado"}
                        </p>
                        <span className="badge bg-primary">
                          {actor.TipoParticipacion || "Reparto"}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default PerfilPelicula;
