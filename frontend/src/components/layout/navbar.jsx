import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import banderaDo from "../../branding/flag-do.svg";
import banderaUs from "../../branding/flag-us.svg";
import cineRdNavbarLogo from "../../branding/cinerd-navbar.png";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
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
  const etiquetaCreditos = idiomaActual === "en" ? "Credit claims" : "Créditos";
  const etiquetaPremios = idiomaActual === "en" ? "Awards" : "Premios";
  const etiquetaGaleria = idiomaActual === "en" ? "Gallery" : "Galería";
  const etiquetaEditorial = idiomaActual === "en" ? "Editorial" : "Editorial";
  const etiquetaCrear = idiomaActual === "en" ? "Create" : "Crear";
  const etiquetaReclamarCredito = idiomaActual === "en" ? "Claim a credit" : "Reclamar crédito";
  const banderaActual = idiomaActual === "es" ? banderaDo : banderaUs;
  const editorialActivo = location.pathname.startsWith("/admin/");

  const estiloBandera = {
    width: "22px",
    height: "15px",
    maxWidth: "22px",
    objectFit: "cover",
    borderRadius: "2px",
    flexShrink: 0,
    display: "block",
  };

  const estiloOpcionIdioma = {
    display: "flex",
    alignItems: "center",
    gap: "9px",
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
              <NavLink className={obtenerClaseNav} to="/" end onClick={cerrarMenuMovil}>
                {t("nav.home")}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={obtenerClaseNav} to="/peliculas" onClick={cerrarMenuMovil}>
                {t("nav.movies")}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={obtenerClaseNav} to="/actores" onClick={cerrarMenuMovil}>
                {t("nav.talents")}
              </NavLink>
            </li>
            {usuario && (
              <li className="nav-item">
                <NavLink className={obtenerClaseNav} to="/dashboard" onClick={cerrarMenuMovil}>
                  {t("nav.space")}
                </NavLink>
              </li>
            )}
            {esUsuario && (
              <li className="nav-item">
                <NavLink className={obtenerClaseNav} to="/verificar-perfil" onClick={cerrarMenuMovil}>
                  {t("nav.verifyProfile")}
                </NavLink>
              </li>
            )}
            {esAdmin && (
              <li className="nav-item dropdown">
                <button
                  className={`nav-link cine-navbar-link dropdown-toggle ${editorialActivo ? "active" : ""}`}
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {etiquetaEditorial}
                </button>
                <ul className="dropdown-menu cine-account-menu">
                  <li>
                    <NavLink className="dropdown-item" to="/admin/verificaciones" onClick={cerrarMenuMovil}>
                      ✓ {t("nav.verifications")}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink className="dropdown-item" to="/admin/solicitudes-creditos" onClick={cerrarMenuMovil}>
                      🎬 {etiquetaCreditos}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink className="dropdown-item" to="/admin/premios" onClick={cerrarMenuMovil}>
                      🏆 {etiquetaPremios}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink className="dropdown-item" to="/admin/galeria" onClick={cerrarMenuMovil}>
                      🖼️ {etiquetaGaleria}
                    </NavLink>
                  </li>
                </ul>
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
              <button
                className="btn cine-btn-ghost btn-sm dropdown-toggle cine-language-button"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                aria-label={t("nav.language")}
                style={{ display: "inline-flex", alignItems: "center", gap: "7px" }}
              >
                <img src={banderaActual} alt="" aria-hidden="true" style={estiloBandera} />
                <span>{idiomaActual === "es" ? "DO ES" : "US EN"}</span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end cine-account-menu">
                <li>
                  <button
                    type="button"
                    className={`dropdown-item cine-language-option ${idiomaActual === "es" ? "active" : ""}`}
                    onClick={() => cambiarIdioma("es")}
                    style={estiloOpcionIdioma}
                  >
                    <img src={banderaDo} alt="" aria-hidden="true" style={estiloBandera} />
                    <span>Español</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className={`dropdown-item cine-language-option ${idiomaActual === "en" ? "active" : ""}`}
                    onClick={() => cambiarIdioma("en")}
                    style={estiloOpcionIdioma}
                  >
                    <img src={banderaUs} alt="" aria-hidden="true" style={estiloBandera} />
                    <span>English</span>
                  </button>
                </li>
              </ul>
            </div>

            {esAdmin && (
              <div className="dropdown">
                <button
                  className="btn cine-btn-accent btn-sm dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  + {etiquetaCrear}
                </button>
                <ul className="dropdown-menu dropdown-menu-end cine-account-menu">
                  <li>
                    <NavLink className="dropdown-item" to="/peliculas/nueva" onClick={cerrarMenuMovil}>
                      🎬 {t("nav.newMovie")}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink className="dropdown-item" to="/actores/nuevo" onClick={cerrarMenuMovil}>
                      🎭 {t("nav.newTalent")}
                    </NavLink>
                  </li>
                </ul>
              </div>
            )}

            {!usuario ? (
              <>
                <NavLink className="btn cine-btn-ghost btn-sm" to="/login" onClick={cerrarMenuMovil}>
                  {t("nav.login")}
                </NavLink>
                <NavLink className="btn cine-btn-accent btn-sm" to="/registro" onClick={cerrarMenuMovil}>
                  {t("nav.register")}
                </NavLink>
              </>
            ) : (
              <div className="dropdown">
                <button className="btn cine-account-button dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
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
                    <NavLink className="dropdown-item" to="/dashboard" onClick={cerrarMenuMovil}>
                      {t("nav.dashboard")}
                    </NavLink>
                  </li>
                  {esTalento && (
                    <li>
                      <NavLink className="dropdown-item" to="/mi-perfil/reclamar-credito" onClick={cerrarMenuMovil}>
                        {etiquetaReclamarCredito}
                      </NavLink>
                    </li>
                  )}
                  {esUsuario && (
                    <li>
                      <NavLink className="dropdown-item" to="/verificar-perfil" onClick={cerrarMenuMovil}>
                        {t("nav.verifyProfile")}
                      </NavLink>
                    </li>
                  )}
                  {esAdmin && (
                    <>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <NavLink className="dropdown-item" to="/admin/verificaciones" onClick={cerrarMenuMovil}>
                          {etiquetaEditorial}
                        </NavLink>
                      </li>
                    </>
                  )}
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button type="button" className="dropdown-item text-danger" onClick={cerrarSesion}>
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
