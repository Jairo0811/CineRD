import { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/layout/navbar";
import Footer from "./components/layout/footer";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ActorEditRoute from "./components/auth/ActorEditRoute";
import AdSenseArea from "./components/ads/AdSenseArea";
import PageLoader from "./components/ui/PageLoader";
import HomePublica from "./pages/HomePublica";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Actores = lazy(() => import("./pages/Actores"));
const Peliculas = lazy(() => import("./pages/Peliculas"));
const Busqueda = lazy(() => import("./pages/Busqueda"));
const FormularioActor = lazy(() => import("./pages/FormularioActor"));
const FormularioPelicula = lazy(() => import("./pages/FormularioPelicula"));
const RepartoPelicula = lazy(() => import("./pages/RepartoPelicula"));
const PerfilActor = lazy(() => import("./pages/PerfilActor"));
const PerfilPelicula = lazy(() => import("./pages/PerfilPelicula"));
const Login = lazy(() => import("./pages/Login"));
const Registro = lazy(() => import("./pages/Registro"));
const RecuperarPassword = lazy(() => import("./pages/RecuperarPassword"));
const RestablecerPassword = lazy(() => import("./pages/RestablecerPassword"));
const VerificarEmail = lazy(() => import("./pages/VerificarEmail"));
const VerificarTalento = lazy(() => import("./pages/VerificarTalento"));
const ReclamarPerfil = lazy(() => import("./pages/ReclamarPerfil"));
const AdminVerificaciones = lazy(() => import("./pages/AdminVerificaciones"));
const ReclamacionCredito = lazy(() => import("./pages/ReclamacionCredito"));
const AdminSolicitudesCredito = lazy(() => import("./pages/AdminSolicitudesCredito"));
const AdminPremios = lazy(() => import("./pages/AdminPremios"));
const AdminGaleria = lazy(() => import("./pages/AdminGaleria"));
const AdminCreditosPelicula = lazy(() => import("./pages/AdminCreditosPelicula"));

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navbar />
        <main className="container py-4 app-main">
          <AdSenseArea />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePublica />} />
              <Route path="/buscar" element={<Busqueda />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Registro />} />
              <Route path="/recuperar-password" element={<RecuperarPassword />} />
              <Route path="/restablecer-password" element={<RestablecerPassword />} />
              <Route path="/verificar-email" element={<VerificarEmail />} />
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
              <Route path="/peliculas/:id/creditos" element={<ProtectedRoute roles={["ADMINISTRADOR"]}><AdminCreditosPelicula /></ProtectedRoute>} />
              <Route path="/mi-perfil/reclamar-credito" element={<ProtectedRoute roles={["TALENTO_VERIFICADO"]}><ReclamacionCredito /></ProtectedRoute>} />
              <Route path="/admin/verificaciones" element={<ProtectedRoute roles={["ADMINISTRADOR"]}><AdminVerificaciones /></ProtectedRoute>} />
              <Route path="/admin/solicitudes-creditos" element={<ProtectedRoute roles={["ADMINISTRADOR"]}><AdminSolicitudesCredito /></ProtectedRoute>} />
              <Route path="/admin/premios" element={<ProtectedRoute roles={["ADMINISTRADOR"]}><AdminPremios /></ProtectedRoute>} />
              <Route path="/admin/galeria" element={<ProtectedRoute roles={["ADMINISTRADOR"]}><AdminGaleria /></ProtectedRoute>} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
