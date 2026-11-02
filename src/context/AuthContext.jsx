import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { connexion } from "../services/auth";
import { effacerJeton } from "../services/api";
import { droitsPour } from "../utils/permissions";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cmp-utilisateur")); } catch { return null; }
  });

  const seConnecter = async (login, motDePasse) => {
    const { jeton, ...infos } = await connexion(login, motDePasse); // le jeton est déjà gardé par services/auth
    localStorage.setItem("cmp-utilisateur", JSON.stringify(infos));
    setUtilisateur(infos);
  };
  const seDeconnecter = () => { effacerJeton(); localStorage.removeItem("cmp-utilisateur"); setUtilisateur(null); };

  // jeton expiré ou refusé par le serveur : retour à l'écran de connexion
  useEffect(() => {
    const sortir = () => { localStorage.removeItem("cmp-utilisateur"); setUtilisateur(null); };
    window.addEventListener("session-expiree", sortir);
    return () => window.removeEventListener("session-expiree", sortir);
  }, []);

  const droits = useMemo(() => droitsPour(utilisateur?.role), [utilisateur]);
  return <AuthContext.Provider value={{ utilisateur, droits, seConnecter, seDeconnecter }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans un <AuthProvider>");
  return ctx;
}