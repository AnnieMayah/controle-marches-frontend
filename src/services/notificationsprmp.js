import api from "./api";

export const envoyerResultatPrmp = (idControle) => api.post(`/resultats/controle/${idControle}/envoyer`).then((r) => r.data);