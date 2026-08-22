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

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cineRdAccessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = String(error.config?.url || "");
    const esLogin = url.includes("/auth/login");

    if (status === 401 && !esLogin) {
      limpiarSesion();

      if (window.location.pathname !== "/login") {
        window.location.assign("/login?session=expired");
      }
    }

    return Promise.reject(error);
  },
);

export { limpiarSesion };
export default api;
