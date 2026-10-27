import { useEffect, useState } from "react";
import { getMarches, getAnomalies } from "../services/marches";
import {
  getEtapes, creerOuRecupererControle, getControle, saisirNoteEtape, validerControle,
} from "../services/controles";
import { formaterErreur } from "../utils/erreurs";

export default function WorkflowControle() {
  const [marches, setMarches] = useState([]);
  const [idMarcheChoisi, setIdMarcheChoisi] = useState("");
  const [etapes, setEtapes] = useState([]);
  const [controle, setControle] = useState(null);
  const [notesParEtape, setNotesParEtape] = useState({});
  const [anomalies, setAnomalies] = useState([]);
  const [messageValidation, setMessageValidation] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [chargementListe, setChargementListe] = useState(true);
  const [chargementControle, setChargementControle] = useState(false);
  const [etapeEnCours, setEtapeEnCours] = useState(null);

  useEffect(() => {
    Promise.all([getMarches().then(setMarches), getEtapes().then(setEtapes)])
      .finally(() => setChargementListe(false));
  }, []);

  useEffect(() => {
    if (!idMarcheChoisi) return;
    setMessageValidation(null);
    setErreur(null);
    setChargementControle(true);

    creerOuRecupererControle(Number(idMarcheChoisi))
      .then((c) => getControle(c.id))
      .then((detail) => {
        setControle(detail);
        const notes = {};
        detail.etapes_notees.forEach((e) => {
          notes[e.id_etape] = { note: e.note, observations: e.observations || "" };
        });
        setNotesParEtape(notes);
      })
      .catch((err) => setErreur(formaterErreur(err)))
      .finally(() => setChargementControle(false));

    getAnomalies(idMarcheChoisi).then((res) => setAnomalies(res.suggestions));
  }, [idMarcheChoisi]);

  const majNote = (idEtape, champ, valeur) => {
    setNotesParEtape((prev) => ({ ...prev, [idEtape]: { ...prev[idEtape], [champ]: valeur } }));
  };

  const enregistrerEtape = async (idEtape) => {
    const saisie = notesParEtape[idEtape] || {};
    if (saisie.note === undefined || saisie.note === "") {
      setErreur("Indique une note de 0 à 4 pour cette étape avant d'enregistrer.");
      return;
    }
    setErreur(null);
    setEtapeEnCours(idEtape);
    try {
      const resultat = await saisirNoteEtape(controle.id, idEtape, Number(saisie.note), saisie.observations || "");
      setControle((prev) => ({ ...prev, note_globale: resultat.note_globale, conclusion: resultat.conclusion }));
    } catch (err) {
      setErreur(formaterErreur(err));
    } finally {
      setEtapeEnCours(null);
    }
  };

  const handleValider = async () => {
    const resultat = await validerControle(controle.id, 1);
    setControle((prev) => ({ ...prev, ...resultat }));
    setMessageValidation("Contrôle validé définitivement.");
  };

  const badgeConclusion = (conclusion) => {
    if (conclusion === "CONFORME") return "badge badge-success";
    if (conclusion === "NON_CONFORME") return "badge badge-danger";
    return "badge badge-muted";
  };

  return (
    <div className="card">
      <h3>Workflow de contrôle</h3>

      <div className="champ" style={{ maxWidth: "420px" }}>
        <label>Marché à contrôler</label>
        <select className="input" value={idMarcheChoisi} onChange={(e) => setIdMarcheChoisi(e.target.value)} disabled={chargementListe}>
          <option value="">{chargementListe ? "Chargement…" : "-- Choisir un marché --"}</option>
          {marches.map((m) => <option key={m.id} value={m.id}>{m.reference} — {m.objet}</option>)}
        </select>
      </div>

      {erreur && <p className="alerte alerte-erreur">{erreur}</p>}
      {idMarcheChoisi && chargementControle && <p>Chargement du contrôle…</p>}

      {anomalies.length > 0 && (
        <div className="encadre-ia">
          <strong>Suggestions du module de détection</strong>
          <ul>{anomalies.map((a, i) => <li key={i}>{a}</li>)}</ul>
        </div>
      )}

      {controle && (
        <>
          <div className="conclusion-bandeau">
            <span>Note globale : <strong>{controle.note_globale ?? "—"}</strong> / 4</span>
            <span>Conclusion : <span className={badgeConclusion(controle.conclusion)}>{controle.conclusion}</span></span>
          </div>

          <div className="table-wrap" style={{ marginTop: "14px" }}>
            <table className="table">
              <thead>
                <tr><th>Étape</th><th>Note (0-4)</th><th>Observations</th><th></th></tr>
              </thead>
              <tbody>
                {etapes.map((etape) => {
                  const saisie = notesParEtape[etape.id] || {};
                  return (
                    <tr key={etape.id}>
                      <td>{etape.ordre}. {etape.libelle}</td>
                      <td style={{ width: "90px" }}>
                        <select className="input" value={saisie.note ?? ""} onChange={(e) => majNote(etape.id, "note", e.target.value)}>
                          <option value="">--</option>
                          <option value="0">0</option><option value="1">1</option>
                          <option value="2">2</option><option value="3">3</option><option value="4">4</option>
                        </select>
                      </td>
                      <td>
                        <input className="input" value={saisie.observations ?? ""} onChange={(e) => majNote(etape.id, "observations", e.target.value)} />
                      </td>
                      <td>
                        <button className="btn btn-sm" onClick={() => enregistrerEtape(etape.id)} disabled={etapeEnCours === etape.id}>
                          {etapeEnCours === etape.id ? "…" : "Enregistrer"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button
            className="btn"
            style={{ marginTop: "16px" }}
            onClick={handleValider}
            disabled={controle.note_globale === null}
          >
            Valider le contrôle (PCNM)
          </button>

          {messageValidation && <p className="message-inline message-ok">{messageValidation}</p>}
        </>
      )}
    </div>
  );
}
