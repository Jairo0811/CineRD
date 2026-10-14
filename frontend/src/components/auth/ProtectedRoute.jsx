import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { limpiarSesion, renovarSesion } from "../../services/api";
import PageLoader from "../ui/PageLoader";

const FUERA = { estado: "fuera" };

const decodificarPayload = (token) => {
  const partes = token.split(".");
  if (partes.length !== 3) return null;
  const base64 = partes[1].replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  return JSON.parse(atob(padded));
};

function leerSesion() {
  try {
    const usuario = JSON.parse(localStorage.getItem("cineRdUsuario") || "null");
    const token = localStorage.getItem("cineRdAccessToken");
    if (!usuario || !token) return FUERA;
    const payload = decodificarPayload(token);
    if (!payload) { limpiarSesion(); return FUERA; }
    const expiraEn = Number(payload.exp || 0) * 1000;
    if (!expiraEn) { limpiarSesion(); return FUERA; }
    if (Date.now() >= expiraEn) return { estado: "renovar" };
    return { estado: "ok", usuario };
  } catch {
    limpiarSesion();
    return FUERA;
  }
}

function ProtectedRoute({ children, roles = [] }) {
  const [sesion, setSesion] = useState(leerSesion);

  useEffect(() => {
    if (sesion.estado !== "renovar") return undefined;
    let activo = true;
    renovarSesion()
      .then(() => {
        if (!activo) return;
        const nueva = leerSesion();
        setSesion(nueva.estado === "ok" ? nueva : FUERA);
      })
      .catch(() => {
        limpiarSesion();
        if (activo) setSesion(FUERA);
      });
    return () => { activo = false; };
  }, [sesion.estado]);

  if (sesion.estado === "renovar") return <PageLoader />;
  if (sesion.estado !== "ok") return <Navigate to="/login?session=expired" replace />;
  if (roles.length > 0 && !roles.includes(sesion.usuario.rol)) return <Navigate to="/dashboard" replace />;
  return children;
}

export default ProtectedRoute;
