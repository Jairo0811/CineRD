import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import { calcularEdad, calcularEdadAproximada, calcularEdadEnFecha, obtenerAnioFecha } from "../utils/fechas";

const API_URL = "http://localhost:3000";
const resolverImagen = (ruta) => !ruta ? null : ruta.startsWith("http") ? ruta : `${API_URL}${ruta}`;

const SOCIAL_LOGOS = {
  instagram: "https://cdn.simpleicons.org/instagram/E4405F",
  facebook: "https://cdn.simpleicons.org/facebook/0866FF",
  tiktok: "https://cdn.simpleicons.org/tiktok/000000",
  youtube: "https://cdn.simpleicons.org/youtube/FF0000",
  spotify: "https://cdn.simpleicons.org/spotify/1ED760",
  x: "https://cdn.simpleicons.org/x/000000",
};

const ETIQUETAS_CREDITO = {
  ACTOR: "Interpretación",
  DIRECTOR: "Dirección",
  PRODUCTOR: "Producción",
  GUIONISTA: "Guion",
  COMPOSITOR: "Música",
  FOTOGRAFIA: "Fotografía",
  EDICION: "Edición",
  OTRO: "Otro crédito",
};

function PerfilActor() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const [actor, setActor] = useState(null);
  const [participaciones, setParticipaciones] = useState([]);
  const [dirigidas, setDirigidas] = useState([]);
  const [creditos, setCreditos] = useState([]);
  const [perfilPropioId, setPerfilPropioId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const usuario = (()=>{ try{return JSON.parse(localStorage.getItem("cineRdUsuario")||"null");}catch{return null;} })();
  const esAdmin = usuario?.rol === "ADMINISTRADOR";
  const esUsuario = usuario?.rol === "USUARIO";
  const esTalentoVerificado = usuario?.rol === "TALENTO_VERIFICADO";

  useEffect(() => {
    const cargar = async () => {
      try {
        const actorResponse = await api.get(`/actores/${id}`);
        const actorData = actorResponse.data;
        const [p,d,c] = await Promise.all([
          api.get(`/actores-peliculas/actor/${id}`),
          api.get(`/peliculas/director/${encodeURIComponent(actorData.NombreCompleto)}`),
          api.get(`/peliculas/creditos/actor/${id}`),
        ]);
        setActor(actorData); setParticipaciones(p.data||[]); setDirigidas(d.data||[]); setCreditos(c.data||[]);
      } catch (error) { console.error(error); }
      finally { setCargando(false); }
    };
    cargar();
  }, [id]);

  useEffect(() => {
    if (!esTalentoVerificado) return;
    api.get("/verificaciones/mi-perfil")
      .then((response) => setPerfilPropioId(Number(response.data?.Id) || null))
      .catch(() => setPerfilPropioId(null));
  }, [esTalentoVerificado]);

  const locale = i18n.language === "en" ? "en-US" : "es-DO";
  const formatearFecha = (fecha, corta = false) => {
    if (!fecha) return null;
    const valor = new Date(`${fecha.substring(0,10)}T12:00:00`);
    if (Number.isNaN(valor.getTime())) return null;
    return new Intl.DateTimeFormat(locale, corta ? { day:"2-digit", month:"2-digit", year:"numeric" } : { day:"2-digit", month:"long", year:"numeric" }).format(valor);
  };

  if (cargando) return <div className="text-center py-5"><div className="spinner-border text-primary" role="status"/><p className="mt-3 text-muted">{t("talentProfile.loading")}</p></div>;
  if (!actor) return <div className="text-center py-5"><p className="text-muted">{t("talentProfile.notFound")}</p><Link to="/actores" className="btn btn-primary">{t("talentProfile.backToTalents")}</Link></div>;

  const edad = actor.FechaNacimiento
    ? (!actor.EstaVivo && actor.FechaFallecimiento ? calcularEdadEnFecha(actor.FechaNacimiento,actor.FechaFallecimiento) : calcularEdad(actor.FechaNacimiento))
    : actor.AnioNacimiento ? calcularEdadAproximada(actor.AnioNacimiento,!actor.EstaVivo&&actor.FechaFallecimiento?obtenerAnioFecha(actor.FechaFallecimiento):new Date().getFullYear()) : null;
  const nombre = actor.NombreArtistico || actor.NombreCompleto || `${actor.Nombres||""} ${actor.Apellidos||""}`.trim();
  const foto = resolverImagen(actor.Foto);
  const nacimiento = actor.FechaNacimiento ? formatearFecha(actor.FechaNacimiento) : actor.AnioNacimiento ? String(actor.AnioNacimiento) : null;
  const fallecimiento = actor.FechaFallecimiento ? formatearFecha(actor.FechaFallecimiento) : null;
  const profesionTraducida = actor.Profesion ? t(`professions.${actor.Profesion}`, { defaultValue: actor.Profesion }) : t("talentProfile.professionMissing");
  const esMiPerfil = esTalentoVerificado && perfilPropioId === Number(actor.Id);

  const redes = [
    { nombre: "Facebook", descripcion: t("talentProfile.social.facebook"), url: actor.FacebookUrl, clase: "facebook", logo: SOCIAL_LOGOS.facebook },
    { nombre: "X / Twitter", descripcion: t("talentProfile.social.profile"), url: actor.XUrl, clase: "x", logo: SOCIAL_LOGOS.x },
    { nombre: "Instagram", descripcion: t("talentProfile.social.profile"), url: actor.InstagramUrl, clase: "instagram", logo: SOCIAL_LOGOS.instagram },
    { nombre: "YouTube", descripcion: t("talentProfile.social.youtube"), url: actor.YouTubeUrl, clase: "youtube", logo: SOCIAL_LOGOS.youtube },
    { nombre: "Spotify", descripcion: t("talentProfile.social.spotify"), url: actor.SpotifyUrl, clase: "spotify", logo: SOCIAL_LOGOS.spotify },
    { nombre: "TikTok", descripcion: t("talentProfile.social.profile"), url: actor.TikTokUrl, clase: "tiktok", logo: SOCIAL_LOGOS.tiktok },
    { nombre: t("talentProfile.social.websiteName"), descripcion: t("talentProfile.social.website"), url: actor.SitioWebUrl, clase: "website", icono: "🌐" },
  ].filter((red) => Boolean(red.url));

  const creditoLegacy = (pelicula, tipo) => <Link to={`/peliculas/${pelicula.Id}`} className="actor-credit" key={`${tipo}-${pelicula.Id}`}>
    {pelicula.Foto ? <img src={resolverImagen(pelicula.Foto)} alt={pelicula.Titulo}/> : <span className="actor-credit-poster-empty">🎬</span>}
    <span className="actor-credit-copy"><strong>{pelicula.Titulo}</strong><small>{tipo === "actuacion" ? `${pelicula.Personaje || t("talentProfile.characterMissing")} · ${pelicula.TipoParticipacion || t("talentProfile.participation")}` : pelicula.Genero ? t(`genres.${pelicula.Genero}`, { defaultValue: pelicula.Genero }) : t("talentProfile.direction")}</small></span>
    <span className="actor-credit-date">{pelicula.FechaEstreno ? formatearFecha(pelicula.FechaEstreno, true) : t("talentProfile.noDate")}</span>
  </Link>;

  const creditoProfesional = (credito) => <Link to={`/peliculas/${credito.Id}`} className="actor-credit" key={`prof-${credito.TipoCredito}-${credito.Id}`}>
    {credito.Foto ? <img src={resolverImagen(credito.Foto)} alt={credito.Titulo}/> : <span className="actor-credit-poster-empty">🎬</span>}
    <span className="actor-credit-copy"><strong>{credito.Titulo}</strong><small>{ETIQUETAS_CREDITO[credito.TipoCredito] || credito.TipoCredito}{credito.Personaje ? ` · ${credito.Personaje}` : ""}</small>{Boolean(credito.CreditoVerificado) && <span className="badge bg-success mt-1">✓ Participación verificada</span>}</span>
    <span className="actor-credit-date">{credito.FechaEstreno ? formatearFecha(credito.FechaEstreno, true) : t("talentProfile.noDate")}</span>
  </Link>;

  return <div className="table-page-container actor-profile-page">
    <div><Link to="/actores" className="btn btn-outline-secondary btn-sm">{t("talentProfile.back")}</Link></div>
    <section className="actor-profile-hero">
      {foto ? <img src={foto} alt={nombre} className="actor-profile-photo"/> : <div className="actor-profile-photo-empty">🎭</div>}
      <div className="actor-profile-copy">
        <span className="eyebrow">{t("talentProfile.eyebrow")}</span>
        <div className="actor-profile-title-row"><h1>{nombre}</h1>{actor.EsVerificado && <span className="cinerd-verified-mark" title={t("talentProfile.verifiedBy")} aria-label={t("talentProfile.verifiedProfile")}>✓</span>}</div>
        {actor.NombreArtistico && <p className="stage-name">{actor.NombreCompleto}</p>}
        <div className="actor-profile-meta"><span>{profesionTraducida}</span>{nacimiento && <span>{t("talentProfile.born")}: {nacimiento}</span>}{edad != null && <span>{t("talentProfile.age", { age: edad })}</span>}{fallecimiento && <span>{t("talentProfile.died")}: {fallecimiento}</span>}<span>{actor.EstaVivo ? t("talentProfile.active") : t("talentProfile.inMemoriam")}</span>{actor.EsVerificado && <span className="cinerd-verified-label">✓ {t("talentProfile.verifiedProfile")}</span>}</div>
      </div>
      <div className="actor-profile-actions">
        <a href="#filmografia" className="btn btn-outline-light">🎬 {t("talentProfile.viewFilmography")}</a>
        {esAdmin && <Link to={`/actores/editar/${actor.Id}`} className="btn btn-light">{t("talentProfile.edit")}</Link>}
        {esUsuario && !actor.EsVerificado && <Link to={`/actores/${actor.Id}/reclamar`} className="btn btn-primary">{t("talentProfile.thisIsMe")}</Link>}
        {esMiPerfil && <Link to="/mi-perfil/reclamar-credito" className="btn btn-primary">➕ Reclamar participación</Link>}
      </div>
    </section>

    {redes.length > 0 && <section className="actor-social-panel"><div className="actor-social-copy"><div className="actor-social-heading-row"><span className="eyebrow">{t("talentProfile.digitalPresence")}</span><span className="actor-social-official">{t("talentProfile.officialProfiles")}</span></div><h2>{t("talentProfile.follow", { name: nombre })}</h2><p>{t("talentProfile.socialDescription")}</p></div><div className="actor-social-links">{redes.map(red=><a key={red.nombre} href={red.url} target="_blank" rel="noreferrer noopener" className={`actor-social-link ${red.clase}`} aria-label={t("talentProfile.openSocial", { network:red.nombre, name:nombre })}><span className="actor-social-icon" aria-hidden="true">{red.logo ? <img src={red.logo} alt="" loading="lazy"/> : red.icono}</span><span className="actor-social-link-copy"><strong>{red.nombre}</strong><small>{red.descripcion}</small></span></a>)}</div></section>}

    <section className="actor-profile-kpis"><article className="actor-profile-kpi"><strong>{participaciones.length}</strong><span>{t("talentProfile.actingCredits")}</span></article><article className="actor-profile-kpi"><strong>{dirigidas.length}</strong><span>{t("talentProfile.directedMovies")}</span></article><article className="actor-profile-kpi"><strong>{creditos.length}</strong><span>Créditos profesionales</span></article></section>

    <section id="filmografia" className="actor-filmography-grid"><article className="actor-filmography-panel"><header className="actor-filmography-header"><span>{t("talentProfile.filmography")}</span><h2>{t("talentProfile.actingTitle")}</h2></header><div className="actor-credit-list">{participaciones.length ? participaciones.map((p)=>creditoLegacy(p,"actuacion")) : <div className="actor-empty">{t("talentProfile.noActingCredits")}</div>}</div></article><article className="actor-filmography-panel"><header className="actor-filmography-header"><span>{t("talentProfile.direction")}</span><h2>{t("talentProfile.directionTitle")}</h2></header><div className="actor-credit-list">{dirigidas.length ? dirigidas.map((p)=>creditoLegacy(p,"direccion")) : <div className="actor-empty">{t("talentProfile.noDirectedMovies")}</div>}</div></article></section>

    {creditos.length > 0 && <section className="actor-filmography-panel mt-4"><header className="actor-filmography-header"><span>CRÉDITOS ESTRUCTURADOS</span><h2>Créditos profesionales registrados</h2></header><div className="actor-credit-list">{creditos.map(creditoProfesional)}</div></section>}
  </div>;
}
export default PerfilActor;
