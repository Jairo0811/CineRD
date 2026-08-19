import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import { calcularEdad, calcularEdadAproximada, calcularEdadEnFecha, formatearFechaCorta, formatearFechaNumerica, obtenerAnioFecha } from "../utils/fechas";

const API_URL = "http://localhost:3000";
const resolverImagen = (ruta) => !ruta ? null : ruta.startsWith("http") ? ruta : `${API_URL}${ruta}`;

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
    { nombre: "Instagram", url: actor.InstagramUrl, icono: "◎", clase: "instagram" },
    { nombre: "Facebook", url: actor.FacebookUrl, icono: "f", clase: "facebook" },
    { nombre: "TikTok", url: actor.TikTokUrl, icono: "♪", clase: "tiktok" },
    { nombre: "YouTube", url: actor.YouTubeUrl, icono: "▶", clase: "youtube" },
    { nombre: "Spotify", url: actor.SpotifyUrl, icono: "●", clase: "spotify" },
    { nombre: "X / Twitter", url: actor.XUrl, icono: "𝕏", clase: "x" },
    { nombre: "Sitio web", url: actor.SitioWebUrl, icono: "🌐", clase: "website" },
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
      <div className="actor-social-copy"><span className="eyebrow">Presencia digital</span><h2>Redes sociales y enlaces oficiales</h2><p>Perfiles públicos asociados a este talento.</p></div>
      <div className="actor-social-links">{redes.map((red)=><a key={red.nombre} href={red.url} target="_blank" rel="noreferrer noopener" className={`actor-social-link ${red.clase}`}><span className="actor-social-icon" aria-hidden="true">{red.icono}</span><span>{red.nombre}</span><span className="actor-social-arrow">↗</span></a>)}</div>
    </section>}
  </div>;
}
export default PerfilActor;