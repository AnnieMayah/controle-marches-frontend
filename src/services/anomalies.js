import api from "./api";

export const getAnomaliesDetaillees = (idMarche) => api.get(`/marches/${idMarche}/anomalies-detaillees`).then((r) => r.data.suggestions);
