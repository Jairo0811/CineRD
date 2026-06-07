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

  return (
    <div className="container mt-4">
    

      <h2>🎭 Actores</h2>

      <table className="table table-striped mt-3">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Nombre artístico</th>
            <th>Estado</th>
          </tr>
        </thead>

        <tbody>
          {actores.map((actor) => (
            <tr key={actor.Id}>
              <td>{actor.Id}</td>

              <td>{actor.NombreCompleto}</td>

              <td>{actor.NombreArtistico || "-"}</td>

              <td>{actor.EstaVivo ? "🟢 Vivo" : "⚫ Fallecido"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link to="/" className="btn btn-secondary mb-3">
        ← Volver al inicio
      </Link>
    </div>
  );
}

export default Actores;
