import { useEffect, useState } from "react";
import Icone from "../components/ui/Icone";
import Pagination from "../components/ui/Pagination";
import { useAuth } from "../context/AuthContext";
import { getControles, creerOuRecupererControle } from "../services/controles";
import { getMarches } from "../services/marches";
import { formaterErreur } from "../utils/erreurs";
import { formatDate, statutControle } from "../utils/format";

const TAILLE_PAGE = 8;
const TOTAL_ETAPES = 7;

export function Avancement({ c }) {
  return (
    <div className="progression">
      <div className="progression-barre"><div style={{ width: `${(c.nb_etapes_notees / TOTAL_ETAPES) * 100}%` }} /></div>
      <small>{c.nb_etapes_notees}/{TOTAL_ETAPES}</small>
    </div>
  );
}

export default function Controles({ naviguer }) {
  const { droits } = useAuth();
  const [controles, setControles] = useState([]);
  const [marches, setMarches] = useState([]);
  const [recherche, setRecherche] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("");
  const [page, setPage] = useState(1);
  const [creation, setCreation] = useState(false);
  const [idMarche, setIdMarche] = useState("");
  const [erreur, setErreur] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    Promise.all([getControles(), getMarches()])
      .then(([c, m]) => { setControles(c); setMarches(m); })
      .catch((err) => setErreur(formaterErreur(err)))
      .finally(() => setChargement(false));
  }, []);

  const q = recherche.trim().toLowerCase();
  const filtres = controles.filter((c) =>
    (!filtreStatut || statutControle(c).label === filtreStatut) &&
    (!q || `${c.reference} ${c.entite} ${c.reference_marche} ${c.nature}`.toLowerCase().includes(q)));
  const visibles = filtres.slice((page - 1) * TAILLE_PAGE, page * TAILLE_PAGE);

  const demarrer = async () => {
    if (!idMarche) { setErreur("Choisis le marché à contrôler."); return; }
    try { const c = await creerOuRecupererControle(Number(idMarche)); naviguer("detail-controle", { idControle: c.id }); }
    catch (err) { setErreur(formaterErreur(err)); }
  };

  return (
    <>
      <div className="page-header">
        <div><h1>Contrôles</h1><p>Suivez l'avancement des contrôles a posteriori.</p></div>
        {droits.noter && <button className="btn" onClick={() => setCreation(!creation)}><Icone nom="plus" /> Nouveau contrôle</button>}
      </div>

      {erreur && <div className="alerte alerte-erreur">{erreur}</div>}

      {creation && (
        <div className="card">
          <h3 style={{ marginBottom: 12 }}>Démarrer un contrôle</h3>
          <div className="champ" style={{ maxWidth: 460 }}>
            <label>Marché à contrôler</label>
            <select className="input" value={idMarche} onChange={(e) => setIdMarche(e.target.value)}>
              <option value="">Sélectionner un marché</option>
              {marches.map((m) => <option key={m.id} value={m.id}>{m.reference} — {m.entite}</option>)}
            </select>
          </div>
          <p style={{ fontSize: 12.5 }}>Si un contrôle est déjà en cours pour ce marché, il sera rouvert.</p>
          <div className="form-actions"><button className="btn" onClick={demarrer}>Ouvrir le contrôle</button><button className="btn btn-secondaire" onClick={() => setCreation(false)}>Annuler</button></div>
        </div>
      )}

      <div className="card">
        <div className="barre-filtres">
          <input className="input" style={{ minWidth: 240 }} placeholder="Rechercher un contrôle…" value={recherche} onChange={(e) => { setRecherche(e.target.value); setPage(1); }} />
          <select className="input" value={filtreStatut} onChange={(e) => { setFiltreStatut(e.target.value); setPage(1); }}>
            <option value="">Tous les statuts</option><option>À démarrer</option><option>En cours</option><option>Conforme</option><option>Non conforme</option>
          </select>
        </div>

        {chargement ? <p>Chargement…</p> : filtres.length === 0 ? <div className="vide">Aucun contrôle.</div> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>N°</th><th>Établissement</th><th>Marché</th><th>Type</th><th>Date</th><th>Avancement</th><th>Statut</th><th className="num">Actions</th></tr></thead>
              <tbody>
                {visibles.map((c) => {
                  const s = statutControle(c);
                  return (
                    <tr key={c.id}>
                      <td className="nowrap">{c.reference}</td><td>{c.entite}</td><td>{c.reference_marche}</td><td>{c.nature}</td><td>{formatDate(c.date_controle)}</td>
                      <td><Avancement c={c} /></td>
                      <td><span className={`badge ${s.classe}`}>{s.label}</span></td>
                      <td><div className="actions"><button className="btn-icone" title="Ouvrir" onClick={() => naviguer("detail-controle", { idControle: c.id })}><Icone nom="oeil" /></button></div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pagination total={filtres.length} page={page} taille={TAILLE_PAGE} onChange={setPage} />
      </div>
    </>
  );
}
