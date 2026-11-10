import { useCallback, useEffect, useState } from "react";
import { formaterErreur } from "../utils/erreurs";
import { getCircuit, avancerControle, renvoyerControle } from "../services/transferts";

const LIBELLES = { COLLECTE: "Collecte", VERIFICATION: "Vérification", ANALYSE: "Analyse", VALIDATION: "Validation" };

export default function CircuitControle({ idControle }) {
  const [circuit, setCircuit] = useState(null);
  const [motif, setMotif] = useState("");
  const [renvoi, setRenvoi] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [succes, setSucces] = useState(null);
  const [enCours, setEnCours] = useState(false);

  const charger = useCallback(async () => {
    try { setCircuit(await getCircuit(idControle)); } catch (err) { setErreur(formaterErreur(err)); }
  }, [idControle]);
  useEffect(() => { charger(); }, [charger]);
  useEffect(() => { if (!succes) return; const t = setTimeout(() => setSucces(null), 3500); return () => clearTimeout(t); }, [succes]);

  const agir = async (action, message) => {
    setErreur(null); setEnCours(true);
    try {
      setCircuit(await action());
      setSucces(message); setRenvoi(false); setMotif("");
    } catch (err) { setErreur(formaterErreur(err)); } finally { setEnCours(false); }
  };

  if (!circuit) return erreur ? <div className="alerte alerte-erreur">{erreur}</div> : <p>Chargement du circuit…</p>;

  const rang = circuit.niveaux.indexOf(circuit.niveau);
  const suivant = LIBELLES[circuit.niveaux[rang + 1]];
  const precedent = LIBELLES[circuit.niveaux[rang - 1]];

  return (
    <>
      {succes && <div className="alerte alerte-succes">{succes}</div>}
      {erreur && <div className="alerte alerte-erreur">{erreur}</div>}

      <div className="card">
        <div className="card-entete"><h3>Circuit de validation</h3>
          <span className="badge badge-info">Niveau actuel : {LIBELLES[circuit.niveau]}</span></div>
        <div className="stepper">
          {circuit.niveaux.map((n, i) => (
            <div key={n} className={`step ${i <= rang ? "actif" : ""}`}>
              <div className="step-rond">{i < rang ? "✓" : i + 1}</div>
              <div className="step-titre">{LIBELLES[n]}</div>
            </div>
          ))}
        </div>

        {circuit.valide && <div className="alerte alerte-info">Ce contrôle est validé : le circuit est terminé.</div>}

        <div className="form-actions" style={{ flexWrap: "wrap" }}>
          {circuit.peut_avancer && (
            <button className="btn" disabled={enCours} onClick={() => agir(() => avancerControle(idControle), `Contrôle transféré au niveau « ${suivant} ».`)}>
              Transférer au niveau « {suivant} »
            </button>
          )}
          {circuit.peut_renvoyer && !renvoi && (
            <button className="btn btn-secondaire" onClick={() => setRenvoi(true)}>Renvoyer au niveau « {precedent} »</button>
          )}
        </div>

        {renvoi && (
          <div style={{ marginTop: 14 }}>
            <div className="champ"><label>Motif du renvoi <span className="requis">*</span></label>
              <textarea className="input" value={motif} onChange={(e) => setMotif(e.target.value)} placeholder="Ex : la note de l'évaluation est à revoir" /></div>
            <div className="form-actions">
              <button className="btn" disabled={enCours} onClick={() => agir(() => renvoyerControle(idControle, motif), `Contrôle renvoyé au niveau « ${precedent} ».`)}>Confirmer le renvoi</button>
              <button className="btn btn-secondaire" onClick={() => { setRenvoi(false); setMotif(""); }}>Annuler</button>
            </div>
          </div>
        )}
        {!circuit.peut_avancer && !circuit.peut_renvoyer && !circuit.valide && (
          <p className="echelle">Ce contrôle se trouve au niveau « {LIBELLES[circuit.niveau]} » : seul le rôle concerné peut le transférer.</p>
        )}
      </div>

      <div className="card">
        <div className="card-entete"><h3>Historique</h3></div>
        {circuit.historique.length === 0 ? <div className="vide">Aucun transfert pour le moment.</div> : (
          <div className="table-wrap"><table className="table">
            <thead><tr><th>Date</th><th>Action</th><th>De</th><th>Vers</th><th>Par</th><th>Motif</th></tr></thead>
            <tbody>
              {circuit.historique.map((h) => (
                <tr key={h.id}>
                  <td className="nowrap">{h.date ? new Date(h.date).toLocaleString("fr-FR") : "—"}</td>
                  <td><span className={`badge ${h.action === "RENVOI" ? "badge-warning" : "badge-success"}`}>{h.action === "RENVOI" ? "Renvoi" : "Transfert"}</span></td>
                  <td>{LIBELLES[h.de]}</td><td>{LIBELLES[h.vers]}</td><td>{h.utilisateur || "—"}</td><td>{h.motif || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>
    </>
  );
}
