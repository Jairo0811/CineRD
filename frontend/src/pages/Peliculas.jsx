import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Peliculas() {
  const [peliculas, setPeliculas] = useState([]);
  const [buscar, setBuscar] = useState("");
  const [orden, setOrden] = useState("estrenoDesc");
  const [genero, setGenero] = useState("");

  const API_URL = "http://localhost:3000";

  const usuario = (() => {
    try {
      return JSON.parse(localStorage.getItem("cineRdUsuario") || "null");
    } catch {
      return null;
    }
  })();

  const esAdmin = usuario?.rol === "ADMINISTRADOR";

  useEffect(() => {
    obtenerPeliculas();
  }, [buscar, orden, genero]);

  const obtenerPeliculas = async () => {
    try {
      const response = await api.get("/peliculas", { params: { buscar, orden, genero } });
      setPeliculas(response.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const eliminarPelicula = async (id) => {
    if (!esAdmin) return;
    if (!window.confirm("¿Desea eliminar esta película?")) return;

    try {
      await api.delete(`/peliculas/${id}`);
      await obtenerPeliculas();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.mensaje || error.response?.data?.error || "Error al eliminar la película");
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";
    const [year, month, day] = fecha.substring(0, 10).split("-");
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="table-page-container">
      <Link to="/" className="btn btn-secondary mb-3">← Volver al inicio</Link>

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 page-header mb-4">
        <div>
          <span className="text-uppercase text-primary fw-bold small">Cartelera y archivo</span>
          <h2 className="mb-0 mt-1">🎬 Películas</h2>
        </div>

        {esAdmin && <Link to="/peliculas/nueva" className="btn btn-primary">➕ Nueva película</Link>}
      </div>

      <div className="filter-panel card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12 col-md-5">
              <label className="form-label">Buscar película</label>
              <input type="text" className="form-control" placeholder="Ej: Sanky Panky, Pinky, Caribbean..." value={buscar} onChange={(e) => setBuscar(e.target.value)} />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label">Ordenar por</label>
              <select className="form-select" value={orden} onChange={(e) => setOrden(e.target.value)}>
                <option value="estrenoDesc">Estreno más reciente</option>
                <option value="estrenoAsc">Estreno más antiguo</option>
                <option value="az">A-Z</option>
                <option value="za">Z-A</option>
                <option value="masActores">Mayor reparto</option>
                <option value="menosActores">Menor reparto</option>
              </select>
            </div>
            <div className="col-12 col-md-3">
              <label className="form-label">Género</label>
              <select className="form-select" value={genero} onChange={(e) => setGenero(e.target.value)}>
                <option value="">Todos</option><option value="Comedia">Comedia</option><option value="Drama">Drama</option><option value="Acción">Acción</option><option value="Terror">Terror</option><option value="Romance">Romance</option><option value="Documental">Documental</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {peliculas.map((pelicula) => (
          <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={pelicula.Id}>
            <div className="card h-100 shadow movie-card">
              <div className="text-center pt-3">
                {pelicula.Foto ? <img src={`${API_URL}${pelicula.Foto}`} alt={pelicula.Titulo} className="movie-poster" /> : <div className="movie-poster-placeholder">🎬</div>}
              </div>

              <div className="card-body text-center">
                <h5 className="card-title mb-2">{pelicula.Titulo}</h5>
                <p className="text-muted mb-1">🎭 {pelicula.Genero || "-"}</p>
                <p className="text-muted mb-1">🎬 {pelicula.Director || "-"}</p>
                <p className="text-muted mb-1">🏢 {pelicula.Productora || "-"}</p>
                <p className="mb-2">👥 {pelicula.CantidadActores || 0} actor(es)</p>
                <span className="badge bg-primary">📅 {formatearFecha(pelicula.FechaEstreno)}</span>
              </div>

              <div className="card-footer bg-white border-0">
                <Link to={`/peliculas/${pelicula.Id}`} className="btn btn-outline-primary btn-sm w-100 mb-2">🎬 Ver perfil</Link>

                {esAdmin && (
                  <>
                    <div className="d-flex gap-2 mb-2">
                      <Link to={`/peliculas/editar/${pelicula.Id}`} className="btn btn-warning btn-sm w-50">✏️ Editar</Link>
                      <button type="button" className="btn btn-danger btn-sm w-50" onClick={() => eliminarPelicula(pelicula.Id)}>🗑️ Eliminar</button>
                    </div>
                    <Link to={`/peliculas/${pelicula.Id}/reparto`} className="btn btn-primary btn-sm w-100">👥 Administrar reparto</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {peliculas.length === 0 && <div className="col-12 text-center text-muted mt-5">No se encontraron películas.</div>}
      </div>
    </div>
  );
}

export default Peliculas;