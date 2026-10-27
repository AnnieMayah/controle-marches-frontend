import Icone from "../ui/Icone";
import { useTheme } from "../../theme/ThemeContext";
import { useAuth } from "../../context/AuthContext";

export const PAGES = [
  { id: "tableau-bord", label: "Tableau de bord", icone: "accueil" },
  { id: "entites-marches", label: "Entités & Marchés", icone: "entites" },
  { id: "controles", label: "Contrôles", icone: "controles" },
  { id: "documents", label: "Documents", icone: "documents" },
  { id: "workflow", label: "Workflow de contrôle", icone: "workflow" },
  { id: "detection", label: "Détection automatique", icone: "detection" },
  { id: "rapports", label: "Rapports", icone: "rapports" },
  { id: "recommandations", label: "Recommandations", icone: "recommandations" },
  { id: "guide", label: "Guide d'utilisation", icone: "livre" },
  { id: "parametres", label: "Paramètres", icone: "parametres" },
];

export default function Sidebar({ pageActive, naviguer }) {
  const { theme, basculerTheme } = useTheme();
  const { seDeconnecter } = useAuth();
  // la page de détail d'un contrôle reste rattachée au menu « Contrôles »
  const actif = pageActive === "detail-controle" ? "controles" : pageActive;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Icone nom="logo" taille={34} />
        <span>Contrôle a posteriori<br />des marchés publics</span>
      </div>

      <nav>
        {PAGES.map((p) => (
          <button key={p.id} className={`nav-item ${actif === p.id ? "actif" : ""}`} onClick={() => naviguer(p.id)} title={p.label}>
            <Icone nom={p.icone} taille={19} />
            <span className="libelle">{p.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="switch-ligne">
          <Icone nom={theme === "dark" ? "lune" : "soleil"} taille={18} />
          <button className={`switch ${theme === "dark" ? "on" : ""}`} onClick={basculerTheme}
                  aria-label="Basculer entre mode clair et mode sombre" />
        </div>
        <button className="icon-btn-dark" onClick={seDeconnecter} title="Se déconnecter" aria-label="Se déconnecter">
          <Icone nom="deconnexion" taille={19} />
        </button>
      </div>
    </aside>
  );
}
