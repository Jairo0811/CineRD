/** Cubierta tipográfica ORIGINAL de CineRD, no cartel oficial. */
export default function PosterOriginal({ titulo, anio, className = "", idioma = "es" }) {
  const english = idioma.startsWith("en");
  return (
    <div
      className={["cinerd-poster-original", className].filter(Boolean).join(" ")}
      role="img"
      aria-label={(english ? "Original CineRD archive cover for " : "Cubierta tipográfica original de CineRD para ") + titulo + (english ? "; not an official film poster" : "; no es el cartel oficial")}
    >
      <div className="cinerd-poster-original-top" aria-hidden="true">CINERD · ARCHIVO</div>
      <div className="cinerd-poster-original-symbol" aria-hidden="true">◇</div>
      <strong className="cinerd-poster-original-title">{titulo}</strong>
      {anio && <span className="cinerd-poster-original-year">{anio}</span>}
      <small className="cinerd-poster-original-disclaimer">
        {english ? "Original archive cover" : "Cubierta original del archivo"}
      </small>
    </div>
  );
}
