import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import { API_URL } from "../config/api";

function Peliculas() {
  const { t, i18n } = useTranslation();
  const [peliculas, setPeliculas] = useState([]);
  const [buscar, setBuscar] = useState("");
  const [orden, setOrden] = useState("estrenoDesc");
  const [genero, setGenero] = useState("");

  const usuario = (() => { try { return JSON.parse(localStorage.getItem("cineRdUsuario") || "null"); } catch { return null; } })();
  const esAdmin = usuario?.rol === "ADMINISTRADOR";

  useEffect(() => { obtenerPeliculas(); }, [buscar, orden, genero]);

  const obtenerPeliculas = async () => {
    try {
      const response = await api.get("/peliculas", { params: { buscar, orden, genero } });
      setPeliculas(response.data || []);
    } catch (error) { console.error(error); }
  };

  const eliminarPelicula = async (id) => {
    if (!esAdmin || !window.confirm(t("movies.confirmDelete"))) return;
    try { await api.delete(`/peliculas/${id}`); await obtenerPeliculas(); }
    catch (error) { console.error(error); alert(error.response?.data?.mensaje || error.response?.data?.error || t("movies.deleteError")); }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return t("movies.noDate");
    const valor = new Date(`${fecha.substring(0, 10)}T12:00:00`);
    if (Number.isNaN(valor.getTime())) return t("movies.noDate");
    return new Intl.DateTimeFormat(i18n.language === "en" ? "en-US" : "es-DO", { day: "2-digit", month: "2-digit", year: "numeric" }).format(valor);
  };

  const generoTraducido = (valor) => valor ? t(`genres.${valor}`, { defaultValue: valor }) : t("movies.dominicanCinema");

  return (
    <div className="table-page-container catalog-page">
      <header className="catalog-hero catalog-hero-movies">
        <div>
          <span className="catalog-eyebrow">{t("movies.eyebrow")}</span>
          <h1>{t("movies.title")}</h1>
          <p>{t("movies.description")}</p>
        </div>
        <div className="catalog-hero-meta"><strong>{peliculas.length}</strong><span>{t("movies.found")}</span></div>
        {esAdmin && <Link to="/peliculas/nueva" className="btn catalog-admin-button">{t("movies.new")}</Link>}
      </header>

      <section className="catalog-filter-bar">
        <div className="catalog-search"><span>⌕</span><input type="text" placeholder={t("movies.search")} value={buscar} onChange={(e) => setBuscar(e.target.value)} /></div>
        <select value={orden} onChange={(e) => setOrden(e.target.value)} aria-label={t("movies.order") }>
          <option value="estrenoDesc">{t("movies.releaseNewest")}</option><option value="estrenoAsc">{t("movies.releaseOldest")}</option><option value="az">{t("movies.titleAZ")}</option><option value="za">{t("movies.titleZA")}</option><option value="masActores">{t("movies.largestCast")}</option><option value="menosActores">{t("movies.smallestCast")}</option>
        </select>
        <select value={genero} onChange={(e) => setGenero(e.target.value)} aria-label={t("movies.genreFilter")}>
          <option value="">{t("movies.allGenres")}</option>{["Comedia","Drama","Acción","Terror","Romance","Documental"].map(g=><option key={g} value={g}>{generoTraducido(g)}</option>)}
        </select>
      </section>

      <section className="movie-catalog-grid">
        {peliculas.map((pelicula) => (
          <article className="cinerd-movie-card" key={pelicula.Id}>
            <Link to={`/peliculas/${pelicula.Id}`} className="cinerd-poster-wrap">
              {pelicula.Foto ? <img src={`${API_URL}${pelicula.Foto}`} alt={pelicula.Titulo} className="cinerd-poster" /> : <div className="cinerd-poster cinerd-poster-empty">🎬</div>}
              <div className="cinerd-poster-overlay"><span>{t("movies.viewMovie")}</span></div>
              <span className="cinerd-date-chip">{formatearFecha(pelicula.FechaEstreno)}</span>
            </Link>
            <div className="cinerd-movie-copy">
              <span className="cinerd-genre">{generoTraducido(pelicula.Genero)}</span>
              <h2><Link to={`/peliculas/${pelicula.Id}`}>{pelicula.Titulo}</Link></h2>
              <div className="cinerd-movie-details">
                <span>🎬 {pelicula.Director || t("movies.directorMissing")}</span>
                <span>🏢 {pelicula.Productora || t("movies.productionCompanyMissing")}</span>
                <span>👥 {t("movies.talentsCount", { count: pelicula.CantidadActores || 0 })}</span>
              </div>
            </div>
            {esAdmin && <div className="cinerd-admin-strip"><Link to={`/peliculas/editar/${pelicula.Id}`}>{t("movies.edit")}</Link><Link to={`/peliculas/${pelicula.Id}/reparto`}>{t("movies.cast")}</Link><button type="button" onClick={() => eliminarPelicula(pelicula.Id)}>{t("movies.delete")}</button></div>}
          </article>
        ))}
      </section>
      {peliculas.length === 0 && <div className="catalog-empty"><span>🎞️</span><h2>{t("movies.emptyTitle")}</h2><p>{t("movies.emptyDescription")}</p></div>}
    </div>
  );
}
export default Peliculas;