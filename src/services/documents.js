import api, { API_BASE } from "./api";
export const getDocumentsMarche = (id) => api.get(`/documents/marche/${id}`).then((r) => r.data);
export const getCompletude = (id) => api.get(`/documents/marche/${id}/completude`).then((r) => r.data);
export const uploaderDocument = (fichier, id_marche, id_type_document) => {
  const fd = new FormData();
  fd.append("fichier", fichier); fd.append("id_marche", id_marche); fd.append("id_type_document", id_type_document);
  return api.post("/documents/upload", fd, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data);
};
export const modifierDocument = (id, id_type_document) => api.put(`/documents/${id}`, { id_type_document }).then((r) => r.data);
export const supprimerDocument = (id) => api.delete(`/documents/${id}`);
export const urlFichier = (chemin) => `${API_BASE}/documents/fichier/${chemin}`;
