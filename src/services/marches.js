import api from "./api";
export const getMarches = () => api.get("/marches").then((r) => r.data);
export const getMarche = (id) => api.get(`/marches/${id}`).then((r) => r.data);
export const creerMarche = (d) => api.post("/marches", d).then((r) => r.data);
export const modifierMarche = (id, d) => api.put(`/marches/${id}`, d).then((r) => r.data);
export const supprimerMarche = (id) => api.delete(`/marches/${id}`);
export const getAnomalies = (id) => api.get(`/marches/${id}/anomalies`).then((r) => r.data);
export const getRisques = () => api.get("/marches/risques").then((r) => r.data);
