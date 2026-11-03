import api from "./api";

export const getObjets = () => api.get("/objets").then((r) => r.data);