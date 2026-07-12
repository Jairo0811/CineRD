import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

import ActorFormFields from "../components/actores/ActorFormFields";
import { prepararFechaParaInput } from "../utils/fechas";

const formularioInicial = {
  TMDbId: "",
  Nombres: "",
  Apellidos: "",
  NombreArtistico: "",
  Profesion: "",
  FechaNacimiento: "",
  AnioNacimiento: "",
  Sexo: "Masculino",
  EstaVivo: true,
  FechaFallecimiento: "",
};

function FormularioActor() {
  const navigate = useNavigate();
  const { id } = useParams();

  const esEdicion = Boolean(id);
  const API_URL = "http://localhost:3000";

  const [formulario, setFormulario] = useState(
    formularioInicial,
  );
  const [foto, setFoto] = useState(null);
  const [vistaPrevia, setVistaPrevia] =
    useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (esEdicion) {
      obtenerActor();
    }
  }, [id]);

  useEffect(() => {
    return () => {
      if (vistaPrevia?.startsWith("blob:")) {
        URL.revokeObjectURL(vistaPrevia);
      }
    };
  }, [vistaPrevia]);

  const obtenerActor = async () => {
    try {
      const response = await api.get(`/actores/${id}`);
      const actor = response.data;

      setFormulario({
        TMDbId: actor.TMDbId || "",
        Nombres:
          actor.Nombres ||
          actor.NombreCompleto ||
          "",
        Apellidos: actor.Apellidos || "",
        NombreArtistico:
          actor.NombreArtistico || "",
        Profesion: actor.Profesion || "",
        FechaNacimiento: prepararFechaParaInput(
          actor.FechaNacimiento,
        ),
        AnioNacimiento:
          actor.AnioNacimiento || "",
        Sexo: actor.Sexo || "Masculino",
        EstaVivo: Boolean(actor.EstaVivo),
        FechaFallecimiento: prepararFechaParaInput(
          actor.FechaFallecimiento,
        ),
      });

      if (actor.Foto) {
        setVistaPrevia(`${API_URL}${actor.Foto}`);
      }
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.mensaje ||
          "Error al cargar el actor",
      );
    }
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setFormulario((actual) => {
      const nuevoFormulario = {
        ...actual,
        [name]: value,
      };

      if (name === "FechaNacimiento" && value) {
        nuevoFormulario.AnioNacimiento = "";
      }

      return nuevoFormulario;
    });
  };

  const cambiarEstadoVida = (e) => {
    const estaVivo = e.target.value === "true";

    setFormulario((actual) => ({
      ...actual,
      EstaVivo: estaVivo,
      FechaFallecimiento: estaVivo
        ? ""
        : actual.FechaFallecimiento,
    }));
  };

  const manejarFoto = (e) => {
    const archivo = e.target.files?.[0];

    if (!archivo) {
      return;
    }

    if (vistaPrevia?.startsWith("blob:")) {
      URL.revokeObjectURL(vistaPrevia);
    }

    setFoto(archivo);
    setVistaPrevia(URL.createObjectURL(archivo));
  };

  const validarFormulario = () => {
    if (
      !formulario.Nombres.trim() ||
      !formulario.Sexo
    ) {
      alert("Nombres y sexo son obligatorios");
      return false;
    }

    if (
      formulario.AnioNacimiento &&
      (Number(formulario.AnioNacimiento) < 1800 ||
        Number(formulario.AnioNacimiento) >
          new Date().getFullYear())
    ) {
      alert("El año de nacimiento no es válido");
      return false;
    }

    if (
      !formulario.EstaVivo &&
      !formulario.FechaFallecimiento
    ) {
      alert(
        "Debe indicar la fecha de fallecimiento",
      );
      return false;
    }

    if (
      formulario.FechaNacimiento &&
      formulario.FechaFallecimiento &&
      formulario.FechaFallecimiento <
        formulario.FechaNacimiento
    ) {
      alert(
        "La fecha de fallecimiento no puede ser anterior a la fecha de nacimiento",
      );
      return false;
    }

    return true;
  };

  const construirFormData = () => {
    const datos = new FormData();

    datos.append(
      "TMDbId",
      formulario.TMDbId || "",
    );
    datos.append(
      "Nombres",
      formulario.Nombres.trim(),
    );
    datos.append(
      "Apellidos",
      formulario.Apellidos.trim(),
    );
    datos.append(
      "NombreArtistico",
      formulario.NombreArtistico.trim(),
    );
    datos.append(
      "Profesion",
      formulario.Profesion,
    );
    datos.append(
      "FechaNacimiento",
      formulario.FechaNacimiento || "",
    );
    datos.append(
      "AnioNacimiento",
      formulario.AnioNacimiento || "",
    );
    datos.append("Sexo", formulario.Sexo);
    datos.append(
      "EstaVivo",
      formulario.EstaVivo,
    );
    datos.append(
      "FechaFallecimiento",
      formulario.EstaVivo
        ? ""
        : formulario.FechaFallecimiento,
    );

    if (foto) {
      datos.append("Foto", foto);
    }

    return datos;
  };

  const guardarActor = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    const datos = construirFormData();

    try {
      setGuardando(true);

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
          "Error al guardar el actor",
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="form-page-container">
      <Link
        to="/actores"
        className="btn btn-secondary mb-3"
      >
        ← Volver a Actores
      </Link>

      <div className="text-center">
        <h2>
          {esEdicion
            ? "✏️ Editar Actor"
            : "➕ Nuevo Actor"}
        </h2>
      </div>

      <form
        onSubmit={guardarActor}
        className="card mt-3 shadow"
      >
        <div className="card-body">
          {formulario.TMDbId && (
            <div className="alert alert-success">
              ✅ Talento vinculado con TMDb. ID:{" "}
              <strong>
                {formulario.TMDbId}
              </strong>
            </div>
          )}

          <ActorFormFields
            formulario={formulario}
            onChange={manejarCambio}
            onChangeEstadoVida={
              cambiarEstadoVida
            }
            onFotoChange={manejarFoto}
            vistaPrevia={vistaPrevia}
          />

          <div className="d-flex gap-2 flex-wrap mt-4">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={guardando}
            >
              {guardando
                ? "Guardando..."
                : "Guardar"}
            </button>

            <Link
              to="/actores"
              className="btn btn-secondary"
            >
              Cancelar
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}

export default FormularioActor;