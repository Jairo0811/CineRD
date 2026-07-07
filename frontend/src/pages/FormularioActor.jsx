import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

const profesiones = [
  "Actor",
  "Actriz",
  "Actor / Director",
  "Actor / Productor",
  "Actor / Director / Productor",
  "Director",
  "Director / Productor",
  "Director / Guionista",
  "Director / Productor / Guionista",
  "Productor",
  "Guionista",
  "Humorista",
  "Comediante",
  "Cantante",
  "Artista Urbano",
  "Influencer",
  "YouTuber",
  "Comunicador",
  "Locutor",
  "Modelo",
  "Deportista",
  "Músico",
  "Otro",
];

function FormularioActor() {
  const navigate = useNavigate();
  const { id } = useParams();

  const esEdicion = Boolean(id);
  const API_URL = "http://localhost:3000";

  const [formulario, setFormulario] = useState({
    Nombres: "",
    Apellidos: "",
    NombreArtistico: "",
    Profesion: "",
    FechaNacimiento: "",
    AnioNacimiento: "",
    Sexo: "Masculino",
    EstaVivo: true,
    FechaFallecimiento: "",
  });

  const [foto, setFoto] = useState(null);
  const [vistaPrevia, setVistaPrevia] = useState(null);

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
        Nombres: actor.Nombres || actor.NombreCompleto || "",
        Apellidos: actor.Apellidos || "",
        NombreArtistico: actor.NombreArtistico || "",
        Profesion: actor.Profesion || "",
        FechaNacimiento: formatearFecha(actor.FechaNacimiento),
        AnioNacimiento: actor.AnioNacimiento || "",
        Sexo: actor.Sexo || "Masculino",
        EstaVivo: actor.EstaVivo,
        FechaFallecimiento: formatearFecha(actor.FechaFallecimiento),
      });

      if (actor.Foto) {
        setVistaPrevia(`${API_URL}${actor.Foto}`);
      }
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

  const manejarFoto = (e) => {
    const archivo = e.target.files[0];

    if (!archivo) return;

    setFoto(archivo);
    setVistaPrevia(URL.createObjectURL(archivo));
  };

  const guardarActor = async (e) => {
    e.preventDefault();

    if (!formulario.Nombres || !formulario.Sexo) {
      alert("Nombres y sexo son obligatorios");
      return;
    }

    if (
      formulario.AnioNacimiento &&
      (Number(formulario.AnioNacimiento) < 1800 ||
        Number(formulario.AnioNacimiento) > new Date().getFullYear())
    ) {
      alert("El año de nacimiento no es válido");
      return;
    }

    if (!formulario.EstaVivo && !formulario.FechaFallecimiento) {
      alert("Debe indicar la fecha de fallecimiento");
      return;
    }

    const datos = new FormData();

    datos.append("Nombres", formulario.Nombres);
    datos.append("Apellidos", formulario.Apellidos);
    datos.append("NombreArtistico", formulario.NombreArtistico);
    datos.append("Profesion", formulario.Profesion);
    datos.append("FechaNacimiento", formulario.FechaNacimiento);
    datos.append("AnioNacimiento", formulario.AnioNacimiento);
    datos.append("Sexo", formulario.Sexo);
    datos.append("EstaVivo", formulario.EstaVivo);
    datos.append(
      "FechaFallecimiento",
      formulario.EstaVivo ? "" : formulario.FechaFallecimiento
    );

    if (foto) {
      datos.append("Foto", foto);
    }

    try {
      if (esEdicion) {
        await api.put(`/actores/${id}`, datos, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        alert("Actor actualizado correctamente");
      } else {
        await api.post("/actores", datos, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        alert("Actor registrado correctamente");
      }

      navigate("/actores");
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.mensaje ||
          error.response?.data?.error ||
          "Error al guardar el actor"
      );
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
            <label className="form-label">Nombres</label>

            <input
              type="text"
              name="Nombres"
              className="form-control"
              value={formulario.Nombres}
              onChange={manejarCambio}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Apellidos</label>

            <input
              type="text"
              name="Apellidos"
              className="form-control"
              value={formulario.Apellidos}
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
            <label className="form-label">Profesión</label>

            <select
              name="Profesion"
              className="form-select"
              value={formulario.Profesion}
              onChange={manejarCambio}
            >
              <option value="">Seleccione una profesión</option>

              {profesiones.map((profesion) => (
                <option key={profesion} value={profesion}>
                  {profesion}
                </option>
              ))}
            </select>
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

            <small className="text-muted">
              Usa este campo si conoces la fecha completa.
            </small>
          </div>

          <div className="mb-3">
            <label className="form-label">Año de Nacimiento</label>

            <input
              type="number"
              name="AnioNacimiento"
              className="form-control"
              placeholder="Ej: 1979"
              min="1800"
              max={new Date().getFullYear()}
              value={formulario.AnioNacimiento}
              onChange={manejarCambio}
            />

            <small className="text-muted">
              Si solo conoces el año, deja la fecha completa vacía y coloca el
              año aquí.
            </small>
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

          <div className="mb-3">
            <label className="form-label">Fotografía del actor</label>

            <input
              type="file"
              name="Foto"
              className="form-control"
              accept="image/jpeg,image/png,image/webp"
              onChange={manejarFoto}
            />
          </div>

          {vistaPrevia && (
            <div className="mb-3 text-center">
              <p className="text-muted mb-2">Vista previa</p>

              <img
                src={vistaPrevia}
                alt="Vista previa del actor"
                className="img-thumbnail"
                style={{
                  width: "180px",
                  height: "180px",
                  objectFit: "cover",
                }}
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