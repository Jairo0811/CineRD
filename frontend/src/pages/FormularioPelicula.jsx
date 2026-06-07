import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

function FormularioPelicula() {
  const navigate = useNavigate();
  const { id } = useParams();

  const esEdicion = Boolean(id);

  const [formulario, setFormulario] = useState({
    Titulo: "",
    Genero: "",
    Director: "",
    Productora: "",
    FechaEstreno: "",
    Foto: null,
  });

  useEffect(() => {
    if (esEdicion) {
      obtenerPelicula();
    }
  }, [id]);

  const formatearFecha = (fecha) => {
    if (!fecha) return "";
    return fecha.substring(0, 10);
  };

  const obtenerPelicula = async () => {
    try {
      const response = await api.get(`/peliculas/${id}`);
      const pelicula = response.data;

      setFormulario({
        Titulo: pelicula.Titulo || "",
        Genero: pelicula.Genero || "",
        Director: pelicula.Director || "",
        Productora: pelicula.Productora || "",
        FechaEstreno: formatearFecha(pelicula.FechaEstreno),
        Foto: pelicula.Foto || null,
      });
    } catch (error) {
      console.error(error);
      alert("Error al cargar la película");
    }
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setFormulario({
      ...formulario,
      [name]: value,
    });
  };

  const guardarPelicula = async (e) => {
    e.preventDefault();

    if (!formulario.Titulo || !formulario.Genero || !formulario.FechaEstreno) {
      alert("Título, género y fecha de estreno son obligatorios");
      return;
    }

    try {
      if (esEdicion) {
        await api.put(`/peliculas/${id}`, formulario);
        alert("Película actualizada correctamente");
      } else {
        await api.post("/peliculas", formulario);
        alert("Película registrada correctamente");
      }

      navigate("/peliculas");
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.mensaje ||
          error.response?.data?.error ||
          "Error al guardar la película"
      );
    }
  };

  return (
    <div className="form-page-container">
      <Link to="/peliculas" className="btn btn-secondary mb-3">
        ← Volver a Películas
      </Link>

      <div className="text-center">
        <h2>{esEdicion ? "✏️ Editar Película" : "➕ Nueva Película"}</h2>
      </div>

      <form onSubmit={guardarPelicula} className="card mt-3 shadow">
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label">Título</label>

            <input
              type="text"
              name="Titulo"
              className="form-control"
              value={formulario.Titulo}
              onChange={manejarCambio}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Género</label>

            <input
              type="text"
              name="Genero"
              className="form-control"
              value={formulario.Genero}
              onChange={manejarCambio}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Director</label>

            <input
              type="text"
              name="Director"
              className="form-control"
              value={formulario.Director}
              onChange={manejarCambio}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Productora</label>

            <input
              type="text"
              name="Productora"
              className="form-control"
              value={formulario.Productora}
              onChange={manejarCambio}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Fecha de Estreno</label>

            <input
              type="date"
              name="FechaEstreno"
              className="form-control"
              value={formulario.FechaEstreno}
              onChange={manejarCambio}
            />
          </div>

          <div className="d-flex gap-2 flex-wrap">
            <button type="submit" className="btn btn-primary">
              Guardar
            </button>

            <Link to="/peliculas" className="btn btn-secondary">
              Cancelar
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}

export default FormularioPelicula;