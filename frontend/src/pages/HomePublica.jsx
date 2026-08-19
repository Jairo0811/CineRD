import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const API_URL = "http://localhost:3000";
const resolverImagen = (ruta) => {
  if (!ruta) return null;
  if (ruta.startsWith("http://") || ruta.startsWith("https://")) return ruta;
  return `${API_URL}${ruta}`;
};

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

  const hoy = new Date();
  const mesActual = hoy.getMonth();
  const anioActual = hoy.getFullYear();
  const nombreMesActual = new Intl.DateTimeFormat("es-DO", { month: "long" }).format(hoy);

  const cumpleanerosDelMes = useMemo(
    () => actores
      .filter((actor) => actor.EstaVivo && actor.FechaNacimiento)
      .map((actor) => {
        const fecha = new Date(`${actor.FechaNacimiento.substring(0, 10)}T12:00:00`);
        return { actor, fecha };
      })
      .filter(({ fecha }) => !Number.isNaN(fecha.getTime()) && fecha.getMonth() === mesActual)
      .sort((a, b) => {
        const porAnio = a.fecha.getFullYear() - b.fecha.getFullYear();
        return porAnio !== 0 ? porAnio : a.fecha.getDate() - b.fecha.getDate();
      })
      .slice(0, 5),
    [actores, mesActual],
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

      <section className="cinematic-showcase-section">
        <div className="cinematic-showcase-heading">
          <div>
            <span className="public-eyebrow">Talentos</span>
            <h2>Con más películas</h2>
            <p>Profesionales con mayor presencia dentro de la filmografía registrada en CineRD.</p>
          </div>
          <Link to="/actores">Ver todos →</Link>
        </div>

        <div className="cinematic-talent-showcase">
          {topTalentos.map((actor, index) => {
            const foto = resolverImagen(actor.Foto);
            return (
              <Link to={`/actores/${actor.Id}`} className="cinematic-talent-card" key={actor.Id}>
                <div className="cinematic-talent-photo-wrap">
                  {foto ? (
                    <img src={foto} alt={actor.NombreArtistico || actor.NombreCompleto} />
                  ) : (
                    <div className="cinematic-talent-photo-placeholder">🎭</div>
                  )}
                  <span className="cinematic-rank-badge">#{index + 1}</span>
                  {actor.EsVerificado && <span className="cinerd-verified-card-badge">✓ Verificado</span>}
                </div>
                <div className="cinematic-talent-card-copy">
                  <span className="cinerd-talent-name-row">
                    <strong>{actor.NombreArtistico || actor.NombreCompleto}</strong>
                    {actor.EsVerificado && <span className="cinerd-verified-mark" title="Perfil verificado por CineRD" aria-label="Perfil verificado">✓</span>}
                  </span>
                  <small>{actor.Profesion || "Talento"}</small>
                  <span>{actor.CantidadPeliculas || 0} películas</span>
                </div>
              </Link>
            );
          })}
        </div>
        {!cargando && topTalentos.length === 0 && <p className="text-muted mb-0">Aún no hay datos para mostrar.</p>}
      </section>

      <section className="cinematic-showcase-section birthday-showcase-section">
        <div className="cinematic-showcase-heading">
          <div>
            <span className="public-eyebrow">Efemérides · {nombreMesActual}</span>
            <h2>Cumpleaños del mes</h2>
            <p>Talentos que cumplen años este mes, ordenados desde el año de nacimiento más antiguo al más reciente.</p>
          </div>
          <Link to="/actores">Ver talentos →</Link>
        </div>

        <div className="cinematic-talent-showcase">
          {cumpleanerosDelMes.map(({ actor, fecha }) => {
            const foto = resolverImagen(actor.Foto);
            const edadQueCumple = anioActual - fecha.getFullYear();
            const fechaCumple = new Intl.DateTimeFormat("es-DO", { day: "2-digit", month: "short" }).format(fecha);
            return (
              <Link to={`/actores/${actor.Id}`} className="cinematic-talent-card birthday-card" key={`cumple-${actor.Id}`}>
                <div className="cinematic-talent-photo-wrap">
                  {foto ? (
                    <img src={foto} alt={actor.NombreArtistico || actor.NombreCompleto} />
                  ) : (
                    <div className="cinematic-talent-photo-placeholder">🎂</div>
                  )}
                  <span className="birthday-date-badge">🎂 {fechaCumple}</span>
                  {actor.EsVerificado && <span className="cinerd-verified-card-badge">✓ Verificado</span>}
                </div>
                <div className="cinematic-talent-card-copy">
                  <span className="cinerd-talent-name-row">
                    <strong>{actor.NombreArtistico || actor.NombreCompleto}</strong>
                    {actor.EsVerificado && <span className="cinerd-verified-mark" title="Perfil verificado por CineRD" aria-label="Perfil verificado">✓</span>}
                  </span>
                  <small>{actor.Profesion || "Talento"}</small>
                  <span>Nació en {fecha.getFullYear()} · cumple {edadQueCumple} años</span>
                </div>
              </Link>
            );
          })}
        </div>
        {!cargando && cumpleanerosDelMes.length === 0 && (
          <div className="birthday-empty-state">
            <span>🎂</span>
            <div><strong>Sin cumpleaños registrados este mes</strong><small>Solo aparecen talentos vivos con fecha de nacimiento completa.</small></div>
          </div>
        )}
      </section>

      <section className="cinematic-showcase-section">
        <div className="cinematic-showcase-heading">
          <div>
            <span className="public-eyebrow">Producciones</span>
            <h2>Películas con mayor reparto</h2>
            <p>Las producciones del catálogo que reúnen la mayor cantidad de talentos registrados.</p>
          </div>
          <Link to="/peliculas">Ver todas →</Link>
        </div>

        <div className="cinematic-movie-showcase">
          {topPeliculas.map((pelicula, index) => {
            const poster = resolverImagen(pelicula.Foto);
            return (
              <Link to={`/peliculas/${pelicula.Id}`} className="cinematic-movie-showcase-card" key={pelicula.Id}>
                <div className="cinematic-movie-poster-wrap">
                  {poster ? (
                    <img src={poster} alt={`Póster de ${pelicula.Titulo}`} />
                  ) : (
                    <div className="cinematic-movie-poster-placeholder">🎬</div>
                  )}
                  <span className="cinematic-rank-badge">#{index + 1}</span>
                  <span className="cinematic-cast-badge">👥 {pelicula.CantidadActores || 0}</span>
                </div>
                <div className="cinematic-movie-showcase-copy">
                  <strong>{pelicula.Titulo}</strong>
                  <small>{pelicula.Genero || "Cine dominicano"}</small>
                  <span>{pelicula.CantidadActores || 0} talentos en reparto</span>
                </div>
              </Link>
            );
          })}
        </div>
        {!cargando && topPeliculas.length === 0 && <p className="text-muted mb-0">Aún no hay datos para mostrar.</p>}
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