import { NavLink, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const usuario = (() => {
    try {
      return JSON.parse(localStorage.getItem("cineRdUsuario") || "null");
    } catch {
      return null;
    }
  })();

  const esAdmin = usuario?.rol === "ADMINISTRADOR";

  const obtenerClaseNav = ({ isActive }) =>
    `nav-link cine-navbar-link ${isActive ? "active fw-semibold" : ""}`;

  const cerrarMenuMovil = () => {
    const menu = document.getElementById("cineRdNavbar");
    if (!menu?.classList.contains("show")) return;
    document.querySelector('[data-bs-target="#cineRdNavbar"]')?.click();
  };

  const cerrarSesion = () => {
    localStorage.removeItem("cineRdAccessToken");
    localStorage.removeItem("cineRdUsuario");
    cerrarMenuMovil();
    navigate("/");
    window.location.reload();
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm sticky-top cine-navbar">
      <div className="container">
        <NavLink className="navbar-brand cine-navbar-brand" to="/" onClick={cerrarMenuMovil}>
          <img src="/logo.png" alt="Logo de CineRD" className="cine-navbar-logo" />
          <span>CineRD</span>
        </NavLink>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#cineRdNavbar"
          aria-controls="cineRdNavbar" aria-expanded="false" aria-label="Mostrar u ocultar navegación">
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="cineRdNavbar">
          <ul className="navbar-nav me-auto mb-3 mb-lg-0">
            <li className="nav-item"><NavLink className={obtenerClaseNav} to="/" end onClick={cerrarMenuMovil}>Inicio</NavLink></li>
            <li className="nav-item"><NavLink className={obtenerClaseNav} to="/peliculas" onClick={cerrarMenuMovil}>Películas</NavLink></li>
            <li className="nav-item"><NavLink className={obtenerClaseNav} to="/actores" onClick={cerrarMenuMovil}>Talentos</NavLink></li>
            {esAdmin && (
              <li className="nav-item"><NavLink className={obtenerClaseNav} to="/admin/verificaciones" onClick={cerrarMenuMovil}>Verificaciones</NavLink></li>
            )}
          </ul>

          <div className="cine-navbar-actions">
            {esAdmin && (
              <>
                <NavLink className="btn btn-outline-primary btn-sm" to="/peliculas/nueva" onClick={cerrarMenuMovil}>+ Nueva película</NavLink>
                <NavLink className="btn btn-primary btn-sm" to="/actores/nuevo" onClick={cerrarMenuMovil}>+ Nuevo talento</NavLink>
              </>
            )}

            {!usuario ? (
              <>
                <NavLink className="btn btn-outline-secondary btn-sm" to="/login" onClick={cerrarMenuMovil}>Ingresar</NavLink>
                <NavLink className="btn btn-dark btn-sm" to="/registro" onClick={cerrarMenuMovil}>Crear cuenta</NavLink>
              </>
            ) : (
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={cerrarSesion}>
                Salir · {usuario.nombre}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
