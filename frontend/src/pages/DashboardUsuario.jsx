import { Link } from "react-router-dom";

function DashboardUsuario({ usuario }) {
  return (
    <div className="role-dashboard">
      <section className="role-hero">
        <div>
          <span className="public-eyebrow">Mi CineRD</span>
          <h1>Hola, {usuario?.nombre || "cinéfilo"}</h1>
          <p>Explora el catálogo, descubre talentos y, si formas parte del sector, reclama tu perfil artístico.</p>
        </div>
        <img src="/logo.png" alt="CineRD" className="role-hero-logo" />
      </section>

      <section className="role-dashboard-grid">
        <Link to="/peliculas" className="role-dashboard-card">
          <span>🎬</span>
          <div><h2>Explorar películas</h2><p>Descubre producciones del cine dominicano.</p></div>
        </Link>
        <Link to="/actores" className="role-dashboard-card">
          <span>🎭</span>
          <div><h2>Explorar talentos</h2><p>Consulta perfiles y filmografías.</p></div>
        </Link>
        <Link to="/verificar-perfil" className="role-dashboard-card role-dashboard-card-highlight">
          <span>✅</span>
          <div><h2>Verificar mi perfil</h2><p>Encuentra tu ficha artística y solicita la verificación.</p></div>
        </Link>
      </section>
    </div>
  );
}

export default DashboardUsuario;
