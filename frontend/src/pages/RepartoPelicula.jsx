import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

function RepartoPelicula() {
  const { id } = useParams();

  const [pelicula, setPelicula] = useState(null);
  const [actores, setActores] = useState([]);
  const [reparto, setReparto] = useState([]);

  const [formulario, setFormulario] = useState({
    ActorId: "",
    Personaje: "",
    EsPrincipal: false,
  });

  const API_URL = "http://localhost:3000";

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    try {
      const peliculaResponse = await api.get(`/peliculas/${id}`);
      const actoresResponse = await api.get("/actores");
      const repartoResponse = await api.get(`/actores-peliculas/pelicula/${id}`);

      setPelicula(peliculaResponse.data);
      setActores(actoresResponse.data);
      setReparto(repartoResponse.data);
    } catch (error) {
      console.error(error);
      alert("Error al cargar el reparto");
    }
  };

  const manejarCambio = (e) => {
    const { name, value, type, checked } = e.target;

    setFormulario({
      ...formulario,
      [name]: type === "checkbox" ? checked : value,
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
        EsPrincipal: formulario.EsPrincipal,
      });

      setFormulario({
        ActorId: "",
        Personaje: "",
        EsPrincipal: false,
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

  return (
    <div className="table-page-container">
      <Link to="/peliculas" className="btn btn-secondary mb-3">
        ← Volver a Películas
      </Link>

      <div className="mb-4">
        <h2>👥 Reparto</h2>

        {pelicula && (
          <p className="text-muted mb-0">
            🎬 {pelicula.Titulo}
          </p>
        )}
      </div>

      <form onSubmit={agregarActor} className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="mb-3">➕ Agregar actor a la película</h5>

          <div className="row g-3">
            <div className="col-12 col-md-4">
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

            <div className="col-12 col-md-4">
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

            <div className="col-12 col-md-2 d-flex align-items-end">
              <div className="form-check mb-2">
                <input
                  type="checkbox"
                  name="EsPrincipal"
                  className="form-check-input"
                  checked={formulario.EsPrincipal}
                  onChange={manejarCambio}
                  id="esPrincipal"
                />

                <label className="form-check-label" htmlFor="esPrincipal">
                  Principal
                </label>
              </div>
            </div>

            <div className="col-12 col-md-2 d-flex align-items-end">
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
                <h5 className="card-title mb-1">{actor.NombreCompleto}</h5>

                <p className="text-muted mb-1">
                  {actor.NombreArtistico || "Sin nombre artístico"}
                </p>

                <p className="mb-2">
                  Personaje: <strong>{actor.Personaje || "-"}</strong>
                </p>

                <span
                  className={`badge ${
                    actor.EsPrincipal ? "bg-warning text-dark" : "bg-secondary"
                  }`}
                >
                  {actor.EsPrincipal ? "⭐ Principal" : "Secundario"}
                </span>
              </div>

              <div className="card-footer bg-white border-0">
                <button
                  className="btn btn-danger btn-sm w-100"
                  onClick={() => eliminarDelReparto(actor.Id)}
                >
                  🗑️ Quitar del reparto
                </button>
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
    </div>
  );
}

export default RepartoPelicula;