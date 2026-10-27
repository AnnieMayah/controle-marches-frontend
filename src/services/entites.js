import api from "./api";
export const getEntites = () => api.get("/entites").then((r) => r.data);
export const creerEntite = (d) => api.post("/entites", d).then((r) => r.data);
export const modifierEntite = (id, d) => api.put(`/entites/${id}`, d).then((r) => r.data);
export const supprimerEntite = (id) => api.delete(`/entites/${id}`);
