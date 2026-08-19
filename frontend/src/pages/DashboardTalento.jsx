import { Link } from "react-router-dom";

function DashboardTalento({ usuario }) {
  return (
    <div className="role-dashboard">
      <section className="role-hero role-hero-verified">
        <div>
          <span className="public-eyebrow">Talento verificado</span>
          <h1>Bienvenido, {usuario?.nombre || "talento"}</h1>
          <p>Gestiona tu presencia profesional en CineRD y consulta tu actividad dentro del catálogo.</p>
        </div>
        <div className="role-verified-mark">✓</div>
      </section>

      <section className="role-dashboard-grid">
        <Link to="/actores" className="role-dashboard-card role-dashboard-card-highlight">
          <span>👤</span>
          <div><h2>Mi perfil artístico</h2><p>Accede a tu ficha y gestiona la información permitida.</p></div>
        </Link>
        <Link to="/peliculas" className="role-dashboard-card">
          <span>🎞️</span>
          <div><h2>Explorar filmografías</h2><p>Consulta películas, repartos y otros talentos.</p></div>
        </Link>
        <Link to="/actores" className="role-dashboard-card">
          <span>🤝</span>
          <div><h2>Comunidad de talentos</h2><p>Descubre profesionales vinculados al cine dominicano.</p></div>
        </Link>
      </section>

      <section className="role-info-panel">
        <span className="role-info-icon">✅</span>
        <div>
          <h2>Tu cuenta está verificada</h2>
          <p>Tu identidad fue revisada por CineRD. Los cambios sensibles del catálogo continúan protegidos por las reglas de autorización.</p>
        </div>
      </section>
    </div>
  );
}

export default DashboardTalento;
