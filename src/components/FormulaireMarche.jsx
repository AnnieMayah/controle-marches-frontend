import { useEffect, useState } from "react";
import { getEntites } from "../services/entites";
import { getNatures, getModesPassation } from "../services/reference";
import { creerMarche } from "../services/marches";

const anneeCourante = new Date().getFullYear();

export default function FormulaireMarche({ onMarcheCree }) {
  const [entites, setEntites] = useState([]);
  const [natures, setNatures] = useState([]);
  const [modes, setModes] = useState([]);
  const [message, setMessage] = useState(null);

  const [form, setForm] = useState({
    reference: "", objet: "", id_entite: "", id_nature: "", id_mode_passation: "",
    montant: "", titulaire: "", annee_exercice: anneeCourante,
    hors_ppm: false, marche_regularisation: false,
  });

  useEffect(() => {
    getEntites().then(setEntites);
    getNatures().then(setNatures);
    getModesPassation().then(setModes);
  }, []);

  const majChamp = (champ, valeur) => setForm((f) => ({ ...f, [champ]: valeur }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      const marche = await creerMarche({
        ...form,
        id_entite: Number(form.id_entite),
        id_nature: Number(form.id_nature),
        id_mode_passation: Number(form.id_mode_passation),
        montant: Number(form.montant),
        annee_exercice: Number(form.annee_exercice),
      });
      setMessage({ ok: true, texte: `Marché « ${marche.reference} » créé.` });
      if (onMarcheCree) onMarcheCree(marche);
    } catch (err) {
      setMessage({ ok: false, texte: "Erreur : " + err.message });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h3>Ajouter un marché</h3>

      <div className="form-row">
        <div className="champ">
          <label>Référence</label>
          <input className="input" value={form.reference} onChange={(e) => majChamp("reference", e.target.value)} required />
        </div>
        <div className="champ" style={{ maxWidth: "140px" }}>
          <label>Année</label>
          <input className="input" type="number" value={form.annee_exercice} onChange={(e) => majChamp("annee_exercice", e.target.value)} required />
        </div>
      </div>

      <div className="champ">
        <label>Objet</label>
        <textarea className="input" rows={2} value={form.objet} onChange={(e) => majChamp("objet", e.target.value)} required />
      </div>

      <div className="champ">
        <label>Entité</label>
        <select className="input" value={form.id_entite} onChange={(e) => majChamp("id_entite", e.target.value)} required>
          <option value="">-- Choisir une entité --</option>
          {entites.map((ent) => <option key={ent.id} value={ent.id}>{ent.nom}</option>)}
        </select>
        {entites.length === 0 && <p style={{ fontSize: "12.5px", color: "var(--text-muted)", marginTop: "4px" }}>Crée d'abord une entité ci-dessus.</p>}
      </div>

      <div className="form-row">
        <div className="champ">
          <label>Nature</label>
          <select className="input" value={form.id_nature} onChange={(e) => majChamp("id_nature", e.target.value)} required>
            <option value="">-- Choisir --</option>
            {natures.map((n) => <option key={n.id} value={n.id}>{n.libelle}</option>)}
          </select>
        </div>
        <div className="champ">
          <label>Mode de passation</label>
          <select className="input" value={form.id_mode_passation} onChange={(e) => majChamp("id_mode_passation", e.target.value)} required>
            <option value="">-- Choisir --</option>
            {modes.map((m) => <option key={m.id} value={m.id}>{m.libelle}</option>)}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="champ">
          <label>Montant (Ar)</label>
          <input className="input" type="number" value={form.montant} onChange={(e) => majChamp("montant", e.target.value)} required />
        </div>
        <div className="champ">
          <label>Titulaire</label>
          <input className="input" value={form.titulaire} onChange={(e) => majChamp("titulaire", e.target.value)} />
        </div>
      </div>

      <div className="checkbox-ligne">
        <input type="checkbox" id="hors_ppm" checked={form.hors_ppm} onChange={(e) => majChamp("hors_ppm", e.target.checked)} />
        <label htmlFor="hors_ppm" style={{ margin: 0, textTransform: "none", fontWeight: 400 }}>Hors PPM</label>
      </div>
      <div className="checkbox-ligne">
        <input type="checkbox" id="regularisation" checked={form.marche_regularisation} onChange={(e) => majChamp("marche_regularisation", e.target.checked)} />
        <label htmlFor="regularisation" style={{ margin: 0, textTransform: "none", fontWeight: 400 }}>Marché de régularisation</label>
      </div>

      <button type="submit" className="btn" style={{ marginTop: "6px" }}>Créer le marché</button>

      {message && <p className={`message-inline ${message.ok ? "message-ok" : "message-erreur"}`}>{message.texte}</p>}
    </form>
  );
}
