import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import EncabezadoPagina from "../components/ui/EncabezadoPagina";
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
      <EncabezadoPagina
        eyebrow="ADMINISTRACIÓN EDITORIAL"
        titulo="Créditos profesionales"
        descripcion={`🎬 ${pelicula.Titulo}`}
        volverA={`/peliculas/${id}`}
        volverTexto="← Volver a la película"
      >
        <Link to={`/peliculas/${id}/reparto`} className="page-hero-link">👥 Administrar reparto</Link>
      </EncabezadoPagina>

      <CreditosProfesionalesPelicula peliculaId={Number(id)} actores={actores} />
    </div>
  );
}

export default AdminCreditosPelicula;
