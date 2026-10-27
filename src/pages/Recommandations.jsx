import { useCallback, useEffect, useState } from "react";
import Icone from "../components/ui/Icone";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { useAuth } from "../context/AuthContext";
import { getEntites } from "../services/entites";
import { getRecommandations, creerRecommandation, changerStatutReco, supprimerRecommandation } from "../services/recommandations";
import { formaterErreur } from "../utils/erreurs";
import { formatDate } from "../utils/format";

const STATUTS = { EMISE: ["Émise", "badge-info"], EN_COURS: ["En cours", "badge-warning"], APPLIQUEE: ["Appliquée", "badge-success"], NON_APPLIQUEE: ["Non appliquée", "badge-danger"] };

export default function Recommandations() {
  const { droits } = useAuth();
  const [entites, setEntites] = useState([]);
  const [recos, setRecos] = useState([]);
  const [filtreEntite, setFiltreEntite] = useState("");
  const [nouvelle, setNouvelle] = useState({ id_entite: "", texte: "" });
  const [aSupprimer, setASupprimer] = useState(null);
  const [message, setMessage] = useState(null);
  const [erreur, setErreur] = useState(null);

  const charger = useCallback(() => getRecommandations(filtreEntite).then(setRecos).catch((e) => setErreur(formaterErreur(e))), [filtreEntite]);
  useEffect(() => { getEntites().then(setEntites).catch((e) => setErreur(formaterErreur(e))); }, []);
  useEffect(() => { charger(); }, [charger]);
  useEffect(() => { if (!message) return; const t = setTimeout(() => setMessage(null), 3500); return () => clearTimeout(t); }, [message]);

  const nomEntite = (id) => entites.find((e) => e.id === id)?.nom || "—";

  const ajouter = async (e) => {
    e.preventDefault(); setErreur(null);
    if (!nouvelle.id_entite) { setErreur("Choisis l'entité concernée."); return; }
    if (!nouvelle.texte.trim()) { setErreur("Le texte de la recommandation est obligatoire."); return; }
    try { await creerRecommandation({ id_entite: Number(nouvelle.id_entite), texte: nouvelle.texte.trim() }); setNouvelle({ id_entite: "", texte: "" }); setMessage("Recommandation ajoutée."); charger(); }
    catch (err) { setErreur(formaterErreur(err)); }
  };
  const changer = async (id, statut) => { try { await changerStatutReco(id, statut); charger(); } catch (err) { setErreur(formaterErreur(err)); } };
  const confirmer = async () => { const c = aSupprimer; setASupprimer(null); try { await supprimerRecommandation(c.id); setMessage("Recommandation supprimée."); charger(); } catch (err) { setErreur(formaterErreur(err)); } };

  return (
    <>
      <div className="page-header"><div><h1>Recommandations</h1><p>Suivi de la mise en œuvre des recommandations émises aux entités.</p></div></div>
      {message && <div className="alerte alerte-succes">{message}</div>}
      {erreur && <div className="alerte alerte-erreur">{erreur}</div>}

      {droits.noter && (
        <form className="card" onSubmit={ajouter} noValidate>
          <div className="card-entete"><h3>Nouvelle recommandation</h3></div>
          <div className="form-grille">
            <div className="champ"><label>Entité <span className="requis">*</span></label>
              <select className="input" value={nouvelle.id_entite} onChange={(e) => setNouvelle({ ...nouvelle, id_entite: e.target.value })}>
                <option value="">Sélectionner une entité</option>{entites.map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}</select></div>
          </div>
          <div className="champ"><label>Recommandation <span className="requis">*</span></label>
            <textarea className="input" value={nouvelle.texte} onChange={(e) => setNouvelle({ ...nouvelle, texte: e.target.value })} /></div>
          <button className="btn" type="submit"><Icone nom="plus" /> Ajouter</button>
        </form>
      )}

      <div className="card">
        <div className="barre-filtres">
          <select className="input" value={filtreEntite} onChange={(e) => setFiltreEntite(e.target.value)}>
            <option value="">Toutes les entités</option>{entites.map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}</select>
        </div>
        {recos.length === 0 ? <div className="vide">Aucune recommandation.</div> : (
          <div className="table-wrap"><table className="table">
            <thead><tr><th>Entité</th><th>Recommandation</th><th>Émise le</th><th>Statut</th><th></th></tr></thead>
            <tbody>{recos.map((r) => (
              <tr key={r.id}>
                <td>{nomEntite(r.id_entite)}</td><td style={{ maxWidth: 380 }}>{r.texte}</td><td>{formatDate(r.date_emission)}</td>
                <td>{droits.noter ? (
                  <select className="input" style={{ minWidth: 140 }} value={r.statut} onChange={(e) => changer(r.id, e.target.value)}>
                    {Object.entries(STATUTS).map(([k, [lib]]) => <option key={k} value={k}>{lib}</option>)}</select>
                ) : <span className={`badge ${STATUTS[r.statut][1]}`}>{STATUTS[r.statut][0]}</span>}</td>
                <td>{droits.noter && <button className="btn-icone danger" title="Supprimer" onClick={() => setASupprimer(r)}><Icone nom="corbeille" /></button>}</td>
              </tr>))}</tbody></table></div>
        )}
      </div>
      <ConfirmDialog ouvert={!!aSupprimer} titre="Supprimer cette recommandation ?" message="Cette action est irréversible." onConfirmer={confirmer} onAnnuler={() => setASupprimer(null)} />
    </>
  );
}
