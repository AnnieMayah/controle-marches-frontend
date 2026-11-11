import api from "./api";

export const getPieces = (idIrregularite) => api.get(`/preuves/irregularite/${idIrregularite}`).then((r) => r.data.ids_documents);
export const enregistrerPieces = (idIrregularite, ids) => api.put(`/preuves/irregularite/${idIrregularite}`, { ids_documents: ids }).then((r) => r.data.ids_documents);
