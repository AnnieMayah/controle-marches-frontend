import { useCallback, useEffect, useState } from "react";
import Icone from "../components/ui/Icone";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { useAuth } from "../context/AuthContext";
import { getControle, saisirNoteEtape, validerControle } from "../services/controles";
import { getEtapes } from "../services/reference";
import { getIrregularitesControle, ajouterIrregularite, supprimerIrregularite } from "../services/irregularites";
import { getDocumentsMarche, urlFichier } from "../services/documents";
import { getAnomalies } from "../services/marches";
import { urlRapportPdf } from "../services/divers";
import { formaterErreur } from "../utils/erreurs";
import { formatDate, formatMontant, statutControle } from "../utils/format";

const CONSTAT_VIDE = { id_controle_etape: "", description: "", texte_applicable: "", risque: "Moyen", recommandation: "", impacte_attribution: false };

export default function DetailControle({ params, naviguer }) {
  const { utilisateur, droits } = useAuth();
  const id = params.idControle;

  const [controle, setControle] = useState(null);
  const [etapes, setEtapes] = useState([]);
  const [irregs, setIrregs] = useState([]);
  const [docs, setDocs] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [onglet, setOnglet] = useState(params.onglet || "infos");
  const [notes, setNotes] = useState({});
  const [erreur, setErreur] = useState(null);
  const [succes, setSucces] = useState(null);
  const [enCours, setEnCours] = useState(null);
  const [confirmValider, setConfirmValider] = useState(false);
  const [aSupprimer, setASupprimer] = useState(null);
  const [constat, setConstat] = useState(CONSTAT_VIDE);

  const charger = useCallback(async () => {
    try {
      const [c, e] = await Promise.all([getControle(id), getEtapes()]);
      setControle(c); setEtapes(e);
      const map = {};
      c.etapes_notees.forEach((x) => { map[x.id_etape] = { note: x.note, observations: x.observations || "" }; });
      setNotes(map);
      const [i, d, a] = await Promise.all([getIrregularitesControle(id), getDocumentsMarche(c.id_marche), getAnomalies(c.id_marche)]);
      setIrregs(i); setDocs(d); setAnomalies(a.suggestions);
    } catch (err) { setErreur(formaterErreur(err)); }
  }, [id]);
  useEffect(() => { charger(); }, [charger]);
  useEffect(() => { if (!succes) return; const t = setTimeout(() => setSucces(null), 3500); return () => clearTimeout(t); }, [succes]);

  if (!controle) return <>{erreur ? <div className="alerte alerte-erreur">{erreur}</div> : <p>Chargement du contrôle…</p>}</>;

  const m = controle.marche;
  const statut = statutControle(controle);
  const peutEditer = droits.noter && !controle.valide;
  const toutesNotees = etapes.length > 0 && controle.nb_etapes_notees >= etapes.length;
  const peutValider = droits.valider && !controle.valide && toutesNotees;

  const majNote = (idEtape, champ, valeur) => setNotes((p) => ({ ...p, [idEtape]: { ...p[idEtape], [champ]: valeur } }));

  const enregistrerNote = async (idEtape) => {
    const s = notes[idEtape] || {};
    if (s.note === undefined || s.note === null || s.note === "") { setErreur("Choisis une note de 0 à 4 pour cette étape."); return; }
    setErreur(null); setEnCours(idEtape);
    try {
      await saisirNoteEtape(id, idEtape, Number(s.note), s.observations || "", utilisateur.id);
      setControle(await getControle(id));
      setSucces("Note enregistrée.");
    } catch (err) { setErreur(formaterErreur(err)); } finally { setEnCours(null); }
  };

  const valider = async () => {
    setConfirmValider(false); setErreur(null);
    try { await validerControle(id, utilisateur.id); await charger(); setSucces("Contrôle validé définitivement."); }
    catch (err) { setErreur(formaterErreur(err)); }
  };

  const ajouterConstat = async (e) => {
    e.preventDefault(); setErreur(null);
    if (!constat.id_controle_etape) { setErreur("Choisis l'étape concernée par ce constat."); return; }
    if (!constat.description.trim()) { setErreur("La description du constat est obligatoire."); return; }
    try {
      await ajouterIrregularite({ ...constat, id_controle_etape: Number(constat.id_controle_etape) });
      setConstat(CONSTAT_VIDE);
      const [i, c] = await Promise.all([getIrregularitesControle(id), getControle(id)]);
      setIrregs(i); setControle(c); setSucces("Constat enregistré.");
    } catch (err) { setErreur(formaterErreur(err)); }
  };

  const confirmerSuppression = async () => {
    const cible = aSupprimer; setASupprimer(null);
    try {
      await supprimerIrregularite(cible.id);
      const [i, c] = await Promise.all([getIrregularitesControle(id), getControle(id)]);
      setIrregs(i); setControle(c); setSucces("Constat supprimé.");
    } catch (err) { setErreur(formaterErreur(err)); }
  };

  const infos = [
    ["Référence du contrôle", controle.reference], ["Marché", m.reference], ["Entité", m.entite], ["Nature", m.nature],
    ["Mode de passation", m.mode_passation], ["Montant", formatMontant(m.montant)], ["Titulaire", m.titulaire || "—"],
    ["Année d'exercice", m.annee_exercice], ["Date du contrôle", formatDate(controle.date_controle)],
    ["Note globale", controle.note_globale !== null ? `${controle.note_globale} / 4` : "—"],
  ];

  return (
    <>
      <button className="retour" onClick={() => naviguer("controles")}>‹ Retour</button>
      <div className="page-header">
        <h1>Détail du contrôle</h1>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <span className={`badge ${statut.classe}`}>{statut.label}</span>
          <a className="btn btn-secondaire btn-sm" href={urlRapportPdf(controle.id_marche)} target="_blank" rel="noreferrer"><Icone nom="telecharger" taille={15} /> Voir le rapport</a>
          {peutValider && <button className="btn btn-sm" onClick={() => setConfirmValider(true)}><Icone nom="check" taille={15} /> Valider le contrôle</button>}
        </div>
      </div>

      {succes && <div className="alerte alerte-succes">{succes}</div>}
      {erreur && <div className="alerte alerte-erreur">{erreur}</div>}
      {controle.valide && <div className="alerte alerte-info">Ce contrôle est validé : il n'est plus modifiable.</div>}

      <div className="card ctrl-entete">
        <div className="ctrl-logo"><Icone nom="entites" taille={28} /></div>
        <div><h3>{m.entite}</h3><p style={{ margin: 0 }}>{m.reference} — {m.objet}</p></div>
        <div className="ctrl-meta">
          <div>Référence<strong>{controle.reference}</strong></div>
          <div>Date<strong>{formatDate(controle.date_controle)}</strong></div>
          <div>Type<strong>{m.nature}</strong></div>
        </div>
      </div>

      <div className="tabs-soulignes">
        {[["infos", "Informations"], ["notation", "Notation des étapes"], ["detection", `Détection automatique (${anomalies.length})`], ["constats", `Constats (${irregs.length})`], ["pieces", `Pièces jointes (${docs.length})`]].map(([k, l]) => (
          <button key={k} className={`tab-s ${onglet === k ? "actif" : ""}`} onClick={() => setOnglet(k)}>{l}</button>
        ))}
      </div>

      {onglet === "infos" && (
        <div className="grille-2">
          <div className="card">
            <div className="card-entete"><h3>Informations générales</h3></div>
            <dl className="info-grille" style={{ margin: 0 }}>{infos.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
            <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
              {m.hors_ppm && <span className="badge badge-danger">Hors PPM</span>}
              {m.marche_regularisation && <span className="badge badge-warning">Marché de régularisation</span>}
            </div>
          </div>
          <div className="card">
            <div className="card-entete"><h3>Constats principaux</h3></div>
            {irregs.length === 0 ? (
              <div className="constat"><span className="constat-point" style={{ background: "var(--success)" }}>✓</span>Aucune irrégularité constatée pour le moment.</div>
            ) : irregs.slice(0, 5).map((i) => (
              <div className="constat" key={i.id}>
                <span className="constat-point" style={{ background: i.impacte_attribution ? "var(--danger)" : "var(--warning)" }}>!</span>
                <span>{i.description}<br /><small style={{ color: "var(--text-muted)" }}>{i.libelle_etape}</small></span>
              </div>
            ))}
            <div className="card-entete" style={{ marginTop: 18 }}><h3>Pièces jointes</h3></div>
            {docs.length === 0 ? <p>Aucune pièce jointe.</p> : docs.slice(0, 4).map((d) => (
              <div className="constat" key={d.id} style={{ justifyContent: "space-between" }}>
                <span>{d.nom_fichier}<br /><small style={{ color: "var(--text-muted)" }}>{d.type_document}</small></span>
                <a className="btn-icone" href={urlFichier(d.chemin_fichier)} target="_blank" rel="noreferrer" title="Télécharger"><Icone nom="telecharger" /></a>
              </div>
            ))}
          </div>
        </div>
      )}

      {onglet === "notation" && (
        <div className="card">
          <div className="bandeau">
            <span>Note globale : <strong>{controle.note_globale ?? "—"}</strong> / 4</span>
            <span>Conclusion {controle.valide ? "" : "provisoire "}: <span className={`badge ${statut.classe}`}>{controle.valide ? statut.label : (controle.nb_etapes_notees ? controle.conclusion.replace("_", " ").toLowerCase() : "—")}</span></span>
            <span>Étapes notées : <strong>{controle.nb_etapes_notees} / {etapes.length}</strong></span>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Étape</th><th style={{ width: 100 }}>Note (0-4)</th><th>Observations</th><th></th></tr></thead>
              <tbody>
                {etapes.map((et) => {
                  const s = notes[et.id] || {};
                  return (
                    <tr key={et.id}>
                      <td>{et.ordre}. {et.libelle}</td>
                      <td>
                        <select className="input" disabled={!peutEditer} value={s.note ?? ""} onChange={(e) => majNote(et.id, "note", e.target.value)}>
                          <option value="">—</option>{[0, 1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </td>
                      <td><input className="input" disabled={!peutEditer} value={s.observations ?? ""} onChange={(e) => majNote(et.id, "observations", e.target.value)} placeholder="Observations (facultatif)" /></td>
                      <td>{peutEditer && <button className="btn btn-sm" disabled={enCours === et.id} onClick={() => enregistrerNote(et.id)}>{enCours === et.id ? "…" : "Enregistrer"}</button>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="echelle">0 : importantes irrégularités · 1 : irrégularités · 2 : généralement acceptable · 3 : acceptable · 4 : excellente maîtrise.
            {!droits.noter && " Tu as un accès en lecture seule à ce contrôle."}</p>
        </div>
      )}

      {onglet === "constats" && (
        <>
          {anomalies.length > 0 && peutEditer && (
            <div className="alerte alerte-info">
              <strong>Suggestions du module de détection (aide à la décision)</strong>
              <ul>
                {anomalies.map((a, i) => (
                  <li key={i}>{a}{" "}
                    <button className="lien-voir" onClick={() => setConstat((c) => ({ ...c, description: a }))}>Utiliser comme constat</button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="card">
            <div className="card-entete"><h3>Constats enregistrés</h3></div>
            {irregs.length === 0 ? <div className="vide">Aucun constat enregistré.</div> : (
              <div className="table-wrap"><table className="table">
                <thead><tr><th>Étape</th><th>Constat</th><th>Texte applicable</th><th>Risque</th><th>Recommandation</th><th></th></tr></thead>
                <tbody>
                  {irregs.map((i) => (
                    <tr key={i.id}>
                      <td>{i.libelle_etape}</td>
                      <td>{i.description}{i.impacte_attribution && <> <span className="badge badge-danger">Impacte l'attribution</span></>}</td>
                      <td>{i.texte_applicable || "—"}</td><td>{i.risque || "—"}</td><td>{i.recommandation || "—"}</td>
                      <td>{peutEditer && <button className="btn-icone danger" title="Supprimer" onClick={() => setASupprimer(i)}><Icone nom="corbeille" /></button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            )}
          </div>

          {peutEditer && (
            <form className="card" onSubmit={ajouterConstat} noValidate>
              <div className="card-entete"><h3>Ajouter un constat</h3></div>
              {controle.etapes_notees.length === 0 ? <p>Note d'abord au moins une étape (onglet « Notation des étapes ») pour pouvoir lui rattacher un constat.</p> : (
                <>
                  <div className="form-grille">
                    <div className="champ"><label>Étape concernée <span className="requis">*</span></label>
                      <select className="input" value={constat.id_controle_etape} onChange={(e) => setConstat({ ...constat, id_controle_etape: e.target.value })}>
                        <option value="">Sélectionner une étape</option>
                        {controle.etapes_notees.map((x) => <option key={x.id} value={x.id}>{x.libelle_etape}</option>)}
                      </select></div>
                    <div className="champ"><label>Niveau de risque</label>
                      <select className="input" value={constat.risque} onChange={(e) => setConstat({ ...constat, risque: e.target.value })}>
                        <option>Faible</option><option>Moyen</option><option>Élevé</option></select></div>
                    <div className="champ"><label>Texte réglementaire applicable</label>
                      <input className="input" value={constat.texte_applicable} onChange={(e) => setConstat({ ...constat, texte_applicable: e.target.value })} placeholder="Ex : Code des marchés publics, art. 45" /></div>
                  </div>
                  <div className="champ"><label>Description du constat <span className="requis">*</span></label>
                    <textarea className="input" value={constat.description} onChange={(e) => setConstat({ ...constat, description: e.target.value })} /></div>
                  <div className="champ"><label>Recommandation / mesure corrective</label>
                    <textarea className="input" value={constat.recommandation} onChange={(e) => setConstat({ ...constat, recommandation: e.target.value })} /></div>
                  <label className="case"><input type="checkbox" checked={constat.impacte_attribution} onChange={(e) => setConstat({ ...constat, impacte_attribution: e.target.checked })} /> Cette irrégularité impacte l'attribution du marché (non-conformité automatique)</label>
                  <div className="form-actions"><button className="btn" type="submit">Enregistrer le constat</button></div>
                </>
              )}
            </form>
          )}
        </>
      )}

      {onglet === "detection" && (
        <div className="card">
          <div className="card-entete"><h3>Détection automatique des irrégularités</h3><span className="badge badge-info">Aide à la décision</span></div>
          <p style={{ color: "var(--text)" }}>Les règles métier ont analysé ce marché (mode de passation, montant, PPM, pièces du dossier). Ces suggestions sont à confirmer par le contrôleur.</p>
          {anomalies.length === 0 ? (
            <div className="alerte alerte-succes">Aucune anomalie détectée par les règles automatiques ✓ (cela ne dispense pas de l'examen du dossier).</div>
          ) : (
            <div className="table-wrap"><table className="table"><thead><tr><th>Anomalie suspectée</th><th className="num">Action</th></tr></thead>
              <tbody>{anomalies.map((a, i) => (
                <tr key={i}><td>{a}</td>
                  <td><div className="actions">{peutEditer && <button className="btn btn-secondaire btn-sm" onClick={() => { setConstat((c) => ({ ...c, description: a })); setOnglet("constats"); }}>Utiliser comme constat</button>}</div></td></tr>
              ))}</tbody></table></div>
          )}
          <p className="echelle">Règles : mode non concurrentiel + montant élevé · hors PPM · marché de régularisation · contrat ou PV d'ouverture des plis manquants.</p>
        </div>
      )}

      {onglet === "pieces" && (
        <div className="card">
          <div className="card-entete"><h3>Pièces jointes du marché</h3>
            <button className="btn btn-secondaire btn-sm" onClick={() => naviguer("documents", { idMarche: controle.id_marche })}>Gérer les documents</button></div>
          {docs.length === 0 ? <div className="vide">Aucun document déposé pour ce marché.</div> : (
            <div className="table-wrap"><table className="table">
              <thead><tr><th>Type</th><th>Fichier</th><th>Taille</th><th>Ajouté le</th><th></th></tr></thead>
              <tbody>{docs.map((d) => (
                <tr key={d.id}><td>{d.type_document}</td><td>{d.nom_fichier}</td><td>{d.taille_ko} Ko</td><td>{formatDate(d.date_upload)}</td>
                  <td><div className="actions"><a className="btn-icone" href={urlFichier(d.chemin_fichier)} target="_blank" rel="noreferrer" title="Télécharger"><Icone nom="telecharger" /></a></div></td></tr>
              ))}</tbody></table></div>
          )}
        </div>
      )}

      <ConfirmDialog ouvert={confirmValider} titre="Valider le contrôle" danger={false} libelleConfirmer="Valider définitivement"
        message="Une fois validé, ce contrôle ne pourra plus être modifié. La conclusion sera figée et prise en compte dans les statistiques."
        onConfirmer={valider} onAnnuler={() => setConfirmValider(false)} />
      <ConfirmDialog ouvert={!!aSupprimer} titre="Supprimer ce constat ?" message="Cette action est irréversible et peut modifier la conclusion du contrôle."
        onConfirmer={confirmerSuppression} onAnnuler={() => setASupprimer(null)} />
    </>
  );
}
