import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="container mt-5">
      <div className="text-center">
        <h1>🎬 CineRD</h1>
        <p className="lead">Sistema de Gestión de Películas y Actores</p>

        <hr />

        <div className="row mt-4">
          <div className="col-md-6">
            <div className="card shadow">
              <div className="card-body">
                <h3>🎭 Actores</h3>
                <p>Administra actores, nombres artísticos y su estado de vida.</p>

                <Link to="/actores" className="btn btn-primary">
                  Ver Actores
                </Link>
              </div>
            </div>
          </div>

          <div className="col-md-6 mt-3 mt-md-0">
            <div className="card shadow">
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

        <div className="mt-5">
          <small className="text-muted">
            CineRD v1.0 • Desarrollado con React + Node.js + SQL Server
          </small>
        </div>
      </div>
    </div>
  );
}

export default Home;