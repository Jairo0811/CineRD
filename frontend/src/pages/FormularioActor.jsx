import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

function FormularioActor() {
  const navigate = useNavigate();
  const { id } = useParams();

  const esEdicion = Boolean(id);

  const [formulario, setFormulario] = useState({
    NombreCompleto: "",
    NombreArtistico: "",
    FechaNacimiento: "",
    Sexo: "Masculino",
    EstaVivo: true,
    FechaFallecimiento: "",
    Foto: null,
  });

  useEffect(() => {
    if (esEdicion) {
      obtenerActor();
    }
  }, [id]);

  const formatearFecha = (fecha) => {
    if (!fecha) return "";
    return fecha.substring(0, 10);
  };

  const obtenerActor = async () => {
    try {
      const response = await api.get(`/actores/${id}`);
      const actor = response.data;

      setFormulario({
        NombreCompleto: actor.NombreCompleto || "",
        NombreArtistico: actor.NombreArtistico || "",
        FechaNacimiento: formatearFecha(actor.FechaNacimiento),
        Sexo: actor.Sexo || "Masculino",
        EstaVivo: actor.EstaVivo,
        FechaFallecimiento: formatearFecha(actor.FechaFallecimiento),
        Foto: actor.Foto || null,
      });
    } catch (error) {
      console.error(error);
      alert("Error al cargar el actor");
    }
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setFormulario({
      ...formulario,
      [name]: value,
    });
  };

  const cambiarEstadoVida = (e) => {
    const estaVivo = e.target.value === "true";

    setFormulario({
      ...formulario,
      EstaVivo: estaVivo,
      FechaFallecimiento: estaVivo ? "" : formulario.FechaFallecimiento,
    });
  };

  const guardarActor = async (e) => {
    e.preventDefault();

    if (
      !formulario.NombreCompleto ||
      !formulario.FechaNacimiento ||
      !formulario.Sexo
    ) {
      alert("Nombre completo, fecha de nacimiento y sexo son obligatorios");
      return;
    }

    if (!formulario.EstaVivo && !formulario.FechaFallecimiento) {
      alert("Debe indicar la fecha de fallecimiento");
      return;
    }

    const datos = {
      ...formulario,
      FechaFallecimiento: formulario.EstaVivo
        ? null
        : formulario.FechaFallecimiento,
    };

    try {
      if (esEdicion) {
        await api.put(`/actores/${id}`, datos);
        alert("Actor actualizado correctamente");
      } else {
        await api.post("/actores", datos);
        alert("Actor registrado correctamente");
      }

      navigate("/actores");
    } catch (error) {
      console.error(error);
      alert("Error al guardar el actor");
    }
  };

  return (
    <div className="form-page-container">
      <Link to="/actores" className="btn btn-secondary mb-3">
        ← Volver a Actores
      </Link>

      <div className="text-center">
        <h2>{esEdicion ? "✏️ Editar Actor" : "➕ Nuevo Actor"}</h2>
      </div>

      <form onSubmit={guardarActor} className="card mt-3 shadow">
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label">Nombre Completo</label>

            <input
              type="text"
              name="NombreCompleto"
              className="form-control"
              value={formulario.NombreCompleto}
              onChange={manejarCambio}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Nombre Artístico</label>

            <input
              type="text"
              name="NombreArtistico"
              className="form-control"
              value={formulario.NombreArtistico}
              onChange={manejarCambio}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Fecha de Nacimiento</label>

            <input
              type="date"
              name="FechaNacimiento"
              className="form-control"
              value={formulario.FechaNacimiento}
              onChange={manejarCambio}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Sexo</label>

            <select
              name="Sexo"
              className="form-select"
              value={formulario.Sexo}
              onChange={manejarCambio}
            >
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">¿Está vivo?</label>

            <select
              className="form-select"
              value={formulario.EstaVivo ? "true" : "false"}
              onChange={cambiarEstadoVida}
            >
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          </div>

          {!formulario.EstaVivo && (
            <div className="mb-3">
              <label className="form-label">Fecha de Fallecimiento</label>

              <input
                type="date"
                name="FechaFallecimiento"
                className="form-control"
                value={formulario.FechaFallecimiento}
                onChange={manejarCambio}
              />
            </div>
          )}

          <div className="d-flex gap-2 flex-wrap">
            <button type="submit" className="btn btn-primary">
              Guardar
            </button>

            <Link to="/actores" className="btn btn-secondary">
              Cancelar
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}

export default FormularioActor;