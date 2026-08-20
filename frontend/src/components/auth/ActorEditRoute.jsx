import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import api from "../../services/api";

function obtenerUsuario() {
  try {
    return JSON.parse(localStorage.getItem("cineRdUsuario") || "null");
  } catch {
    return null;
  }
}

function ActorEditRoute({ children }) {
  const { id } = useParams();
  const usuario = obtenerUsuario();
  const [estado, setEstado] = useState("CARGANDO");

  useEffect(() => {
    if (!usuario) {
      setEstado("SIN_SESION");
      return;
    }

    if (usuario.rol === "ADMINISTRADOR") {
      setEstado("AUTORIZADO");
      return;
    }

    if (usuario.rol !== "TALENTO_VERIFICADO") {
      setEstado("DENEGADO");
      return;
    }

    api.get("/verificaciones/mi-perfil")
      .then((response) => {
        setEstado(Number(response.data?.Id) === Number(id) ? "AUTORIZADO" : "DENEGADO");
      })
      .catch(() => setEstado("DENEGADO"));
  }, [id]);

  if (estado === "CARGANDO") {
    return <div className="text-center py-5"><div className="spinner-border text-primary" role="status"/><p className="text-muted mt-3">Validando permisos...</p></div>;
  }

  if (estado === "SIN_SESION") return <Navigate to="/login" replace />;
  if (estado === "DENEGADO") return <Navigate to="/dashboard" replace />;
  return children;
}

export default ActorEditRoute;