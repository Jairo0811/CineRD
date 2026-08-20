import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const API_URL = "http://localhost:3000";
const resolverFoto = (perfil) => {
  const ruta = perfil?.Foto || perfil?.FotoUrl || perfil?.Imagen || perfil?.ImagenUrl || perfil?.ProfilePath || null;
  if (!ruta) return null;
  return ruta.startsWith("http") ? ruta : `${API_URL}${ruta}`;
};

function DashboardTalento({ usuario }) {
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.get("/verificaciones/mi-perfil")
      .then((response) => setPerfil(response.data))
      .catch((error) => console.error("No fue posible cargar el perfil artístico vinculado:", error))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <div className="talent-loading"><div className="spinner-border text-primary" role="status"/><p className="mt-3">Preparando tu espacio profesional...</p></div>;

  const nombre = perfil?.NombreArtistico || perfil?.NombreCompleto || usuario?.nombre || "Talento CineRD";
  const peliculas = Number(perfil?.CantidadPeliculas || 0);
  const profesion = perfil?.Profesion || "Talento cinematográfico";
  const fechaVerificacion = perfil?.FechaVerificacion ? new Date(perfil.FechaVerificacion).toLocaleDateString("es-DO", { year:"numeric", month:"short", day:"numeric" }) : "Verificado";
  const imagen = resolverFoto(perfil);

  return <div className="talent-dashboard">
    <section className="talent-hero">
      {imagen ? <img className="talent-avatar" src={imagen} alt={nombre}/> : <div className="talent-avatar-placeholder">🎭</div>}
      <div className="talent-hero-copy"><span>Perfil profesional CineRD</span><h1>{nombre}</h1><p>{profesion} · Tu espacio profesional dentro del archivo cinematográfico dominicano.</p></div>
      <div className="talent-verified-seal"><span>✓</span> Talento verificado</div>
    </section>
    <section className="talent-kpis">
      <article className="talent-kpi"><strong>{peliculas}</strong><span>Películas vinculadas</span></article>
      <article className="talent-kpi"><strong>{perfil?.EstaVivo === false ? "Legado" : "Activo"}</strong><span>Estado del perfil</span></article>
      <article className="talent-kpi"><strong>✓</strong><span>Identidad verificada</span></article>
      <article className="talent-kpi"><strong>{fechaVerificacion}</strong><span>Verificación CineRD</span></article>
    </section>
    <section className="talent-dashboard-grid">
      <Link to={perfil?.Id ? `/actores/${perfil.Id}` : "/actores"} className="talent-action-card highlight"><span className="talent-action-icon">👤</span><div><h2>Ver mi perfil público</h2><p>Consulta cómo aparece tu identidad profesional y filmografía ante los visitantes.</p></div></Link>
      {perfil?.Id && <Link to={`/actores/editar/${perfil.Id}`} className="talent-action-card"><span className="talent-action-icon">✎</span><div><h2>Editar mi información</h2><p>Actualiza los campos de tu perfil permitidos por las reglas de autorización.</p></div></Link>}
      <Link to="/peliculas" className="talent-action-card"><span className="talent-action-icon">🎞️</span><div><h2>Explorar filmografías</h2><p>Consulta producciones, repartos y conexiones profesionales del catálogo.</p></div></Link>
    </section>
    <section className="talent-profile-panel">
      <article className="talent-panel"><header className="talent-panel-header"><span>Ficha profesional</span><h2>Información registrada en CineRD</h2></header><div className="talent-facts"><div className="talent-fact"><small>Nombre completo</small><strong>{perfil?.NombreCompleto || usuario?.nombre || "—"}</strong></div><div className="talent-fact"><small>Nombre artístico</small><strong>{perfil?.NombreArtistico || "—"}</strong></div><div className="talent-fact"><small>Profesión</small><strong>{profesion}</strong></div><div className="talent-fact"><small>Filmografía registrada</small><strong>{peliculas} producciones</strong></div></div></article>
      <article className="talent-panel"><header className="talent-panel-header"><span>Confianza</span><h2>Identidad profesional protegida</h2></header><div className="talent-trust"><div className="talent-trust-badge"><span>🛡️</span><div><strong>Verificación activa</strong><p>Esta cuenta está vinculada a un único perfil artístico y la autorización impide modificar perfiles ajenos.</p></div></div></div></article>
    </section>
  </div>;
}
export default DashboardTalento;