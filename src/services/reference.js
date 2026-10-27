import api from "./api";
export const getNatures = () => api.get("/reference/natures").then((r) => r.data);
export const getModesPassation = () => api.get("/reference/modes-passation").then((r) => r.data);
export const getEtapes = () => api.get("/reference/etapes").then((r) => r.data);
export const getTypesDocument = () => api.get("/reference/types-document").then((r) => r.data);
