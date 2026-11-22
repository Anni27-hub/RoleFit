import axios from "axios";

const isProduction =
  typeof window !== "undefined" &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1";

const defaultBaseURL = isProduction
  ? "https://rolefit-api-bjqd.onrender.com/api"
  : "http://localhost:5000/api";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultBaseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;