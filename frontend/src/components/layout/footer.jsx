function Footer() {
  const anioActual = new Date().getFullYear();

  return (
    <footer className="cine-footer">
      <div className="container">
        <div className="cine-footer-content">
          <img
            src="/logo.png"
            alt="Logo de CineRD"
            className="cine-footer-logo"
          />

          <p className="cine-footer-description">
            Catálogo digital del Cine Dominicano
          </p>

          <p className="cine-footer-copy">
            © {anioActual} CineRD | Todos los derechos reservados.
          </p>
        </div>

        <div className="cine-footer-attribution">
          Este producto utiliza la API de TMDb, pero no está respaldado ni
          certificado por TMDb.
        </div>
      </div>
    </footer>
  );
}

export default Footer;