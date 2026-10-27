import api from "./api";
export const getRecommandations = (id_entite) => api.get("/recommandations", { params: id_entite ? { id_entite } : {} }).then((r) => r.data);
export const creerRecommandation = (d) => api.post("/recommandations", d).then((r) => r.data);
export const changerStatutReco = (id, statut) => api.put(`/recommandations/${id}/statut`, { statut }).then((r) => r.data);
export const supprimerRecommandation = (id) => api.delete(`/recommandations/${id}`);
