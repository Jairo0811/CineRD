import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import { formatearFecha } from "../utils/fechas";

const API_URL = "http://localhost:3000";

const resolverImagen = (ruta) => {
  if (!ruta) return null;
  if (ruta.startsWith("http://") || ruta.startsWith("https://")) return ruta;
  return `${API_URL}${ruta}`;
};

const formatearDuracion = (minutos) => {
  if (!minutos) return null;

  const horas = Math.floor(minutos / 60);
  const restantes = minutos % 60;

  if (horas === 0) return `${restantes} min`;
  return `${horas} h ${restantes} min`;
};

const formatearDinero = (valor) => {
  if (valor === null || valor === undefined) return null;

  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(valor);
};

const obtenerYoutubeId = (url) => {
  if (!url) return null;

  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname.includes("youtu.be")) {
      return parsedUrl.pathname.replace("/", "");
    }

    if (parsedUrl.hostname.includes("youtube.com")) {
      return parsedUrl.searchParams.get("v") || parsedUrl.pathname.split("/").pop();
    }
  } catch {
    return null;
  }

  return null;
};

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
          api.get(`/peliculas/${id}/perfil`),
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
        const ordenCreditoA = a.OrdenCreditos ?? Number.MAX_SAFE_INTEGER;
        const ordenCreditoB = b.OrdenCreditos ?? Number.MAX_SAFE_INTEGER;

        if (ordenCreditoA !== ordenCreditoB) {
          return ordenCreditoA - ordenCreditoB;
        }

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

  const youtubeId = useMemo(
    () => obtenerYoutubeId(pelicula?.TrailerUrl),
    [pelicula?.TrailerUrl],
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

  const backdrop = resolverImagen(pelicula.Backdrop);
  const poster = resolverImagen(pelicula.Foto);

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
        {backdrop && (
          <div
            style={{
              minHeight: "300px",
              backgroundImage: `linear-gradient(180deg, rgba(10, 15, 25, 0.08), rgba(10, 15, 25, 0.86)), url(${backdrop})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
            }}
          />
        )}

        <div className="card-body p-4 p-lg-5">
          <div className="row g-4 align-items-center">
            <div className="col-12 col-md-4 col-lg-3 text-center">
              {poster ? (
                <img
                  src={poster}
                  alt={`Póster de ${pelicula.Titulo}`}
                  className="img-fluid rounded-4 shadow"
                  style={{ maxHeight: "420px", objectFit: "cover" }}
                />
              ) : (
                <div
                  className="bg-light border rounded-4 d-grid mx-auto"
                  style={{
                    maxWidth: "280px",
                    minHeight: "390px",
                    placeItems: "center",
                  }}
                >
                  <span style={{ fontSize: "4rem" }}>🎬</span>
                </div>
              )}
            </div>

            <div className="col-12 col-md-8 col-lg-9">
              <span className="badge bg-primary mb-3">Cine dominicano</span>

              <h1 className="display-5 fw-bold mb-2">{pelicula.Titulo}</h1>

              {pelicula.Eslogan && (
                <p className="lead text-muted fst-italic">“{pelicula.Eslogan}”</p>
              )}

              <div className="d-flex flex-wrap gap-2 mb-4">
                <span className="badge bg-secondary">
                  🎭 {pelicula.Genero || "Sin género"}
                </span>

                <span className="badge bg-light text-dark border">
                  📅 {pelicula.FechaEstreno
                    ? formatearFecha(pelicula.FechaEstreno)
                    : "Sin fecha"}
                </span>

                {pelicula.DuracionMinutos && (
                  <span className="badge bg-light text-dark border">
                    ⏱️ {formatearDuracion(pelicula.DuracionMinutos)}
                  </span>
                )}

                {pelicula.Calificacion !== null &&
                  pelicula.Calificacion !== undefined && (
                    <span className="badge bg-warning text-dark">
                      ⭐ {Number(pelicula.Calificacion).toFixed(1)}/10
                    </span>
                  )}

                <span className="badge bg-light text-dark border">
                  👥 {reparto.length} integrante(s)
                </span>

                {pelicula.Estado && (
                  <span className="badge bg-info text-dark">{pelicula.Estado}</span>
                )}

                {pelicula.TMDbId && (
                  <span className="badge bg-success">TMDb #{pelicula.TMDbId}</span>
                )}
              </div>

              <dl className="row mb-0">
                <dt className="col-sm-3">Director</dt>
                <dd className="col-sm-9">{pelicula.Director || "No registrado"}</dd>

                <dt className="col-sm-3">Productora</dt>
                <dd className="col-sm-9">
                  {pelicula.Productora || "No registrada"}
                </dd>

                <dt className="col-sm-3">Idioma original</dt>
                <dd className="col-sm-9">
                  {pelicula.IdiomaOriginal?.toUpperCase() || "No registrado"}
                </dd>

                {pelicula.Presupuesto !== null &&
                  pelicula.Presupuesto !== undefined && (
                    <>
                      <dt className="col-sm-3">Presupuesto</dt>
                      <dd className="col-sm-9">
                        {formatearDinero(pelicula.Presupuesto)}
                      </dd>
                    </>
                  )}

                {pelicula.Recaudacion !== null &&
                  pelicula.Recaudacion !== undefined && (
                    <>
                      <dt className="col-sm-3">Recaudación</dt>
                      <dd className="col-sm-9">
                        {formatearDinero(pelicula.Recaudacion)}
                      </dd>
                    </>
                  )}
              </dl>
            </div>
          </div>
        </div>
      </section>

      <section className="card shadow mb-4">
        <div className="card-body p-4">
          <h2 className="h4 fw-bold">📖 Sinopsis</h2>
          <p className="text-muted mb-0" style={{ whiteSpace: "pre-line" }}>
            {pelicula.Sinopsis ||
              "La sinopsis todavía no ha sido registrada para esta película."}
          </p>
        </div>
      </section>

      {(youtubeId || pelicula.TrailerUrl) && (
        <section className="card shadow mb-4">
          <div className="card-body p-4">
            <h2 className="h4 fw-bold mb-3">▶️ Tráiler</h2>

            {youtubeId ? (
              <div className="ratio ratio-16x9 rounded overflow-hidden">
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  title={`Tráiler de ${pelicula.Titulo}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <a
                href={pelicula.TrailerUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-danger"
              >
                Ver tráiler
              </a>
            )}
          </div>
        </section>
      )}

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
              <p className="text-muted">
                Esta película todavía no tiene reparto registrado.
              </p>
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
                <div className="col-12 col-sm-6 col-lg-4" key={actor.Id}>
                  <Link
                    to={`/actores/${actor.Id}`}
                    className="card h-100 border shadow-sm text-dark"
                  >
                    <div className="card-body d-flex align-items-center gap-3">
                      {actor.Foto ? (
                        <img
                          src={resolverImagen(actor.Foto)}
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
                          {actor.NombreArtistico || actor.NombreCompleto}
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
