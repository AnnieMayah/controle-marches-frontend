import api from "./api";

export const getCircuit = (idControle) => api.get(`/transferts/controle/${idControle}`).then((r) => r.data);
export const avancerControle = (idControle) => api.post(`/transferts/controle/${idControle}/avancer`).then((r) => r.data);
export const renvoyerControle = (idControle, motif) => api.post(`/transferts/controle/${idControle}/renvoyer`, { motif }).then((r) => r.data);
export const getATraiter = () => api.get("/transferts/a-traiter").then((r) => r.data.ids);
