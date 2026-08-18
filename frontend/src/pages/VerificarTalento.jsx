import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function VerificarTalento() {
  const [actores, setActores] = useState([]);
  const [buscar, setBuscar] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.get("/actores")
      .then((response) => setActores(response.data || []))
      .finally(() => setCargando(false));
  }, []);

  const resultados = useMemo(() => {
    const termino = buscar.trim().toLowerCase();
    if (!termino) return actores.slice(0, 24);
    return actores.filter((actor) =>
      [actor.NombreCompleto, actor.Nombres, actor.Apellidos, actor.NombreArtistico]
        .filter(Boolean)
        .some((valor) => valor.toLowerCase().includes(termino)),
    );
  }, [actores, buscar]);

  return (
    <div className="table-page-container">
      <div className="text-center mb-4">
        <span className="badge bg-primary mb-2">Talentos de CineRD</span>
        <h1 className="h2">¿Eres un talento registrado?</h1>
        <p className="text-muted">Busca tu perfil y solicita la verificación de identidad para vincularlo con tu cuenta.</p>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <input className="form-control form-control-lg" placeholder="Busca por nombre completo o nombre artístico"
            value={buscar} onChange={(e) => setBuscar(e.target.value)} />
        </div>
      </div>

      {cargando ? <div className="text-center py-5"><div className="spinner-border text-primary" /></div> : (
        <div className="row g-3">
          {resultados.map((actor) => (
            <div className="col-12 col-md-6 col-lg-4" key={actor.Id}>
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h2 className="h5 mb-1">{actor.NombreArtistico || actor.NombreCompleto}</h2>
                  {actor.NombreArtistico && <div className="text-muted small mb-2">{actor.NombreCompleto}</div>}
                  <div className="text-muted mb-3">{actor.Profesion || "Talento"}</div>
                  <div className="d-flex gap-2">
                    <Link className="btn btn-outline-secondary btn-sm" to={`/actores/${actor.Id}`}>Ver perfil</Link>
                    <Link className="btn btn-primary btn-sm" to={`/actores/${actor.Id}/reclamar`}>Este soy yo</Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default VerificarTalento;
