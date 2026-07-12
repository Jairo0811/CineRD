import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

import {
  calcularEdad,
  calcularEdadAproximada,
  calcularEdadEnFecha,
  formatearFecha,
  formatearFechaCorta,
  obtenerAnioFecha,
} from "../utils/fechas";

function PerfilActor() {
  const { id } = useParams();

  const [actor, setActor] = useState(null);
  const [participaciones, setParticipaciones] = useState([]);
  const [dirigidas, setDirigidas] = useState([]);
  const [cargando, setCargando] = useState(true);

  const API_URL = "http://localhost:3000";

  useEffect(() => {
    cargarPerfil();
  }, [id]);

  const cargarPerfil = async () => {
    try {
      setCargando(true);

      const actorResponse = await api.get(`/actores/${id}`);
      const actorData = actorResponse.data;

      const [participacionesResponse, dirigidasResponse] = await Promise.all([
        api.get(`/actores-peliculas/actor/${id}`),
        api.get(
          `/peliculas/director/${encodeURIComponent(actorData.NombreCompleto)}`,
        ),
      ]);

      setActor(actorData);
      setParticipaciones(participacionesResponse.data || []);
      setDirigidas(dirigidasResponse.data || []);
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.mensaje || "Error al cargar el perfil del actor",
      );
    } finally {
      setCargando(false);
    }
  };

  const obtenerEdadActor = () => {
    if (!actor) {
      return null;
    }

    if (actor.FechaNacimiento) {
      if (!actor.EstaVivo && actor.FechaFallecimiento) {
        return calcularEdadEnFecha(
          actor.FechaNacimiento,
          actor.FechaFallecimiento,
        );
      }

      return calcularEdad(actor.FechaNacimiento);
    }

    if (actor.AnioNacimiento) {
      const anioFinal =
        !actor.EstaVivo && actor.FechaFallecimiento
          ? obtenerAnioFecha(actor.FechaFallecimiento)
          : new Date().getFullYear();

      return calcularEdadAproximada(actor.AnioNacimiento, anioFinal);
    }

    return null;
  };

  const mostrarNacimiento = () => {
    const edad = obtenerEdadActor();

    if (actor.FechaNacimiento) {
      return (
        <>
          <p className="mb-1">
            🎂 <strong>{formatearFecha(actor.FechaNacimiento)}</strong>
          </p>

          {edad !== null && <p className="text-muted mb-2">{edad} años</p>}
        </>
      );
    }

    if (actor.AnioNacimiento) {
      return (
        <>
          <p className="mb-1">
            🎂 Año de nacimiento: <strong>{actor.AnioNacimiento}</strong>
          </p>

          {edad !== null && (
            <p className="text-muted mb-2">Aprox. {edad} años</p>
          )}
        </>
      );
    }

    return (
      <p className="text-muted mb-2">🎂 Fecha de nacimiento desconocida</p>
    );
  };

  const obtenerEstadoActor = () => {
    if (actor.EstaVivo) {
      return "🟢 Vivo";
    }

    return actor.Sexo === "Femenino" ? "⚫ Fallecida" : "⚫ Fallecido";
  };

  const renderPoster = (pelicula) => {
    if (pelicula.Foto) {
      return (
        <img
          src={`${API_URL}${pelicula.Foto}`}
          alt={pelicula.Titulo}
          style={{
            width: "55px",
            height: "80px",
            objectFit: "cover",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,.25)",
            flexShrink: 0,
          }}
        />
      );
    }

    return (
      <div
        style={{
          width: "55px",
          height: "80px",
          borderRadius: "8px",
          background: "#ececec",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
          flexShrink: 0,
        }}
      >
        🎬
      </div>
    );
  };

  if (cargando) {
    return (
      <div className="table-page-container text-center py-5">
        <div className="spinner-border text-primary" role="status" />

        <p className="mt-3 mb-0">Cargando perfil...</p>
      </div>
    );
  }

  if (!actor) {
    return (
      <div className="table-page-container text-center py-5">
        <p className="text-muted">No se encontró el actor solicitado.</p>

        <Link to="/actores" className="btn btn-primary">
          Volver a Actores
        </Link>
      </div>
    );
  }

  return (
    <div className="table-page-container">
      <Link to="/actores" className="btn btn-secondary mb-4">
        ← Volver a Actores
      </Link>

      <div className="card shadow mb-4">
        <div className="card-body text-center">
          {actor.Foto ? (
            <img
              src={`${API_URL}${actor.Foto}`}
              alt={actor.NombreCompleto}
              className="actor-photo mb-3"
            />
          ) : (
            <div className="actor-photo-placeholder mb-3">🎭</div>
          )}

          <h2 className="mb-2">
            <div>{actor.Nombres || actor.NombreCompleto || "Sin nombre"}</div>

            {actor.Apellidos && (
              <div
                className="text-secondary"
                style={{
                  fontSize: "0.85em",
                  fontWeight: 600,
                }}
              >
                {actor.Apellidos}
              </div>
            )}
          </h2>

          {actor.NombreArtistico && (
            <p className="text-muted mb-1">🎭 {actor.NombreArtistico}</p>
          )}

          <p className="mb-1">
            💼 <strong>{actor.Profesion || "Sin profesión definida"}</strong>
          </p>

          {mostrarNacimiento()}

          {!actor.EstaVivo && actor.FechaFallecimiento && (
            <p className="text-danger mb-2">
              ⚰️ Falleció el{" "}
              <strong>{formatearFecha(actor.FechaFallecimiento)}</strong>
            </p>
          )}

          <span
            className={`badge ${actor.EstaVivo ? "bg-success" : "bg-dark"}`}
          >
            {obtenerEstadoActor()}
          </span>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-md-4">
          <div className="dashboard-stat-card">
            <span className="dashboard-stat-icon">🎭</span>

            <strong className="dashboard-stat-value">
              {participaciones.length}
            </strong>

            <span className="dashboard-stat-label">
              Participaciones como actor/actriz
            </span>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="dashboard-stat-card">
            <span className="dashboard-stat-icon">🎬</span>

            <strong className="dashboard-stat-value">{dirigidas.length}</strong>

            <span className="dashboard-stat-label">Películas dirigidas</span>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="dashboard-stat-card">
            <span className="dashboard-stat-icon">📽️</span>

            <strong className="dashboard-stat-value">
              {participaciones.length + dirigidas.length}
            </strong>

            <span className="dashboard-stat-label">Total de créditos</span>
          </div>
        </div>
      </div>

      <div className="row g-4 align-items-start">
        <div className="col-12 col-lg-6">
          <div className="card shadow">
            <div className="card-header fw-bold">
              🎭 Participaciones como actor/actriz
            </div>

            <div className="card-body">
              {participaciones.length === 0 ? (
                <p className="text-muted mb-0">
                  No tiene participaciones registradas.
                </p>
              ) : (
                participaciones.map((pelicula) => (
                  <div
                    key={pelicula.Id}
                    className="d-flex align-items-center gap-3 py-3 border-bottom"
                  >
                    {renderPoster(pelicula)}

                    <div className="flex-grow-1">
                      <strong>{pelicula.Titulo}</strong>

                      <br />

                      <small className="text-muted">
                        Personaje: {pelicula.Personaje || "-"}
                      </small>

                      <br />

                      <small className="text-primary">
                        {pelicula.TipoParticipacion || "Participación"}
                      </small>
                    </div>

                    <small className="text-muted text-end">
                      {pelicula.FechaEstreno
                        ? formatearFechaCorta(pelicula.FechaEstreno)
                        : "Sin fecha"}
                    </small>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card shadow">
            <div className="card-header fw-bold">🎬 Películas dirigidas</div>

            <div className="card-body">
              {dirigidas.length === 0 ? (
                <p className="text-muted mb-0">
                  No tiene películas dirigidas registradas.
                </p>
              ) : (
                dirigidas.map((pelicula) => (
                  <div
                    key={pelicula.Id}
                    className="d-flex align-items-center gap-3 py-3 border-bottom"
                  >
                    {renderPoster(pelicula)}

                    <div className="flex-grow-1">
                      <strong>{pelicula.Titulo}</strong>

                      <br />

                      <small className="text-muted">
                        {pelicula.Genero || "Sin género"}
                      </small>
                    </div>

                    <small className="text-muted text-end">
                      {pelicula.FechaEstreno
                        ? formatearFechaCorta(pelicula.FechaEstreno)
                        : "Sin fecha"}
                    </small>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PerfilActor;
