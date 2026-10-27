import { useEffect, useState } from "react";
import { getEntites } from "../services/entites";
import { getNatures, getModesPassation } from "../services/reference";
import { creerMarche, modifierMarche } from "../services/marches";
import { formaterErreur } from "../utils/erreurs";

export default function FormMarche({ marche, onTermine, onAnnuler }) {
  const [entites, setEntites] = useState([]);
  const [natures, setNatures] = useState([]);
  const [modes, setModes] = useState([]);
  const [form, setForm] = useState({
    reference: marche?.reference || "", objet: marche?.objet || "",
    id_entite: marche?.id_entite || "", id_nature: marche?.id_nature || "", id_mode_passation: marche?.id_mode_passation || "",
    montant: marche?.montant ?? "", titulaire: marche?.titulaire || "",
    annee_exercice: marche?.annee_exercice || new Date().getFullYear(),
    hors_ppm: marche?.hors_ppm || false, marche_regularisation: marche?.marche_regularisation || false,
  });
  const [erreurs, setErreurs] = useState({});
  const [erreurServeur, setErreurServeur] = useState(null);
  const [envoi, setEnvoi] = useState(false);
  const maj = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => { getEntites().then(setEntites); getNatures().then(setNatures); getModesPassation().then(setModes); }, []);

  const soumettre = async (e) => {
    e.preventDefault();
    const err = {};
    if (!form.reference.trim()) err.reference = "La référence est obligatoire.";
    if (!form.objet.trim()) err.objet = "L'objet du marché est obligatoire.";
    if (!form.id_entite) err.id_entite = "Choisis une entité.";
    if (!form.id_nature) err.id_nature = "Choisis une nature.";
    if (!form.id_mode_passation) err.id_mode_passation = "Choisis un mode de passation.";
    if (!(Number(form.montant) > 0)) err.montant = "Le montant doit être supérieur à 0.";
    const annee = Number(form.annee_exercice);
    if (!(annee >= 2000 && annee <= 2100)) err.annee_exercice = "Année invalide.";
    setErreurs(err);
    if (Object.keys(err).length) return;

    setEnvoi(true); setErreurServeur(null);
    const donnees = { ...form, reference: form.reference.trim(), id_entite: Number(form.id_entite), id_nature: Number(form.id_nature),
                      id_mode_passation: Number(form.id_mode_passation), montant: Number(form.montant), annee_exercice: annee };
    try {
      if (marche) await modifierMarche(marche.id, donnees); else await creerMarche(donnees);
      onTermine(marche ? "Marché modifié." : "Marché créé.");
    } catch (ex) { setErreurServeur(formaterErreur(ex)); setEnvoi(false); }
  };

  const champ = (cle, libelle, contenu, requis = true) => (
    <div className="champ">
      <label>{libelle} {requis && <span className="requis">*</span>}</label>
      {contenu}
      {erreurs[cle] && <div className="champ-erreur">{erreurs[cle]}</div>}
    </div>
  );
  const classe = (cle) => `input ${erreurs[cle] ? "invalide" : ""}`;

  return (
    <>
      <button className="retour" onClick={onAnnuler}>‹ Retour</button>
      <div className="page-header"><h1>{marche ? "Modifier le marché" : "Ajouter un marché"}</h1></div>
      <form className="card" onSubmit={soumettre} noValidate>
        <h3 style={{ marginBottom: 14 }}>Informations du marché</h3>
        <div className="form-grille">
          {champ("reference", "Référence", <input className={classe("reference")} value={form.reference} onChange={(e) => maj("reference", e.target.value)} placeholder="Ex : M001/24" />)}
          {champ("annee_exercice", "Année d'exercice", <input className={classe("annee_exercice")} type="number" value={form.annee_exercice} onChange={(e) => maj("annee_exercice", e.target.value)} />)}
          {champ("id_entite", "Entité", (
            <select className={classe("id_entite")} value={form.id_entite} onChange={(e) => maj("id_entite", e.target.value)}>
              <option value="">Sélectionner une entité</option>
              {entites.map((en) => <option key={en.id} value={en.id}>{en.nom}</option>)}
            </select>))}
          {champ("id_nature", "Nature", (
            <select className={classe("id_nature")} value={form.id_nature} onChange={(e) => maj("id_nature", e.target.value)}>
              <option value="">Sélectionner une nature</option>
              {natures.map((n) => <option key={n.id} value={n.id}>{n.libelle}</option>)}
            </select>))}
          {champ("id_mode_passation", "Mode de passation", (
            <select className={classe("id_mode_passation")} value={form.id_mode_passation} onChange={(e) => maj("id_mode_passation", e.target.value)}>
              <option value="">Sélectionner un mode</option>
              {modes.map((m) => <option key={m.id} value={m.id}>{m.libelle}</option>)}
            </select>))}
          {champ("montant", "Montant (Ar)", <input className={classe("montant")} type="number" min="0" value={form.montant} onChange={(e) => maj("montant", e.target.value)} />)}
          {champ("titulaire", "Titulaire", <input className="input" value={form.titulaire} onChange={(e) => maj("titulaire", e.target.value)} />, false)}
        </div>
        {champ("objet", "Objet", <textarea className={classe("objet")} value={form.objet} onChange={(e) => maj("objet", e.target.value)} placeholder="Décris l'objet du marché" />)}

        <label className="case"><input type="checkbox" checked={form.hors_ppm} onChange={(e) => maj("hors_ppm", e.target.checked)} /> Marché hors PPM (non-conformité automatique)</label>
        <label className="case"><input type="checkbox" checked={form.marche_regularisation} onChange={(e) => maj("marche_regularisation", e.target.checked)} /> Marché de régularisation (non-conformité automatique)</label>

        {erreurServeur && <div className="alerte alerte-erreur">{erreurServeur}</div>}
        <div className="form-actions">
          <button className="btn" type="submit" disabled={envoi}>{envoi ? "Enregistrement…" : "Enregistrer"}</button>
          <button className="btn btn-secondaire" type="button" onClick={onAnnuler}>Annuler</button>
        </div>
      </form>
    </>
  );
}
