import api from "./api";

export const getPrmp = (idEntite) => api.get("/prmp", { params: idEntite ? { id_entite: idEntite } : {} }).then((r) => r.data);
export const getEntitesPrmp = () => api.get("/prmp/entites").then((r) => r.data);
export const creerPrmp = (donnees) => api.post("/prmp", donnees).then((r) => r.data);
export const modifierPrmp = (id, donnees) => api.put(`/prmp/${id}`, donnees).then((r) => r.data);
export const supprimerPrmp = (id) => api.delete(`/prmp/${id}`).then((r) => r.data);