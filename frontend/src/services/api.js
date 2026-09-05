import axios from "axios";
import { API_BASE_URL } from "../config/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const limpiarSesion = () => {
  localStorage.removeItem("cineRdAccessToken");
  localStorage.removeItem("cineRdUsuario");
};

const guardarSesion = ({ accessToken, usuario }) => {
  if (accessToken) localStorage.setItem("cineRdAccessToken", accessToken);
  if (usuario) localStorage.setItem("cineRdUsuario", JSON.stringify(usuario));
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cineRdAccessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let refreshPromise = null;

const renovarSesion = async () => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true })
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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const url = String(error.config?.url || "");
    const esRutaAuth = ["/auth/login", "/auth/registro", "/auth/refresh", "/auth/logout"]
      .some((ruta) => url.includes(ruta));
    const requestOriginal = error.config;

    if (status === 401 && !esRutaAuth && requestOriginal && !requestOriginal._cineRdRetry) {
      requestOriginal._cineRdRetry = true;

      try {
        const nuevoToken = await renovarSesion();
        requestOriginal.headers = requestOriginal.headers || {};
        requestOriginal.headers.Authorization = `Bearer ${nuevoToken}`;
        return api(requestOriginal);
      } catch {
        limpiarSesion();
      }
    }

    if (status === 401 && !esRutaAuth) {
      limpiarSesion();

      if (window.location.pathname !== "/login") {
        window.location.assign("/login?session=expired");
      }
    }

    return Promise.reject(error);
  },
);

export { limpiarSesion, guardarSesion };
export default api;
