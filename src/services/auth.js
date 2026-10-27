import api from "./api";
export const connexion = (login, mot_de_passe) => api.post("/auth/login", { login, mot_de_passe }).then((r) => r.data);
export const getUtilisateurs = () => api.get("/auth/utilisateurs").then((r) => r.data);
export const creerUtilisateur = (d) => api.post("/auth/utilisateurs", d).then((r) => r.data);
export const basculerActif = (id) => api.put(`/auth/utilisateurs/${id}/actif`).then((r) => r.data);
export const changerMotDePasse = (id_utilisateur, ancien, nouveau) =>
  api.put("/auth/mot-de-passe", { id_utilisateur, ancien, nouveau }).then((r) => r.data);

export const inscription = (d) => api.post("/auth/inscription", d).then((r) => r.data);
export const verifierInscription = (email, code) => api.post("/auth/inscription/verifier", { email, code }).then((r) => r.data);
export const renvoyerCode = (email, objet) => api.post("/auth/code/renvoyer", { email, objet }).then((r) => r.data);
export const motDePasseOublie = (email) => api.post("/auth/mot-de-passe-oublie", { email }).then((r) => r.data);
export const reinitialiserMotDePasse = (email, code, nouveau) => api.post("/auth/reinitialiser", { email, code, nouveau }).then((r) => r.data);
export const changerRole = (id, role, id_demandeur) => api.put(`/auth/utilisateurs/${id}/role`, { role, id_demandeur }).then((r) => r.data);
