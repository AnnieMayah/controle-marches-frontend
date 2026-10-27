import { useEffect, useState } from "react";
import Icone from "../components/ui/Icone";
import { Avancement } from "./Controles";
import { getControles } from "../services/controles";
import { formaterErreur } from "../utils/erreurs";
import { formatDate, phaseControle, statutControle } from "../utils/format";

const PHASES = [
  { id: "demarrer", titre: "À démarrer", aide: "Aucune étape notée" },
  { id: "analyse", titre: "En analyse", aide: "Notation en cours" },
  { id: "valider", titre: "À valider", aide: "7 étapes notées" },
  { id: "valide", titre: "Validés", aide: "Contrôle clôturé" },
];
const BAREME = [
  [0, "Importantes irrégularités ou anomalies (en nombre)"], [1, "Existence d'irrégularités ou d'anomalies"],
  [2, "Généralement acceptable"], [3, "Acceptable"], [4, "Excellente maîtrise"],
];

export default function Workflow({ naviguer }) {
  const [controles, setControles] = useState([]);
  const [phase, setPhase] = useState("");
  const [erreur, setErreur] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    getControles().then(setControles).catch((e) => setErreur(formaterErreur(e))).finally(() => setChargement(false));
  }, []);

  const compte = (p) => controles.filter((c) => phaseControle(c) === p).length;
  const affiches = controles.filter((c) => (phase ? phaseControle(c) === phase : phaseControle(c) !== "valide"));

  return (
    <>
      <div className="page-header"><div><h1>Workflow de contrôle</h1><p>Suivez l'avancement des contrôles, de la collecte à la validation.</p></div></div>
      {erreur && <div className="alerte alerte-erreur">{erreur}</div>}

      <div className="card">
        <div className="stepper">
          {PHASES.map((p, i) => (
            <div key={p.id} className={`step ${phase === p.id ? "actif" : ""}`} style={{ cursor: "pointer" }}
                 onClick={() => setPhase(phase === p.id ? "" : p.id)} title="Cliquer pour filtrer">
              <div className="step-rond">{i + 1}</div>
              <div className="step-titre">{p.titre}</div>
              <div className="step-nb">{compte(p.id)} contrôle{compte(p.id) > 1 ? "s" : ""}</div>
            </div>
          ))}
        </div>

        <div className="card-entete"><h3>{phase ? PHASES.find((p) => p.id === phase).titre : "Contrôles en cours"}</h3>
          {phase && <button className="lien-voir" onClick={() => setPhase("")}>Réinitialiser le filtre</button>}</div>

        {chargement ? <p>Chargement…</p> : affiches.length === 0 ? <div className="vide">Aucun contrôle dans cette phase.</div> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>N°</th><th>Établissement</th><th>Marché</th><th>Date</th><th>Avancement</th><th>Statut</th><th className="num">Actions</th></tr></thead>
              <tbody>
                {affiches.map((c) => {
                  const s = statutControle(c);
                  return (
                    <tr key={c.id}>
                      <td className="nowrap">{c.reference}</td><td>{c.entite}</td><td>{c.reference_marche}</td><td>{formatDate(c.date_controle)}</td>
                      <td><Avancement c={c} /></td><td><span className={`badge ${s.classe}`}>{s.label}</span></td>
                      <td><div className="actions"><button className="btn-icone" title="Ouvrir" onClick={() => naviguer("detail-controle", { idControle: c.id })}><Icone nom="oeil" /></button></div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-entete"><h3>Barème de notation par étape</h3></div>
        <div className="table-wrap">
          <table className="table"><tbody>
            {BAREME.map(([n, t]) => <tr key={n}><td style={{ width: 60 }}><span className="badge badge-info">{n}</span></td><td>{t}</td></tr>)}
          </tbody></table>
        </div>
        <p className="echelle">Un contrôle est conforme si la moyenne des notes est ≥ 2. Un marché hors PPM, de régularisation, ou comportant une irrégularité qui impacte l'attribution est automatiquement non conforme.</p>
      </div>
    </>
  );
}
