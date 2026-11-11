import { useEffect, useState } from "react";
import { formaterErreur } from "../utils/erreurs";
import { getPieces, enregistrerPieces } from "../services/preuves";

export default function PiecesConstat({ idIrregularite, documents, editable }) {
  const [ids, setIds] = useState([]);
  const [ouvert, setOuvert] = useState(false);
  const [choix, setChoix] = useState([]);
  const [erreur, setErreur] = useState(null);

  useEffect(() => { getPieces(idIrregularite).then(setIds).catch(() => setIds([])); }, [idIrregularite]);

  const noms = documents.filter((d) => ids.includes(d.id));
  const basculer = (id) => setChoix((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  const enregistrer = async () => {
    setErreur(null);
    try { setIds(await enregistrerPieces(idIrregularite, choix)); setOuvert(false); }
    catch (err) { setErreur(formaterErreur(err)); }
  };

  return (
    <div>
      {noms.length === 0 ? <span style={{ color: "var(--text-muted)" }}>—</span> : noms.map((d) => <div key={d.id}><small>{d.nom_fichier}</small></div>)}
      {editable && !ouvert && <button className="lien-bouton" onClick={() => { setChoix(ids); setOuvert(true); }}>{noms.length ? "Modifier" : "Lier des pièces"}</button>}
      {ouvert && (
        <div style={{ marginTop: 6 }}>
          {documents.length === 0 ? <small>Aucun document déposé pour ce marché.</small> : documents.map((d) => (
            <label className="case" key={d.id}><input type="checkbox" checked={choix.includes(d.id)} onChange={() => basculer(d.id)} /> {d.nom_fichier}</label>
          ))}
          {erreur && <div className="champ-erreur">{erreur}</div>}
          <div className="form-actions">
            <button className="btn btn-sm" onClick={enregistrer}>Enregistrer</button>
            <button className="btn btn-secondaire btn-sm" onClick={() => setOuvert(false)}>Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}
