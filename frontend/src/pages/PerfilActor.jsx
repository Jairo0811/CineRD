import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

function PerfilActor() {
  const { id } = useParams();

  const [actor, setActor] = useState(null);
  const [participaciones, setParticipaciones] = useState([]);
  const [dirigidas, setDirigidas] = useState([]);

  const API_URL = "http://localhost:3000";

  useEffect(() => {
    cargarPerfil();
  }, [id]);

  const cargarPerfil = async () => {
    try {
      const actorResponse = await api.get(`/actores/${id}`);
      const actorData = actorResponse.data;

      const participacionesResponse = await api.get(
        `/actores-peliculas/actor/${id}`
      );

      const dirigidasResponse = await api.get(
        `/peliculas/director/${encodeURIComponent(actorData.NombreCompleto)}`
      );

      setActor(actorData);
      setParticipaciones(participacionesResponse.data);
      setDirigidas(dirigidasResponse.data);
    } catch (error) {
      console.error(error);
      alert("Error al cargar el perfil del actor");
    }
  };

  const calcularEdad = (fechaNacimiento, fechaFallecimiento = null) => {
    if (!fechaNacimiento) return "Edad no disponible";

    const nacimiento = new Date(fechaNacimiento);
    const fechaFinal = fechaFallecimiento
      ? new Date(fechaFallecimiento)
      : new Date();

    let edad = fechaFinal.getFullYear() - nacimiento.getFullYear();
    const mes = fechaFinal.getMonth() - nacimiento.getMonth();

    if (mes < 0 || (mes === 0 && fechaFinal.getDate() < nacimiento.getDate())) {
      edad--;
    }

    return `${edad} años`;
  };

  const formatearFechaCompleta = (fecha) => {
    if (!fecha) return "Desconocida";

    return new Date(fecha).toLocaleDateString("es-DO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    return new Date(fecha).toLocaleDateString("es-DO", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
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

  if (!actor) {
    return (
      <div className="table-page-container text-center">
        <p>Cargando perfil...</p>
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

          <h2>{actor.NombreCompleto}</h2>

          <p className="text-muted mb-1">
            🎭 {actor.NombreArtistico || "Sin nombre artístico"}
          </p>

          <p className="mb-1">
            💼 <strong>{actor.Profesion || "Sin profesión definida"}</strong>
          </p>

          {actor.FechaNacimiento ? (
            <>
              <p className="mb-1">
                🎂{" "}
                <strong>{formatearFechaCompleta(actor.FechaNacimiento)}</strong>
              </p>

              <p className="text-muted mb-2">
                {calcularEdad(actor.FechaNacimiento, actor.FechaFallecimiento)}
              </p>
            </>
          ) : (
            <p className="text-muted mb-2">
              🎂 Fecha de nacimiento desconocida
            </p>
          )}

          {!actor.EstaVivo && actor.FechaFallecimiento && (
            <p className="text-danger">
              ⚰️ Falleció el{" "}
              <strong>
                {formatearFechaCompleta(actor.FechaFallecimiento)}
              </strong>
            </p>
          )}

          <span
            className={`badge ${actor.EstaVivo ? "bg-success" : "bg-dark"}`}
          >
            {actor.EstaVivo ? "🟢 Vivo" : "⚫ Fallecido"}
          </span>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-md-4">
          <div className="dashboard-card">
            <h2>🎭</h2>
            <h3>{participaciones.length}</h3>
            <p>Participaciones como actor/actriz</p>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="dashboard-card">
            <h2>🎬</h2>
            <h3>{dirigidas.length}</h3>
            <p>Películas dirigidas</p>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="dashboard-card">
            <h2>📽️</h2>
            <h3>{participaciones.length + dirigidas.length}</h3>
            <p>Total créditos</p>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-6">
          <div className="card shadow h-100">
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
                      {formatearFecha(pelicula.FechaEstreno)}
                    </small>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card shadow h-100">
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
                      {formatearFecha(pelicula.FechaEstreno)}
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