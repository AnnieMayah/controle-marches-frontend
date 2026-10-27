import { createContext, useContext, useMemo, useState } from "react";
import { connexion } from "../services/auth";
import { droitsPour } from "../utils/permissions";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cmp-utilisateur")); } catch { return null; }
  });

  const seConnecter = async (login, motDePasse) => {
    const u = await connexion(login, motDePasse);
    localStorage.setItem("cmp-utilisateur", JSON.stringify(u));
    setUtilisateur(u);
  };
  const seDeconnecter = () => { localStorage.removeItem("cmp-utilisateur"); setUtilisateur(null); };

  const droits = useMemo(() => droitsPour(utilisateur?.role), [utilisateur]);
  return <AuthContext.Provider value={{ utilisateur, droits, seConnecter, seDeconnecter }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans un <AuthProvider>");
  return ctx;
}
