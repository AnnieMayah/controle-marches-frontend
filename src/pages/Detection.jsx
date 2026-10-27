import { Fragment, useEffect, useState } from "react";
import Icone from "../components/ui/Icone";
import { useAuth } from "../context/AuthContext";
import { getRisques } from "../services/marches";
import { creerOuRecupererControle } from "../services/controles";
import { formaterErreur } from "../utils/erreurs";
import { formatMontant } from "../utils/format";

export const CLASSE_NIVEAU = { "Élevé": "badge-danger", Moyen: "badge-warning", Faible: "badge-info", Aucun: "badge-success" };

const REGLES = [
  ["Mode de passation non concurrentiel et montant élevé", "gré à gré ou achat direct au-delà du seuil de risque : justification du choix à vérifier."],
  ["Marché hors PPM ou de régularisation", "non-conformité automatique, quelle que soit la moyenne des notes."],
  ["Pièces essentielles manquantes", "contrat ou PV d'ouverture des plis absents du dossier."],
  ["Historique de l'entité", "plus de la moitié de ses contrôles validés précédents sont non conformes."],
];

export default function Detection({ naviguer }) {
  const { droits } = useAuth();
  const [marches, setMarches] = useState([]);
  const [niveau, setNiveau] = useState("");
  const [seulementRisque, setSeulementRisque] = useState(true);
  const [ouvert, setOuvert] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => { getRisques().then(setMarches).catch((e) => setErreur(formaterErreur(e))).finally(() => setChargement(false)); }, []);

  const affiches = marches.filter((m) => (!niveau || m.niveau === niveau) && (!seulementRisque || m.points > 0));

  const analyser = async (m) => {
    try {
      if (m.id_controle) return naviguer("detail-controle", { idControle: m.id_controle, onglet: "detection" });
      const c = await creerOuRecupererControle(m.id);
      naviguer("detail-controle", { idControle: c.id, onglet: "detection" });
    } catch (e) { setErreur(formaterErreur(e)); }
  };

  return (
    <>
      <div className="page-header"><div><h1>Détection automatique</h1>
        <p>Aide à la décision : le module repère les marchés à surveiller en priorité et propose des constats.</p></div></div>
      {erreur && <div className="alerte alerte-erreur">{erreur}</div>}

      <div className="card">
        <div className="card-entete"><h3>Comment ça marche ?</h3></div>
        <p style={{ color: "var(--text)" }}>Le module applique des <strong>règles métier explicites</strong> (pas de boîte noire) à chaque marché. Il calcule un score de risque et liste les anomalies suspectées :</p>
        <ul style={{ margin: "4px 0 10px", paddingLeft: 20 }}>{REGLES.map(([t, d]) => <li key={t} style={{ marginBottom: 4 }}><strong>{t}</strong> — {d}</li>)}</ul>
        <div className="astuce">Les suggestions ne sont que des pistes : c'est le contrôleur qui confirme ou écarte chaque constat, dans l'onglet « Détection automatique » de chaque contrôle.</div>
      </div>

      <div className="card">
        <div className="barre-filtres">
          <select className="input" value={niveau} onChange={(e) => setNiveau(e.target.value)}>
            <option value="">Tous les niveaux de risque</option><option>Élevé</option><option>Moyen</option><option>Faible</option><option>Aucun</option></select>
          <label className="case" style={{ margin: 0 }}><input type="checkbox" checked={seulementRisque} onChange={(e) => setSeulementRisque(e.target.checked)} /> Masquer les marchés sans anomalie</label>
        </div>
        {chargement ? <p>Analyse en cours…</p> : affiches.length === 0 ? <div className="vide">Aucun marché ne correspond à ces critères.</div> : (
          <div className="table-wrap"><table className="table">
            <thead><tr><th>Marché</th><th>Entité</th><th className="num">Montant</th><th>Risque</th><th className="num">Score</th><th>Anomalies</th><th className="num">Actions</th></tr></thead>
            <tbody>
              {affiches.map((m) => (
                <Fragment key={m.id}>
                  <tr>
                    <td><strong className="nowrap">{m.reference}</strong><br /><small style={{ color: "var(--text-muted)" }}>{m.objet}</small></td>
                    <td>{m.entite}</td><td className="num">{formatMontant(m.montant)}</td>
                    <td><span className={`badge ${CLASSE_NIVEAU[m.niveau]}`}>{m.niveau === "Aucun" ? "RAS" : m.niveau}</span></td>
                    <td className="num">{m.score}/7</td>
                    <td><button className="lien-bouton" onClick={() => setOuvert(ouvert === m.id ? null : m.id)}>
                      {m.anomalies.length} anomalie{m.anomalies.length > 1 ? "s" : ""} {ouvert === m.id ? "▲" : "▼"}</button></td>
                    <td><div className="actions">
                      {(droits.noter || m.id_controle) && <button className="btn btn-secondaire btn-sm" onClick={() => analyser(m)}><Icone nom="detection" taille={15} /> Analyser</button>}
                    </div></td>
                  </tr>
                  {ouvert === m.id && (
                    <tr><td colSpan={7} style={{ background: "var(--surface-alt)" }}>
                      {m.anomalies.length === 0 ? "Aucune anomalie détectée." : <ul style={{ margin: 0, paddingLeft: 18 }}>{m.anomalies.map((a, i) => <li key={i}>{a}</li>)}</ul>}
                    </td></tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table></div>
        )}
      </div>
    </>
  );
}
