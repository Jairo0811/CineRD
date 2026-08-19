import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import { formatearFecha } from "../utils/fechas";

const API_URL = "http://localhost:3000";
const resolverImagen = (ruta) => !ruta ? null : ruta.startsWith("http") ? ruta : `${API_URL}${ruta}`;
const formatearDuracion = (minutos) => !minutos ? null : `${Math.floor(minutos / 60) ? `${Math.floor(minutos / 60)} h ` : ""}${minutos % 60} min`;
const formatearDinero = (valor) => valor == null ? null : new Intl.NumberFormat("es-DO", { style:"currency", currency:"USD", maximumFractionDigits:0 }).format(valor);
const obtenerYoutubeId = (url) => {
  if (!url) return null;
  try { const u = new URL(url); if (u.hostname.includes("youtu.be")) return u.pathname.replace("/", ""); if (u.hostname.includes("youtube.com")) return u.searchParams.get("v") || u.pathname.split("/").pop(); } catch { return null; }
  return null;
};

function PerfilPelicula() {
  const { id } = useParams();
  const [pelicula, setPelicula] = useState(null);
  const [reparto, setReparto] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const usuario = (()=>{ try{return JSON.parse(localStorage.getItem("cineRdUsuario")||"null");}catch{return null;} })();
  const esAdmin = usuario?.rol === "ADMINISTRADOR";

  useEffect(() => {
    Promise.all([api.get(`/peliculas/${id}/perfil`), api.get(`/actores-peliculas/pelicula/${id}`)])
      .then(([p,r])=>{ setPelicula(p.data); setReparto(r.data||[]); })
      .catch((e)=>{ console.error(e); setError(e.response?.data?.mensaje || "No fue posible cargar el perfil de la película."); })
      .finally(()=>setCargando(false));
  }, [id]);

  const repartoOrdenado = useMemo(() => [...reparto].sort((a,b) => (a.OrdenCreditos ?? 9999) - (b.OrdenCreditos ?? 9999)), [reparto]);
  const youtubeId = useMemo(()=>obtenerYoutubeId(pelicula?.TrailerUrl), [pelicula?.TrailerUrl]);

  if (cargando) return <div className="text-center py-5"><div className="spinner-border text-primary" role="status"/><p className="text-muted mt-3">Cargando película...</p></div>;
  if (error || !pelicula) return <div className="text-center py-5"><div className="alert alert-danger">{error || "Película no encontrada"}</div><Link to="/peliculas" className="btn btn-primary">Volver a películas</Link></div>;

  const backdrop = resolverImagen(pelicula.Backdrop);
  const poster = resolverImagen(pelicula.Foto);

  return <div className="table-page-container movie-profile-page">
    <div className="d-flex flex-wrap gap-2 mb-4"><Link to="/peliculas" className="btn btn-outline-secondary">← Películas</Link>{esAdmin && <><Link to={`/peliculas/editar/${pelicula.Id}`} className="btn btn-outline-warning">Editar película</Link><Link to={`/peliculas/${pelicula.Id}/reparto`} className="btn btn-primary">Gestionar reparto</Link></>}</div>

    <section className="card mb-4 overflow-hidden">
      <div style={{minHeight: backdrop ? "340px" : "90px", background: backdrop ? `linear-gradient(180deg,rgba(5,11,22,.08),rgba(5,11,22,.88)),url(${backdrop}) center/cover` : "linear-gradient(135deg,#07111f,#10345f)"}} />
      <div className="card-body p-4 p-lg-5"><div className="row g-4 align-items-center">
        <div className="col-12 col-md-4 col-lg-3 text-center">{poster ? <img src={poster} alt={`Póster de ${pelicula.Titulo}`} className="img-fluid rounded-4 shadow" style={{maxHeight:"430px",objectFit:"cover"}}/> : <div className="bg-light border rounded-4 d-grid mx-auto" style={{maxWidth:"280px",minHeight:"390px",placeItems:"center"}}>🎬</div>}</div>
        <div className="col-12 col-md-8 col-lg-9"><span className="badge bg-primary mb-3">Cine dominicano</span><h1 className="display-5 fw-bold mb-2">{pelicula.Titulo}</h1>{pelicula.Eslogan && <p className="lead text-muted fst-italic">“{pelicula.Eslogan}”</p>}
          <div className="d-flex flex-wrap gap-2 mb-4"><span className="badge bg-secondary">{pelicula.Genero || "Sin género"}</span><span className="badge bg-light text-dark border">{pelicula.FechaEstreno ? formatearFecha(pelicula.FechaEstreno) : "Sin fecha"}</span>{pelicula.DuracionMinutos && <span className="badge bg-light text-dark border">{formatearDuracion(pelicula.DuracionMinutos)}</span>}{pelicula.Calificacion != null && <span className="badge bg-warning text-dark">★ {Number(pelicula.Calificacion).toFixed(1)}/10</span>}<span className="badge bg-light text-dark border">{reparto.length} talentos</span>{pelicula.Estado && <span className="badge bg-info text-dark">{pelicula.Estado}</span>}</div>
          <dl className="row mb-0"><dt className="col-sm-3">Director</dt><dd className="col-sm-9">{pelicula.Director || "No registrado"}</dd><dt className="col-sm-3">Productora</dt><dd className="col-sm-9">{pelicula.Productora || "No registrada"}</dd><dt className="col-sm-3">Idioma original</dt><dd className="col-sm-9">{pelicula.IdiomaOriginal?.toUpperCase() || "No registrado"}</dd>{pelicula.Presupuesto != null && <><dt className="col-sm-3">Presupuesto</dt><dd className="col-sm-9">{formatearDinero(pelicula.Presupuesto)}</dd></>}{pelicula.Recaudacion != null && <><dt className="col-sm-3">Recaudación</dt><dd className="col-sm-9">{formatearDinero(pelicula.Recaudacion)}</dd></>}</dl>
        </div>
      </div></div>
    </section>

    <section className="card mb-4"><div className="card-body p-4"><span className="catalog-eyebrow">HISTORIA</span><h2 className="h4">Sinopsis</h2><p className="text-muted mb-0" style={{whiteSpace:"pre-line"}}>{pelicula.Sinopsis || "La sinopsis todavía no ha sido registrada para esta película."}</p></div></section>

    {(youtubeId || pelicula.TrailerUrl) && <section className="card mb-4"><div className="card-body p-4"><span className="catalog-eyebrow">AUDIOVISUAL</span><h2 className="h4 mb-3">Tráiler</h2>{youtubeId ? <div className="ratio ratio-16x9 rounded-4 overflow-hidden"><iframe src={`https://www.youtube.com/embed/${youtubeId}`} title={`Tráiler de ${pelicula.Titulo}`} allowFullScreen/></div> : <a href={pelicula.TrailerUrl} target="_blank" rel="noreferrer" className="btn btn-danger">Ver tráiler</a>}</div></section>}

    <section className="card"><div className="card-header bg-white d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 p-3"><div><span className="catalog-eyebrow">REPARTO</span><h2 className="h5 fw-bold mb-0">Talentos y personajes</h2></div>{esAdmin && <Link to={`/peliculas/${pelicula.Id}/reparto`} className="btn btn-outline-primary btn-sm">Gestionar reparto</Link>}</div><div className="card-body">
      {repartoOrdenado.length===0 ? <div className="text-center py-5 text-muted">Esta película todavía no tiene reparto registrado.</div> : <div className="row g-3">{repartoOrdenado.map((actor)=><div className="col-12 col-sm-6 col-lg-4" key={actor.Id}><Link to={`/actores/${actor.Id}`} className="card h-100 border-0 bg-light text-dark"><div className="card-body d-flex align-items-center gap-3">{actor.Foto ? <img src={resolverImagen(actor.Foto)} alt={actor.NombreCompleto} className="rounded-circle" style={{width:"72px",height:"72px",objectFit:"cover"}}/> : <div className="rounded-circle bg-white d-grid" style={{width:"72px",height:"72px",placeItems:"center"}}>🎭</div>}<div><h3 className="h6 fw-bold mb-1">{actor.NombreArtistico || actor.NombreCompleto}</h3><p className="text-muted small mb-1">{actor.Personaje || "Personaje no registrado"}</p><span className="badge bg-primary">{actor.TipoParticipacion || "Reparto"}</span></div></div></Link></div>)}</div>}
    </div></section>
  </div>;
}
export default PerfilPelicula;