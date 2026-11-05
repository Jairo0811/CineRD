import { Link } from "react-router-dom";

/**
 * Cabecera de página con la identidad «archivo»: fondo oscuro, sobretítulo dorado,
 * título editorial y cinta de película. `children` se muestra a la derecha (filtros, cifras).
 */
function EncabezadoPagina({ eyebrow, titulo, descripcion, volverA, volverTexto, children }) {
  return (
    <header className="page-hero">
      <div className="page-hero-main">
        {volverA && <Link to={volverA} className="page-hero-back">{volverTexto}</Link>}
        <div className="page-hero-copy">
          {eyebrow && <span className="page-hero-eyebrow">{eyebrow}</span>}
          <h1>{titulo}</h1>
          {descripcion && <p>{descripcion}</p>}
        </div>
      </div>
      {children && <div className="page-hero-aside">{children}</div>}
      <div className="page-hero-strip" aria-hidden="true" />
    </header>
  );
}

export default EncabezadoPagina;
