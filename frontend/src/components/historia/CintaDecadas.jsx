import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { agruparPorDecada } from "../../data/historiaCine";

/**
 * Cinta de décadas: cada ficha enlaza al catálogo filtrado por década.
 * Muestra solo las décadas que tienen películas registradas.
 */
function CintaDecadas({ peliculas = [], activa = null, mostrarTodas = false, className = "" }) {
  const { t } = useTranslation();
  const grupos = agruparPorDecada(peliculas);

  if (grupos.length === 0) return null;

  return (
    <nav className={`decade-rail ${className}`.trim()} aria-label={t("movies.decadeFilter")}>
      {mostrarTodas && (
        <Link
          to="/peliculas"
          className={`decade-chip decade-chip-all${activa ? "" : " is-active"}`}
          aria-current={activa ? undefined : "true"}
        >
          <span className="decade-chip-year">{t("movies.allDecades")}</span>
          <small>{t("history.films", { count: peliculas.length })}</small>
        </Link>
      )}
      {grupos.map(({ decada, items }) => (
        <Link
          key={decada}
          to={`/peliculas?decada=${decada}`}
          className={`decade-chip${activa === decada ? " is-active" : ""}`}
          aria-current={activa === decada ? "true" : undefined}
        >
          <span className="decade-chip-year">{decada}s</span>
          <small>{t("history.films", { count: items.length })}</small>
        </Link>
      ))}
    </nav>
  );
}

export default CintaDecadas;
