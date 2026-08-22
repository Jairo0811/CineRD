import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

const TIPOS = {
  TEMA_OFICIAL: "Tema oficial",
  CANCION_ORIGINAL: "Canción original",
  BANDA_SONORA: "Banda sonora / OST",
  SCORE: "Score",
};

const obtenerSpotifyEmbed = (valor) => {
  if (!valor) return null;
  try {
    const url = new URL(valor);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    if (host !== "open.spotify.com") return null;

    const partes = url.pathname.split("/").filter(Boolean);
    if (!["track", "album", "playlist"].includes(partes[0]) || !partes[1]) return null;

    return `https://open.spotify.com/embed/${partes[0]}/${partes[1]}?utm_source=generator&theme=0`;
  } catch {
    return null;
  }
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
        <span className="catalog-eyebrow">MÚSICA</span>
        <h2 className="h4 mb-3">🎵 Música de la película</h2>
        <div className="d-grid gap-3">
          {ordenados.map((item) => {
            const embed = obtenerSpotifyEmbed(item.AudioUrl);
            return (
              <article className="border rounded-4 p-3" key={item.Id}>
                <div className="d-flex flex-wrap justify-content-between gap-2 mb-3">
                  <div>
                    <span className="badge bg-success mb-2">{TIPOS[item.Tipo] || item.Tipo}</span>
                    <h3 className="h6 mb-1">{item.Titulo || "Música oficial"}</h3>
                    {item.Artista && <p className="text-muted small mb-0">{item.Artista}</p>}
                  </div>
                  {item.EsDestacada && <span className="badge bg-warning text-dark align-self-start">★ Destacada</span>}
                </div>

                {embed ? (
                  <iframe
                    src={embed}
                    title={`${TIPOS[item.Tipo] || "Música"}: ${item.Titulo || "Spotify"}`}
                    width="100%"
                    height="152"
                    style={{ border: 0, borderRadius: "12px" }}
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                  />
                ) : (
                  <a className="btn btn-success btn-sm" href={item.AudioUrl} target="_blank" rel="noreferrer noopener">
                    Abrir en Spotify ↗
                  </a>
                )}

                {item.Descripcion && <p className="small text-muted mt-3 mb-0">{item.Descripcion}</p>}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default MusicaPelicula;
