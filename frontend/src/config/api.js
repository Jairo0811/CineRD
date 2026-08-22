const API_ORIGIN =
  import.meta.env.VITE_API_URL ||
  `${window.location.protocol}//${window.location.hostname}:3000`;

export const API_URL = API_ORIGIN.replace(/\/$/, "");
export const API_BASE_URL = `${API_URL}/api`;

const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "0.0.0.0"]);

/**
 * Resolves media stored by CineRD without coupling the UI to localhost.
 * Legacy absolute localhost URLs are rewritten to the API origin currently
 * being used by the browser, which also makes them work from phones on LAN.
 */
export const resolveMediaUrl = (value) => {
  if (!value) return null;

  const mediaPath = String(value).trim();
  if (!mediaPath) return null;

  if (mediaPath.startsWith("/")) {
    return `${API_URL}${mediaPath}`;
  }

  try {
    const url = new URL(mediaPath);

    if (LOCAL_HOSTNAMES.has(url.hostname)) {
      return `${API_URL}${url.pathname}${url.search}${url.hash}`;
    }

    return url.toString();
  } catch {
    return `${API_URL}/${mediaPath.replace(/^\/+/, "")}`;
  }
};