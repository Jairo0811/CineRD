import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Peliculas() {
  const [peliculas, setPeliculas] = useState([]);
  const [buscar, setBuscar] = useState("");
  const [orden, setOrden] = useState("estrenoDesc");
  const [genero, setGenero] = useState("");
  const API_URL = "http://localhost:3000";

  const usuario = (() => { try { return JSON.parse(localStorage.getItem("cineRdUsuario") || "null"); } catch { return null; } })();
  const esAdmin = usuario?.rol === "ADMINISTRADOR";

  useEffect(() => { obtenerPeliculas(); }, [buscar, orden, genero]);

  const obtenerPeliculas = async () => {
    try {
      const response = await api.get("/peliculas", { params: { buscar, orden, genero } });
      setPeliculas(response.data || []);
    } catch (error) { console.error(error); }
  };

  const eliminarPelicula = async (id) => {
    if (!esAdmin || !window.confirm("¿Desea eliminar esta película?")) return;
    try { await api.delete(`/peliculas/${id}`); await obtenerPeliculas(); }
    catch (error) { console.error(error); alert(error.response?.data?.mensaje || error.response?.data?.error || "Error al eliminar la película"); }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";
    const [year, month, day] = fecha.substring(0, 10).split("-");
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="table-page-container catalog-page">
      <header className="catalog-hero catalog-hero-movies">
        <div>
          <span className="catalog-eyebrow">CINERD · ARCHIVO CINEMATOGRÁFICO</span>
          <h1>Películas dominicanas</h1>
          <p>Descubre producciones, repartos y las historias que forman parte de nuestra memoria audiovisual.</p>
        </div>
        <div className="catalog-hero-meta"><strong>{peliculas.length}</strong><span>producciones encontradas</span></div>
        {esAdmin && <Link to="/peliculas/nueva" className="btn catalog-admin-button">+ Nueva película</Link>}
      </header>

      <section className="catalog-filter-bar">
        <div className="catalog-search"><span>⌕</span><input type="text" placeholder="Buscar por título, director o productora..." value={buscar} onChange={(e) => setBuscar(e.target.value)} /></div>
        <select value={orden} onChange={(e) => setOrden(e.target.value)} aria-label="Ordenar películas">
          <option value="estrenoDesc">Estreno más reciente</option><option value="estrenoAsc">Estreno más antiguo</option><option value="az">Título A-Z</option><option value="za">Título Z-A</option><option value="masActores">Mayor reparto</option><option value="menosActores">Menor reparto</option>
        </select>
        <select value={genero} onChange={(e) => setGenero(e.target.value)} aria-label="Filtrar por género">
          <option value="">Todos los géneros</option><option value="Comedia">Comedia</option><option value="Drama">Drama</option><option value="Acción">Acción</option><option value="Terror">Terror</option><option value="Romance">Romance</option><option value="Documental">Documental</option>
        </select>
      </section>

      <section className="movie-catalog-grid">
        {peliculas.map((pelicula) => (
          <article className="cinerd-movie-card" key={pelicula.Id}>
            <Link to={`/peliculas/${pelicula.Id}`} className="cinerd-poster-wrap">
              {pelicula.Foto ? <img src={`${API_URL}${pelicula.Foto}`} alt={pelicula.Titulo} className="cinerd-poster" /> : <div className="cinerd-poster cinerd-poster-empty">🎬</div>}
              <div className="cinerd-poster-overlay"><span>Ver película</span></div>
              <span className="cinerd-date-chip">{formatearFecha(pelicula.FechaEstreno)}</span>
            </Link>
            <div className="cinerd-movie-copy">
              <span className="cinerd-genre">{pelicula.Genero || "Cine dominicano"}</span>
              <h2><Link to={`/peliculas/${pelicula.Id}`}>{pelicula.Titulo}</Link></h2>
              <div className="cinerd-movie-details">
                <span>🎬 {pelicula.Director || "Director no registrado"}</span>
                <span>🏢 {pelicula.Productora || "Productora no registrada"}</span>
                <span>👥 {pelicula.CantidadActores || 0} talentos</span>
              </div>
            </div>
            {esAdmin && <div className="cinerd-admin-strip"><Link to={`/peliculas/editar/${pelicula.Id}`}>Editar</Link><Link to={`/peliculas/${pelicula.Id}/reparto`}>Reparto</Link><button type="button" onClick={() => eliminarPelicula(pelicula.Id)}>Eliminar</button></div>}
          </article>
        ))}
      </section>
      {peliculas.length === 0 && <div className="catalog-empty"><span>🎞️</span><h2>No encontramos películas</h2><p>Prueba cambiando los filtros de búsqueda.</p></div>}
    </div>
  );
}
export default Peliculas;
