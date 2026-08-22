import { Navigate } from "react-router-dom";
import { limpiarSesion } from "../../services/api";

function leerSesion() {
  try {
    const usuario = JSON.parse(localStorage.getItem("cineRdUsuario") || "null");
    const token = localStorage.getItem("cineRdAccessToken");
    if (!usuario || !token) return null;

    const partes = token.split(".");
    if (partes.length !== 3) return null;

    const payload = JSON.parse(atob(partes[1].replace(/-/g, "+").replace(/_/g, "/")));
    const expiraEn = Number(payload?.exp || 0) * 1000;

    if (!expiraEn || Date.now() >= expiraEn) {
      limpiarSesion();
      return null;
    }

    return usuario;
  } catch {
    limpiarSesion();
    return null;
  }
}

function ProtectedRoute({ children, roles = [] }) {
  const usuario = leerSesion();

  if (!usuario) {
    return <Navigate to="/login?session=expired" replace />;
  }

  if (roles.length > 0 && !roles.includes(usuario.rol)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;
