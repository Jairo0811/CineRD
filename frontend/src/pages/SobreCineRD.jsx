import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SOBRE_CINERD } from "../data/sobreCineRD";

export default function SobreCineRD() {
  const { i18n } = useTranslation();
  const texto = SOBRE_CINERD[i18n.language?.startsWith("en") ? "en" : "es"];

  useEffect(() => {
    document.title = texto.title + " | CineRD";
  }, [texto.title]);

  return (
    <div className="cinerd-info-page">
      <header className="cinerd-info-hero">
        <span className="cinerd-info-eyebrow">{texto.eyebrow}</span>
        <h1>{texto.title}</h1>
        <p>{texto.intro}</p>
      </header>
      <article className="cinerd-info-document">
        {texto.sections.map((seccion) => (
          <section className="cinerd-info-section" key={seccion.title}>
            <h2>{seccion.title}</h2>
            {seccion.paragraphs.map((p) => <p key={p}>{p}</p>)}
          </section>
        ))}
      </article>
      <nav className="cinerd-info-bottom" aria-label={texto.title}>
        <Link to="/historia">{texto.history}</Link>
        <Link to="/peliculas">{texto.catalog}</Link>
        <Link to="/contacto">{texto.contact}</Link>
        <Link to="/privacidad">{texto.privacy}</Link>
      </nav>
    </div>
  );
}
