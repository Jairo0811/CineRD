import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="page-container">
      <div className="text-center">
        <h1>🎬 CineRD</h1>

        <p className="lead">Sistema de Gestión de Películas y Actores</p>

        <hr />

        <div className="row mt-4 justify-content-center">
          <div className="col-12 col-md-6 mb-3 mb-md-0">
            <div className="card shadow h-100">
              <div className="card-body">
                <h3>🎭 Actores</h3>

                <p>
                  Administra actores, nombres artísticos y su estado de vida.
                </p>

                <Link to="/actores" className="btn btn-primary">
                  Ver Actores
                </Link>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="card shadow h-100">
              <div className="card-body">
                <h3>🎬 Películas</h3>

                <p>Gestiona películas, directores y productoras.</p>

                <Link to="/peliculas" className="btn btn-success">
                  Ver Películas
                </Link>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-5">
          <small className="text-muted">
            © {new Date().getFullYear()} Francis Jairo Matías Rosario
            <br />
            • CineRD v1.0 •
            <br />
            Desarrollado con React + Node.js + SQL Server
          </small>
        </footer>
      </div>
    </div>
  );
}

export default Home;