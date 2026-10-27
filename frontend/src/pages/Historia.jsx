import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import { API_URL } from "../config/api";
import {
  ERAS,
  ERAS_TEXTO,
  FUENTES,
  HITOS,
  agruparPorDecada,
  etiquetaDecada,
  peliculasDelHito,
} from "../data/historiaCine";

const AnioPrimeraFiccion = 1922;

function Historia() {
  const { t, i18n } = useTranslation();
  const { hash } = useLocation();
  const idioma = i18n.language?.startsWith("en") ? "en" : "es";
  const [peliculas, setPeliculas] = useState([]);

  useEffect(() => {
    let activo = true;
    api
      .get("/peliculas")
      .then((respuesta) => activo && setPeliculas(respuesta.data || []))
      .catch((error) => console.error("Error al cargar el archivo para la cronología:", error));
    return () => {
      activo = false;
    };
  }, []);

  // Los enlaces con #hito llegan antes de que el catálogo cargue; reajusta al terminar.
  useEffect(() => {
    if (!hash) return;
    document.getElementById(hash.slice(1))?.scrollIntoView({ block: "start" });
  }, [hash, peliculas.length]);

  const grupos = useMemo(() => agruparPorDecada(peliculas), [peliculas]);
  const erasConHitos = useMemo(
    () => ERAS.map((era) => ({ era, hitos: HITOS.filter((hito) => hito.era === era.id) })),
    [],
  );
  const aniosDesdeFiccion = new Date().getFullYear() - AnioPrimeraFiccion;
  const rangoEra = (era) => `${era.desde} — ${era.hasta ?? (idioma === "en" ? "today" : "hoy")}`;
  const urlFoto = (pelicula) => (pelicula.Foto ? `${API_URL}${pelicula.Foto}` : null);

  return (
    <div className="history-page">
      <header className="history-hero">
        <div className="history-hero-strip" aria-hidden="true" />
        <span className="public-eyebrow">{t("history.eyebrow")}</span>
        <h1>{t("history.title")}</h1>
        <p>{t("history.description")}</p>
        <dl className="history-hero-stats">
          <div><dt>{t("history.yearsSince")}</dt><dd>{aniosDesdeFiccion}</dd></div>
          <div><dt>{t("history.milestones")}</dt><dd>{HITOS.length}</dd></div>
          <div><dt>{t("history.archiveFilms")}</dt><dd>{peliculas.length}</dd></div>
        </dl>
      </header>

      <nav className="history-era-nav" aria-label={t("history.eras")}>
        {erasConHitos.map(({ era }) => (
          <a key={era.id} href={`#era-${era.id}`}>
            <small>{era.desde}{era.hasta ? `–${String(era.hasta).slice(2)}` : "+"}</small>
            <span>{ERAS_TEXTO[era.id][idioma].nombre}</span>
          </a>
        ))}
      </nav>

      <div className="history-timeline-wrap" aria-label={t("history.timelineLabel")}>
        {erasConHitos.map(({ era, hitos }) => (
          <section key={era.id} id={`era-${era.id}`} className="history-era">
            <header className="history-era-header">
              <span className="history-era-range">{rangoEra(era)}</span>
              <h2>{ERAS_TEXTO[era.id][idioma].nombre}</h2>
              <p>{ERAS_TEXTO[era.id][idioma].resumen}</p>
            </header>

            <ol className="history-timeline">
              {hitos.map((hito) => {
                const enArchivo = peliculasDelHito(hito, peliculas);
                return (
                  <li key={hito.id} id={`h-${hito.id}`} className={`history-item${hito.destacado ? " is-featured" : ""}`}>
                    <div className="history-item-year">{hito.etiquetaAnio || hito.anio}</div>
                    <article className="history-item-card">
                      <h3>{hito[idioma].titulo}</h3>
                      <p>{hito[idioma].texto}</p>
                      {enArchivo.length > 0 && (
                        <div className="history-item-archive">
                          <small>{t("history.inArchive")}</small>
                          <div>
                            {enArchivo.map((pelicula) => (
                              <Link key={pelicula.Id} to={`/peliculas/${pelicula.Id}`} className="history-film-chip">
                                {urlFoto(pelicula) && <img src={urlFoto(pelicula)} alt="" loading="lazy" />}
                                <span>{pelicula.Titulo}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </article>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>

      <section className="history-archive" aria-labelledby="history-archive-title">
        <span className="public-eyebrow">{t("history.archiveEyebrow")}</span>
        <h2 id="history-archive-title">{t("history.archiveTitle")}</h2>
        <p>{t("history.archiveDescription")}</p>

        {grupos.length === 0 && <p className="history-empty">{t("history.noFilms")}</p>}

        {grupos.map(({ decada, items }) => (
          <div key={decada} className="history-decade">
            <div className="history-decade-head">
              <h3>{etiquetaDecada(decada, idioma)}</h3>
              <span>{t("history.films", { count: items.length })}</span>
              <Link to={`/peliculas?decada=${decada}`}>{t("history.viewDecade")}</Link>
            </div>
            <ul className="history-decade-posters">
              {items.slice(0, 12).map((pelicula) => (
                <li key={pelicula.Id}>
                  <Link to={`/peliculas/${pelicula.Id}`} title={pelicula.Titulo}>
                    {urlFoto(pelicula) ? <img src={urlFoto(pelicula)} alt={pelicula.Titulo} loading="lazy" /> : <span>{pelicula.Titulo}</span>}
                    <small>{String(pelicula.FechaEstreno).substring(0, 4)}</small>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <footer className="history-sources">
        <h2>{t("history.sourcesTitle")}</h2>
        <ul>
          {FUENTES.map((fuente) => (
            <li key={fuente.url}>
              <a href={fuente.url} target="_blank" rel="noreferrer noopener">{fuente.nombre}</a>
            </li>
          ))}
        </ul>
        <p>{t("history.sourcesNote")}</p>
      </footer>
    </div>
  );
}

export default Historia;
