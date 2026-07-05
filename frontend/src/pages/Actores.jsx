import { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

function Actores() {
  const [actores, setActores] = useState([]);
  const [buscar, setBuscar] = useState("");
  const [orden, setOrden] = useState("az");
  const [estado, setEstado] = useState("");
  const [anio, setAnio] = useState("");

  const API_URL = "http://localhost:3000";

  useEffect(() => {
    obtenerActores();
  }, [buscar, orden, estado, anio]);

  const obtenerActores = async () => {
    try {
      const response = await api.get("/actores", {
        params: { buscar, orden, estado, anio },
      });

      setActores(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const eliminarActor = async (id) => {
    const confirmar = window.confirm("¿Desea eliminar este actor?");
    if (!confirmar) return;

    try {
      await api.delete(`/actores/${id}`);
      obtenerActores();
    } catch (error) {
      console.error(error);
      alert("Error al eliminar el actor");
    }
  };

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return "N/A";

    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date();

    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    return edad;
  };

  return (
    <div className="table-page-container">
      <Link to="/" className="btn btn-secondary mb-3">
        ← Volver al inicio
      </Link>

      <div className="d-flex justify-content-between align-items-center page-header mb-4">
        <h2>🎭 Actores</h2>

        <Link to="/actores/nuevo" className="btn btn-success">
          ➕ Nuevo Actor
        </Link>
      </div>

      <div className="filter-panel card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <label className="form-label">Buscar actor</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ej: Fausto, Boca de Piano..."
                value={buscar}
                onChange={(e) => setBuscar(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-3">
              <label className="form-label">Ordenar por</label>
              <select
                className="form-select"
                value={orden}
                onChange={(e) => setOrden(e.target.value)}
              >
                <option value="az">A-Z</option>
                <option value="za">Z-A</option>
                <option value="masPeliculas">Más películas</option>
                <option value="menosPeliculas">Menos películas</option>
                <option value="nacimientoReciente">Nacimiento reciente</option>
                <option value="nacimientoAntiguo">Nacimiento antiguo</option>
              </select>
            </div>

            <div className="col-12 col-md-3">
              <label className="form-label">Estado</label>
              <select
                className="form-select"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="vivo">Vivos</option>
                <option value="fallecido">Fallecidos</option>
              </select>
            </div>

            <div className="col-12 col-md-2">
              <label className="form-label">Año</label>
              <input
                type="number"
                className="form-control"
                placeholder="1971"
                value={anio}
                onChange={(e) => setAnio(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {actores.map((actor) => (
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

                <p className="text-muted mb-2">
                  🎭 {actor.NombreArtistico || "Sin nombre artístico"}
                </p>

                <p className="mb-1">🎂 {calcularEdad(actor.FechaNacimiento)} años</p>

                <p className="mb-2">
                  🎬 {actor.CantidadPeliculas || 0} película(s)
                </p>

                <span
                  className={`badge ${actor.EstaVivo ? "bg-success" : "bg-dark"}`}
                >
                  {actor.EstaVivo ? "🟢 Vivo" : "⚫ Fallecido"}
                </span>
              </div>

              <div className="card-footer bg-white border-0">
                <div className="d-flex gap-2">
                  <Link
                    to={`/actores/editar/${actor.Id}`}
                    className="btn btn-warning btn-sm w-50"
                  >
                    ✏️ Editar
                  </Link>

                  <button
                    className="btn btn-danger btn-sm w-50"
                    onClick={() => eliminarActor(actor.Id)}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {actores.length === 0 && (
          <div className="col-12 text-center text-muted mt-5">
            No se encontraron actores.
          </div>
        )}
      </div>
    </div>
  );
}

export default Actores;