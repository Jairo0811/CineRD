import { Link } from 'react-router-dom';

export default function DemoUnavailable() {
  return (
    <section className="container py-5 text-center">
      <h1 className="mb-3">CineRD — Demo pública</h1>
      <p className="lead">Estás viendo una demostración de consulta. El registro, el inicio de sesión y la edición de información no están disponibles en esta versión.</p>
      <Link to="/peliculas" className="btn btn-primary me-2">Explorar películas</Link>
      <Link to="/actores" className="btn btn-outline-primary">Explorar talentos</Link>
    </section>
  );
}
