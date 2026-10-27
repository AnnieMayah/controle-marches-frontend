import { useEffect, useState } from "react";
import { ThemeProvider } from "./theme/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import EntitesMarches from "./pages/EntitesMarches";
import Controles from "./pages/Controles";
import DetailControle from "./pages/DetailControle";
import Documents from "./pages/Documents";
import Workflow from "./pages/Workflow";
import Rapports from "./pages/Rapports";
import Recommandations from "./pages/Recommandations";
import Parametres from "./pages/Parametres";
import Detection from "./pages/Detection";
import Guide from "./pages/Guide";
import "./theme.css";

const PAGES = {
  "tableau-bord": Dashboard, "entites-marches": EntitesMarches, controles: Controles, "detail-controle": DetailControle,
  documents: Documents, workflow: Workflow, rapports: Rapports, recommandations: Recommandations, parametres: Parametres, detection: Detection, guide: Guide,
};

function Application() {
  const { utilisateur } = useAuth();
  // `cle` change à chaque navigation : la page est recréée (état remis à zéro, données rechargées)
  const [vue, setVue] = useState({ page: "tableau-bord", params: {}, cle: 0 });
  const naviguer = (page, params = {}) => setVue((v) => ({ page, params, cle: v.cle + 1 }));
  // à chaque connexion / déconnexion on repart du tableau de bord
  useEffect(() => { setVue((v) => ({ page: "tableau-bord", params: {}, cle: v.cle + 1 })); }, [utilisateur?.id]);

  if (!utilisateur) return <Login />;
  const Page = PAGES[vue.page] || Dashboard;

  return (
    <div className="app-shell">
      <Sidebar pageActive={vue.page} naviguer={naviguer} />
      <div className="main-area">
        <Topbar naviguer={naviguer} />
        <main className="page-content">
          <Page key={vue.cle} params={vue.params} naviguer={naviguer} />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Application />
      </AuthProvider>
    </ThemeProvider>
  );
}
