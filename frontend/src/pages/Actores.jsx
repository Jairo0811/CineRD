import { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

function Actores() {
  const [actores, setActores] = useState([]);

  useEffect(() => {
    obtenerActores();
  }, []);

  const obtenerActores = async () => {
    try {
      const response = await api.get("/actores");
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

  return (
    <div className="table-page-container">
      <Link to="/" className="btn btn-secondary mb-3">
        ← Volver al inicio
      </Link>

      <div className="d-flex justify-content-between align-items-center page-header">
        <h2>🎭 Actores</h2>

        <Link to="/actores/nuevo" className="btn btn-success">
          ➕ Nuevo Actor
        </Link>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover mt-3">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Nombre artístico</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {actores.map((actor) => (
              <tr key={actor.Id}>
                <td>{actor.Id}</td>

                <td>{actor.NombreCompleto}</td>

                <td>{actor.NombreArtistico || "-"}</td>

                <td>
                  {actor.EstaVivo
                    ? "🟢 Vivo"
                    : "⚫ Fallecido"}
                </td>

                <td>
                  <div className="action-buttons">
                    <Link
                      to={`/actores/editar/${actor.Id}`}
                      className="btn btn-warning btn-sm"
                    >
                      ✏️ Editar
                    </Link>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => eliminarActor(actor.Id)}
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Actores;