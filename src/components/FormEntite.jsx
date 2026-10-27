import { useState } from "react";
import { creerEntite, modifierEntite } from "../services/entites";
import { formaterErreur } from "../utils/erreurs";

export default function FormEntite({ entite, onTermine, onAnnuler }) {
  const [form, setForm] = useState({ nom: entite?.nom || "", type: entite?.type || "", region: entite?.region || "" });
  const [erreurs, setErreurs] = useState({});
  const [erreurServeur, setErreurServeur] = useState(null);
  const [envoi, setEnvoi] = useState(false);
  const maj = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const soumettre = async (e) => {
    e.preventDefault();
    const err = {};
    if (!form.nom.trim()) err.nom = "Le nom de l'entité est obligatoire.";
    if (!form.type) err.type = "Choisis un type d'entité.";
    setErreurs(err);
    if (Object.keys(err).length) return;
    setEnvoi(true); setErreurServeur(null);
    try {
      if (entite) await modifierEntite(entite.id, form); else await creerEntite(form);
      onTermine(entite ? "Entité modifiée." : "Entité créée.");
    } catch (ex) { setErreurServeur(formaterErreur(ex)); setEnvoi(false); }
  };

  return (
    <>
      <button className="retour" onClick={onAnnuler}>‹ Retour</button>
      <div className="page-header"><h1>{entite ? "Modifier l'entité" : "Ajouter une entité"}</h1></div>
      <form className="card" onSubmit={soumettre} noValidate>
        <h3 style={{ marginBottom: 14 }}>Informations générales</h3>
        <div className="form-grille">
          <div className="champ">
            <label>Nom de l'entité <span className="requis">*</span></label>
            <input className={`input ${erreurs.nom ? "invalide" : ""}`} value={form.nom} onChange={(e) => maj("nom", e.target.value)} placeholder="Ex : Ministère de l'Éducation" />
            {erreurs.nom && <div className="champ-erreur">{erreurs.nom}</div>}
          </div>
          <div className="champ">
            <label>Type <span className="requis">*</span></label>
            <select className={`input ${erreurs.type ? "invalide" : ""}`} value={form.type} onChange={(e) => maj("type", e.target.value)}>
              <option value="">Sélectionner un type</option>
              <option value="STD">STD — Service Technique Déconcentré</option>
              <option value="CTD">CTD — Collectivité Territoriale Décentralisée</option>
              <option value="EPN">EPN — Établissement Public National</option>
            </select>
            {erreurs.type && <div className="champ-erreur">{erreurs.type}</div>}
          </div>
          <div className="champ">
            <label>Région</label>
            <input className="input" value={form.region} onChange={(e) => maj("region", e.target.value)} placeholder="Ex : Haute Matsiatra" />
          </div>
        </div>
        {erreurServeur && <div className="alerte alerte-erreur">{erreurServeur}</div>}
        <div className="form-actions">
          <button className="btn" type="submit" disabled={envoi}>{envoi ? "Enregistrement…" : "Enregistrer"}</button>
          <button className="btn btn-secondaire" type="button" onClick={onAnnuler}>Annuler</button>
        </div>
      </form>
    </>
  );
}
