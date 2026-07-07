import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

const tiposParticipacion = [
  "Principal",
  "Secundario",
  "Cameo",
  "Especial",
  "Voz",
  "Archivo",
  "Sin acreditar",
  "Escena postcréditos",
];

function RepartoPelicula() {
  const { id } = useParams();

  const [pelicula, setPelicula] = useState(null);
  const [actores, setActores] = useState([]);
  const [reparto, setReparto] = useState([]);

  const [formulario, setFormulario] = useState({
    ActorId: "",
    Personaje: "",
    TipoParticipacion: "Principal",
  });

  const [editando, setEditando] = useState(null);

  const API_URL = "http://localhost:3000";

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    try {
      const [peliculaResponse, actoresResponse, repartoResponse] =
        await Promise.all([
          api.get(`/peliculas/${id}`),
          api.get("/actores"),
          api.get(`/actores-peliculas/pelicula/${id}`),
        ]);

      setPelicula(peliculaResponse.data);
      setActores(actoresResponse.data);
      setReparto(repartoResponse.data);
    } catch (error) {
      console.error(error);
      alert("Error al cargar el reparto");
    }
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setFormulario({
      ...formulario,
      [name]: value,
    });
  };

  const manejarCambioEdicion = (e) => {
    const { name, value } = e.target;

    setEditando({
      ...editando,
      [name]: value,
    });
  };

  const agregarActor = async (e) => {
    e.preventDefault();

    if (!formulario.ActorId) {
      alert("Debe seleccionar un actor");
      return;
    }

    try {
      await api.post("/actores-peliculas", {
        PeliculaId: Number(id),
        ActorId: Number(formulario.ActorId),
        Personaje: formulario.Personaje,
        TipoParticipacion: formulario.TipoParticipacion,
      });

      setFormulario({
        ActorId: "",
        Personaje: "",
        TipoParticipacion: "Principal",
      });

      cargarDatos();
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.mensaje ||
          error.response?.data?.error ||
          "Error al agregar actor al reparto"
      );
    }
  };

  const abrirEdicion = (actor) => {
    setEditando({
      ActorId: actor.Id,
      NombreCompleto: actor.NombreCompleto,
      Personaje: actor.Personaje || "",
      TipoParticipacion: actor.TipoParticipacion || "Secundario",
    });
  };

  const cerrarEdicion = () => {
    setEditando(null);
  };

  const guardarEdicion = async (e) => {
    e.preventDefault();

    try {
      await api.put(`/actores-peliculas/${id}/${editando.ActorId}`, {
        Personaje: editando.Personaje,
        TipoParticipacion: editando.TipoParticipacion,
      });

      cerrarEdicion();
      cargarDatos();
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.mensaje ||
          error.response?.data?.error ||
          "Error al actualizar la participación"
      );
    }
  };

  const eliminarDelReparto = async (actorId) => {
    const confirmar = window.confirm("¿Desea quitar este actor del reparto?");

    if (!confirmar) return;

    try {
      await api.delete(`/actores-peliculas/${id}/${actorId}`);
      cargarDatos();
    } catch (error) {
      console.error(error);
      alert("Error al quitar actor del reparto");
    }
  };

  const obtenerBadgeParticipacion = (tipo) => {
    switch (tipo) {
      case "Principal":
        return "⭐ Principal";
      case "Secundario":
        return "🎭 Secundario";
      case "Cameo":
        return "🎬 Cameo";
      case "Especial":
        return "🌟 Especial";
      case "Voz":
        return "🎙️ Voz";
      case "Archivo":
        return "📼 Archivo";
      case "Sin acreditar":
        return "👤 Sin acreditar";
      case "Escena postcréditos":
        return "🎁 Escena postcréditos";
      default:
        return "🎭 Participación";
    }
  };

  const obtenerClaseBadge = (tipo) => {
    switch (tipo) {
      case "Principal":
        return "bg-primary";
      case "Secundario":
        return "bg-secondary";
      case "Cameo":
        return "bg-light text-primary border border-primary";
      case "Especial":
        return "bg-primary";
      case "Voz":
        return "bg-secondary";
      case "Archivo":
        return "bg-dark";
      case "Sin acreditar":
        return "bg-light text-dark border";
      case "Escena postcréditos":
        return "bg-dark";
      default:
        return "bg-secondary";
    }
  };

  const obtenerNombreVisual = (actor) => {
    const nombre = actor.Nombres || actor.NombreCompleto || "Sin nombre";
    const apellidos = actor.Apellidos || "";

    return { nombre, apellidos };
  };

  return (
    <div className="table-page-container">
      <Link to="/peliculas" className="btn btn-secondary mb-3">
        ← Volver a Películas
      </Link>

      <div className="mb-4">
        <h2>👥 Reparto</h2>
        {pelicula && <p className="text-muted mb-0">🎬 {pelicula.Titulo}</p>}
      </div>

      <form onSubmit={agregarActor} className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="mb-3">➕ Agregar actor a la película</h5>

          <div className="row g-3">
            <div className="col-12 col-md-3">
              <label className="form-label">Actor</label>

              <select
                name="ActorId"
                className="form-select"
                value={formulario.ActorId}
                onChange={manejarCambio}
              >
                <option value="">Seleccione un actor</option>

                {actores.map((actor) => (
                  <option key={actor.Id} value={actor.Id}>
                    {actor.NombreCompleto}
                    {actor.NombreArtistico
                      ? ` (${actor.NombreArtistico})`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-3">
              <label className="form-label">Personaje</label>

              <input
                type="text"
                name="Personaje"
                className="form-control"
                placeholder="Ej: Genaro"
                value={formulario.Personaje}
                onChange={manejarCambio}
              />
            </div>

            <div className="col-12 col-md-3">
              <label className="form-label">Tipo de participación</label>

              <select
                name="TipoParticipacion"
                className="form-select"
                value={formulario.TipoParticipacion}
                onChange={manejarCambio}
              >
                {tiposParticipacion.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-3 d-flex align-items-end">
              <button type="submit" className="btn btn-primary w-100">
                Agregar
              </button>
            </div>
          </div>
        </div>
      </form>

      <div className="row g-4">
        {reparto.map((actor) => (
          <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={actor.Id}>
            <div className="card h-100 shadow actor-card">
              <div className="text-center pt-3">
                {actor.Foto ? (
                  <img
                    src={`${API_URL}${actor.Foto}`}
                    alt={actor.NombreCompleto}
                    className="actor-photo"
                  />
                ) : (
                  <div className="actor-photo-placeholder">🎭</div>
                )}
              </div>

              <div className="card-body text-center">
                <h5 className="card-title text-center mb-2">
                  <div className="fw-bold">{obtenerNombreVisual(actor).nombre}</div>

                  {obtenerNombreVisual(actor).apellidos && (
                    <div className="text-secondary fw-semibold">
                      {obtenerNombreVisual(actor).apellidos}
                    </div>
                  )}
                </h5>

                <p className="text-muted mb-1">
                  {actor.NombreArtistico || "Sin nombre artístico"}
                </p>

                {actor.Profesion && (
                  <p className="mb-1">
                    💼 <strong>{actor.Profesion}</strong>
                  </p>
                )}

                <p className="mb-2">
                  Personaje: <strong>{actor.Personaje || "-"}</strong>
                </p>

                <span
                  className={`badge ${obtenerClaseBadge(
                    actor.TipoParticipacion
                  )}`}
                >
                  {obtenerBadgeParticipacion(actor.TipoParticipacion)}
                </span>
              </div>

              <div className="card-footer bg-white border-0">
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-warning btn-sm w-50"
                    onClick={() => abrirEdicion(actor)}
                  >
                    ✏️ Editar
                  </button>

                  <button
                    className="btn btn-danger btn-sm w-50"
                    onClick={() => eliminarDelReparto(actor.Id)}
                  >
                    🗑️ Quitar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {reparto.length === 0 && (
          <div className="col-12 text-center text-muted mt-5">
            Esta película todavía no tiene actores asignados.
          </div>
        )}
      </div>

      {editando && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={guardarEdicion}>
                <div className="modal-header">
                  <h5 className="modal-title">✏️ Editar participación</h5>

                  <button
                    type="button"
                    className="btn-close"
                    onClick={cerrarEdicion}
                  ></button>
                </div>

                <div className="modal-body">
                  <p className="text-muted mb-3">
                    Actor: <strong>{editando.NombreCompleto}</strong>
                  </p>

                  <div className="mb-3">
                    <label className="form-label">Personaje</label>

                    <input
                      type="text"
                      name="Personaje"
                      className="form-control"
                      value={editando.Personaje}
                      onChange={manejarCambioEdicion}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Tipo de participación</label>

                    <select
                      name="TipoParticipacion"
                      className="form-select"
                      value={editando.TipoParticipacion}
                      onChange={manejarCambioEdicion}
                    >
                      {tiposParticipacion.map((tipo) => (
                        <option key={tipo} value={tipo}>
                          {tipo}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={cerrarEdicion}
                  >
                    Cancelar
                  </button>

                  <button type="submit" className="btn btn-primary">
                    Guardar cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RepartoPelicula;