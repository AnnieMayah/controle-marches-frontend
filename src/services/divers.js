import api, { API_BASE } from "./api";
export const rechercher = (q) => api.get("/recherche", { params: { q } }).then((r) => r.data);
export const getNotifications = () => api.get("/notifications").then((r) => r.data);
export const urlRapportPdf = (idMarche) => `${API_BASE}/rapports/marche/${idMarche}/pdf`;
export const urlRapportGlobal = (p) => {
  const q = new URLSearchParams(Object.entries(p).filter(([, v]) => v !== "" && v !== null && v !== undefined));
  return `${API_BASE}/rapports/global/docx?${q.toString()}`;
};
