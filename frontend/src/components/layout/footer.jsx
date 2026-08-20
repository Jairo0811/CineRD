import { useTranslation } from "react-i18next";

function Footer() {
  const { t } = useTranslation();
  const anioActual = new Date().getFullYear();

  return (
    <footer className="cine-footer">
      <div className="container">
        <div className="cine-footer-content">
          <img src="/logo.png" alt="CineRD" className="cine-footer-logo" />

          <p className="cine-footer-description">
            {t("footer.description")}
          </p>

          <p className="cine-footer-copy">
            © {anioActual} CineRD | {t("footer.rights")}
          </p>
        </div>

        <div className="cine-footer-attribution">
          {t("footer.tmdb")}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
