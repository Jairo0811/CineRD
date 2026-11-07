/**
 * Cubiertas editoriales originales de CineRD: NO son afiches oficiales.
 * SVG/CSS propios, sin fotografías, logos de productoras ni arte de terceros.
 * El año no se repite visualmente: cada tarjeta ya muestra el suyo.
 */
import EditorialCoverArtwork from "./EditorialCoverArtwork";
import { getCoverTheme, POSTER_VARIANTS } from "../../data/posterCoverCatalog";
export { POSTER_VARIANTS } from "../../data/posterCoverCatalog";

function CoverArtwork({ variant, peliculaId }) {
  switch (variant) {
    case "city":
      return <svg viewBox="0 0 280 240" fill="none" aria-hidden="true" focusable="false">
        <circle className="cover-art-orbit" cx="143" cy="112" r="93" strokeWidth="1.5" strokeDasharray="3 9" />
        <path className="cover-art-accent" d="M25 119C66 53 120 20 214 43" strokeWidth="2" strokeDasharray="4 8" />
        <path className="cover-art-accent" d="M206 34l10 9-14 5" strokeWidth="2.5" />
        <circle className="cover-art-hot" cx="65" cy="68" r="18" />
        <path className="cover-art-primary" d="M25 201V115h32v86M57 201V83h32v118M89 201v-67h29v67M118 201V55h36v146M154 201V94h33v107M187 201V118h30v83M217 201V75h39v126" strokeWidth="2.3" />
        <path className="cover-art-muted" d="M36 134v13m9-13v13m23-48v16m11-16v16m50-39v18m14-18v18m24 13v12m11-12v12m50-15v14m13-14v14M36 164v14m32-46v14m65-28v14m34 18v14m64-25v15" strokeWidth="3" />
        <path className="cover-art-accent" d="M14 202h252M42 215h197" strokeWidth="2" />
        <circle className="cover-art-star" cx="205" cy="67" r="3" />
      </svg>;
    case "rhythm":
      return <svg viewBox="0 0 280 240" fill="none" aria-hidden="true" focusable="false">
        <circle className="cover-art-primary" cx="132" cy="113" r="85" strokeWidth="3" />
        <circle className="cover-art-muted" cx="132" cy="113" r="64" strokeWidth="1.5" />
        <circle className="cover-art-muted" cx="132" cy="113" r="49" strokeWidth="1.5" />
        <circle className="cover-art-accent" cx="132" cy="113" r="34" strokeWidth="6" />
        <circle className="cover-art-hot" cx="132" cy="113" r="9" />
        <path className="cover-art-primary" d="M31 188l24-18 26 12 26-22M168 42l21-11 17 12 25-8" strokeWidth="3" strokeLinecap="round" />
        <path className="cover-art-accent" d="M207 86v63m0-39 25-10v51m-25-2c-20-4-21 18-6 17 7 0 10-6 6-17Zm25 2c-20-4-21 18-6 17 7 0 10-6 6-17Z" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path className="cover-art-muted" d="M46 57v32m11-39v46m11-36v32m11-23v17M31 122v34m11-39v44" strokeWidth="4" strokeLinecap="round" />
        <path className="cover-art-accent" d="M28 217h225" strokeWidth="2" />
      </svg>;
    case "coast":
      return <svg viewBox="0 0 280 240" fill="none" aria-hidden="true" focusable="false">
        <circle className="cover-art-hot" cx="165" cy="84" r="51" />
        <circle className="cover-art-accent" cx="165" cy="84" r="66" strokeWidth="1.5" strokeDasharray="2 8" />
        <path className="cover-art-primary" d="M14 157c25-17 45-17 70 0s45 17 70 0 45-17 70 0 33 13 43 7M14 181c25-17 45-17 70 0s45 17 70 0 45-17 70 0 33 13 43 7M14 205c25-17 45-17 70 0s45 17 70 0 45-17 70 0 33 13 43 7" strokeWidth="3" strokeLinecap="round" />
        <path className="cover-art-muted" d="M37 34c23 12 42 34 55 64M37 34C25 66 28 86 42 108M37 34c27-8 55-5 79 11" strokeWidth="4" strokeLinecap="round" />
        <path className="cover-art-accent" d="M33 40c-5 8-11 17-18 29m29-26c2 11 7 23 14 34m-15-40c18-1 34 4 48 11" strokeWidth="2" />
        <path className="cover-art-primary" d="M16 136h251" strokeWidth="1.5" strokeDasharray="5 8" />
      </svg>;
    case "bloom":
      return <svg viewBox="0 0 280 240" fill="none" aria-hidden="true" focusable="false">
        <path className="cover-art-muted" d="M20 206l91-167M46 217 141 39M71 217 168 39M96 217l96-166" strokeWidth="1" strokeDasharray="3 9" />
        <path className="cover-art-primary" d="M137 209c11-33 10-67 0-94" strokeWidth="3.5" strokeLinecap="round" />
        <path className="cover-art-primary" d="M137 169c-19-23-39-24-59-18 9 23 28 34 59 30M138 187c24-27 39-29 57-20-8 20-26 30-57 33" strokeWidth="2.5" />
        <ellipse className="cover-art-hot" cx="138" cy="72" rx="16" ry="35" />
        <ellipse className="cover-art-accent" cx="138" cy="72" rx="16" ry="35" transform="rotate(72 138 95)" />
        <ellipse className="cover-art-accent" cx="138" cy="72" rx="16" ry="35" transform="rotate(144 138 95)" />
        <ellipse className="cover-art-accent" cx="138" cy="72" rx="16" ry="35" transform="rotate(216 138 95)" />
        <ellipse className="cover-art-accent" cx="138" cy="72" rx="16" ry="35" transform="rotate(288 138 95)" />
        <circle className="cover-art-hot" cx="138" cy="95" r="13" />
        <circle className="cover-art-orbit" cx="138" cy="95" r="68" strokeWidth="1.5" strokeDasharray="4 8" />
        <path className="cover-art-primary" d="M31 218h219" strokeWidth="2" />
      </svg>;
    default:
      if (getCoverTheme(peliculaId)) return <EditorialCoverArtwork peliculaId={peliculaId} />;
      return <svg viewBox="0 0 280 240" fill="none" aria-hidden="true" focusable="false">
        <circle className="cover-art-primary" cx="140" cy="110" r="81" strokeWidth="3" />
        <circle className="cover-art-orbit" cx="140" cy="110" r="57" strokeWidth="1.5" />
        <circle className="cover-art-hot" cx="140" cy="110" r="13" />
        <circle className="cover-art-muted" cx="99" cy="76" r="16" strokeWidth="3" />
        <circle className="cover-art-muted" cx="184" cy="84" r="16" strokeWidth="3" />
        <circle className="cover-art-muted" cx="117" cy="162" r="16" strokeWidth="3" />
        <circle className="cover-art-muted" cx="185" cy="153" r="16" strokeWidth="3" />
        <path className="cover-art-accent" d="M13 212h254" strokeWidth="2" />
      </svg>;
  }
}

export default function PosterOriginal({
  titulo,
  anio,
  peliculaId,
  className = "",
  idioma = "es",
}) {
  const english = idioma?.startsWith("en");
  const variant = POSTER_VARIANTS[Number(peliculaId)] || "reel";
  const coverTheme = getCoverTheme(peliculaId);
  const coverStyle = coverTheme ? {
    "--co-accent": coverTheme.accent,
    "--co-back": coverTheme.back,
    "--co-gold": coverTheme.gold,
    "--co-haze": coverTheme.accent + "4d",
  } : undefined;
  const titleSizeClass = String(titulo ?? "").length > 35
    ? "cinerd-poster-original--title-long"
    : String(titulo ?? "").length > 24
      ? "cinerd-poster-original--title-medium"
      : "";
  const label = english
    ? "Original CineRD editorial cover for " + titulo + (anio ? " (" + anio + ")" : "") + ". Not an official movie poster."
    : "Cubierta editorial original de CineRD para " + titulo + (anio ? " (" + anio + ")" : "") + ". No es el cartel oficial.";

  return (
    <div
      className={["cinerd-poster-original", "cinerd-poster-original--" + variant,
        coverTheme && "cinerd-poster-original--archive", titleSizeClass, className].filter(Boolean).join(" ")}
      role="img"
      style={coverStyle}
      aria-label={label}
      data-cover-variant={variant}
    >
      <div className="cinerd-poster-original-head" aria-hidden="true">
        <span className="cinerd-poster-original-monogram">CR<span>·</span></span>
        <span className="cinerd-poster-original-edition">{english ? "DOMINICAN FILM ARCHIVE" : "ARCHIVO DE CINE DOMINICANO"}</span>
      </div>
      <div className="cinerd-poster-original-art" aria-hidden="true">
        <CoverArtwork variant={variant} peliculaId={peliculaId} />
      </div>
      <div className="cinerd-poster-original-copy" aria-hidden="true">
        <span className="cinerd-poster-original-rule" />
        <strong className="cinerd-poster-original-title">{titulo}</strong>
      </div>
      <div className="cinerd-poster-original-foot" aria-hidden="true">
        <span>CINERD · EDICIÓN ARCHIVO</span>
        <span className="cinerd-poster-original-footmark">◆</span>
      </div>
    </div>
  );
}
