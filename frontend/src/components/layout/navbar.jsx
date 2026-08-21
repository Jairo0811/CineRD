import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
<<<<<<< Updated upstream
import banderaDo from "../../branding/flag-do.svg";
import banderaUs from "../../branding/flag-us.svg";
=======
import cineRdNavbarLogo from "../../branding/cinerd-navbar.png";
>>>>>>> Stashed changes

function Navbar() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [tema, setTema] = useState(
    () => document.documentElement.dataset.theme || "light",
  );

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
  const idiomaActual = i18n.language?.startsWith("en") ? "en" : "es";

  useEffect(() => {
    document.documentElement.dataset.theme = tema;
    localStorage.setItem("cineRdTheme", tema);
  }, [tema]);

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

  const cambiarIdioma = (idioma) => {
    i18n.changeLanguage(idioma);
  };

  const alternarTema = () => {
    setTema((actual) => (actual === "dark" ? "light" : "dark"));
  };

  const etiquetaTema =
    tema === "dark"
      ? idiomaActual === "en"
        ? "Use light mode"
        : "Usar modo claro"
      : idiomaActual === "en"
        ? "Use dark mode"
        : "Usar modo oscuro";

  const etiquetaRol = esAdmin
    ? t("nav.admin")
    : esTalento
      ? t("nav.verifiedTalent")
      : t("nav.user");

  const etiquetaBusqueda = idiomaActual === "en" ? "Search" : "Buscar";
  const banderaActual = idiomaActual === "es" ? banderaDo : banderaUs;

  const estiloBandera = {
    width: "22px",
    height: "15px",
    objectFit: "cover",
    borderRadius: "2px",
    flexShrink: 0,
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark sticky-top cine-navbar cine-navbar-cinematic">
      <div className="container">
        <NavLink
          className="navbar-brand cine-navbar-brand"
          to="/"
          onClick={cerrarMenuMovil}
        >
          <img
            src={cineRdNavbarLogo}
            alt="CineRD"
            className="cine-navbar-logo-horizontal"
          />
        </NavLink>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#cineRdNavbar"
          aria-controls="cineRdNavbar"
          aria-expanded="false"
          aria-label={t("nav.toggleNavigation")}
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="cineRdNavbar">
          <ul className="navbar-nav me-auto mb-3 mb-lg-0">
            <li className="nav-item">
              <NavLink
                className={obtenerClaseNav}
                to="/"
                end
                onClick={cerrarMenuMovil}
              >
                {t("nav.home")}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={obtenerClaseNav}
                to="/peliculas"
                onClick={cerrarMenuMovil}
              >
                {t("nav.movies")}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={obtenerClaseNav}
                to="/actores"
                onClick={cerrarMenuMovil}
              >
                {t("nav.talents")}
              </NavLink>
            </li>
            {usuario && (
              <li className="nav-item">
                <NavLink
                  className={obtenerClaseNav}
                  to="/dashboard"
                  onClick={cerrarMenuMovil}
                >
                  {t("nav.space")}
                </NavLink>
              </li>
            )}
            {esUsuario && (
              <li className="nav-item">
                <NavLink
                  className={obtenerClaseNav}
                  to="/verificar-perfil"
                  onClick={cerrarMenuMovil}
                >
                  {t("nav.verifyProfile")}
                </NavLink>
              </li>
            )}
            {esAdmin && (
              <li className="nav-item">
                <NavLink
                  className={obtenerClaseNav}
                  to="/admin/verificaciones"
                  onClick={cerrarMenuMovil}
                >
                  {t("nav.verifications")}
                </NavLink>
              </li>
            )}
          </ul>

          <div className="cine-navbar-actions">
            <NavLink
              className="btn cine-btn-ghost btn-sm"
              to="/buscar"
              onClick={cerrarMenuMovil}
              aria-label={etiquetaBusqueda}
              title={etiquetaBusqueda}
            >
              🔎
            </NavLink>

            <button
              type="button"
              className="cine-theme-toggle"
              onClick={alternarTema}
              aria-label={etiquetaTema}
              title={etiquetaTema}
            >
              <span className="cine-theme-toggle-icon" aria-hidden="true">
                {tema === "dark" ? "☀️" : "🌙"}
              </span>
            </button>

            <div className="dropdown">
<<<<<<< Updated upstream
              <button
                className="btn cine-btn-ghost btn-sm dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                aria-label={t("nav.language")}
                style={{ display: "inline-flex", alignItems: "center", gap: "7px" }}
              >
                <img src={banderaActual} alt="" aria-hidden="true" style={estiloBandera} />
                <span>{idiomaActual === "es" ? "DO ES" : "US EN"}</span>
              </button>
=======
           <button
  className="btn btn-outline-secondary dropdown-toggle cine-language-button"
  type="button"
  data-bs-toggle="dropdown"
  aria-expanded="false"
>
  <span className="cine-language-flag">
    {i18n.language?.startsWith("en") ? "🇺🇸" : "🇩🇴"}
  </span>

  <span>
    {i18n.language?.startsWith("en") ? "US EN" : "DO ES"}
  </span>
</button>
>>>>>>> Stashed changes
              <ul className="dropdown-menu dropdown-menu-end cine-account-menu">
                <li>
                  <button
                    type="button"
                    className={`dropdown-item ${idiomaActual === "es" ? "active" : ""}`}
                    onClick={() => cambiarIdioma("es")}
<<<<<<< Updated upstream
                    style={{ display: "flex", alignItems: "center", gap: "9px" }}
                  >
                    <img src={banderaDo} alt="" aria-hidden="true" style={estiloBandera} />
                    <span>Español</span>
=======
                  >
                    🇩🇴 Español
>>>>>>> Stashed changes
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className={`dropdown-item ${idiomaActual === "en" ? "active" : ""}`}
                    onClick={() => cambiarIdioma("en")}
<<<<<<< Updated upstream
                    style={{ display: "flex", alignItems: "center", gap: "9px" }}
                  >
                    <img src={banderaUs} alt="" aria-hidden="true" style={estiloBandera} />
                    <span>English</span>
=======
                  >
                    🇺🇸 English
>>>>>>> Stashed changes
                  </button>
                </li>
              </ul>
            </div>

            {esAdmin && (
              <div className="cine-admin-quick-actions">
                <NavLink
                  className="btn cine-btn-ghost btn-sm"
                  to="/peliculas/nueva"
                  onClick={cerrarMenuMovil}
                >
                  {t("nav.newMovie")}
                </NavLink>
                <NavLink
                  className="btn cine-btn-accent btn-sm"
                  to="/actores/nuevo"
                  onClick={cerrarMenuMovil}
                >
                  {t("nav.newTalent")}
                </NavLink>
              </div>
            )}

            {!usuario ? (
              <>
                <NavLink
                  className="btn cine-btn-ghost btn-sm"
                  to="/login"
                  onClick={cerrarMenuMovil}
                >
                  {t("nav.login")}
                </NavLink>
                <NavLink
                  className="btn cine-btn-accent btn-sm"
                  to="/registro"
                  onClick={cerrarMenuMovil}
                >
                  {t("nav.register")}
                </NavLink>
              </>
            ) : (
              <div className="dropdown">
                <button
                  className="btn cine-account-button dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <span className="cine-account-avatar">
                    {usuario.nombre?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                  <span className="cine-account-copy">
                    <strong>{usuario.nombre}</strong>
                    <small>{etiquetaRol}</small>
                  </span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end cine-account-menu">
                  <li>
                    <NavLink
                      className="dropdown-item"
                      to="/dashboard"
                      onClick={cerrarMenuMovil}
                    >
                      {t("nav.dashboard")}
                    </NavLink>
                  </li>
                  {esUsuario && (
                    <li>
                      <NavLink
                        className="dropdown-item"
                        to="/verificar-perfil"
                        onClick={cerrarMenuMovil}
                      >
                        {t("nav.verifyProfile")}
                      </NavLink>
                    </li>
                  )}
                  {esAdmin && (
                    <li>
                      <NavLink
                        className="dropdown-item"
                        to="/admin/verificaciones"
                        onClick={cerrarMenuMovil}
                      >
                        {t("nav.manageVerifications")}
                      </NavLink>
                    </li>
                  )}
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button
                      type="button"
                      className="dropdown-item text-danger"
                      onClick={cerrarSesion}
                    >
                      {t("nav.logout")}
                    </button>
                  </li>
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
