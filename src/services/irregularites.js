import api from "./api";
export const getIrregularitesControle = (idControle) => api.get(`/irregularites/controle/${idControle}`).then((r) => r.data);
export const ajouterIrregularite = (d) => api.post("/irregularites", d).then((r) => r.data);
export const supprimerIrregularite = (id) => api.delete(`/irregularites/${id}`);
