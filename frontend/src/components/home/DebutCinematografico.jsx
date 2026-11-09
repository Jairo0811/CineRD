import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { manejarErrorFotoTalento, obtenerFotoTalento } from "../../utils/talentoPlaceholder";

const anioEstreno = (fecha) => {
  const match = String(fecha || "").match(/^\d{4}/);
  return match ? match[0] : null;
};

export default function DebutCinematografico({ debuts = [], cargando = false, error = false }) {
  const { t } = useTranslation();

  return (
    <section className="cinematic-showcase-section cinematic-debuts-section" aria-labelledby="cinematic-debuts-title">
      <div className="cinematic-showcase-heading">
        <div>
          <span className="public-eyebrow">{t("home.debutsEyebrow")}</span>
          <h2 id="cinematic-debuts-title">{t("home.debutsTitle")}</h2>
          <p>{t("home.debutsDescription")}</p>
        </div>
        <Link to="/actores">{t("home.viewTalents")}</Link>
      </div>

      {debuts.length > 0 ? (
        <div className="cinematic-debuts-grid">
          {debuts.map((debut) => {
            const nombre = debut.NombreArtistico || debut.NombreCompleto || t("talents.talent");
            const anio = anioEstreno(debut.FechaEstreno);
            return (
              <article className="cinematic-debut-card" key={`${debut.ActorId}-${debut.PeliculaId}`}>
                <Link to={`/actores/${debut.ActorId}`} className="cinematic-debut-portrait" aria-label={t("home.debutsViewTalent", { name: nombre })}>
                  <img
                    src={obtenerFotoTalento({ Id: debut.ActorId, Foto: debut.FotoTalento, Sexo: debut.Sexo })}
                    alt={nombre}
                    loading="lazy"
                    onError={(event) => manejarErrorFotoTalento(event, debut.Sexo)}
                  />
                </Link>
                <div className="cinematic-debut-copy">
                  <span className="cinematic-debut-label">{t("home.debutsBadge")}</span>
                  <h3><Link to={`/actores/${debut.ActorId}`}>{nombre}</Link></h3>
                  {debut.Personaje?.trim() && (
                    <p className="cinematic-debut-character">
                      {t("home.debutsAsCharacter", { character: debut.Personaje.trim() })}
                    </p>
                  )}
                  <div className="cinematic-debut-film">
                    <span aria-hidden="true">🎬</span>
                    <div>
                      <small>{t("home.debutsFirstFilm")}</small>
                      <Link to={`/peliculas/${debut.PeliculaId}`}>
                        {debut.PeliculaTitulo}
                      </Link>
                      {anio && <span className="cinematic-debut-year">{anio}</span>}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="cinematic-debuts-empty" role="status">
          {cargando ? t("home.debutsLoading") : error ? t("home.debutsError") : t("home.debutsEmpty")}
        </p>
      )}
      <p className="cinematic-debuts-note">{t("home.debutsNote")}</p>
    </section>
  );
}
