import Home from "./home";
import DashboardUsuario from "./DashboardUsuario";
import DashboardTalento from "./DashboardTalento";

function obtenerUsuario() {
  try {
    return JSON.parse(localStorage.getItem("cineRdUsuario") || "null");
  } catch {
    return null;
  }
}

function Dashboard() {
  const usuario = obtenerUsuario();

  if (!usuario) {
    return <DashboardUsuario usuario={null} />;
  }

  if (usuario.rol === "ADMINISTRADOR") {
    return <Home />;
  }

  if (usuario.rol === "TALENTO_VERIFICADO") {
    return <DashboardTalento usuario={usuario} />;
  }

  return <DashboardUsuario usuario={usuario} />;
}

export default Dashboard;
