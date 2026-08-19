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
  const esTalento = usuario?.rol === "TALENTO_VERIFICADO";
  const esUsuario = usuario?.rol === "USUARIO";

  const obtenerClaseNav = ({ isActive }) =>
    `nav-link cine-navbar-link ${isActive ? "active" : ""}`;

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

  const etiquetaRol = esAdmin
    ? "Administrador"
    : esTalento
      ? "Talento verificado"
      : "Usuario";

  return (
    <nav className="navbar navbar-expand-lg navbar-dark sticky-top cine-navbar cine-navbar-cinematic">
      <div className="container">
        <NavLink className="navbar-brand cine-navbar-brand" to="/" onClick={cerrarMenuMovil}>
          <img src="/logo.png" alt="CineRD" className="cine-navbar-logo" />
          <span className="cine-navbar-wordmark">Cine<span>RD</span></span>
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
            {usuario && <li className="nav-item"><NavLink className={obtenerClaseNav} to="/dashboard" onClick={cerrarMenuMovil}>Mi espacio</NavLink></li>}
            {esUsuario && <li className="nav-item"><NavLink className={obtenerClaseNav} to="/verificar-perfil" onClick={cerrarMenuMovil}>Verificar perfil</NavLink></li>}
            {esAdmin && <li className="nav-item"><NavLink className={obtenerClaseNav} to="/admin/verificaciones" onClick={cerrarMenuMovil}>Verificaciones</NavLink></li>}
          </ul>

          <div className="cine-navbar-actions">
            {esAdmin && (
              <div className="cine-admin-quick-actions">
                <NavLink className="btn cine-btn-ghost btn-sm" to="/peliculas/nueva" onClick={cerrarMenuMovil}>+ Película</NavLink>
                <NavLink className="btn cine-btn-accent btn-sm" to="/actores/nuevo" onClick={cerrarMenuMovil}>+ Talento</NavLink>
              </div>
            )}

            {!usuario ? (
              <>
                <NavLink className="btn cine-btn-ghost btn-sm" to="/login" onClick={cerrarMenuMovil}>Ingresar</NavLink>
                <NavLink className="btn cine-btn-accent btn-sm" to="/registro" onClick={cerrarMenuMovil}>Crear cuenta</NavLink>
              </>
            ) : (
              <div className="dropdown">
                <button className="btn cine-account-button dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <span className="cine-account-avatar">{usuario.nombre?.charAt(0)?.toUpperCase() || "U"}</span>
                  <span className="cine-account-copy">
                    <strong>{usuario.nombre}</strong>
                    <small>{etiquetaRol}</small>
                  </span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end cine-account-menu">
                  <li><NavLink className="dropdown-item" to="/dashboard" onClick={cerrarMenuMovil}>Mi dashboard</NavLink></li>
                  {esUsuario && <li><NavLink className="dropdown-item" to="/verificar-perfil" onClick={cerrarMenuMovil}>Verificar mi perfil</NavLink></li>}
                  {esAdmin && <li><NavLink className="dropdown-item" to="/admin/verificaciones" onClick={cerrarMenuMovil}>Gestionar verificaciones</NavLink></li>}
                  <li><hr className="dropdown-divider" /></li>
                  <li><button type="button" className="dropdown-item text-danger" onClick={cerrarSesion}>Cerrar sesión</button></li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
