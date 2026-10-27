import api from "./api";
const get = (url) => api.get(`/statistiques/${url}`).then((r) => r.data);
export const getResume = () => get("resume");
export const getEvolution = () => get("evolution");
export const getStatsParNature = () => get("par-nature");
export const getStatsParModePassation = () => get("par-mode-passation");
export const getTauxConformite = () => get("taux-conformite");
export const getTauxConformiteParEntite = () => get("taux-conformite-par-entite");
