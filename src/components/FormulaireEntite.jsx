import { useState } from "react";
import { creerEntite } from "../services/entites";

export default function FormulaireEntite({ onEntiteCreee }) {
  const [nom, setNom] = useState("");
  const [type, setType] = useState("STD");
  const [region, setRegion] = useState("");
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      const entite = await creerEntite({ nom, type, region });
      setMessage({ ok: true, texte: `Entité « ${entite.nom} » créée.` });
      setNom("");
      setRegion("");
      if (onEntiteCreee) onEntiteCreee(entite);
    } catch (err) {
      setMessage({ ok: false, texte: "Erreur : " + err.message });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h3>Ajouter une entité</h3>

      <div className="form-row">
        <div className="champ">
          <label>Nom de l'entité</label>
          <input className="input" value={nom} onChange={(e) => setNom(e.target.value)} required />
        </div>

        <div className="champ" style={{ maxWidth: "220px" }}>
          <label>Type</label>
          <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="STD">STD — Service Technique Déconcentré</option>
            <option value="CTD">CTD — Collectivité Territoriale Décentralisée</option>
            <option value="EPN">EPN — Établissement Public National</option>
          </select>
        </div>

        <div className="champ" style={{ maxWidth: "200px" }}>
          <label>Région</label>
          <input className="input" value={region} onChange={(e) => setRegion(e.target.value)} />
        </div>
      </div>

      <button type="submit" className="btn">Créer l'entité</button>

      {message && (
        <p className={`message-inline ${message.ok ? "message-ok" : "message-erreur"}`}>{message.texte}</p>
      )}
    </form>
  );
}
