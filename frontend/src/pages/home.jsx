import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import api from "../services/api";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);
const API_URL = "http://localhost:3000";
const COLORES = ["#0057B8", "#CE1126", "#F4B400", "#198754", "#6F42C1", "#FD7E14", "#1F2937", "#6C757D"];
const resolverImagen = (ruta) => !ruta ? null : ruta.startsWith("http://") || ruta.startsWith("https://") ? ruta : `${API_URL}${ruta}`;
const imagenActor = (a) => resolverImagen(a?.Foto || a?.FotoUrl || a?.Imagen || a?.ImagenUrl || a?.ProfilePath || null);
const imagenPelicula = (p) => resolverImagen(p?.Foto || p?.Poster || p?.PosterUrl || p?.Imagen || p?.ImagenUrl || null);

function Home() {
  const [actores, setActores] = useState([]);
  const [peliculas, setPeliculas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/actores"), api.get("/peliculas")])
      .then(([a, p]) => { setActores(a.data || []); setPeliculas(p.data || []); })
      .catch((error) => console.error("Error al cargar el centro de control:", error))
      .finally(() => setCargando(false));
  }, []);

  const resumen = useMemo(() => ({
    participaciones: peliculas.reduce((t, p) => t + Number(p.CantidadActores || 0), 0),
    conReparto: peliculas.filter((p) => Number(p.CantidadActores || 0) > 0).length,
    directores: actores.filter((a) => a.Profesion?.toLowerCase().includes("director")).length,
    vivos: actores.filter((a) => Boolean(a.EstaVivo)).length,
    verificados: actores.filter((a) => Boolean(a.EsVerificado)).length,
  }), [actores, peliculas]);

  const topActores = useMemo(() => [...actores].sort((a,b) => Number(b.CantidadPeliculas || 0) - Number(a.CantidadPeliculas || 0)).slice(0,10), [actores]);
  const topPeliculas = useMemo(() => [...peliculas].sort((a,b) => Number(b.CantidadActores || 0) - Number(a.CantidadActores || 0)).slice(0,8), [peliculas]);
  const ultimasPeliculas = useMemo(() => [...peliculas].sort((a,b) => Number(b.Id)-Number(a.Id)).slice(0,5), [peliculas]);
  const ultimosTalentos = useMemo(() => [...actores].sort((a,b) => Number(b.Id)-Number(a.Id)).slice(0,5), [actores]);
  const generos = useMemo(() => peliculas.reduce((acc,p) => { const g=p.Genero||"Sin género"; acc[g]=(acc[g]||0)+1; return acc; },{}), [peliculas]);
  const estrenos = useMemo(() => peliculas.reduce((acc,p) => { if(p.FechaEstreno){const a=p.FechaEstreno.substring(0,4); acc[a]=(acc[a]||0)+1;} return acc; },{}), [peliculas]);
  const anios = Object.keys(estrenos).sort();
  const anioMasReciente = anios.length ? anios[anios.length - 1] : "—";
  const coberturaReparto = peliculas.length ? Math.round((resumen.conReparto / peliculas.length) * 100) : 0;
  const opciones = { responsive:true, maintainAspectRatio:false, plugins:{legend:{position:"bottom"}} };
  const datosGeneros = { labels:Object.keys(generos), datasets:[{label:"Películas",data:Object.values(generos),backgroundColor:COLORES,borderWidth:0}] };
  const datosEstrenos = { labels:anios, datasets:[{label:"Estrenos",data:anios.map(a=>estrenos[a]),backgroundColor:"#0057B8",borderWidth:0}] };
  const datosTop = { labels:topPeliculas.map(p=>p.Titulo), datasets:[{label:"Talentos en reparto",data:topPeliculas.map(p=>Number(p.CantidadActores||0)),backgroundColor:"#0057B8",borderWidth:0}] };
  const kpis = [
    ["🎬",peliculas.length,"Películas catalogadas"],["🎭",actores.length,"Talentos registrados"],["👥",resumen.participaciones,"Participaciones"],["🎞️",resumen.conReparto,"Películas con reparto"],
    ["🎥",resumen.directores,"Directores registrados"],["🟢",resumen.vivos,"Talentos vivos"],["📚",Object.keys(generos).length,"Géneros presentes"],["📈",Object.keys(estrenos).length,"Años documentados"]
  ];

  if (cargando) return <div className="dashboard-loading"><div className="spinner-border text-primary" role="status"/><p className="mt-3 mb-0">Preparando el centro de control...</p></div>;

  return <div className="admin-dashboard">
    <section className="admin-dashboard-hero"><div><span className="admin-dashboard-eyebrow">● Administración · CineRD</span><h1>Centro de Control</h1><p>Supervisa el catálogo cinematográfico dominicano, sus talentos, repartos y crecimiento desde una vista operativa única.</p><div className="admin-dashboard-hero-tags"><span>Catálogo activo</span><span>{peliculas.length} producciones</span><span>{actores.length} talentos</span></div></div><div className="admin-dashboard-brand"><img src="/logo.png" alt="CineRD"/></div></section>
    <section className="admin-dashboard-actions">
      <Link to="/peliculas/nueva" className="admin-dashboard-action primary"><span className="admin-dashboard-action-icon">＋</span><div><strong>Nueva película</strong><small>Registrar o importar producción</small></div></Link>
      <Link to="/actores/nuevo" className="admin-dashboard-action"><span className="admin-dashboard-action-icon">🎭</span><div><strong>Nuevo talento</strong><small>Agregar perfil profesional</small></div></Link>
      <Link to="/admin/verificaciones" className="admin-dashboard-action"><span className="admin-dashboard-action-icon">✓</span><div><strong>Verificaciones</strong><small>Revisar identidad de talentos</small></div></Link>
      <Link to="/peliculas" className="admin-dashboard-action"><span className="admin-dashboard-action-icon">⌕</span><div><strong>Gestionar catálogo</strong><small>Consultar y administrar registros</small></div></Link>
    </section>
    <section className="admin-dashboard-overview" aria-label="Estado del catálogo"><article><span>Cobertura de reparto</span><strong>{coberturaReparto}%</strong><small>{resumen.conReparto} de {peliculas.length} películas con talentos vinculados</small></article><article><span>Identidad profesional</span><strong>{resumen.verificados}</strong><small>perfiles de talento verificados</small></article><article><span>Archivo histórico</span><strong>{anioMasReciente}</strong><small>año de estreno más reciente documentado</small></article></section>
    <section className="admin-kpi-grid">{kpis.map(([i,v,t])=><article className="admin-kpi" key={t}><div className="admin-kpi-top"><span className="admin-kpi-icon">{i}</span></div><strong className="admin-kpi-value">{v}</strong><span className="admin-kpi-label">{t}</span></article>)}</section>
    <section className="admin-dashboard-section-grid">
      <article className="admin-dashboard-panel"><header className="admin-dashboard-panel-header"><div><span>Top 10 · Ranking de talentos</span><h2>Mayor presencia en el catálogo</h2></div><Link to="/actores">Ver todos</Link></header><div className="admin-ranking">{topActores.map((a,i)=><Link to={`/actores/${a.Id}`} className="admin-ranking-item" key={a.Id}><span className="admin-ranking-position">{i+1}</span>{imagenActor(a)?<img className="admin-ranking-image" src={imagenActor(a)} alt={a.NombreArtistico||a.NombreCompleto}/>:<span className="admin-ranking-placeholder">🎭</span>}<span className="admin-ranking-copy"><strong>{a.NombreArtistico||a.NombreCompleto}</strong><small>{a.Profesion||"Talento cinematográfico"}</small></span><span className="admin-ranking-total">{a.CantidadPeliculas||0}</span></Link>)}</div></article>
      <article className="admin-dashboard-panel"><header className="admin-dashboard-panel-header"><div><span>Producciones</span><h2>Películas con mayor reparto</h2></div></header><div className="admin-chart"><Bar data={datosTop} options={opciones}/></div></article>
    </section>
    <section className="admin-dashboard-charts">
      <article className="admin-dashboard-panel"><header className="admin-dashboard-panel-header"><div><span>Catálogo</span><h2>Distribución por género</h2></div></header><div className="admin-chart"><Pie data={datosGeneros} options={opciones}/></div></article>
      <article className="admin-dashboard-panel"><header className="admin-dashboard-panel-header"><div><span>Historia</span><h2>Estrenos documentados por año</h2></div></header><div className="admin-chart"><Bar data={datosEstrenos} options={opciones}/></div></article>
    </section>
    <section className="admin-recent-grid">
      <article className="admin-dashboard-panel"><header className="admin-dashboard-panel-header"><div><span>Actividad reciente</span><h2>Últimas películas agregadas</h2></div><Link to="/peliculas">Catálogo</Link></header><div className="admin-recent-list">{ultimasPeliculas.map(p=><Link to={`/peliculas/${p.Id}`} className="admin-recent-item" key={p.Id}>{imagenPelicula(p)?<img className="admin-recent-thumb" src={imagenPelicula(p)} alt={p.Titulo}/>:<span className="admin-recent-placeholder">🎬</span>}<span className="admin-recent-copy"><strong>{p.Titulo}</strong><small>{p.Genero||"Producción dominicana"}</small></span></Link>)}</div></article>
      <article className="admin-dashboard-panel"><header className="admin-dashboard-panel-header"><div><span>Actividad reciente</span><h2>Últimos talentos agregados</h2></div><Link to="/actores">Talentos</Link></header><div className="admin-recent-list">{ultimosTalentos.map(a=><Link to={`/actores/${a.Id}`} className="admin-recent-item" key={a.Id}>{imagenActor(a)?<img className="admin-recent-thumb" src={imagenActor(a)} alt={a.NombreArtistico||a.NombreCompleto}/>:<span className="admin-recent-placeholder">🎭</span>}<span className="admin-recent-copy"><strong>{a.NombreArtistico||a.NombreCompleto}</strong><small>{a.Profesion||"Talento cinematográfico"}</small></span></Link>)}</div></article>
    </section>
  </div>;
}
export default Home;