import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import Navbar from "./components/layout/navbar";
import Footer from "./components/layout/footer";

import Home from "./pages/Home";
import Actores from "./pages/Actores";
import Peliculas from "./pages/Peliculas";
import FormularioActor from "./pages/FormularioActor";
import FormularioPelicula from "./pages/FormularioPelicula";
import RepartoPelicula from "./pages/RepartoPelicula";
import PerfilActor from "./pages/PerfilActor";
import PerfilPelicula from "./pages/PerfilPelicula";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import ReclamarPerfil from "./pages/ReclamarPerfil";
import AdminVerificaciones from "./pages/AdminVerificaciones";

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navbar />

        <main className="container py-4 app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />

            <Route path="/actores" element={<Actores />} />
            <Route path="/actores/nuevo" element={<FormularioActor />} />
            <Route path="/actores/editar/:id" element={<FormularioActor />} />
            <Route path="/actores/:id" element={<PerfilActor />} />
            <Route path="/actores/:actorId/reclamar" element={<ReclamarPerfil />} />

            <Route path="/peliculas" element={<Peliculas />} />
            <Route path="/peliculas/nueva" element={<FormularioPelicula />} />
            <Route path="/peliculas/editar/:id" element={<FormularioPelicula />} />
            <Route path="/peliculas/:id" element={<PerfilPelicula />} />
            <Route path="/peliculas/:id/reparto" element={<RepartoPelicula />} />

            <Route path="/admin/verificaciones" element={<AdminVerificaciones />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
