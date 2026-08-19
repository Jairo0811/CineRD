import { Link } from "react-router-dom";

function HomePublica() {
  return (
    <div className="public-home">
      <section className="public-hero">
        <div className="public-hero-copy">
          <span className="public-eyebrow">Cine dominicano, organizado y accesible</span>
          <h1>Descubre la historia, las películas y los talentos del cine dominicano.</h1>
          <p>
            CineRD es un catálogo digital dedicado a preservar, organizar y conectar
            información sobre producciones, actores, directores y otros talentos de
            la República Dominicana.
          </p>

          <div className="public-hero-actions">
            <Link to="/peliculas" className="btn btn-primary btn-lg">Explorar películas</Link>
            <Link to="/actores" className="btn btn-outline-primary btn-lg">Explorar talentos</Link>
          </div>
        </div>

        <div className="public-hero-brand" aria-hidden="true">
          <img src="/logo.png" alt="" />
          <div className="public-hero-glow" />
        </div>
      </section>

      <section className="public-value-grid">
        <article className="public-value-card">
          <span>🎬</span>
          <h2>Películas</h2>
          <p>Consulta fichas cinematográficas, repartos, géneros, fechas y metadatos.</p>
          <Link to="/peliculas">Ver catálogo →</Link>
        </article>

        <article className="public-value-card">
          <span>🎭</span>
          <h2>Talentos</h2>
          <p>Explora perfiles artísticos, filmografías y participaciones registradas.</p>
          <Link to="/actores">Conocer talentos →</Link>
        </article>

        <article className="public-value-card">
          <span>✅</span>
          <h2>Perfiles verificados</h2>
          <p>Los talentos pueden reclamar su perfil y verificar su identidad en CineRD.</p>
          <Link to="/registro">Crear una cuenta →</Link>
        </article>
      </section>

      <section className="public-cta">
        <div>
          <span className="public-eyebrow">Forma parte de CineRD</span>
          <h2>¿Eres actor, actriz, director o profesional del sector audiovisual?</h2>
          <p>Crea tu cuenta, encuentra tu perfil y solicita su verificación.</p>
        </div>
        <div className="public-cta-actions">
          <Link to="/registro" className="btn btn-dark">Crear cuenta</Link>
          <Link to="/login" className="btn btn-outline-dark">Iniciar sesión</Link>
        </div>
      </section>
    </div>
  );
}

export default HomePublica;
