import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import "../../styles/movie-music.css";

const TIPOS = {
  TEMA_OFICIAL: "Tema oficial",
  CANCION_ORIGINAL: "Canción original",
  BANDA_SONORA: "Banda sonora / OST",
  SCORE: "Score",
};

const obtenerYoutubeId = (valor) => {
  if (!valor) return null;
  try {
    const url = new URL(valor);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    if (host === "youtu.be") return url.pathname.split("/").filter(Boolean)[0] || null;
    if (host === "youtube.com" || host === "m.youtube.com") {
      if (url.pathname === "/watch") return url.searchParams.get("v");
      const partes = url.pathname.split("/").filter(Boolean);
      if (["embed", "shorts", "live"].includes(partes[0])) return partes[1] || null;
    }
  } catch {
    return null;
  }
  return null;
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

const obtenerAlturaSpotify = (spotifyTipo, tipoContenido) => {
  if (spotifyTipo === "track") return 352;
  if (["BANDA_SONORA", "SCORE"].includes(tipoContenido)) return 452;
  return 352;
};

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
            const tipo = TIPOS[item.Tipo] || item.Tipo;
            const proveedor = String(item.Proveedor || "SPOTIFY").toUpperCase();
            const spotify = proveedor === "SPOTIFY" ? obtenerSpotifyRecurso(item.AudioUrl) : null;
            const youtubeId = proveedor === "YOUTUBE" ? obtenerYoutubeId(item.AudioUrl) : null;
            const urlExterna = spotify?.url || item.AudioUrl;

            return (
              <article
                className={`movie-music-card ${item.EsDestacada ? "is-featured" : ""}`}
                key={item.Id}
              >
                <div className="movie-music-card__meta">
                  <div>
                    <div className="d-flex flex-wrap gap-2 align-items-center">
                      <span className="badge bg-success">{tipo}</span>
                      <span className={`badge ${proveedor === "YOUTUBE" ? "bg-danger" : "bg-dark"}`}>
                        {proveedor === "YOUTUBE" ? "YouTube" : "Spotify"}
                      </span>
                    </div>
                    <h3 className="movie-music-card__title">{item.Titulo || "Música oficial"}</h3>
                    {item.Artista && <p className="movie-music-card__artist">{item.Artista}</p>}
                  </div>

                  {item.EsDestacada && (
                    <span className="badge bg-warning text-dark align-self-start">★ Destacada</span>
                  )}
                </div>

                <div className={`movie-music-card__player ${proveedor === "YOUTUBE" ? "is-youtube" : "is-spotify"}`}>
                  {spotify ? (
                    <iframe
                      src={spotify.embed}
                      title={`${tipo}: ${item.Titulo || "Spotify"}`}
                      height={obtenerAlturaSpotify(spotify.tipo, item.Tipo)}
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                    />
                  ) : youtubeId ? (
                    <div className="movie-music-youtube-frame">
                      <iframe
                        src={`https://www.youtube.com/embed/${youtubeId}`}
                        title={`${tipo}: ${item.Titulo || "YouTube"}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="alert alert-secondary mb-0">
                      No fue posible generar la vista previa para este enlace musical.
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
                      className={`btn btn-sm ${proveedor === "YOUTUBE" ? "btn-danger" : "btn-success movie-music-spotify-btn"}`}
                      href={urlExterna}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {proveedor === "YOUTUBE" ? "YouTube ↗" : "Abrir en Spotify ↗"}
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
