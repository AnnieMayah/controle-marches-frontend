import { useEffect, useState } from "react";
import { getEntites } from "../services/entites";
import { getNatures, getModesPassation } from "../services/reference";
import { creerMarche, modifierMarche } from "../services/marches";
import { getPrmp } from "../services/prmp";
import { formaterErreur } from "../utils/erreurs";
import { getObjets } from "../services/objets";

export default function FormMarche({ marche, onTermine, onAnnuler }) {
  const [entites, setEntites] = useState([]);
  const [natures, setNatures] = useState([]);
  const [modes, setModes] = useState([]);
  const [prmps, setPrmps] = useState([]);
  const [objets, setObjets] = useState([]);
  const [form, setForm] = useState({
    reference: marche?.reference || "", objet: marche?.objet || "",
    id_entite: marche?.id_entite || "", id_prmp: marche?.id_prmp || "", id_objet: marche?.id_objet || "", id_nature: marche?.id_nature || "", id_mode_passation: marche?.id_mode_passation || "",
    montant: marche?.montant ?? "", titulaire: marche?.titulaire || "",
    annee_exercice: marche?.annee_exercice || new Date().getFullYear(),
    hors_ppm: marche?.hors_ppm || false, marche_regularisation: marche?.marche_regularisation || false,
    numero_saisie: marche?.numero_saisie || "", direction_service: marche?.direction_service || "",
    forme_contrat: marche?.forme_contrat || "", montant_min: marche?.montant_min ?? "",
    montant_max: marche?.montant_max ?? "", montant_tef: marche?.montant_tef ?? "",
    forme_prix: marche?.forme_prix || "", delai_execution: marche?.delai_execution || "",
    financement: marche?.financement || "", date_signature: marche?.date_signature || "",
    date_approbation: marche?.date_approbation || "", date_notification: marche?.date_notification || "",
  });
  const [erreurs, setErreurs] = useState({});
  const [erreurServeur, setErreurServeur] = useState(null);
  const [envoi, setEnvoi] = useState(false);
  const maj = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => { getEntites().then(setEntites); getNatures().then(setNatures); getModesPassation().then(setModes); getObjets().then(setObjets);}, []);
  useEffect(() => {
    if (!form.id_entite) { setPrmps([]); return; }
    getPrmp(form.id_entite).then(setPrmps).catch(() => setPrmps([]));
  }, [form.id_entite]);
  const soumettre = async (e) => {
    e.preventDefault();
    const err = {};
    if (!form.reference.trim()) err.reference = "La référence est obligatoire.";
    if (!form.id_objet && !form.objet.trim()) err.id_objet = "Choisis l'objet du marché.";
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
      id_mode_passation: Number(form.id_mode_passation), montant: Number(form.montant), annee_exercice: annee,
      id_prmp: form.id_prmp ? Number(form.id_prmp) : null, id_objet: form.id_objet ? Number(form.id_objet) : null };
    try {
      if (marche) await modifierMarche(marche.id, donnees); else await creerMarche(donnees);
      onTermine(marche ? "Marché modifié." : "Marché créé.");
    } catch (ex) { setErreurServeur(formaterErreur(ex)); setEnvoi(false); }
  };

  const choisirObjet = (id) => {
    const o = objets.find((x) => String(x.id) === String(id));
    setForm((f) => ({ ...f, id_objet: id, objet: o ? o.libelle : "" }));
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
            <select className={classe("id_entite")} value={form.id_entite} onChange={(e) => setForm((f) => ({ ...f, id_entite: e.target.value, id_prmp: "" }))}>
              <option value="">Sélectionner une entité</option>
              {entites.map((en) => <option key={en.id} value={en.id}>{en.nom}</option>)}
            </select>))}
            {champ("id_prmp", "PRMP", (
            <select className="input" value={form.id_prmp} onChange={(e) => maj("id_prmp", e.target.value)} disabled={!form.id_entite}>
              <option value="">{form.id_entite ? "Aucune" : "Choisis d'abord une entité"}</option>
              {prmps.map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}
            </select>), false)}
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
       
          {champ("numero_saisie", "Numéro de saisie", <input className="input" value={form.numero_saisie} onChange={(e) => maj("numero_saisie", e.target.value)} />, false)}
          {champ("direction_service", "Direction / Service", <input className="input" value={form.direction_service} onChange={(e) => maj("direction_service", e.target.value)} />, false)}
          {champ("forme_contrat", "Forme du contrat", (
            <select className="input" value={form.forme_contrat} onChange={(e) => maj("forme_contrat", e.target.value)}>
              <option value="">—</option><option value="QUANTITE_FIXE">À quantité fixe</option><option value="COMMANDES">À commandes</option>
            </select>), false)}
          {champ("forme_prix", "Forme du prix", (
            <select className="input" value={form.forme_prix} onChange={(e) => maj("forme_prix", e.target.value)}>
              <option value="">—</option><option value="UNITAIRE">Unitaire</option><option value="FORFAITAIRE">Forfaitaire</option>
            </select>), false)}
          {champ("montant_min", "Montant minimum (Ar)", <input className="input" type="number" min="0" value={form.montant_min} onChange={(e) => maj("montant_min", e.target.value)} />, false)}
          {champ("montant_max", "Montant maximum (Ar)", <input className="input" type="number" min="0" value={form.montant_max} onChange={(e) => maj("montant_max", e.target.value)} />, false)}
          {champ("montant_tef", "Montant du TEF (Ar)", <input className="input" type="number" min="0" value={form.montant_tef} onChange={(e) => maj("montant_tef", e.target.value)} />, false)}
          {champ("delai_execution", "Délai d'exécution / livraison", <input className="input" value={form.delai_execution} onChange={(e) => maj("delai_execution", e.target.value)} />, false)}
          {champ("financement", "Financement", <input className="input" value={form.financement} onChange={(e) => maj("financement", e.target.value)} />, false)}
          {champ("date_signature", "Date de signature", <input className="input" type="date" value={form.date_signature} onChange={(e) => maj("date_signature", e.target.value)} />, false)}
          {champ("date_approbation", "Date d'approbation", <input className="input" type="date" value={form.date_approbation} onChange={(e) => maj("date_approbation", e.target.value)} />, false)}
          {champ("date_notification", "Date de notification", <input className="input" type="date" value={form.date_notification} onChange={(e) => maj("date_notification", e.target.value)} />, false)}
        
        </div>
        {champ("id_objet", "Objet du marché", (
  <>
    <select className={classe("id_objet")} value={form.id_objet} onChange={(e) => choisirObjet(e.target.value)}>
      <option value="">Sélectionner un objet</option>
      {objets.map((o) => <option key={o.id} value={o.id}>{o.compte} — {o.libelle}</option>)}
    </select>
    {!form.id_objet && form.objet && <div className="indication">Objet actuel (ancien format) : {form.objet}</div>}
  </>))}

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
