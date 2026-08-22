import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import "../../styles/movie-music.css";

const TIPOS = {
  TEMA_OFICIAL: "Tema oficial",
  CANCION_ORIGINAL: "Canción original",
  BANDA_SONORA: "Banda sonora / OST",
  SCORE: "Score",
};

const obtenerSpotifyRecurso = (valor) => {
  if (!valor) return null;

  try {
    const url = new URL(valor);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    if (host !== "open.spotify.com") return null;

    const partes = url.pathname.split("/").filter(Boolean);
    const offset = partes[0]?.toLowerCase().startsWith("intl-") ? 1 : 0;
    const tipo = partes[offset];
    const id = partes[offset + 1];

    if (!["track", "album", "playlist"].includes(tipo) || !id) return null;

    return {
      tipo,
      id,
      url: `https://open.spotify.com/${tipo}/${id}`,
      embed: `https://open.spotify.com/embed/${tipo}/${id}?utm_source=generator&theme=0`,
    };
  } catch {
    return null;
  }
};

const obtenerAlturaEmbed = (tipo) => (tipo === "track" ? 152 : 352);

function MusicaPelicula({ peliculaId }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let activo = true;

    api.get("/galeria", { params: { peliculaId, musica: true, incluirExternos: true } })
      .then(({ data }) => {
        if (activo) setItems(data || []);
      })
      .catch((error) => {
        console.error("No fue posible cargar la música de la película:", error);
        if (activo) setItems([]);
      });

    return () => { activo = false; };
  }, [peliculaId]);

  const ordenados = useMemo(
    () => [...items].sort((a, b) => Number(b.EsDestacada) - Number(a.EsDestacada) || (a.Orden ?? 9999) - (b.Orden ?? 9999)),
    [items],
  );

  if (!ordenados.length) return null;

  return (
    <section className="card mb-4 movie-music-section">
      <div className="card-body p-4">
        <header className="movie-music-header">
          <span className="catalog-eyebrow">MÚSICA</span>
          <h2 className="h4 mb-1">🎵 Banda sonora y música</h2>
          <p className="text-muted small mb-0">
            Temas, canciones originales y bandas sonoras asociadas oficialmente a la película.
          </p>
        </header>

        <div className="movie-music-grid">
          {ordenados.map((item) => {
            const spotify = obtenerSpotifyRecurso(item.AudioUrl);
            const tipo = TIPOS[item.Tipo] || item.Tipo;

            return (
              <article
                className={`movie-music-card ${item.EsDestacada ? "is-featured" : ""}`}
                key={item.Id}
              >
                <div className="movie-music-card__meta">
                  <div>
                    <span className="badge bg-success">{tipo}</span>
                    <h3 className="movie-music-card__title">{item.Titulo || "Música oficial"}</h3>
                    {item.Artista && <p className="movie-music-card__artist">{item.Artista}</p>}
                  </div>

                  {item.EsDestacada && (
                    <span className="badge bg-warning text-dark align-self-start">★ Destacada</span>
                  )}
                </div>

                <div className="movie-music-card__player">
                  {spotify ? (
                    <iframe
                      src={spotify.embed}
                      title={`${tipo}: ${item.Titulo || "Spotify"}`}
                      height={obtenerAlturaEmbed(spotify.tipo)}
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                    />
                  ) : (
                    <div className="alert alert-secondary mb-0">
                      No fue posible generar la vista previa de Spotify para este enlace.
                    </div>
                  )}
                </div>

                <div className="movie-music-card__footer">
                  <div>
                    {item.Descripcion && (
                      <p className="movie-music-card__description">{item.Descripcion}</p>
                    )}
                  </div>

                  <div className="movie-music-card__actions">
                    <a
                      className="btn btn-success btn-sm movie-music-spotify-btn"
                      href={spotify?.url || item.AudioUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      <span aria-hidden="true">●</span>
                      Abrir en Spotify ↗
                    </a>

                    {item.FuenteUrl && (
                      <a
                        className="btn btn-outline-secondary btn-sm"
                        href={item.FuenteUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        Fuente ↗
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default MusicaPelicula;
