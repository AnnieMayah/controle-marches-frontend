import { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from "recharts";
import {
  getStatsParNature, getStatsParModePassation, getTauxConformite, getTauxConformiteParEntite,
} from "../services/statistiques";
import { useTheme } from "../theme/ThemeContext";
import { getChartColors } from "../theme/colors";

export default function TableauBord() {
  const { theme } = useTheme();
  const couleurs = getChartColors(theme);

  const [parNature, setParNature] = useState([]);
  const [parMode, setParMode] = useState([]);
  const [tauxGlobal, setTauxGlobal] = useState(null);
  const [tauxParEntite, setTauxParEntite] = useState([]);
  const [chargement, setChargement] = useState(true);

  const charger = () => {
    setChargement(true);
    Promise.all([
      getStatsParNature().then(setParNature),
      getStatsParModePassation().then(setParMode),
      getTauxConformite().then(setTauxGlobal),
      getTauxConformiteParEntite().then(setTauxParEntite),
    ]).finally(() => setChargement(false));
  };

  useEffect(() => { charger(); }, []);

  // texte des axes/labels lisible dans les deux thèmes
  const couleurTexte = theme === "dark" ? "#9BA39A" : "#5B6058";
  const couleurSurface = theme === "dark" ? "#192420" : "#FFFFFF";
  const couleurBordure = theme === "dark" ? "#2E3B34" : "#DAD4C0";

  const stylesTooltip = { background: couleurSurface, border: `1px solid ${couleurBordure}`, borderRadius: 6, fontSize: 13 };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px" }}>
        <button className="btn btn-ghost btn-sm" onClick={charger}>Rafraîchir</button>
      </div>

      {chargement && <p>Chargement des statistiques…</p>}

      {tauxGlobal && (
        <div className="stat-grid">
          <Carte titre="Marchés contrôlés" valeur={tauxGlobal.total_controles} />
          <Carte titre="Conformes" valeur={tauxGlobal.conformes} accent="var(--success)" />
          <Carte titre="Non conformes" valeur={tauxGlobal.non_conformes} accent="var(--danger)" />
          <Carte titre="Taux de conformité" valeur={`${tauxGlobal.taux_conformite_pct}%`} accent="var(--accent)" />
        </div>
      )}

      <div className="chart-grid">
        <div className="chart-card">
          <h4>Répartition par nature</h4>
          {parNature.length === 0 ? <p>Aucune donnée.</p> : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={parNature} dataKey="nombre" nameKey="nature" outerRadius={85} label>
                  {parNature.map((_, i) => <Cell key={i} fill={couleurs[i % couleurs.length]} />)}
                </Pie>
                <Tooltip contentStyle={stylesTooltip} />
                <Legend wrapperStyle={{ fontSize: 12, color: couleurTexte }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="chart-card">
          <h4>Répartition par mode de passation</h4>
          {parMode.length === 0 ? <p>Aucune donnée.</p> : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={parMode} dataKey="nombre" nameKey="mode_passation" outerRadius={85} label>
                  {parMode.map((_, i) => <Cell key={i} fill={couleurs[i % couleurs.length]} />)}
                </Pie>
                <Tooltip contentStyle={stylesTooltip} />
                <Legend wrapperStyle={{ fontSize: 12, color: couleurTexte }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="chart-card">
        <h4>Taux de conformité par entité</h4>
        {tauxParEntite.length === 0 ? <p>Aucune donnée.</p> : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={tauxParEntite}>
              <CartesianGrid strokeDasharray="3 3" stroke={couleurBordure} />
              <XAxis dataKey="entite" tick={{ fontSize: 11, fill: couleurTexte }} />
              <YAxis domain={[0, 100]} unit="%" tick={{ fill: couleurTexte }} />
              <Tooltip contentStyle={stylesTooltip} />
              <Bar dataKey="taux_conformite_pct" fill={couleurs[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="card">
        <h3>Montants par nature</h3>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Nature</th><th>Nombre</th><th>Montant (Ar)</th></tr></thead>
            <tbody>
              {parNature.map((n) => (
                <tr key={n.nature}>
                  <td>{n.nature}</td>
                  <td>{n.nombre}</td>
                  <td>{n.montant.toLocaleString("fr-FR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Carte({ titre, valeur, accent }) {
  return (
    <div className="stat-card" style={accent ? { borderLeftColor: accent } : undefined}>
      <div className="stat-label">{titre}</div>
      <div className="stat-valeur" style={accent ? { color: accent } : undefined}>{valeur}</div>
    </div>
  );
}
