import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import { obtenerFotoTalento, manejarErrorFotoTalento } from "../utils/talentoPlaceholder";
import { obtenerFotoLibreTalento } from "../data/fotosLibresTalentos";
import { anioDe } from "../data/historiaCine";
import PosterOriginal from "../components/media/PosterOriginal";
import { DEMO_MODE } from "../config/api";

const COPY = {
  es: {
    eyebrow: "CINERD / BITÁCORA DE DESARROLLO",
    title: "Nuestro cine merece un archivo a su altura.",
    description: "Una mirada a lo que estamos construyendo: películas, talentos, filmografías y una historia cinematográfica dominicana conectada.",
    demo: "Avance público de CineRD. Catálogo de consulta y solo lectura; la plataforma sigue en desarrollo.",
    local: "Vista de desarrollo local: los datos pueden cambiar durante las pruebas del sistema.",
    movies: "Películas catalogadas",
    talents: "Talentos registrados",
    links: "Participaciones vinculadas",
    explore: "Explorar",
    moviesTab: "Cubiertas de películas",
    talentsTab: "Talentos del cine",
    search: "Buscar por título, nombre o profesión",
    all: "Mostrar todas las fichas",
    less: "Mostrar menos",
    film: "Película",
    filmCredits: "Reparto",
    date: "Estreno",
    director: "Dirección",
    seeFilm: "Ver ficha de la película",
    seeTalent: "Ver perfil profesional",
    works: "películas registradas",
    noData: "Todavía no hay fichas disponibles con este filtro.",
    loading: "Cargando el catálogo de CineRD…",
    error: "No fue posible cargar el catálogo público.",
    retry: "Volver a intentar",
    photo: "Fotografía Creative Commons",
    originalArt: "Cubierta editorial original",
    fallback: "Retrato editorial ilustrado",
    disclaimer: "Las cubiertas son diseños originales de CineRD, no carteles oficiales. Las fotografías publicadas cuentan con atribuciones y licencias documentadas; los materiales anteriores sin permiso comercial siguen excluidos.",
    visitMovies: "Visitar el catálogo de películas",
    visitTalents: "Explorar profesionales",
    privacy: "Ver créditos y licencias en el pie de página",
    updated: "Avances de un proyecto en evolución · República Dominicana",
    showing: "Mostrando",
    of: "de",
  },
  en: {
    eyebrow: "CINERD / DEVELOPMENT JOURNAL",
    title: "Our cinema deserves an archive of its own.",
    description: "A look at what we are building: films, talent, filmographies, and a connected history of Dominican cinema.",
    demo: "Public CineRD preview. Read-only catalog; the platform remains in development.",
    local: "Local development view: records may change during testing.",
    movies: "Cataloged films",
    talents: "Talent profiles",
    links: "Linked appearances",
    explore: "Explore",
    moviesTab: "Original film covers",
    talentsTab: "Cinema talent",
    search: "Search by film title, name or profession",
    all: "Show all profiles",
    less: "Show fewer",
    film: "Film",
    filmCredits: "Cast",
    date: "Release",
    director: "Director",
    seeFilm: "View film",
    seeTalent: "View professional profile",
    works: "cataloged films",
    noData: "No profiles match this filter.",
    loading: "Loading the CineRD catalog…",
    error: "The public catalog could not be loaded.",
    retry: "Try again",
    photo: "Creative Commons photograph",
    originalArt: "Original editorial cover",
    fallback: "Illustrated editorial portrait",
    disclaimer: "Covers are original CineRD designs, not official movie posters. Published photographs have documented licenses and attribution; older images lacking commercial permission remain excluded.",
    visitMovies: "Explore film catalog",
    visitTalents: "Discover professionals",
    privacy: "See photo credits and licenses in the footer",
    updated: "A project in progress · Dominican Republic",
    showing: "Showing",
    of: "of",
  },
};

function normalizar(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export default function AvancesCineRD() {
  const { i18n } = useTranslation();
  const idioma = i18n.language?.startsWith("en") ? "en" : "es";
  const c = COPY[idioma];
  const [peliculas, setPeliculas] = useState([]);
  const [talentos, setTalentos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [intento, setIntento] = useState(0);
  const [seccion, setSeccion] = useState("peliculas");
  const [buscar, setBuscar] = useState("");
  const [mostrarTodas, setMostrarTodas] = useState(false);

  useEffect(() => {
    let activo = true;
    Promise.all([api.get("/peliculas"), api.get("/actores")])
      .then(([films, people]) => {
        if (!activo) return;
        setPeliculas(Array.isArray(films.data) ? films.data : []);
        setTalentos(Array.isArray(people.data) ? people.data : []);
        setError(false);
      })
      .catch((reason) => {
        console.error("CineRD: error al cargar galería de avances", reason);
        if (activo) setError(true);
      })
      .finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, [intento]);

  const peliculasOrdenadas = useMemo(
    () => [...peliculas].sort((a, b) => String(b.FechaEstreno || "").localeCompare(String(a.FechaEstreno || "")) || String(a.Titulo).localeCompare(String(b.Titulo), "es")),
    [peliculas],
  );
  const talentosOrdenados = useMemo(
    () => [...talentos].sort((a, b) => Number(b.CantidadPeliculas || 0) - Number(a.CantidadPeliculas || 0)
      || String(a.NombreArtistico || a.NombreCompleto || "").localeCompare(String(b.NombreArtistico || b.NombreCompleto || ""), "es")),
    [talentos],
  );

  const listado = seccion === "peliculas" ? peliculasOrdenadas : talentosOrdenados;
  const filtrados = listado.filter((item) => {
    const haystack = seccion === "peliculas"
      ? [item.Titulo, item.Genero, item.Director, item.Productora]
      : [item.NombreArtistico, item.NombreCompleto, item.Profesion];
    return haystack.some((campo) => normalizar(campo).includes(normalizar(buscar.trim())));
  });
  const visibles = mostrarTodas || buscar.trim() ? filtrados : filtrados.slice(0, 12);
  const participaciones = peliculas.reduce((total, movie) => total + Number(movie.CantidadActores || 0), 0);

  const cambiarSeccion = (valor) => {
    setSeccion(valor);
    setBuscar("");
    setMostrarTodas(false);
  };

  return (
    <div className="cinerd-avances">
      <header className="cinerd-avances-hero">
        <div className="cinerd-avances-beam" aria-hidden="true" />
        <div className="cinerd-avances-hero-inner">
          <span className="cinerd-avances-eyebrow">{c.eyebrow}</span>
          <h1>{c.title}</h1>
          <p>{c.description}</p>
          <div className="cinerd-avances-status">
            <span className="cinerd-avances-status-dot" aria-hidden="true" />
            {DEMO_MODE ? c.demo : c.local}
          </div>
          <div className="cinerd-avances-stats">
            <div><strong>{peliculas.length}</strong><span>{c.movies}</span></div>
            <div><strong>{talentos.length}</strong><span>{c.talents}</span></div>
            <div><strong>{participaciones}</strong><span>{c.links}</span></div>
          </div>
        </div>
        <div className="cinerd-avances-side" aria-hidden="true">
          <span>CINERD</span><strong>RD</strong><small>FILM · PEOPLE · HERITAGE</small>
        </div>
      </header>

      <section className="cinerd-avances-gallery" aria-labelledby="cinerd-avances-gallery-title">
        <div className="cinerd-avances-heading">
          <div><span className="cinerd-avances-eyebrow">{c.explore}</span><h2 id="cinerd-avances-gallery-title">{seccion === "peliculas" ? c.moviesTab : c.talentsTab}</h2></div>
          <div className="cinerd-avances-actions"><Link to="/peliculas">{c.visitMovies}</Link><Link to="/actores">{c.visitTalents}</Link></div>
        </div>
        <div className="cinerd-avances-tools">
          <div role="group" aria-label={c.explore} className="cinerd-avances-tabs">
            <button type="button" className={seccion === "peliculas" ? "is-active" : ""} aria-pressed={seccion === "peliculas"} onClick={() => cambiarSeccion("peliculas")}>{c.moviesTab}</button>
            <button type="button" className={seccion === "talentos" ? "is-active" : ""} aria-pressed={seccion === "talentos"} onClick={() => cambiarSeccion("talentos")}>{c.talentsTab}</button>
          </div>
          <label className="cinerd-avances-search">
            <span className="visually-hidden">{c.search}</span>
            <input type="search" placeholder={c.search} value={buscar} onChange={(e) => setBuscar(e.target.value)} />
          </label>
        </div>

        {cargando ? <p className="cinerd-avances-message" role="status">{c.loading}</p>
          : error ? <div className="cinerd-avances-message" role="alert"><p>{c.error}</p><button type="button" onClick={() => { setError(false); setCargando(true); setIntento(v => v + 1); }}>{c.retry}</button></div>
            : <>
              <p className="cinerd-avances-count" role="status">{c.showing} {visibles.length} {c.of} {filtrados.length}</p>
              <div className="cinerd-avances-grid">
                {seccion === "peliculas" ? visibles.map((pelicula) => (
                  <article className="cinerd-avances-card" key={"p-" + pelicula.Id}>
                    <Link to={"/peliculas/" + pelicula.Id} aria-label={c.seeFilm + ": " + pelicula.Titulo} className="cinerd-avances-visual cinerd-avances-poster">
                      <PosterOriginal peliculaId={pelicula.Id} titulo={pelicula.Titulo} anio={anioDe(pelicula.FechaEstreno)} idioma={idioma} />
                      <span className="cinerd-avances-number">{anioDe(pelicula.FechaEstreno) || "—"}</span>
                    </Link>
                    <div className="cinerd-avances-card-body">
                      <small>{c.originalArt}</small>
                      <h3><Link to={"/peliculas/" + pelicula.Id}>{pelicula.Titulo}</Link></h3>
                      <p>{pelicula.Director || pelicula.Genero || c.film}</p>
                    </div>
                  </article>
                )) : visibles.map((actor) => {
                  const nombre = actor.NombreArtistico || actor.NombreCompleto || "";
                  const fotoCc = DEMO_MODE && !actor.Foto && obtenerFotoLibreTalento(actor.Id);
                  return (
                    <article className="cinerd-avances-card" key={"a-" + actor.Id}>
                      <Link to={"/actores/" + actor.Id} aria-label={c.seeTalent + ": " + nombre} className="cinerd-avances-visual cinerd-avances-portrait">
                        <img src={obtenerFotoTalento(actor)} alt={nombre} loading="lazy" onError={(event) => manejarErrorFotoTalento(event, actor.Sexo)} />
                        <span className="cinerd-avances-number">{Number(actor.CantidadPeliculas || 0)} {c.works}</span>
                      </Link>
                      <div className="cinerd-avances-card-body">
                        <small>{fotoCc ? c.photo : c.fallback}</small>
                        <h3><Link to={"/actores/" + actor.Id}>{nombre}</Link></h3>
                        <p>{actor.Profesion || c.works}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
              {!filtrados.length && <p className="cinerd-avances-message">{c.noData}</p>}
              {!buscar.trim() && filtrados.length > 12 && (
                <button type="button" className="cinerd-avances-more" onClick={() => setMostrarTodas(value => !value)}>
                  {mostrarTodas ? c.less : c.all + " (" + filtrados.length + ")"}
                </button>
              )}
            </>}
      </section>

      <aside className="cinerd-avances-disclaimer">
        <span aria-hidden="true">ⓘ</span>
        <div><strong>{c.updated}</strong><p>{c.disclaimer}</p><small>{c.privacy}</small></div>
      </aside>
    </div>
  );
}
