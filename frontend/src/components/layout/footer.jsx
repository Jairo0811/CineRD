import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function Footer() {
  const { t } = useTranslation();
  const anioActual = new Date().getFullYear();

  return (
    <footer className="cine-footer">
      <div className="cine-footer-strip" aria-hidden="true" />
      <div className="container">
        <div className="cine-footer-grid">
          <div className="cine-footer-brand">
            <img src="/logo.png" alt="CineRD" className="cine-footer-logo" />
            <div>
              <p className="cine-footer-tagline">{t("footer.tagline")}</p>
              <p className="cine-footer-description">{t("footer.description")}</p>
            </div>
          </div>

          <nav className="cine-footer-links" aria-label={t("footer.explore")}>
            <strong>{t("footer.explore")}</strong>
            <Link to="/historia">{t("nav.history")}</Link>
            <Link to="/peliculas">{t("nav.movies")}</Link>
            <Link to="/actores">{t("nav.talents")}</Link>
          </nav>
        </div>

        <p className="cine-footer-copy">
          © {anioActual} CineRD | {t("footer.rights")}
        </p>

        <div className="cine-footer-attribution">
          {t("footer.tmdb")}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
