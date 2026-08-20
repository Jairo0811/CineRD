import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const API_URL = "http://localhost:3000";
const resolverPoster = (p) => {
  const ruta = p?.Foto || p?.Poster || p?.PosterUrl || p?.Imagen || p?.ImagenUrl || null;
  if (!ruta) return null;
  return ruta.startsWith("http") ? ruta : `${API_URL}${ruta}`;
};

function DashboardUsuario({ usuario }) {
  const [peliculas, setPeliculas] = useState([]);
  const [actores, setActores] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get("/peliculas"),
      api.get("/actores"),
      usuario ? api.get("/verificaciones/mis-solicitudes").catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
    ]).then(([p, a, s]) => {
      setPeliculas(p.data || []);
      setActores(a.data || []);
      setSolicitudes(s.data || []);
    }).catch((error) => console.error("Error al cargar Mi CineRD:", error));
  }, [usuario]);

  const destacadas = useMemo(() => [...peliculas].sort((a,b) => Number(b.CantidadActores || 0) - Number(a.CantidadActores || 0)).slice(0,6), [peliculas]);
  const pendientes = solicitudes.filter((s) => s.Estado === "PENDIENTE").length;
  const aprobadas = solicitudes.filter((s) => s.Estado === "APROBADA").length;

  return <div className="user-dashboard">
    <section className="user-dashboard-hero"><div><span className="user-dashboard-eyebrow">Mi CineRD · Experiencia personal</span><h1>Hola, {usuario?.nombre || "cinéfilo"}</h1><p>Explora el cine dominicano, descubre talentos y, si formas parte de la industria, inicia el proceso para verificar tu identidad profesional.</p></div><img src="/logo.png" alt="CineRD" className="user-dashboard-logo" /></section>
    <section className="user-dashboard-stats"><article className="user-stat"><strong>{peliculas.length}</strong><span>Películas disponibles</span></article><article className="user-stat"><strong>{actores.length}</strong><span>Talentos registrados</span></article><article className="user-stat"><strong>{pendientes}</strong><span>Solicitudes pendientes</span></article></section>
    <section className="user-dashboard-actions"><Link to="/peliculas" className="user-action"><span className="user-action-icon">🎬</span><div><h2>Explorar películas</h2><p>Recorre producciones, géneros, repartos y fichas cinematográficas.</p></div></Link><Link to="/actores" className="user-action"><span className="user-action-icon">🎭</span><div><h2>Descubrir talentos</h2><p>Consulta perfiles profesionales y filmografías del audiovisual dominicano.</p></div></Link><Link to="/verificar-perfil" className="user-action highlight"><span className="user-action-icon">✓</span><div><h2>Verificar mi perfil</h2><p>Encuentra tu ficha artística y solicita el vínculo oficial con tu cuenta.</p></div></Link></section>
    <section className="user-dashboard-grid">
      <article className="user-panel"><header className="user-panel-header"><div><span>Descubrimiento</span><h2>Producciones con mayor reparto</h2></div><Link to="/peliculas">Ver catálogo</Link></header><div className="user-discovery-grid">{destacadas.map((p)=>{const imagen=resolverPoster(p);return <Link to={`/peliculas/${p.Id}`} className="user-discovery-card" key={p.Id}>{imagen ? <img src={imagen} className="user-discovery-visual" alt={p.Titulo}/> : <div className="user-discovery-placeholder">🎬</div>}<div className="user-discovery-copy"><strong>{p.Titulo}</strong><small>{p.CantidadActores || 0} talentos · {p.Genero || "Cine dominicano"}</small></div></Link>;})}</div></article>
      <article className="user-panel"><header className="user-panel-header"><div><span>Mi actividad</span><h2>Verificación de perfil</h2></div>{solicitudes.length > 0 && <span>{aprobadas} aprobada(s)</span>}</header>{solicitudes.length === 0 ? <div className="user-empty-state">Todavía no has enviado solicitudes. Si eres profesional del sector, localiza tu perfil y solicita su verificación.</div> : <div className="user-status-list">{solicitudes.slice(0,5).map((s)=><div className="user-status-item" key={s.Id}><div className="user-status-copy"><strong>{s.NombreArtistico || s.NombreCompleto}</strong><small>{s.Metodo?.replaceAll("_"," ") || "Verificación"}</small></div><span className={`user-status-badge ${String(s.Estado||"").toLowerCase()}`}>{s.Estado}</span></div>)}</div>}</article>
    </section>
  </div>;
}
export default DashboardUsuario;