import { useEffect, useState } from "react";
import Icone from "../components/ui/Icone";
import Pagination from "../components/ui/Pagination";
import { getControles } from "../services/controles";
import { urlRapportPdf, urlRapportGlobal } from "../services/divers";
import { formaterErreur } from "../utils/erreurs";
import { exporterCSV, formatDate, statutControle } from "../utils/format";

const TAILLE_PAGE = 8;

function RapportGlobal() {
  const [p, setP] = useState({ annee: "", debut: "", fin: "", region: "" });
  const maj = (k) => (e) => setP({ ...p, [k]: e.target.value });
  return (
    <div className="card">
      <div className="card-entete"><h3>Rapport global de mission (Word)</h3><span className="badge badge-info">Format .docx</span></div>
      <p style={{ color: "var(--text)" }}>Génère le grand rapport de tous les contrôles <strong>validés</strong>, au format des rapports de la Commission : couverture, méthodologie,
        tableaux par nature et par mode de passation, camemberts, histogrammes de conformité, irrégularités, recommandations, conclusion et annexes.
        Les passages à rédiger sont surlignés « [À compléter] ».</p>
      <div className="form-grille">
        <div className="champ"><label htmlFor="g-annee">Exercice (année)</label><input id="g-annee" className="input" type="number" placeholder="Tous" value={p.annee} onChange={maj("annee")} /></div>
        <div className="champ"><label htmlFor="g-debut">Contrôles du</label><input id="g-debut" className="input" type="date" value={p.debut} onChange={maj("debut")} /></div>
        <div className="champ"><label htmlFor="g-fin">au</label><input id="g-fin" className="input" type="date" value={p.fin} onChange={maj("fin")} /></div>
        <div className="champ"><label htmlFor="g-region">Région (couverture)</label><input id="g-region" className="input" placeholder="Ex : Haute Matsiatra" value={p.region} onChange={maj("region")} /></div>
      </div>
      <a className="btn" href={urlRapportGlobal(p)} target="_blank" rel="noreferrer"><Icone nom="telecharger" /> Générer le rapport Word</a>
    </div>
  );
}

export default function Rapports({ naviguer }) {
  const [controles, setControles] = useState([]);
  const [debut, setDebut] = useState("");
  const [fin, setFin] = useState("");
  const [nature, setNature] = useState("");
  const [page, setPage] = useState(1);
  const [erreur, setErreur] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => { getControles().then(setControles).catch((e) => setErreur(formaterErreur(e))).finally(() => setChargement(false)); }, []);

  // un rapport existe dès qu'au moins une étape a été notée
  const rapports = controles.filter((c) => c.nb_etapes_notees > 0).filter((c) =>
    (!nature || c.nature === nature) && (!debut || c.date_controle >= debut) && (!fin || c.date_controle <= fin));
  const natures = [...new Set(controles.map((c) => c.nature))];
  const visibles = rapports.slice((page - 1) * TAILLE_PAGE, page * TAILLE_PAGE);

  const exporter = () => exporterCSV("rapports_controles.csv",
    ["Rapport", "Contrôle", "Marché", "Entité", "Nature", "Date", "Note globale", "Statut"],
    rapports.map((c) => [`RPT-${c.reference}`, c.reference, c.reference_marche, c.entite, c.nature, c.date_controle, c.note_globale ?? "", statutControle(c).label]));

  return (
    <>
      <div className="page-header">
        <div><h1>Rapports</h1><p>Consultez et téléchargez les rapports de contrôle.</p></div>
        <button className="btn btn-secondaire" onClick={exporter} disabled={rapports.length === 0}><Icone nom="telecharger" /> Exporter en CSV (Excel)</button>
      </div>
      {erreur && <div className="alerte alerte-erreur">{erreur}</div>}

      <RapportGlobal />

      <div className="card">
        <div className="barre-filtres">
          <label style={{ fontSize: 12.5, color: "var(--text-muted)" }}>Période du</label>
          <input className="input" type="date" value={debut} onChange={(e) => { setDebut(e.target.value); setPage(1); }} />
          <label style={{ fontSize: 12.5, color: "var(--text-muted)" }}>au</label>
          <input className="input" type="date" value={fin} onChange={(e) => { setFin(e.target.value); setPage(1); }} />
          <select className="input" value={nature} onChange={(e) => { setNature(e.target.value); setPage(1); }}>
            <option value="">Tous les types</option>{natures.map((n) => <option key={n}>{n}</option>)}
          </select>
        </div>

        {chargement ? <p>Chargement…</p> : rapports.length === 0 ? <div className="vide">Aucun rapport disponible pour ces critères.</div> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>N°</th><th>Titre</th><th>Entité</th><th>Type</th><th>Date</th><th>Statut</th><th className="num">Actions</th></tr></thead>
              <tbody>
                {visibles.map((c) => {
                  const s = statutControle(c);
                  return (
                    <tr key={c.id}>
                      <td className="nowrap">RPT-{String(c.id).padStart(3, "0")}</td><td>Rapport de contrôle — {c.reference_marche}</td><td>{c.entite}</td><td>{c.nature}</td>
                      <td>{formatDate(c.date_controle)}</td><td><span className={`badge ${s.classe}`}>{s.label}</span></td>
                      <td><div className="actions">
                        <button className="btn-icone" title="Voir le contrôle" onClick={() => naviguer("detail-controle", { idControle: c.id })}><Icone nom="oeil" /></button>
                        <a className="btn-icone" title="Télécharger le PDF" href={urlRapportPdf(c.id_marche)} target="_blank" rel="noreferrer"><Icone nom="telecharger" /></a>
                      </div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pagination total={rapports.length} page={page} taille={TAILLE_PAGE} onChange={setPage} />
      </div>
    </>
  );
}
