import { NavLink } from "react-router-dom";

function Navbar() {
  const obtenerClaseNav = ({ isActive }) =>
    `nav-link cine-navbar-link ${
      isActive ? "active fw-semibold" : ""
    }`;

  const cerrarMenuMovil = () => {
    const menu = document.getElementById("cineRdNavbar");

    if (!menu?.classList.contains("show")) {
      return;
    }

    const boton = document.querySelector(
      '[data-bs-target="#cineRdNavbar"]',
    );

    boton?.click();
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm sticky-top cine-navbar">
      <div className="container">
        <NavLink
          className="navbar-brand cine-navbar-brand"
          to="/"
          onClick={cerrarMenuMovil}
        >
          <img
            src="/logo.png"
            alt="Logo de CineRD"
            className="cine-navbar-logo"
          />

          <span>CineRD</span>
        </NavLink>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#cineRdNavbar"
          aria-controls="cineRdNavbar"
          aria-expanded="false"
          aria-label="Mostrar u ocultar navegación"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div
          className="collapse navbar-collapse"
          id="cineRdNavbar"
        >
          <ul className="navbar-nav me-auto mb-3 mb-lg-0">
            <li className="nav-item">
              <NavLink
                className={obtenerClaseNav}
                to="/"
                end
                onClick={cerrarMenuMovil}
              >
                Inicio
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                className={obtenerClaseNav}
                to="/peliculas"
                onClick={cerrarMenuMovil}
              >
                Películas
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                className={obtenerClaseNav}
                to="/actores"
                onClick={cerrarMenuMovil}
              >
                Actores
              </NavLink>
            </li>
          </ul>

          <div className="cine-navbar-actions">
            <NavLink
              className="btn btn-outline-primary btn-sm"
              to="/peliculas/nueva"
              onClick={cerrarMenuMovil}
            >
              + Nueva película
            </NavLink>

            <NavLink
              className="btn btn-primary btn-sm"
              to="/actores/nuevo"
              onClick={cerrarMenuMovil}
            >
              + Nuevo actor
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;