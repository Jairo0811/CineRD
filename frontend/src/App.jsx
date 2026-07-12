import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

import Home from "./pages/Home";
import Actores from "./pages/Actores";
import Peliculas from "./pages/Peliculas";
import FormularioActor from "./pages/FormularioActor";
import FormularioPelicula from "./pages/FormularioPelicula";
import RepartoPelicula from "./pages/RepartoPelicula";
import PerfilActor from "./pages/PerfilActor";

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navbar />

        <main className="container py-4 app-main">
          <Routes>
            <Route path="/" element={<Home />} />

            <Route path="/actores" element={<Actores />} />
            <Route
              path="/actores/nuevo"
              element={<FormularioActor />}
            />
            <Route
              path="/actores/editar/:id"
              element={<FormularioActor />}
            />
            <Route
              path="/actores/:id"
              element={<PerfilActor />}
            />

            <Route
              path="/peliculas"
              element={<Peliculas />}
            />
            <Route
              path="/peliculas/nueva"
              element={<FormularioPelicula />}
            />
            <Route
              path="/peliculas/editar/:id"
              element={<FormularioPelicula />}
            />
            <Route
              path="/peliculas/:id/reparto"
              element={<RepartoPelicula />}
            />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;