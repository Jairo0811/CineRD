import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HITOS } from "../../data/historiaCine";

// Seis paradas que resumen la historia; el detalle completo vive en /historia.
const PARADAS = ["1922", "1963", "1995", "2003", "2010", "2025"];

function LineaTiempoMini() {
  const { t, i18n } = useTranslation();
  const idioma = i18n.language?.startsWith("en") ? "en" : "es";
  const paradas = PARADAS.map((id) => HITOS.find((h) => h.id === id)).filter(Boolean);

  return (
    <section className="mini-timeline-section" aria-labelledby="mini-timeline-title">
      <div className="mini-timeline-heading">
        <div>
          <span className="public-eyebrow">{t("home.timelineEyebrow")}</span>
          <h2 id="mini-timeline-title">{t("home.timelineTitle")}</h2>
        </div>
        <Link to="/historia" className="mini-timeline-cta">{t("home.timelineCta")}</Link>
      </div>

      <ol className="mini-timeline">
        {paradas.map((hito) => (
          <li key={hito.id}>
            <Link to={`/historia#h-${hito.id}`}>
              <span className="mini-timeline-year">{hito.etiquetaAnio || hito.anio}</span>
              <strong>{hito[idioma].titulo}</strong>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default LineaTiempoMini;
