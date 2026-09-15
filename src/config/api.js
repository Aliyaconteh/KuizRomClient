const LIVE_API_URL = import.meta.env.VITE_API_BASE_URL || "https://quizroomserver.onrender.com";
const LOCAL_API_URL = import.meta.env.VITE_LOCAL_API_URL || "http://localhost:5000";

export const resolveApiBaseUrl = () => {
  if (typeof window === "undefined") {
    return import.meta.env.VITE_API_BASE_URL || LOCAL_API_URL;
  }

  // If explicitly requested to use remote API in local development
  if (import.meta.env.VITE_FORCE_REMOTE_API === "true") {
    return LIVE_API_URL;
  }

  const { hostname } = window.location;
  return hostname === "localhost" || hostname === "127.0.0.1"
    ? LOCAL_API_URL
    : LIVE_API_URL;
};

export const API_BASE_URL = resolveApiBaseUrl();

export const SOCKET_URL =
  import.meta.env.VITE_FORCE_REMOTE_API === "true"
    ? LIVE_API_URL
    : (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
        ? LOCAL_API_URL
        : API_BASE_URL);

export const apiUrl = (path) => {
  const base = resolveApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};
