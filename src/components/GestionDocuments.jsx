import { useEffect, useState } from "react";
import { getMarches } from "../services/marches";
import {
  getTypesDocument, getDocumentsMarche, getCompletude,
  uploaderDocument, supprimerDocument, urlFichier,
} from "../services/documents";
import { formaterErreur } from "../utils/erreurs";

export default function GestionDocuments() {
  const [marches, setMarches] = useState([]);
  const [idMarcheChoisi, setIdMarcheChoisi] = useState("");
  const [types, setTypes] = useState([]);
  const [idTypeChoisi, setIdTypeChoisi] = useState("");
  const [fichierChoisi, setFichierChoisi] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [completude, setCompletude] = useState(null);
  const [message, setMessage] = useState(null);
  const [chargementListe, setChargementListe] = useState(true);
  const [chargementDocs, setChargementDocs] = useState(false);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  useEffect(() => {
    Promise.all([getMarches().then(setMarches), getTypesDocument().then(setTypes)])
      .finally(() => setChargementListe(false));
  }, []);

  const rechargerDocuments = (idMarche) => {
    setChargementDocs(true);
    Promise.all([
      getDocumentsMarche(idMarche).then(setDocuments),
      getCompletude(idMarche).then(setCompletude),
    ]).finally(() => setChargementDocs(false));
  };

  useEffect(() => {
    if (idMarcheChoisi) rechargerDocuments(idMarcheChoisi);
  }, [idMarcheChoisi]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!fichierChoisi || !idTypeChoisi || !idMarcheChoisi) {
      setMessage({ ok: false, texte: "Choisis un marché, un type de document et un fichier." });
      return;
    }
    setEnvoiEnCours(true);
    try {
      await uploaderDocument(fichierChoisi, idMarcheChoisi, idTypeChoisi);
      setMessage({ ok: true, texte: "Document ajouté." });
      setFichierChoisi(null);
      setIdTypeChoisi("");
      rechargerDocuments(idMarcheChoisi);
    } catch (err) {
      setMessage({ ok: false, texte: formaterErreur(err) });
    } finally {
      setEnvoiEnCours(false);
    }
  };

  const handleSupprimer = async (id) => {
    await supprimerDocument(id);
    rechargerDocuments(idMarcheChoisi);
  };

  return (
    <div className="card">
      <h3>Documents justificatifs</h3>

      <div className="champ" style={{ maxWidth: "420px" }}>
        <label>Marché</label>
        <select className="input" value={idMarcheChoisi} onChange={(e) => setIdMarcheChoisi(e.target.value)} disabled={chargementListe}>
          <option value="">{chargementListe ? "Chargement…" : "-- Choisir un marché --"}</option>
          {marches.map((m) => <option key={m.id} value={m.id}>{m.reference} — {m.objet}</option>)}
        </select>
      </div>

      {idMarcheChoisi && chargementDocs && <p>Chargement du dossier…</p>}

      {idMarcheChoisi && !chargementDocs && (
        <>
          {completude && (
            <div className={`alerte ${completude.complet ? "alerte-succes" : "alerte-info"}`}>
              {completude.complet ? (
                <strong>Dossier complet ✓</strong>
              ) : (
                <>
                  <strong>Pièces manquantes :</strong>
                  <ul style={{ margin: "6px 0 0", paddingLeft: "18px" }}>
                    {completude.pieces_manquantes.map((p) => <li key={p}>{p}</li>)}
                  </ul>
                </>
              )}
            </div>
          )}

          <form onSubmit={handleUpload} className="form-row" style={{ marginTop: "16px", alignItems: "flex-end" }}>
            <div className="champ" style={{ flex: "1 1 200px" }}>
              <label>Type de document</label>
              <select className="input" value={idTypeChoisi} onChange={(e) => setIdTypeChoisi(e.target.value)}>
                <option value="">-- Type --</option>
                {types.map((t) => <option key={t.id} value={t.id}>{t.libelle}</option>)}
              </select>
            </div>
            <div className="champ" style={{ flex: "1 1 200px" }}>
              <label>Fichier</label>
              <input className="input" type="file" onChange={(e) => setFichierChoisi(e.target.files[0])} />
            </div>
            <button type="submit" className="btn" style={{ marginBottom: "14px" }} disabled={envoiEnCours}>
              {envoiEnCours ? "Envoi en cours…" : "Ajouter"}
            </button>
          </form>

          {message && <p className={`message-inline ${message.ok ? "message-ok" : "message-erreur"}`}>{message.texte}</p>}

          <div className="table-wrap" style={{ marginTop: "12px" }}>
            <table className="table">
              <thead><tr><th>Type</th><th>Fichier</th><th>Taille</th><th></th></tr></thead>
              <tbody>
                {documents.map((d) => (
                  <tr key={d.id}>
                    <td>{d.type_document}</td>
                    <td><a href={urlFichier(d.chemin_fichier)} target="_blank" rel="noreferrer">{d.nom_fichier}</a></td>
                    <td>{d.taille_ko} Ko</td>
                    <td><button className="btn btn-ghost btn-sm" onClick={() => handleSupprimer(d.id)}>Supprimer</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
