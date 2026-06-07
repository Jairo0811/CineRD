import { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

function Peliculas() {
  const [peliculas, setPeliculas] = useState([]);

  useEffect(() => {
    obtenerPeliculas();
  }, []);

  const obtenerPeliculas = async () => {
    try {
      const response = await api.get("/peliculas");
      setPeliculas(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const eliminarPelicula = async (id) => {
    const confirmar = window.confirm("¿Desea eliminar esta película?");

    if (!confirmar) return;

    try {
      await api.delete(`/peliculas/${id}`);
      obtenerPeliculas();
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.mensaje ||
          error.response?.data?.error ||
          "Error al eliminar la película"
      );
    }
  };

  return (
    <div className="table-page-container">
      <Link to="/" className="btn btn-secondary mb-3">
        ← Volver al inicio
      </Link>

      <div className="d-flex justify-content-between align-items-center page-header">
        <h2>🎬 Películas</h2>

        <Link to="/peliculas/nueva" className="btn btn-success">
          ➕ Nueva Película
        </Link>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover mt-3">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Título</th>
              <th>Género</th>
              <th>Director</th>
              <th>Productora</th>
              <th>Estreno</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {peliculas.map((pelicula) => (
              <tr key={pelicula.Id}>
                <td>{pelicula.Id}</td>

                <td>{pelicula.Titulo}</td>

                <td>{pelicula.Genero}</td>

                <td>{pelicula.Director || "-"}</td>

                <td>{pelicula.Productora || "-"}</td>

                <td>
  {pelicula.FechaEstreno
    ? new Date(pelicula.FechaEstreno).toLocaleDateString("es-DO")
    : "-"}
</td>

                <td>
                  <div className="action-buttons">
                    <Link
                      to={`/peliculas/editar/${pelicula.Id}`}
                      className="btn btn-warning btn-sm"
                    >
                      ✏️ Editar
                    </Link>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => eliminarPelicula(pelicula.Id)}
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

export default Peliculas;