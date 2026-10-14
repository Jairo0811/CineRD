import { Suspense, lazy } from "react";
import PageLoader from "../components/ui/PageLoader";

const Home = lazy(() => import("./home"));
const DashboardUsuario = lazy(() => import("./DashboardUsuario"));
const DashboardTalento = lazy(() => import("./DashboardTalento"));

function obtenerUsuario() {
  try { return JSON.parse(localStorage.getItem("cineRdUsuario") || "null"); }
  catch { return null; }
}

function PanelSegunRol({ usuario }) {
  if (!usuario) return <DashboardUsuario usuario={null} />;
  if (usuario.rol === "ADMINISTRADOR") return <Home />;
  if (usuario.rol === "TALENTO_VERIFICADO") return <DashboardTalento usuario={usuario} />;
  return <DashboardUsuario usuario={usuario} />;
}

function Dashboard() {
  const usuario = obtenerUsuario();
  return <Suspense fallback={<PageLoader />}><PanelSegunRol usuario={usuario} /></Suspense>;
}

export default Dashboard;
