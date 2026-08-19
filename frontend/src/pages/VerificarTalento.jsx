import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const API_URL = "http://localhost:3000";

function VerificarTalento() {
  const [actores, setActores] = useState([]);
  const [buscar, setBuscar] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.get("/actores").then((response) => setActores(response.data || [])).finally(() => setCargando(false));
  }, []);

  const resultados = useMemo(() => {
    const termino = buscar.trim().toLowerCase();
    if (!termino) return actores.slice(0, 24);
    return actores.filter((actor) => [actor.NombreCompleto, actor.Nombres, actor.Apellidos, actor.NombreArtistico].filter(Boolean).some((valor) => valor.toLowerCase().includes(termino)));
  }, [actores, buscar]);

  return <div className="verification-page">
    <section className="verification-hero"><div><span>Identidad profesional</span><h1>Encuentra tu perfil artístico</h1><p>Busca tu nombre completo o artístico y solicita la vinculación segura de tu identidad con CineRD.</p></div></section>
    <div className="verification-search"><input placeholder="Buscar por nombre completo o nombre artístico..." value={buscar} onChange={(e)=>setBuscar(e.target.value)} /></div>
    {cargando ? <div className="text-center py-5"><div className="spinner-border text-primary" /></div> : <section className="verification-grid">
      {resultados.map((actor)=><article className="verification-card" key={actor.Id}>
        <div className="verification-card-head">
          {actor.Foto ? <img src={`${API_URL}${actor.Foto}`} alt={actor.NombreArtistico || actor.NombreCompleto} className="verification-photo"/> : <div className="verification-photo-placeholder">🎭</div>}
          <div><h2>{actor.NombreArtistico || actor.NombreCompleto}</h2>{actor.NombreArtistico && <small>{actor.NombreCompleto}</small>}<small>{actor.Profesion || "Talento cinematográfico"}</small></div>
        </div>
        <div className="verification-card-actions"><Link className="btn btn-outline-secondary btn-sm" to={`/actores/${actor.Id}`}>Ver perfil</Link><Link className="btn btn-primary btn-sm" to={`/actores/${actor.Id}/reclamar`}>Este soy yo</Link></div>
      </article>)}
    </section>}
    {!cargando && !resultados.length && <div className="admin-review-empty">No encontramos talentos con ese criterio.</div>}
  </div>;
}
export default VerificarTalento;