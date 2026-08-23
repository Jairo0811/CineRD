import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import CreditosProfesionalesPelicula from "../components/reparto/CreditosProfesionalesPelicula";

function AdminCreditosPelicula() {
  const { id } = useParams();
  const [pelicula, setPelicula] = useState(null);
  const [actores, setActores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get(`/peliculas/${id}`), api.get("/actores")])
      .then(([peliculaResponse, actoresResponse]) => {
        setPelicula(peliculaResponse.data);
        setActores(actoresResponse.data || []);
      })
      .catch((e) => {
        console.error(e);
        setError(e.response?.data?.mensaje || "No fue posible cargar la administración de créditos");
      })
      .finally(() => setCargando(false));
  }, [id]);

  if (cargando) {
    return <div className="text-center py-5"><div className="spinner-border text-primary" /></div>;
  }

  if (error || !pelicula) {
    return <div className="alert alert-danger">{error || "Película no encontrada"}</div>;
  }

  return (
    <div className="table-page-container">
      <div className="d-flex flex-wrap gap-2 mb-4">
        <Link to={`/peliculas/${id}`} className="btn btn-outline-secondary">← Volver a la película</Link>
        <Link to={`/peliculas/${id}/reparto`} className="btn btn-outline-primary">👥 Administrar reparto</Link>
      </div>

      <header className="mb-4">
        <span className="catalog-eyebrow">ADMINISTRACIÓN EDITORIAL</span>
        <h1 className="display-6 fw-bold mb-1">Créditos profesionales</h1>
        <p className="text-muted mb-0">🎬 {pelicula.Titulo}</p>
      </header>

      <CreditosProfesionalesPelicula peliculaId={Number(id)} actores={actores} />
    </div>
  );
}

export default AdminCreditosPelicula;
