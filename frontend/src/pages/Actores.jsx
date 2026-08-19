import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { calcularEdad, calcularEdadAproximada, calcularEdadEnFecha, obtenerAnioFecha } from "../utils/fechas";

function Actores() {
  const [actores, setActores] = useState([]);
  const [buscar, setBuscar] = useState(""); const [orden, setOrden] = useState("az"); const [estado, setEstado] = useState(""); const [anio, setAnio] = useState(""); const [profesion, setProfesion] = useState(""); const [cargando, setCargando] = useState(false);
  const API_URL = "http://localhost:3000";
  const usuario = (() => { try { return JSON.parse(localStorage.getItem("cineRdUsuario") || "null"); } catch { return null; } })();
  const esAdmin = usuario?.rol === "ADMINISTRADOR";

  useEffect(() => { obtenerActores(); }, [buscar, orden, estado, anio, profesion]);
  const obtenerActores = async () => { try { setCargando(true); const response = await api.get("/actores", { params:{buscar,orden,estado,anio,profesion} }); setActores(response.data || []); } catch(error){ console.error(error); } finally { setCargando(false); } };
  const eliminarActor = async (id) => { if (!esAdmin || !window.confirm("¿Desea eliminar este talento?")) return; try { await api.delete(`/actores/${id}`); await obtenerActores(); } catch(error){ console.error(error); alert(error.response?.data?.mensaje || "Error al eliminar el talento"); } };
  const obtenerEdadActor = (actor) => { if(actor.FechaNacimiento){ if(!actor.EstaVivo && actor.FechaFallecimiento) return calcularEdadEnFecha(actor.FechaNacimiento,actor.FechaFallecimiento); return calcularEdad(actor.FechaNacimiento); } if(actor.AnioNacimiento){ const final=!actor.EstaVivo&&actor.FechaFallecimiento?obtenerAnioFecha(actor.FechaFallecimiento):new Date().getFullYear(); return calcularEdadAproximada(actor.AnioNacimiento,final); } return null; };
  const mostrarNacimiento = (actor) => { const edad=obtenerEdadActor(actor); if(actor.FechaNacimiento) return edad!==null?`${edad} años`:"Edad no disponible"; if(actor.AnioNacimiento) return edad!==null?`${actor.AnioNacimiento} · aprox. ${edad} años`:String(actor.AnioNacimiento); return "Fecha desconocida"; };

  return (
    <div className="table-page-container catalog-page">
      <header className="catalog-hero catalog-hero-talents">
        <div><span className="catalog-eyebrow">CINERD · TALENTO DOMINICANO</span><h1>Las caras de nuestro cine</h1><p>Actores, actrices, directores, productores, guionistas y artistas que construyen el audiovisual dominicano.</p></div>
        <div className="catalog-hero-meta"><strong>{actores.length}</strong><span>talentos encontrados</span></div>
        {esAdmin && <Link to="/actores/nuevo" className="btn catalog-admin-button">+ Nuevo talento</Link>}
      </header>

      <section className="catalog-filter-bar talent-filter-bar">
        <div className="catalog-search"><span>⌕</span><input type="text" placeholder="Buscar talento o nombre artístico..." value={buscar} onChange={(e)=>setBuscar(e.target.value)} /></div>
        <select value={profesion} onChange={(e)=>setProfesion(e.target.value)} aria-label="Profesión"><option value="">Todas las profesiones</option><option value="Actor">Actor</option><option value="Actriz">Actriz</option><option value="Comediante">Comediante</option><option value="Director">Director</option><option value="Productor">Productor</option><option value="Guionista">Guionista</option><option value="Cantante">Cantante</option><option value="Artista urbano">Artista urbano</option><option value="Artista urbana">Artista urbana</option><option value="Otro">Otro</option></select>
        <select value={orden} onChange={(e)=>setOrden(e.target.value)} aria-label="Orden"><option value="az">Nombre A-Z</option><option value="za">Nombre Z-A</option><option value="masPeliculas">Más películas</option><option value="menosPeliculas">Menos películas</option><option value="nacimientoReciente">Más jóvenes</option><option value="nacimientoAntiguo">Mayor trayectoria</option></select>
        <select value={estado} onChange={(e)=>setEstado(e.target.value)} aria-label="Estado"><option value="">Todos</option><option value="vivo">Vivos</option><option value="fallecido">Fallecidos</option></select>
        <input className="catalog-year" type="number" placeholder="Año" value={anio} onChange={(e)=>setAnio(e.target.value)} aria-label="Año de nacimiento" />
      </section>

      {cargando && <div className="catalog-loading"><div className="spinner-border" role="status"/><span>Buscando talentos...</span></div>}
      {!cargando && <section className="talent-catalog-grid">
        {actores.map((actor)=>(
          <article className="cinerd-talent-card" key={actor.Id}>
            <Link to={`/actores/${actor.Id}`} className="cinerd-talent-visual">
              {actor.Foto ? <img src={`${API_URL}${actor.Foto}`} alt={actor.NombreCompleto} /> : <div className="cinerd-talent-placeholder">🎭</div>}
              <div className="cinerd-talent-gradient" />
              <span className={`cinerd-status-dot ${actor.EstaVivo ? "alive" : "deceased"}`}>{actor.EstaVivo ? "Vivo" : "In memoriam"}</span>
            </Link>
            <div className="cinerd-talent-copy">
              <span className="cinerd-genre">{actor.Profesion || "Talento"}</span>
              <h2><Link to={`/actores/${actor.Id}`}>{actor.NombreArtistico || `${actor.Nombres || actor.NombreCompleto || "Sin nombre"}${actor.Apellidos ? ` ${actor.Apellidos}` : ""}`}</Link></h2>
              {actor.NombreArtistico && <small>{actor.NombreCompleto || `${actor.Nombres || ""} ${actor.Apellidos || ""}`}</small>}
              <div className="cinerd-talent-facts"><span>🎬 {actor.CantidadPeliculas || 0} películas</span><span>🎂 {mostrarNacimiento(actor)}</span></div>
              <Link to={`/actores/${actor.Id}`} className="cinerd-profile-link">Ver filmografía <span>→</span></Link>
            </div>
            {esAdmin && <div className="cinerd-admin-strip"><Link to={`/actores/editar/${actor.Id}`}>Editar</Link><button type="button" onClick={()=>eliminarActor(actor.Id)}>Eliminar</button></div>}
          </article>
        ))}
      </section>}
      {!cargando && actores.length===0 && <div className="catalog-empty"><span>🎭</span><h2>No encontramos talentos</h2><p>Prueba cambiando los filtros de búsqueda.</p></div>}
    </div>
  );
}
export default Actores;
