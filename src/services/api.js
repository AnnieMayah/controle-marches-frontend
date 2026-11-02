import axios from "axios";

export const API_BASE = "http://127.0.0.1:5000/api";
const CLE_JETON = "jeton";

export const getJeton = () => localStorage.getItem(CLE_JETON);
export const setJeton = (j) => localStorage.setItem(CLE_JETON, j);
export const effacerJeton = () => localStorage.removeItem(CLE_JETON);

// Pour les liens de téléchargement : un <a href> ne peut pas envoyer d'en-tête.
export const avecJeton = (url) => {
  const j = getJeton();
  return j ? `${url}${url.includes("?") ? "&" : "?"}token=${encodeURIComponent(j)}` : url;
};

const api = axios.create({ baseURL: API_BASE, headers: { "Content-Type": "application/json" } });

api.interceptors.request.use((config) => {
  const j = getJeton();
  if (j) config.headers.Authorization = `Bearer ${j}`;
  return config;
});

api.interceptors.response.use((r) => r, (erreur) => {
  const url = erreur.config?.url || "";
  if (erreur.response?.status === 401 && !url.includes("/auth/login")) {
    effacerJeton();
    window.dispatchEvent(new Event("session-expiree"));
  }
  return Promise.reject(erreur);
});

export default api;