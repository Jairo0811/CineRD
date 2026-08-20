import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../services/api";

const API_URL = "http://localhost:3000";
const resolverImagen = (ruta) => {
  if (!ruta) return null;
  if (ruta.startsWith("http://") || ruta.startsWith("https://")) return ruta;
  return `${API_URL}${ruta}`;
};

function HomePublica() {
  const { t, i18n } = useTranslation();
  const [actores, setActores] = useState([]);
  const [peliculas, setPeliculas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [actoresRes, peliculasRes] = await Promise.all([api.get("/actores"), api.get("/peliculas")]);
        setActores(actoresRes.data || []);
        setPeliculas(peliculasRes.data || []);
      } catch (error) { console.error("Error al cargar portada pública:", error); }
      finally { setCargando(false); }
    };
    cargar();
  }, []);

  const topTalentos = useMemo(() => [...actores].sort((a,b)=>Number(b.CantidadPeliculas||0)-Number(a.CantidadPeliculas||0)).slice(0,10), [actores]);
  const topPeliculas = useMemo(() => [...peliculas].sort((a,b)=>Number(b.CantidadActores||0)-Number(a.CantidadActores||0)).slice(0,5), [peliculas]);

  const hoy = new Date();
  const mesActual = hoy.getMonth();
  const anioActual = hoy.getFullYear();
  const locale = i18n.language?.startsWith("en") ? "en-US" : "es-DO";
  const nombreMesActual = new Intl.DateTimeFormat(locale, { month:"long" }).format(hoy);

  const cumpleanerosDelMes = useMemo(() => actores
    .filter((actor)=>actor.EstaVivo && actor.FechaNacimiento)
    .map((actor)=>({ actor, fecha:new Date(`${actor.FechaNacimiento.substring(0,10)}T12:00:00`) }))
    .filter(({fecha})=>!Number.isNaN(fecha.getTime()) && fecha.getMonth()===mesActual)
    .sort((a,b)=>a.fecha.getFullYear()-b.fecha.getFullYear() || a.fecha.getDate()-b.fecha.getDate()), [actores, mesActual]);

  const estrenosDelMes = useMemo(() => peliculas
    .filter((pelicula)=>pelicula.FechaEstreno)
    .map((pelicula)=>({ pelicula, fecha:new Date(`${pelicula.FechaEstreno.substring(0,10)}T12:00:00`) }))
    .filter(({fecha})=>!Number.isNaN(fecha.getTime()) && fecha.getMonth()===mesActual)
    .sort((a,b)=>b.fecha.getFullYear()-a.fecha.getFullYear() || a.fecha.getDate()-b.fecha.getDate()), [peliculas, mesActual]);

  return <div className="public-home cinematic-home">
    <section className="cinematic-hero"><div className="cinematic-flag-band" aria-hidden="true"/><div className="cinematic-hero-copy"><span className="public-eyebrow">{t("home.eyebrow")}</span><h1>{t("home.title")}</h1><p>{t("home.description")}</p><div className="public-hero-actions"><Link to="/peliculas" className="btn btn-primary btn-lg">{t("home.exploreMovies")}</Link><Link to="/actores" className="btn btn-outline-light btn-lg">{t("home.meetTalents")}</Link></div><div className="cinematic-stats" aria-label="CineRD"><div><strong>{peliculas.length}</strong><span>{t("home.movies")}</span></div><div><strong>{actores.length}</strong><span>{t("home.talents")}</span></div><div><strong>{peliculas.reduce((total,p)=>total+Number(p.CantidadActores||0),0)}</strong><span>{t("home.participations")}</span></div></div></div><div className="cinematic-hero-brand"><div className="cinematic-projector-beam"/><img src="/logo.png" alt="CineRD"/><span className="cinematic-caption">{t("home.catalogCaption")}</span></div></section>

    <section className="cinematic-manifesto"><span>🎞️</span><div><small>{t("home.manifestoEyebrow")}</small><h2>{t("home.manifestoTitle")}</h2></div></section>

    <section className="cinematic-showcase-section"><div className="cinematic-showcase-heading"><div><span className="public-eyebrow">{t("home.topTalentsEyebrow")}</span><h2>{t("home.topTalentsTitle")}</h2><p>{t("home.topTalentsDescription")}</p></div><Link to="/actores">{t("home.viewAll")}</Link></div><div className="cinematic-talent-showcase">{topTalentos.map((actor,index)=>{const foto=resolverImagen(actor.Foto);return <Link to={`/actores/${actor.Id}`} className="cinematic-talent-card" key={actor.Id}><div className="cinematic-talent-photo-wrap">{foto?<img src={foto} alt={actor.NombreArtistico||actor.NombreCompleto}/>:<div className="cinematic-talent-photo-placeholder">🎭</div>}<span className="cinematic-rank-badge">#{index+1}</span>{actor.EsVerificado&&<span className="cinerd-verified-card-badge">✓ {t("home.verified")}</span>}</div><div className="cinematic-talent-card-copy"><span className="cinerd-talent-name-row"><strong>{actor.NombreArtistico||actor.NombreCompleto}</strong>{actor.EsVerificado&&<span className="cinerd-verified-mark" title={t("home.verified")}>✓</span>}</span><small>{actor.Profesion||t("home.talents")}</small><span>{t("home.moviesCount",{count:actor.CantidadPeliculas||0})}</span></div></Link>})}</div>{!cargando&&topTalentos.length===0&&<p className="text-muted mb-0">—</p>}</section>

    <section className="cinematic-showcase-section birthday-showcase-section"><div className="cinematic-showcase-heading"><div><span className="public-eyebrow">{t("home.ephemeris",{month:nombreMesActual})}</span><h2>{t("home.birthdaysTitle")}</h2><p>{t("home.birthdaysDescription")}</p></div><Link to="/actores">{t("home.viewTalents")}</Link></div><div className="cinematic-talent-showcase">{cumpleanerosDelMes.map(({actor,fecha})=>{const foto=resolverImagen(actor.Foto);const edadQueCumple=anioActual-fecha.getFullYear();const fechaCumple=new Intl.DateTimeFormat(locale,{day:"2-digit",month:"short"}).format(fecha);return <Link to={`/actores/${actor.Id}`} className="cinematic-talent-card birthday-card" key={`cumple-${actor.Id}`}><div className="cinematic-talent-photo-wrap">{foto?<img src={foto} alt={actor.NombreArtistico||actor.NombreCompleto}/>:<div className="cinematic-talent-photo-placeholder">🎂</div>}<span className="birthday-date-badge">🎂 {fechaCumple}</span>{actor.EsVerificado&&<span className="cinerd-verified-card-badge">✓ {t("home.verified")}</span>}</div><div className="cinematic-talent-card-copy"><span className="cinerd-talent-name-row"><strong>{actor.NombreArtistico||actor.NombreCompleto}</strong>{actor.EsVerificado&&<span className="cinerd-verified-mark">✓</span>}</span><small>{actor.Profesion||t("home.talents")}</small><span>{t("home.bornTurns",{year:fecha.getFullYear(),age:edadQueCumple})}</span></div></Link>})}</div>{!cargando&&cumpleanerosDelMes.length===0&&<div className="birthday-empty-state"><span>🎂</span><div><strong>{t("home.noBirthdays")}</strong><small>{t("home.noBirthdaysDescription")}</small></div></div>}</section>

    <section className="cinematic-showcase-section premiere-showcase-section"><div className="cinematic-showcase-heading"><div><span className="public-eyebrow">{t("home.premieresEyebrow",{month:nombreMesActual})}</span><h2>{t("home.premieresTitle")}</h2><p>{t("home.premieresDescription",{month:nombreMesActual})}</p></div><Link to="/peliculas">{t("home.viewMovies")}</Link></div><div className="cinematic-movie-showcase">{estrenosDelMes.map(({pelicula,fecha})=>{const poster=resolverImagen(pelicula.Foto);const fechaEstreno=new Intl.DateTimeFormat(locale,{day:"2-digit",month:"short"}).format(fecha);const aniversario=anioActual-fecha.getFullYear();return <Link to={`/peliculas/${pelicula.Id}`} className="cinematic-movie-showcase-card premiere-card" key={`estreno-${pelicula.Id}`}><div className="cinematic-movie-poster-wrap">{poster?<img src={poster} alt={pelicula.Titulo}/>:<div className="cinematic-movie-poster-placeholder">🎬</div>}<span className="premiere-date-badge">🎬 {fechaEstreno}</span></div><div className="cinematic-movie-showcase-copy"><strong>{pelicula.Titulo}</strong><small>{pelicula.Genero||t("movieProfile.dominicanCinema")}</small><span>{aniversario>0?t("home.releasedIn",{year:fecha.getFullYear(),years:aniversario}):t("home.releasedThisYear",{year:fecha.getFullYear()})}</span></div></Link>})}</div>{!cargando&&estrenosDelMes.length===0&&<div className="birthday-empty-state"><span>🎬</span><div><strong>{t("home.noPremieres",{month:nombreMesActual})}</strong><small>{t("home.noPremieresDescription")}</small></div></div>}</section>

    <section className="cinematic-showcase-section"><div className="cinematic-showcase-heading"><div><span className="public-eyebrow">{t("home.productions")}</span><h2>{t("home.largestCast")}</h2><p>{t("home.largestCastDescription")}</p></div><Link to="/peliculas">{t("home.viewAll")}</Link></div><div className="cinematic-movie-showcase">{topPeliculas.map((pelicula,index)=>{const poster=resolverImagen(pelicula.Foto);return <Link to={`/peliculas/${pelicula.Id}`} className="cinematic-movie-showcase-card" key={pelicula.Id}><div className="cinematic-movie-poster-wrap">{poster?<img src={poster} alt={pelicula.Titulo}/>:<div className="cinematic-movie-poster-placeholder">🎬</div>}<span className="cinematic-rank-badge">#{index+1}</span><span className="cinematic-cast-badge">👥 {pelicula.CantidadActores||0}</span></div><div className="cinematic-movie-showcase-copy"><strong>{pelicula.Titulo}</strong><small>{pelicula.Genero||t("movieProfile.dominicanCinema")}</small><span>{t("home.castCount",{count:pelicula.CantidadActores||0})}</span></div></Link>})}</div></section>

    <section className="public-value-grid cinematic-value-grid"><article className="public-value-card cinematic-value-card"><span>🎬</span><h2>{t("home.movieCardTitle")}</h2><p>{t("home.movieCardDescription")}</p><Link to="/peliculas">{t("home.enterCatalog")}</Link></article><article className="public-value-card cinematic-value-card"><span>🎭</span><h2>{t("home.talentCardTitle")}</h2><p>{t("home.talentCardDescription")}</p><Link to="/actores">{t("home.exploreProfiles")}</Link></article><article className="public-value-card cinematic-value-card verified-card"><span>✅</span><h2>{t("home.verifiedIdentity")}</h2><p>{t("home.verifiedIdentityDescription")}</p><Link to="/registro">{t("home.createAccount")}</Link></article></section>
    <section className="public-cta cinematic-cta"><div><span className="public-eyebrow">{t("home.ctaEyebrow")}</span><h2>{t("home.ctaTitle")}</h2><p>{t("home.ctaDescription")}</p></div><div className="public-cta-actions"><Link to="/registro" className="btn btn-light">{t("home.createAccountButton")}</Link><Link to="/login" className="btn btn-outline-light">{t("home.signInButton")}</Link></div></section>
  </div>;
}
export default HomePublica;
