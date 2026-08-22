const API_ORIGIN =
  import.meta.env.VITE_API_URL ||
  `${window.location.protocol}//${window.location.hostname}:3000`;

export const API_URL = API_ORIGIN.replace(/\/$/, "");
export const API_BASE_URL = `${API_URL}/api`;