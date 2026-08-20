import { Navigate } from "react-router-dom";

function obtenerUsuario() {
  try {
    return JSON.parse(localStorage.getItem("cineRdUsuario") || "null");
  } catch {
    return null;
  }
}

function ProtectedRoute({ children, roles = [] }) {
  const usuario = obtenerUsuario();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(usuario.rol)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;