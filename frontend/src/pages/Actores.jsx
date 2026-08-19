import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

import {
  calcularEdad,
  calcularEdadAproximada,
  calcularEdadEnFecha,
  obtenerAnioFecha,
} from "../utils/fechas";

function Actores() {
  const [actores, setActores] = useState([]);
  const [buscar, setBuscar] = useState("");
  const [orden, setOrden] = useState("az");
  const [estado, setEstado] = useState("");
  const [anio, setAnio] = useState("");
  const [profesion, setProfesion] = useState("");
  const [cargando, setCargando] = useState(false);

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
    obtenerActores();
  }, [buscar, orden, estado, anio, profesion]);

  const obtenerActores = async () => {
    try {
      setCargando(true);
      const response = await api.get("/actores", {
        params: { buscar, orden, estado, anio, profesion },
      });
      setActores(response.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  const eliminarActor = async (id) => {
    if (!esAdmin) return;
    if (!window.confirm("¿Desea eliminar este talento?")) return;

    try {
      await api.delete(`/actores/${id}`);
      await obtenerActores();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.mensaje || "Error al eliminar el talento");
    }
  };

  const obtenerEdadActor = (actor) => {
    if (actor.FechaNacimiento) {
      if (!actor.EstaVivo && actor.FechaFallecimiento) {
        return calcularEdadEnFecha(actor.FechaNacimiento, actor.FechaFallecimiento);
      }
      return calcularEdad(actor.FechaNacimiento);
    }

    if (actor.AnioNacimiento) {
      const anioFinal = !actor.EstaVivo && actor.FechaFallecimiento
        ? obtenerAnioFecha(actor.FechaFallecimiento)
        : new Date().getFullYear();
      return calcularEdadAproximada(actor.AnioNacimiento, anioFinal);
    }

    return null;
  };

  const mostrarNacimiento = (actor) => {
    const edad = obtenerEdadActor(actor);
    if (actor.FechaNacimiento) return edad !== null ? `${edad} años` : "Edad no disponible";
    if (actor.AnioNacimiento) return edad !== null ? `${actor.AnioNacimiento} · Aprox. ${edad} años` : String(actor.AnioNacimiento);
    return "Fecha desconocida";
  };

  const obtenerEstadoActor = (actor) => {
    if (actor.EstaVivo) return "🟢 Vivo";
    return actor.Sexo === "Femenino" ? "⚫ Fallecida" : "⚫ Fallecido";
  };

  return (
    <div className="table-page-container">
      <Link to="/" className="btn btn-secondary mb-3">← Volver al inicio</Link>

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 page-header mb-4">
        <div>
          <span className="text-uppercase text-primary fw-bold small">Archivo artístico</span>
          <h2 className="mb-0 mt-1">🎭 Talentos</h2>
        </div>

        {esAdmin && (
          <Link to="/actores/nuevo" className="btn btn-primary">➕ Nuevo talento</Link>
        )}
      </div>

      <div className="filter-panel card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <label className="form-label">Buscar talento</label>
              <input type="text" className="form-control" placeholder="Ej: Fausto, Boca de Piano, Director..." value={buscar} onChange={(e) => setBuscar(e.target.value)} />
            </div>

            <div className="col-12 col-md-3">
              <label className="form-label">Ordenar por</label>
              <select className="form-select" value={orden} onChange={(e) => setOrden(e.target.value)}>
                <option value="az">A-Z</option>
                <option value="za">Z-A</option>
                <option value="masPeliculas">Más películas</option>
                <option value="menosPeliculas">Menos películas</option>
                <option value="nacimientoReciente">Nacimiento reciente</option>
                <option value="nacimientoAntiguo">Nacimiento antiguo</option>
              </select>
            </div>

            <div className="col-12 col-md-3">
              <label className="form-label">Estado</label>
              <select className="form-select" value={estado} onChange={(e) => setEstado(e.target.value)}>
                <option value="">Todos</option>
                <option value="vivo">Vivos</option>
                <option value="fallecido">Fallecidos</option>
              </select>
            </div>

            <div className="col-12 col-md-2">
              <label className="form-label">Año</label>
              <input type="number" className="form-control" placeholder="1971" value={anio} onChange={(e) => setAnio(e.target.value)} />
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label">Profesión / Rol</label>
              <select className="form-select" value={profesion} onChange={(e) => setProfesion(e.target.value)}>
                <option value="">Todas las profesiones</option>
                <optgroup label="🎭 Interpretación">
                  <option value="Actor">Actor</option><option value="Actriz">Actriz</option><option value="Comediante">Comediante</option><option value="Humorista">Humorista</option>
                </optgroup>
                <optgroup label="🎬 Dirección"><option value="Director">Director</option></optgroup>
                <optgroup label="🎥 Producción"><option value="Productor">Productor</option><option value="Guionista">Guionista</option></optgroup>
                <optgroup label="🎵 Música"><option value="Cantante">Cantante</option><option value="Artista urbano">Artista urbano</option><option value="Artista urbana">Artista urbana</option></optgroup>
                <optgroup label="📺 Medios"><option value="YouTuber">YouTuber</option><option value="Influencer">Influencer</option><option value="Comunicador">Comunicador</option><option value="Locutor">Locutor</option></optgroup>
                <optgroup label="⭐ Otros"><option value="Modelo">Modelo</option><option value="Deportista">Deportista</option><option value="Músico">Músico</option><option value="Otro">Otro</option></optgroup>
              </select>
            </div>
          </div>
        </div>
      </div>

      {cargando && <div className="text-center py-4"><div className="spinner-border text-primary" role="status" /><p className="text-muted mt-2 mb-0">Cargando talentos...</p></div>}

      {!cargando && (
        <div className="row g-4">
          {actores.map((actor) => (
            <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={actor.Id}>
              <div className="card h-100 shadow actor-card">
                <div className="text-center pt-3">
                  {actor.Foto ? <img src={`${API_URL}${actor.Foto}`} alt={actor.NombreCompleto} className="actor-photo" /> : <div className="actor-photo-placeholder">🎭</div>}
                </div>

                <div className="card-body text-center">
                  <h5 className="card-title text-center mb-2">
                    <div className="fw-bold fs-4">{actor.Nombres || actor.NombreCompleto || "Sin nombre"}</div>
                    {actor.Apellidos && <div className="text-secondary fw-semibold">{actor.Apellidos}</div>}
                  </h5>
                  {actor.NombreArtistico && <p className="text-muted mb-2">🎭 {actor.NombreArtistico}</p>}
                  <p className="mb-1">💼 <strong>{actor.Profesion || "Sin profesión definida"}</strong></p>
                  <p className="mb-1">🎂 {mostrarNacimiento(actor)}</p>
                  <p className="mb-2">🎬 {actor.CantidadPeliculas || 0} película(s)</p>
                  <span className={`badge ${actor.EstaVivo ? "bg-success" : "bg-dark"}`}>{obtenerEstadoActor(actor)}</span>
                </div>

                <div className="card-footer bg-white border-0">
                  <Link to={`/actores/${actor.Id}`} className="btn btn-outline-primary btn-sm w-100 mb-2">👤 Ver perfil</Link>

                  {esAdmin && (
                    <div className="d-flex gap-2">
                      <Link to={`/actores/editar/${actor.Id}`} className="btn btn-warning btn-sm w-50">✏️ Editar</Link>
                      <button type="button" className="btn btn-danger btn-sm w-50" onClick={() => eliminarActor(actor.Id)}>🗑️ Eliminar</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {actores.length === 0 && <div className="col-12 text-center text-muted py-5">No se encontraron talentos.</div>}
        </div>
      )}
    </div>
  );
}

export default Actores;