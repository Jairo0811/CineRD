import { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Navbar from "./components/layout/navbar";
import Footer from "./components/layout/footer";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import ActorEditRoute from "./components/auth/ActorEditRoute";

import AdSenseArea from "./components/ads/AdSenseArea";
import PageLoader from "./components/ui/PageLoader";
import HomePublica from "./pages/HomePublica";
import NotFound from "./pages/NotFound";
import { PrivacyPolicy, TermsOfUse, Contact } from "./pages/PublicInfoPage";
import SobreCineRD from "./pages/SobreCineRD";

// Configuración del modo demo
import { DEMO_MODE } from "./config/api";
import DemoUnavailable from "./pages/DemoUnavailable";

// ================================
// PÁGINAS DEL SISTEMA
// ================================

const Dashboard = lazy(() => import("./pages/Dashboard"));

const Actores = lazy(() => import("./pages/Actores"));
const AvancesCineRD = lazy(() => import("./pages/AvancesCineRD"));
const Peliculas = lazy(() => import("./pages/Peliculas"));
const Busqueda = lazy(() => import("./pages/Busqueda"));
const Historia = lazy(() => import("./pages/Historia"));

const FormularioActor = lazy(() => import("./pages/FormularioActor"));

const FormularioPelicula = lazy(() => import("./pages/FormularioPelicula"));

const RepartoPelicula = lazy(() => import("./pages/RepartoPelicula"));

const PerfilActor = lazy(() => import("./pages/PerfilActor"));

const PerfilPelicula = lazy(() => import("./pages/PerfilPelicula"));

// Autenticación
const Login = lazy(() => import("./pages/Login"));
const Registro = lazy(() => import("./pages/Registro"));

const RecuperarPassword = lazy(() => import("./pages/RecuperarPassword"));

const RestablecerPassword = lazy(() => import("./pages/RestablecerPassword"));

const VerificarEmail = lazy(() => import("./pages/VerificarEmail"));

const VerificarTalento = lazy(() => import("./pages/VerificarTalento"));

const ReclamarPerfil = lazy(() => import("./pages/ReclamarPerfil"));

// Administración
const AdminVerificaciones = lazy(() => import("./pages/AdminVerificaciones"));

const ReclamacionCredito = lazy(() => import("./pages/ReclamacionCredito"));

const AdminSolicitudesCredito = lazy(
  () => import("./pages/AdminSolicitudesCredito"),
);

const AdminPremios = lazy(() => import("./pages/AdminPremios"));

const AdminGaleria = lazy(() => import("./pages/AdminGaleria"));

const AdminCreditosPelicula = lazy(
  () => import("./pages/AdminCreditosPelicula"),
);

// ================================
// PROTECCIÓN DEL MODO DEMO
// ================================

/**
 * En modo demo se muestra una pantalla
 * informativa para las funciones que
 * necesitan el backend real.
 *
 * En modo normal se conserva el componente
 * original y su protección de acceso.
 */
const backendOnly = (element) => {
  return DEMO_MODE ? <DemoUnavailable /> : element;
};

// ================================
// APLICACIÓN PRINCIPAL
// ================================

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navbar />

        <main className="container py-4 app-main">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* ==========================
                  RUTAS PÚBLICAS
                  Disponibles en Netlify Demo
                 ========================== */}

              <Route path="/" element={<HomePublica />} />
              <Route path="/avances" element={<AvancesCineRD />} />

              <Route path="/buscar" element={<Busqueda />} />

              <Route path="/historia" element={<Historia />} />

              {/* Páginas institucionales públicas, disponibles también en la demo. */}
              <Route path="/privacidad" element={<PrivacyPolicy />} />
              <Route path="/terminos" element={<TermsOfUse />} />
              <Route path="/contacto" element={<Contact />} />
              <Route path="/sobre-cinerd" element={<SobreCineRD />} />

              <Route path="/actores" element={<Actores />} />

              <Route path="/actores/:id" element={<PerfilActor />} />

              <Route path="/peliculas" element={<Peliculas />} />

              <Route path="/peliculas/:id" element={<PerfilPelicula />} />

              {/* No dejar la zona central en blanco si Netlify sirve
                  index.html para una dirección inexistente. */}
              <Route path="*" element={<NotFound />} />

              {/* ==========================
                  AUTENTICACIÓN
                  Solo con backend
                 ========================== */}

              <Route path="/login" element={backendOnly(<Login />)} />

              <Route path="/registro" element={backendOnly(<Registro />)} />

              <Route
                path="/recuperar-password"
                element={backendOnly(<RecuperarPassword />)}
              />

              <Route
                path="/restablecer-password"
                element={backendOnly(<RestablecerPassword />)}
              />

              <Route
                path="/verificar-email"
                element={backendOnly(<VerificarEmail />)}
              />

              {/* ==========================
                  DASHBOARD
                 ========================== */}

              <Route
                path="/dashboard"
                element={backendOnly(
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>,
                )}
              />

              {/* ==========================
                  GESTIÓN DE TALENTOS
                 ========================== */}

              <Route
                path="/actores/nuevo"
                element={backendOnly(
                  <ProtectedRoute roles={["ADMINISTRADOR"]}>
                    <FormularioActor />
                  </ProtectedRoute>,
                )}
              />

              <Route
                path="/actores/editar/:id"
                element={backendOnly(
                  <ActorEditRoute>
                    <FormularioActor />
                  </ActorEditRoute>,
                )}
              />

              <Route
                path="/actores/:actorId/reclamar"
                element={backendOnly(
                  <ProtectedRoute roles={["USUARIO"]}>
                    <ReclamarPerfil />
                  </ProtectedRoute>,
                )}
              />

              <Route
                path="/verificar-perfil"
                element={backendOnly(
                  <ProtectedRoute roles={["USUARIO"]}>
                    <VerificarTalento />
                  </ProtectedRoute>,
                )}
              />

              {/* ==========================
                  GESTIÓN DE PELÍCULAS
                 ========================== */}

              <Route
                path="/peliculas/nueva"
                element={backendOnly(
                  <ProtectedRoute roles={["ADMINISTRADOR"]}>
                    <FormularioPelicula />
                  </ProtectedRoute>,
                )}
              />

              <Route
                path="/peliculas/editar/:id"
                element={backendOnly(
                  <ProtectedRoute roles={["ADMINISTRADOR"]}>
                    <FormularioPelicula />
                  </ProtectedRoute>,
                )}
              />

              <Route
                path="/peliculas/:id/reparto"
                element={backendOnly(
                  <ProtectedRoute roles={["ADMINISTRADOR"]}>
                    <RepartoPelicula />
                  </ProtectedRoute>,
                )}
              />

              <Route
                path="/peliculas/:id/creditos"
                element={backendOnly(
                  <ProtectedRoute roles={["ADMINISTRADOR"]}>
                    <AdminCreditosPelicula />
                  </ProtectedRoute>,
                )}
              />

              {/* ==========================
                  RECLAMACIONES DE CRÉDITOS
                 ========================== */}

              <Route
                path="/mi-perfil/reclamar-credito"
                element={backendOnly(
                  <ProtectedRoute roles={["TALENTO_VERIFICADO"]}>
                    <ReclamacionCredito />
                  </ProtectedRoute>,
                )}
              />

              {/* ==========================
                  ADMINISTRACIÓN
                 ========================== */}

              <Route
                path="/admin/verificaciones"
                element={backendOnly(
                  <ProtectedRoute roles={["ADMINISTRADOR"]}>
                    <AdminVerificaciones />
                  </ProtectedRoute>,
                )}
              />

              <Route
                path="/admin/solicitudes-creditos"
                element={backendOnly(
                  <ProtectedRoute roles={["ADMINISTRADOR"]}>
                    <AdminSolicitudesCredito />
                  </ProtectedRoute>,
                )}
              />

              <Route
                path="/admin/premios"
                element={backendOnly(
                  <ProtectedRoute roles={["ADMINISTRADOR"]}>
                    <AdminPremios />
                  </ProtectedRoute>,
                )}
              />

              <Route
                path="/admin/galeria"
                element={backendOnly(
                  <ProtectedRoute roles={["ADMINISTRADOR"]}>
                    <AdminGaleria />
                  </ProtectedRoute>,
                )}
              />
            </Routes>
          </Suspense>
          {/* El contenido editorial debe preceder a la publicidad. */}
          <AdSenseArea />
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
