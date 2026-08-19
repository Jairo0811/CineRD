import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function HomePublica() {
  const [actores, setActores] = useState([]);
  const [peliculas, setPeliculas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [actoresRes, peliculasRes] = await Promise.all([
          api.get("/actores"),
          api.get("/peliculas"),
        ]);
        setActores(actoresRes.data || []);
        setPeliculas(peliculasRes.data || []);
      } catch (error) {
        console.error("Error al cargar portada pública:", error);
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, []);

  const topTalentos = useMemo(
    () => [...actores]
      .sort((a, b) => Number(b.CantidadPeliculas || 0) - Number(a.CantidadPeliculas || 0))
      .slice(0, 5),
    [actores],
  );

  const topPeliculas = useMemo(
    () => [...peliculas]
      .sort((a, b) => Number(b.CantidadActores || 0) - Number(a.CantidadActores || 0))
      .slice(0, 5),
    [peliculas],
  );

  return (
    <div className="public-home cinematic-home">
      <section className="cinematic-hero">
        <div className="cinematic-flag-band" aria-hidden="true" />
        <div className="cinematic-hero-copy">
          <span className="public-eyebrow">Archivo digital del cine dominicano 🇩🇴</span>
          <h1>Las historias que se filman aquí también merecen quedar para la historia.</h1>
          <p>
            CineRD conecta películas, talentos, repartos y datos del audiovisual dominicano
            en un catálogo pensado para descubrir, documentar y preservar nuestra memoria cinematográfica.
          </p>

          <div className="public-hero-actions">
            <Link to="/peliculas" className="btn btn-primary btn-lg">🎬 Explorar películas</Link>
            <Link to="/actores" className="btn btn-outline-light btn-lg">🎭 Conocer talentos</Link>
          </div>

          <div className="cinematic-stats" aria-label="Resumen del catálogo">
            <div><strong>{peliculas.length}</strong><span>Películas</span></div>
            <div><strong>{actores.length}</strong><span>Talentos</span></div>
            <div><strong>{peliculas.reduce((t, p) => t + Number(p.CantidadActores || 0), 0)}</strong><span>Participaciones</span></div>
          </div>
        </div>

        <div className="cinematic-hero-brand">
          <div className="cinematic-projector-beam" />
          <img src="/logo.png" alt="CineRD" />
          <span className="cinematic-caption">Catálogo digital del cine dominicano</span>
        </div>
      </section>

      <section className="cinematic-manifesto">
        <span>🎞️</span>
        <div>
          <small>MEMORIA · IDENTIDAD · CINE</small>
          <h2>Un espacio hecho para mirar el cine dominicano como patrimonio, industria y cultura.</h2>
        </div>
      </section>

      <section className="cinematic-ranking-grid">
        <article className="cinematic-ranking-panel">
          <div className="cinematic-section-heading">
            <div>
              <span className="public-eyebrow">Talentos</span>
              <h2>Con más películas</h2>
            </div>
            <Link to="/actores">Ver todos →</Link>
          </div>

          <div className="cinematic-ranking-list">
            {topTalentos.map((actor, index) => (
              <Link to={`/actores/${actor.Id}`} className="cinematic-ranking-item" key={actor.Id}>
                <span className="cinematic-ranking-number">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{actor.NombreArtistico || actor.NombreCompleto}</strong>
                  <small>{actor.Profesion || "Talento"}</small>
                </div>
                <b>{actor.CantidadPeliculas || 0}</b>
              </Link>
            ))}
            {!cargando && topTalentos.length === 0 && <p className="text-muted mb-0">Aún no hay datos para mostrar.</p>}
          </div>
        </article>

        <article className="cinematic-ranking-panel">
          <div className="cinematic-section-heading">
            <div>
              <span className="public-eyebrow">Producciones</span>
              <h2>Con mayor reparto</h2>
            </div>
            <Link to="/peliculas">Ver todas →</Link>
          </div>

          <div className="cinematic-ranking-list">
            {topPeliculas.map((pelicula, index) => (
              <Link to={`/peliculas/${pelicula.Id}`} className="cinematic-ranking-item" key={pelicula.Id}>
                <span className="cinematic-ranking-number">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{pelicula.Titulo}</strong>
                  <small>{pelicula.Genero || "Sin género"}</small>
                </div>
                <b>{pelicula.CantidadActores || 0}</b>
              </Link>
            ))}
            {!cargando && topPeliculas.length === 0 && <p className="text-muted mb-0">Aún no hay datos para mostrar.</p>}
          </div>
        </article>
      </section>

      <section className="public-value-grid cinematic-value-grid">
        <article className="public-value-card cinematic-value-card">
          <span>🎬</span>
          <h2>Películas</h2>
          <p>Fichas cinematográficas, repartos, géneros, fechas, directores y productoras.</p>
          <Link to="/peliculas">Entrar al catálogo →</Link>
        </article>

        <article className="public-value-card cinematic-value-card">
          <span>🎭</span>
          <h2>Talentos</h2>
          <p>Perfiles artísticos, nombres profesionales, filmografías y participaciones.</p>
          <Link to="/actores">Explorar perfiles →</Link>
        </article>

        <article className="public-value-card cinematic-value-card verified-card">
          <span>✅</span>
          <h2>Identidad verificada</h2>
          <p>Los profesionales del sector pueden reclamar su perfil y confirmar su identidad.</p>
          <Link to="/registro">Crear una cuenta →</Link>
        </article>
      </section>

      <section className="public-cta cinematic-cta">
        <div>
          <span className="public-eyebrow">¿Trabajas en el audiovisual dominicano?</span>
          <h2>Haz que tu historia profesional también forme parte de CineRD.</h2>
          <p>Crea tu cuenta, encuentra tu perfil y solicita su verificación.</p>
        </div>
        <div className="public-cta-actions">
          <Link to="/registro" className="btn btn-light">Crear cuenta</Link>
          <Link to="/login" className="btn btn-outline-light">Iniciar sesión</Link>
        </div>
      </section>
    </div>
  );
}

export default HomePublica;