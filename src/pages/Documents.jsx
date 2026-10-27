import { useCallback, useEffect, useState } from "react";
import Icone from "../components/ui/Icone";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { useAuth } from "../context/AuthContext";
import { getMarches } from "../services/marches";
import { getTypesDocument } from "../services/reference";
import { getDocumentsMarche, getCompletude, uploaderDocument, modifierDocument, supprimerDocument, urlFichier } from "../services/documents";
import { formaterErreur } from "../utils/erreurs";
import { formatDate } from "../utils/format";

export default function Documents({ params }) {
  const { droits } = useAuth();
  const [marches, setMarches] = useState([]);
  const [types, setTypes] = useState([]);
  const [idMarche, setIdMarche] = useState(params.idMarche ? String(params.idMarche) : "");
  const [docs, setDocs] = useState([]);
  const [completude, setCompletude] = useState(null);
  const [idType, setIdType] = useState("");
  const [fichier, setFichier] = useState(null);
  const [edition, setEdition] = useState(null); // { id, id_type_document }
  const [aSupprimer, setASupprimer] = useState(null);
  const [message, setMessage] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [chargement, setChargement] = useState(false);
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => { Promise.all([getMarches(), getTypesDocument()]).then(([m, t]) => { setMarches(m); setTypes(t); }).catch((e) => setErreur(formaterErreur(e))); }, []);

  const recharger = useCallback(async (id) => {
    if (!id) return;
    setChargement(true);
    try { const [d, c] = await Promise.all([getDocumentsMarche(id), getCompletude(id)]); setDocs(d); setCompletude(c); }
    catch (e) { setErreur(formaterErreur(e)); } finally { setChargement(false); }
  }, []);
  useEffect(() => { recharger(idMarche); }, [idMarche, recharger]);
  useEffect(() => { if (!message) return; const t = setTimeout(() => setMessage(null), 3500); return () => clearTimeout(t); }, [message]);

  const televerser = async (e) => {
    e.preventDefault(); setErreur(null);
    if (!idType) { setErreur("Choisis le type de document."); return; }
    if (!fichier) { setErreur("Choisis un fichier à déposer."); return; }
    setEnvoi(true);
    try { await uploaderDocument(fichier, idMarche, idType); setFichier(null); setIdType(""); e.target.reset(); setMessage("Document ajouté."); await recharger(idMarche); }
    catch (err) { setErreur(formaterErreur(err)); } finally { setEnvoi(false); }
  };

  const enregistrerModif = async () => {
    try { await modifierDocument(edition.id, Number(edition.id_type_document)); setEdition(null); setMessage("Document modifié."); await recharger(idMarche); }
    catch (err) { setErreur(formaterErreur(err)); }
  };

  const confirmerSuppression = async () => {
    const cible = aSupprimer; setASupprimer(null);
    try { await supprimerDocument(cible.id); setMessage("Document supprimé."); await recharger(idMarche); }
    catch (err) { setErreur(formaterErreur(err)); }
  };

  return (
    <>
      <div className="page-header"><div><h1>Documents</h1><p>Dépôt, classement et suivi des pièces justificatives par marché.</p></div></div>
      {message && <div className="alerte alerte-succes">{message}</div>}
      {erreur && <div className="alerte alerte-erreur">{erreur}</div>}

      <div className="card">
        <div className="champ" style={{ maxWidth: 480 }}>
          <label>Marché</label>
          <select className="input" value={idMarche} onChange={(e) => { setIdMarche(e.target.value); setEdition(null); }}>
            <option value="">Sélectionner un marché</option>
            {marches.map((m) => <option key={m.id} value={m.id}>{m.reference} — {m.entite}</option>)}
          </select>
        </div>

        {!idMarche && <div className="vide">Choisis un marché pour voir et gérer ses documents.</div>}

        {idMarche && completude && (
          <div className={`alerte ${completude.complet ? "alerte-succes" : "alerte-info"}`}>
            {completude.complet ? <strong>Dossier complet ✓</strong> : (<><strong>Pièces manquantes ({completude.pieces_manquantes.length}) :</strong>
              <ul>{completude.pieces_manquantes.map((p) => <li key={p}>{p}</li>)}</ul></>)}
          </div>
        )}

        {idMarche && droits.gererDocuments && (
          <form onSubmit={televerser} className="barre-filtres" style={{ alignItems: "flex-end", marginTop: 14 }}>
            <div className="champ" style={{ margin: 0 }}><label>Type de document</label>
              <select className="input" value={idType} onChange={(e) => setIdType(e.target.value)}><option value="">Sélectionner</option>
                {types.map((t) => <option key={t.id} value={t.id}>{t.libelle}</option>)}</select></div>
            <div className="champ" style={{ margin: 0 }}><label>Fichier</label>
              <input className="input" type="file" onChange={(e) => setFichier(e.target.files[0] || null)} /></div>
            <button className="btn" type="submit" disabled={envoi}><Icone nom="televerser" /> {envoi ? "Envoi…" : "Déposer"}</button>
          </form>
        )}

        {idMarche && (chargement ? <p>Chargement…</p> : docs.length === 0 ? <div className="vide">Aucun document déposé pour ce marché.</div> : (
          <div className="table-wrap" style={{ marginTop: 14 }}>
            <table className="table">
              <thead><tr><th>Type</th><th>Fichier</th><th>Taille</th><th>Ajouté le</th><th className="num">Actions</th></tr></thead>
              <tbody>
                {docs.map((d) => (
                  <tr key={d.id}>
                    <td>{edition?.id === d.id ? (
                      <select className="input" value={edition.id_type_document} onChange={(e) => setEdition({ ...edition, id_type_document: e.target.value })}>
                        {types.map((t) => <option key={t.id} value={t.id}>{t.libelle}</option>)}</select>) : d.type_document}</td>
                    <td><a href={urlFichier(d.chemin_fichier)} target="_blank" rel="noreferrer">{d.nom_fichier}</a></td>
                    <td>{d.taille_ko} Ko</td><td>{formatDate(d.date_upload)}</td>
                    <td><div className="actions">
                      {edition?.id === d.id ? (<>
                        <button className="btn btn-sm" onClick={enregistrerModif}>Enregistrer</button>
                        <button className="btn btn-secondaire btn-sm" onClick={() => setEdition(null)}>Annuler</button></>) : (<>
                        <a className="btn-icone" href={urlFichier(d.chemin_fichier)} target="_blank" rel="noreferrer" title="Aperçu / télécharger"><Icone nom="oeil" /></a>
                        {droits.gererDocuments && <>
                          <button className="btn-icone" title="Modifier le type" onClick={() => { const t = types.find((x) => x.libelle === d.type_document); setEdition({ id: d.id, id_type_document: t ? t.id : "" }); }}><Icone nom="crayon" /></button>
                          <button className="btn-icone danger" title="Supprimer" onClick={() => setASupprimer(d)}><Icone nom="corbeille" /></button></>}</>)}
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      <ConfirmDialog ouvert={!!aSupprimer} titre="Supprimer ce document ?" message={`Le fichier « ${aSupprimer?.nom_fichier} » sera définitivement supprimé.`}
        onConfirmer={confirmerSuppression} onAnnuler={() => setASupprimer(null)} />
    </>
  );
}
