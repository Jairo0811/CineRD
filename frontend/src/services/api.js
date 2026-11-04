
import axios from "axios";
import { API_BASE_URL, DEMO_MODE } from "../config/api";
import demoAdapter from "./demoAdapter";

/**
 * CINERD - CONFIGURACIÓN DE API
 *
 * Modo Demo:
 *   VITE_DEMO_MODE=true
 *   Utiliza el catálogo estático publicado en Netlify.
 *
 * Modo Normal:
 *   VITE_DEMO_MODE=false
 *   Utiliza Node.js + Express + SQL Server.
 */

// Limpiar sesiones anteriores al iniciar la demo pública.
if (DEMO_MODE) {
  localStorage.removeItem("cineRdAccessToken");
  localStorage.removeItem("cineRdUsuario");
}

/**
 * Instancia principal de Axios.
 *
 * En modo demo utiliza el adaptador estático.
 * En modo normal se conecta con el backend real.
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: !DEMO_MODE,
  ...(DEMO_MODE ? { adapter: demoAdapter } : {}),
});

/**
 * Eliminar la sesión almacenada.
 */
const limpiarSesion = () => {
  localStorage.removeItem("cineRdAccessToken");
  localStorage.removeItem("cineRdUsuario");
};

/**
 * Guardar una sesión autenticada.
 * No se permite almacenar sesiones en modo demo.
 */
const guardarSesion = ({ accessToken, usuario }) => {
  if (DEMO_MODE) return;

  if (accessToken) {
    localStorage.setItem("cineRdAccessToken", accessToken);
  }

  if (usuario) {
    localStorage.setItem(
      "cineRdUsuario",
      JSON.stringify(usuario)
    );
  }
};

/**
 * INTERCEPTOR DE SOLICITUDES
 *
 * Agrega el JWT únicamente cuando
 * CineRD utiliza el backend real.
 */
api.interceptors.request.use((config) => {
  if (DEMO_MODE) {
    return config;
  }

  const token = localStorage.getItem("cineRdAccessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/**
 * Control de renovación de sesiones.
 *
 * Evita solicitudes simultáneas de refresh.
 */
let refreshPromise = null;

const renovarSesion = async () => {
  // En la demo pública no existe autenticación.
  if (DEMO_MODE) {
    throw new Error(
      "La renovación de sesión no está disponible en modo demo."
    );
  }

  if (!refreshPromise) {
    refreshPromise = axios
      .post(
        `${API_BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      )
      .then(({ data }) => {
        guardarSesion(data);
        return data.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

/**
 * INTERCEPTOR DE RESPUESTAS
 *
 * Modo Demo:
 *   Propaga errores del catálogo estático.
 *
 * Modo Normal:
 *   Conserva la renovación automática de JWT,
 *   la detección de sesiones expiradas
 *   y la redirección al login.
 */
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    // La demo no intenta renovar sesiones.
    if (DEMO_MODE) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const url = String(error.config?.url || "");

    const esRutaAuth = [
      "/auth/login",
      "/auth/registro",
      "/auth/refresh",
      "/auth/logout",
    ].some((ruta) => url.includes(ruta));

    const requestOriginal = error.config;

    // Intentar renovar un access token expirado.
    if (
      status === 401 &&
      !esRutaAuth &&
      requestOriginal &&
      !requestOriginal._cineRdRetry
    ) {
      requestOriginal._cineRdRetry = true;

      try {
        const nuevoToken = await renovarSesion();

        requestOriginal.headers =
          requestOriginal.headers || {};

        requestOriginal.headers.Authorization =
          `Bearer ${nuevoToken}`;

        return api(requestOriginal);
      } catch {
        limpiarSesion();
      }
    }

    // Redirigir cuando la sesión ya no es válida.
    if (status === 401 && !esRutaAuth) {
      limpiarSesion();

      if (window.location.pathname !== "/login") {
        window.location.assign(
          "/login?session=expired"
        );
      }
    }

    return Promise.reject(error);
  }
);

// Exportaciones utilizadas por los componentes.
export {
  limpiarSesion,
  guardarSesion,
  renovarSesion,
};

export default api;
