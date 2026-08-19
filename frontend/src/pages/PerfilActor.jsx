import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import { calcularEdad, calcularEdadAproximada, calcularEdadEnFecha, formatearFechaCorta, formatearFechaNumerica, obtenerAnioFecha } from "../utils/fechas";

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

function PerfilActor() {
  const { id } = useParams();
  const [actor, setActor] = useState(null);
  const [participaciones, setParticipaciones] = useState([]);
  const [dirigidas, setDirigidas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const usuario = (()=>{ try{return JSON.parse(localStorage.getItem("cineRdUsuario")||"null");}catch{return null;} })();
  const esAdmin = usuario?.rol === "ADMINISTRADOR";
  const esUsuario = usuario?.rol === "USUARIO";

  useEffect(() => {
    const cargar = async () => {
      try {
        const actorResponse = await api.get(`/actores/${id}`);
        const actorData = actorResponse.data;
        const [p,d] = await Promise.all([
          api.get(`/actores-peliculas/actor/${id}`),
          api.get(`/peliculas/director/${encodeURIComponent(actorData.NombreCompleto)}`),
        ]);
        setActor(actorData); setParticipaciones(p.data||[]); setDirigidas(d.data||[]);
      } catch (error) { console.error(error); }
      finally { setCargando(false); }
    };
    cargar();
  }, [id]);

  if (cargando) return <div className="text-center py-5"><div className="spinner-border text-primary" role="status"/><p className="mt-3 text-muted">Cargando perfil...</p></div>;
  if (!actor) return <div className="text-center py-5"><p className="text-muted">No se encontró el talento solicitado.</p><Link to="/actores" className="btn btn-primary">Volver a talentos</Link></div>;

  const edad = actor.FechaNacimiento
    ? (!actor.EstaVivo && actor.FechaFallecimiento ? calcularEdadEnFecha(actor.FechaNacimiento,actor.FechaFallecimiento) : calcularEdad(actor.FechaNacimiento))
    : actor.AnioNacimiento ? calcularEdadAproximada(actor.AnioNacimiento,!actor.EstaVivo&&actor.FechaFallecimiento?obtenerAnioFecha(actor.FechaFallecimiento):new Date().getFullYear()) : null;
  const nombre = actor.NombreArtistico || actor.NombreCompleto || `${actor.Nombres||""} ${actor.Apellidos||""}`.trim();
  const foto = resolverImagen(actor.Foto);
  const nacimiento = actor.FechaNacimiento ? formatearFechaNumerica(actor.FechaNacimiento) : actor.AnioNacimiento ? String(actor.AnioNacimiento) : null;
  const fallecimiento = actor.FechaFallecimiento ? formatearFechaNumerica(actor.FechaFallecimiento) : null;
  const redes = [
    { nombre: "Instagram", descripcion: "Perfil oficial", url: actor.InstagramUrl, clase: "instagram", logo: SOCIAL_LOGOS.instagram },
    { nombre: "Facebook", descripcion: "Página oficial", url: actor.FacebookUrl, clase: "facebook", logo: SOCIAL_LOGOS.facebook },
    { nombre: "TikTok", descripcion: "Perfil oficial", url: actor.TikTokUrl, clase: "tiktok", logo: SOCIAL_LOGOS.tiktok },
    { nombre: "YouTube", descripcion: "Canal oficial", url: actor.YouTubeUrl, clase: "youtube", logo: SOCIAL_LOGOS.youtube },
    { nombre: "Spotify", descripcion: "Escuchar artista", url: actor.SpotifyUrl, clase: "spotify", logo: SOCIAL_LOGOS.spotify },
    { nombre: "X / Twitter", descripcion: "Perfil oficial", url: actor.XUrl, clase: "x", logo: SOCIAL_LOGOS.x },
    { nombre: "Sitio web", descripcion: "Sitio oficial", url: actor.SitioWebUrl, clase: "website", icono: "🌐" },
  ].filter((red) => Boolean(red.url));

  const credito = (pelicula, tipo) => <Link to={`/peliculas/${pelicula.Id}`} className="actor-credit" key={`${tipo}-${pelicula.Id}`}>
    {pelicula.Foto ? <img src={resolverImagen(pelicula.Foto)} alt={pelicula.Titulo}/> : <span className="actor-credit-poster-empty">🎬</span>}
    <span className="actor-credit-copy"><strong>{pelicula.Titulo}</strong><small>{tipo === "actuacion" ? `${pelicula.Personaje || "Personaje no registrado"} · ${pelicula.TipoParticipacion || "Participación"}` : pelicula.Genero || "Dirección"}</small></span>
    <span className="actor-credit-date">{pelicula.FechaEstreno ? formatearFechaCorta(pelicula.FechaEstreno) : "Sin fecha"}</span>
  </Link>;

  return <div className="table-page-container actor-profile-page">
    <div><Link to="/actores" className="btn btn-outline-secondary btn-sm">← Talentos</Link></div>
    <section className="actor-profile-hero">
      {foto ? <img src={foto} alt={nombre} className="actor-profile-photo"/> : <div className="actor-profile-photo-empty">🎭</div>}
      <div className="actor-profile-copy"><span className="eyebrow">Talento · CineRD</span><h1>{nombre}</h1>{actor.NombreArtistico && <p className="stage-name">{actor.NombreCompleto}</p>}
        <div className="actor-profile-meta"><span>{actor.Profesion || "Profesión no registrada"}</span>{nacimiento && <span>Nació: {nacimiento}</span>}{edad != null && <span>{edad} años</span>}{fallecimiento && <span>Falleció: {fallecimiento}</span>}<span>{actor.EstaVivo ? "Activo" : "In memoriam"}</span></div>
      </div>
      <div className="actor-profile-actions">{esAdmin && <Link to={`/actores/editar/${actor.Id}`} className="btn btn-light">Editar perfil</Link>}{esUsuario && <Link to={`/actores/${actor.Id}/reclamar`} className="btn btn-primary">Este soy yo</Link>}</div>
    </section>

    <section className="actor-profile-kpis"><article className="actor-profile-kpi"><strong>{participaciones.length}</strong><span>Participaciones como intérprete</span></article><article className="actor-profile-kpi"><strong>{dirigidas.length}</strong><span>Películas dirigidas</span></article><article className="actor-profile-kpi"><strong>{participaciones.length+dirigidas.length}</strong><span>Créditos registrados</span></article></section>

    <section className="actor-filmography-grid">
      <article className="actor-filmography-panel"><header className="actor-filmography-header"><span>Filmografía</span><h2>Participaciones como actor/actriz</h2></header><div className="actor-credit-list">{participaciones.length ? participaciones.map((p)=>credito(p,"actuacion")) : <div className="actor-empty">No tiene participaciones registradas.</div>}</div></article>
      <article className="actor-filmography-panel"><header className="actor-filmography-header"><span>Dirección</span><h2>Películas dirigidas</h2></header><div className="actor-credit-list">{dirigidas.length ? dirigidas.map((p)=>credito(p,"direccion")) : <div className="actor-empty">No tiene películas dirigidas registradas.</div>}</div></article>
    </section>

    {redes.length > 0 && <section className="actor-social-panel">
      <div className="actor-social-copy">
        <div className="actor-social-heading-row"><span className="eyebrow">Presencia digital</span><span className="actor-social-official">Perfiles oficiales</span></div>
        <h2>Sigue a {nombre}</h2>
        <p>Consulta sus canales, música y perfiles públicos oficiales.</p>
      </div>
      <div className="actor-social-links">{redes.map((red)=><a key={red.nombre} href={red.url} target="_blank" rel="noreferrer noopener" className={`actor-social-link ${red.clase}`} aria-label={`Abrir ${red.nombre} de ${nombre}`}>
        <span className="actor-social-icon" aria-hidden="true">{red.logo ? <img src={red.logo} alt="" loading="lazy"/> : red.icono}</span>
        <span className="actor-social-link-copy"><strong>{red.nombre}</strong><small>{red.descripcion}</small></span>
      </a>)}</div>
    </section>}
  </div>;
}
export default PerfilActor;