import api from "./api";
export const getControles = (params = {}) => api.get("/controles", { params }).then((r) => r.data);
export const getControle = (id) => api.get(`/controles/${id}`).then((r) => r.data);
export const creerOuRecupererControle = (id_marche) => api.post("/controles", { id_marche }).then((r) => r.data);
export const saisirNoteEtape = (id, id_etape, note, observations, id_utilisateur) =>
  api.post(`/controles/${id}/etapes`, { id_etape, note, observations, id_utilisateur }).then((r) => r.data);
export const validerControle = (id, id_utilisateur_validateur) =>
  api.post(`/controles/${id}/valider`, { id_utilisateur_validateur }).then((r) => r.data);
