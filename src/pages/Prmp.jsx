import { useCallback, useEffect, useState } from "react";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import Icone from "../components/ui/Icone";
import { useAuth } from "../context/AuthContext";
import { formaterErreur } from "../utils/erreurs";
import { getPrmp, getEntitesPrmp, creerPrmp, modifierPrmp, supprimerPrmp } from "../services/prmp";

const VIDE = { id: null, nom: "", id_entite: "" };

export default function Prmp() {
  const { droits } = useAuth();
  const peutGerer = droits.gererDonnees;

  const [liste, setListe] = useState([]);
  const [entites, setEntites] = useState([]);
  const [filtre, setFiltre] = useState("");
  const [form, setForm] = useState(VIDE);
  const [erreur, setErreur] = useState(null);
  const [succes, setSucces] = useState(null);
  const [aSupprimer, setASupprimer] = useState(null);

  const charger = useCallback(async () => {
    try {
      const [p, e] = await Promise.all([getPrmp(), getEntitesPrmp()]);
      setListe(p); setEntites(e);
    } catch (err) { setErreur(formaterErreur(err)); }
  }, []);
  useEffect(() => { charger(); }, [charger]);
  useEffect(() => { if (!succes) return; const t = setTimeout(() => setSucces(null), 3500); return () => clearTimeout(t); }, [succes]);

  const enregistrer = async (e) => {
    e.preventDefault(); setErreur(null);
    if (!form.nom.trim()) { setErreur("Le nom de la PRMP est obligatoire."); return; }
    if (!form.id_entite) { setErreur("Choisis l'entité de cette PRMP."); return; }
    const donnees = { nom: form.nom.trim(), id_entite: Number(form.id_entite) };
    try {
      if (form.id) await modifierPrmp(form.id, donnees); else await creerPrmp(donnees);
      setSucces(form.id ? "PRMP modifiée." : "PRMP ajoutée.");
      setForm(VIDE);
      await charger();
    } catch (err) { setErreur(formaterErreur(err)); }
  };

  const confirmerSuppression = async () => {
    const cible = aSupprimer; setASupprimer(null); setErreur(null);
    try { await supprimerPrmp(cible.id); setSucces("PRMP supprimée."); await charger(); }
    catch (err) { setErreur(formaterErreur(err)); }
  };

  const affichees = filtre ? liste.filter((p) => String(p.id_entite) === filtre) : liste;

  return (
    <>
      <div className="page-header"><h1>PRMP</h1></div>

      {succes && <div className="alerte alerte-succes">{succes}</div>}
      {erreur && <div className="alerte alerte-erreur">{erreur}</div>}

      {peutGerer && (
        <form className="card" onSubmit={enregistrer} noValidate>
          <div className="card-entete"><h3>{form.id ? "Modifier la PRMP" : "Ajouter une PRMP"}</h3></div>
          <div className="form-grille">
            <div className="champ"><label>Nom de la PRMP <span className="requis">*</span></label>
              <input className="input" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} placeholder="Ex : Rakoto Hery" /></div>
            <div className="champ"><label>Entité <span className="requis">*</span></label>
              <select className="input" value={form.id_entite} onChange={(e) => setForm({ ...form, id_entite: e.target.value })}>
                <option value="">Sélectionner une entité</option>
                {entites.map((x) => <option key={x.id} value={x.id}>{x.nom}</option>)}
              </select></div>
          </div>
          <div className="form-actions">
            <button className="btn" type="submit">{form.id ? "Enregistrer" : "Ajouter"}</button>
            {form.id && <button className="btn btn-secondaire" type="button" onClick={() => { setForm(VIDE); setErreur(null); }}>Annuler</button>}
          </div>
        </form>
      )}

      <div className="card">
        <div className="card-entete">
          <h3>Liste des PRMP ({affichees.length})</h3>
          <select className="input" style={{ maxWidth: 320 }} value={filtre} onChange={(e) => setFiltre(e.target.value)}>
            <option value="">Toutes les entités</option>
            {entites.map((x) => <option key={x.id} value={x.id}>{x.nom}</option>)}
          </select>
        </div>
        {affichees.length === 0 ? <div className="vide">Aucune PRMP enregistrée.</div> : (
          <div className="table-wrap"><table className="table">
            <thead><tr><th>Nom</th><th>Entité</th><th>Marchés</th><th></th></tr></thead>
            <tbody>
              {affichees.map((p) => (
                <tr key={p.id}>
                  <td>{p.nom}</td><td>{p.entite}</td><td>{p.nb_marches}</td>
                  <td>{peutGerer && (
                    <div className="actions">
                      <button className="btn-icone" title="Modifier" onClick={() => { setForm({ id: p.id, nom: p.nom, id_entite: String(p.id_entite) }); setErreur(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}><Icone nom="crayon" /></button>
                      <button className="btn-icone danger" title="Supprimer" onClick={() => setASupprimer(p)}><Icone nom="corbeille" /></button>
                    </div>
                  )}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>

      <ConfirmDialog ouvert={!!aSupprimer} titre="Supprimer cette PRMP ?"
        message="Cette action est irréversible. Une PRMP rattachée à des marchés ne peut pas être supprimée."
        onConfirmer={confirmerSuppression} onAnnuler={() => setASupprimer(null)} />
    </>
  );
}