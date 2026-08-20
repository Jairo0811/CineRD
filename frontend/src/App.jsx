import { BrowserRouter, Route, Routes } from "react-router-dom";

import Navbar from "./components/layout/navbar";
import Footer from "./components/layout/footer";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ActorEditRoute from "./components/auth/ActorEditRoute";

import HomePublica from "./pages/HomePublica";
import Dashboard from "./pages/Dashboard";
import Actores from "./pages/Actores";
import Peliculas from "./pages/Peliculas";
import FormularioActor from "./pages/FormularioActor";
import FormularioPelicula from "./pages/FormularioPelicula";
import RepartoPelicula from "./pages/RepartoPelicula";
import PerfilActor from "./pages/PerfilActor";
import PerfilPelicula from "./pages/PerfilPelicula";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import VerificarTalento from "./pages/VerificarTalento";
import ReclamarPerfil from "./pages/ReclamarPerfil";
import AdminVerificaciones from "./pages/AdminVerificaciones";

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navbar />
        <main className="container py-4 app-main">
          <Routes>
            <Route path="/" element={<HomePublica />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/verificar-perfil" element={<ProtectedRoute roles={["USUARIO"]}><VerificarTalento /></ProtectedRoute>} />

            <Route path="/actores" element={<Actores />} />
            <Route path="/actores/nuevo" element={<ProtectedRoute roles={["ADMINISTRADOR"]}><FormularioActor /></ProtectedRoute>} />
            <Route path="/actores/editar/:id" element={<ActorEditRoute><FormularioActor /></ActorEditRoute>} />
            <Route path="/actores/:id" element={<PerfilActor />} />
            <Route path="/actores/:actorId/reclamar" element={<ProtectedRoute roles={["USUARIO"]}><ReclamarPerfil /></ProtectedRoute>} />

            <Route path="/peliculas" element={<Peliculas />} />
            <Route path="/peliculas/nueva" element={<ProtectedRoute roles={["ADMINISTRADOR"]}><FormularioPelicula /></ProtectedRoute>} />
            <Route path="/peliculas/editar/:id" element={<ProtectedRoute roles={["ADMINISTRADOR"]}><FormularioPelicula /></ProtectedRoute>} />
            <Route path="/peliculas/:id" element={<PerfilPelicula />} />
            <Route path="/peliculas/:id/reparto" element={<ProtectedRoute roles={["ADMINISTRADOR"]}><RepartoPelicula /></ProtectedRoute>} />

            <Route path="/admin/verificaciones" element={<ProtectedRoute roles={["ADMINISTRADOR"]}><AdminVerificaciones /></ProtectedRoute>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;