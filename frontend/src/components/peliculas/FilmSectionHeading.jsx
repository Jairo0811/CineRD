/**
 * Encabezado de sección sin acciones laterales.
 * Agrupar el eyebrow con h2 evita que justify-content: space-between
 * los mande a extremos opuestos de .film-section-head.
 */
export default function FilmSectionHeading({ eyebrow, title }) {
  return (
    <header className="film-section-head">
      <div className="film-section-heading-copy">
        <span className="catalog-eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
      </div>
    </header>
  );
}
