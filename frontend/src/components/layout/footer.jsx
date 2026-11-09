import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CREDITOS_FOTOGRAFICOS } from "../../data/fotosLibresTalentos";
import { DEMO_MODE } from "../../config/api";

function Footer() {
  const { t, i18n } = useTranslation();
  const anioActual = new Date().getFullYear();

  return (
    <footer className="cine-footer">
      <div className="cine-footer-strip" aria-hidden="true" />
      <div className="container">
        <div className="cine-footer-grid">
          <div className="cine-footer-brand">
            <img src="/logo-cinerd.webp" alt="CineRD" className="cine-footer-logo" />
            <div>
              <p className="cine-footer-tagline">{t("footer.tagline")}</p>
              <p className="cine-footer-description">{t("footer.description")}</p>
            </div>
          </div>

          <nav className="cine-footer-links" aria-label={t("footer.explore")}>
            <strong>{t("footer.explore")}</strong>
            <Link to="/historia">{t("nav.history")}</Link>
            <Link to="/sobre-cinerd">{i18n.language?.startsWith("en") ? "About CineRD" : "Sobre CineRD"}</Link>
            <Link to="/peliculas">{t("nav.movies")}</Link>
            <Link to="/actores">{t("nav.talents")}</Link>
          </nav>

          <nav className="cine-footer-links" aria-label={t("footer.explore") + " / Legal"}>
            <strong>{i18n.language?.startsWith("en") ? "Legal & contact" : "Información y contacto"}</strong>
            <Link to="/privacidad">{i18n.language?.startsWith("en") ? "Privacy Policy" : "Política de Privacidad"}</Link>
            <Link to="/terminos">{i18n.language?.startsWith("en") ? "Terms of Use" : "Términos de Uso"}</Link>
            <Link to="/contacto">{i18n.language?.startsWith("en") ? "Contact" : "Contacto"}</Link>
          </nav>
        </div>

        <p className="cine-footer-copy">
          © {anioActual} CineRD | {t("footer.rights")}
        </p>

        <div className="cine-footer-attribution">
          {t("footer.tmdb")}
        </div>

        {DEMO_MODE && <details className="cine-footer-photo-credits mt-3">
          <summary>{i18n.language?.startsWith("en") ? "Photo credits and licenses" : "Créditos y licencias de fotografías"} ({CREDITOS_FOTOGRAFICOS.length})</summary>
          <p className="small mt-2 mb-2">{i18n.language?.startsWith("en")
            ? "Selected talent photos are hosted by Wikimedia Commons under the specified Creative Commons licenses. Original uploaded photos with pending rights are not published."
            : "Algunas fotos de talentos proceden de Wikimedia Commons bajo las licencias Creative Commons indicadas. Las fotografías originales con derechos pendientes continúan sin publicarse."}</p>
          <ul className="list-unstyled small mb-0">
            {CREDITOS_FOTOGRAFICOS.map((foto) => <li key={foto.id} className="mb-1">
              {foto.nombre} · {foto.autor} · <a href={foto.fuente} target="_blank" rel="noopener noreferrer">{foto.archivo}</a> · <a href={foto.enlaceLicencia} target="_blank" rel="noopener noreferrer">{foto.licencia}</a>
            </li>)}
          </ul>
        </details>}
      </div>
    </footer>
  );
}

export default Footer;
