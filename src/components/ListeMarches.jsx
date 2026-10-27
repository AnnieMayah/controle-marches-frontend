import { useEffect, useState } from "react";
import { getMarches } from "../services/marches";

export default function ListeMarches() {
  const [marches, setMarches] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    getMarches()
      .then((data) => setMarches(data))
      .catch((err) => setErreur(err.message))
      .finally(() => setChargement(false));
  }, []);

  return (
    <div className="card">
      <h3>Liste des marchés</h3>

      {chargement && <p>Chargement…</p>}
      {erreur && <p className="alerte alerte-erreur">Erreur : {erreur} (le backend Flask tourne-t-il ?)</p>}

      {!chargement && !erreur && marches.length === 0 && (
        <p>Aucun marché enregistré pour le moment.</p>
      )}

      {!chargement && marches.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Référence</th><th>Objet</th><th>Entité</th><th>Nature</th>
                <th>Mode de passation</th><th>Montant (Ar)</th>
              </tr>
            </thead>
            <tbody>
              {marches.map((m) => (
                <tr key={m.id}>
                  <td>{m.reference}</td>
                  <td>{m.objet}</td>
                  <td>{m.entite}</td>
                  <td>{m.nature}</td>
                  <td>{m.mode_passation}</td>
                  <td>{m.montant.toLocaleString("fr-FR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
