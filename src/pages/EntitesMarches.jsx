import { useCallback, useEffect, useState } from "react";
import Icone from "../components/ui/Icone";
import Pagination from "../components/ui/Pagination";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import FormEntite from "../components/FormEntite";
import FormMarche from "../components/FormMarche";
import { useAuth } from "../context/AuthContext";
import { getEntites, supprimerEntite } from "../services/entites";
import { getMarches, supprimerMarche } from "../services/marches";
import { creerOuRecupererControle } from "../services/controles";
import { formaterErreur } from "../utils/erreurs";
import { formatMontant } from "../utils/format";

const TAILLE_PAGE = 8;

export default function EntitesMarches({ params, naviguer }) {
  const { droits } = useAuth();
  const [onglet, setOnglet] = useState(params.onglet || "entites");
  const [vue, setVue] = useState("liste");
  const [edition, setEdition] = useState(null);
  const [entites, setEntites] = useState([]);
  const [marches, setMarches] = useState([]);
  const [recherche, setRecherche] = useState(params.recherche || "");
  const [filtre, setFiltre] = useState("");
  const [page, setPage] = useState(1);
  const [aSupprimer, setASupprimer] = useState(null);
  const [message, setMessage] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [chargement, setChargement] = useState(true);

  const charger = useCallback(() => {
    Promise.all([getEntites(), getMarches()])
      .then(([e, m]) => { setEntites(e); setMarches(m); })
      .catch((err) => setErreur(formaterErreur(err)))
      .finally(() => setChargement(false));
  }, []);
  useEffect(() => { charger(); }, [charger]);
  useEffect(() => { if (!message) return; const t = setTimeout(() => setMessage(null), 4000); return () => clearTimeout(t); }, [message]);

  const changerOnglet = (o) => { setOnglet(o); setFiltre(""); setRecherche(""); setPage(1); };
  const termine = (msg) => { setVue("liste"); setEdition(null); setMessage(msg); charger(); };

  if (vue === "form-entite") return <FormEntite entite={edition} onTermine={termine} onAnnuler={() => { setVue("liste"); setEdition(null); }} />;
  if (vue === "form-marche") return <FormMarche marche={edition} onTermine={termine} onAnnuler={() => { setVue("liste"); setEdition(null); }} />;

  const q = recherche.trim().toLowerCase();
  const nbMarchesParEntite = (id) => marches.filter((m) => m.id_entite === id).length;

  const entitesFiltrees = entites.filter((e) =>
    (!filtre || e.type === filtre) && (!q || `${e.nom} ${e.region || ""}`.toLowerCase().includes(q)));
  const marchesFiltres = marches.filter((m) =>
    (!filtre || m.nature === filtre) && (!q || `${m.reference} ${m.objet} ${m.entite} ${m.titulaire || ""}`.toLowerCase().includes(q)));

  const liste = onglet === "entites" ? entitesFiltrees : marchesFiltres;
  const visibles = liste.slice((page - 1) * TAILLE_PAGE, page * TAILLE_PAGE);

  const confirmerSuppression = async () => {
    const cible = aSupprimer; setASupprimer(null); setErreur(null);
    try {
      if (cible.type === "entite") await supprimerEntite(cible.id); else await supprimerMarche(cible.id);
      setMessage(cible.type === "entite" ? "Entité supprimée." : "Marché supprimé.");
      charger();
    } catch (err) { setErreur(formaterErreur(err)); }
  };

  const controler = async (marche) => {
    try { const c = await creerOuRecupererControle(marche.id); naviguer("detail-controle", { idControle: c.id }); }
    catch (err) { setErreur(formaterErreur(err)); }
  };

  const natures = [...new Set(marches.map((m) => m.nature))];

  return (
    <>
      <div className="page-header">
        <div><h1>Entités &amp; Marchés</h1><p>Liste des entités et des marchés publics à contrôler.</p></div>
        {droits.gererDonnees && (
          <button className="btn" onClick={() => { setEdition(null); setVue(onglet === "entites" ? "form-entite" : "form-marche"); }}>
            <Icone nom="plus" /> {onglet === "entites" ? "Ajouter une entité" : "Ajouter un marché"}
          </button>
        )}
      </div>

      {message && <div className="alerte alerte-succes">{message}</div>}
      {erreur && <div className="alerte alerte-erreur">{erreur}</div>}

      <div className="card">
        <div className="tabs">
          <button className={`tab ${onglet === "entites" ? "actif" : ""}`} onClick={() => changerOnglet("entites")}>Entités ({entites.length})</button>
          <button className={`tab ${onglet === "marches" ? "actif" : ""}`} onClick={() => changerOnglet("marches")}>Marchés ({marches.length})</button>
        </div>

        <div className="barre-filtres">
          <input className="input" style={{ minWidth: 240 }} placeholder="Filtrer…" value={recherche} onChange={(e) => { setRecherche(e.target.value); setPage(1); }} />
          {onglet === "entites" ? (
            <select className="input" value={filtre} onChange={(e) => { setFiltre(e.target.value); setPage(1); }}>
              <option value="">Tous les types</option><option value="STD">STD</option><option value="CTD">CTD</option><option value="EPN">EPN</option>
            </select>
          ) : (
            <select className="input" value={filtre} onChange={(e) => { setFiltre(e.target.value); setPage(1); }}>
              <option value="">Toutes les natures</option>{natures.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          )}
        </div>

        {chargement ? <p>Chargement…</p> : liste.length === 0 ? <div className="vide">Aucun résultat.</div> : (
          <div className="table-wrap">
            {onglet === "entites" ? (
              <table className="table">
                <thead><tr><th>N°</th><th>Nom de l'entité</th><th>Type</th><th>Région</th><th className="num">Nb marchés</th><th className="num">Actions</th></tr></thead>
                <tbody>
                  {visibles.map((e) => (
                    <tr key={e.id}>
                      <td className="nowrap">ENT-{String(e.id).padStart(3, "0")}</td><td>{e.nom}</td>
                      <td><span className="badge badge-info">{e.type}</span></td><td>{e.region || "—"}</td>
                      <td className="num">{nbMarchesParEntite(e.id)}</td>
                      <td><div className="actions">
                        <button className="btn-icone" title="Voir ses marchés" onClick={() => { setOnglet("marches"); setRecherche(e.nom); setFiltre(""); setPage(1); }}><Icone nom="oeil" /></button>
                        {droits.gererDonnees && <>
                          <button className="btn-icone" title="Modifier" onClick={() => { setEdition(e); setVue("form-entite"); }}><Icone nom="crayon" /></button>
                          <button className="btn-icone danger" title="Supprimer" onClick={() => setASupprimer({ type: "entite", id: e.id, libelle: e.nom })}><Icone nom="corbeille" /></button>
                        </>}
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="table">
                <thead><tr><th>Référence</th><th>Objet</th><th>Entité</th><th>Nature</th><th>Mode de passation</th><th className="num">Montant</th><th>Année</th><th>Particularité</th><th className="num">Actions</th></tr></thead>
                <tbody>
                  {visibles.map((m) => (
                    <tr key={m.id}>
                      <td className="nowrap">{m.reference}</td><td style={{ maxWidth: 220 }}>{m.objet}</td><td>{m.entite}</td><td>{m.nature}</td><td>{m.mode_passation}</td>
                      <td className="num">{formatMontant(m.montant)}</td><td>{m.annee_exercice}</td>
                      <td>{m.hors_ppm && <span className="badge badge-danger">Hors PPM</span>} {m.marche_regularisation && <span className="badge badge-warning">Régularisation</span>}</td>
                      <td><div className="actions">
                        {droits.noter && <button className="btn-icone" title="Ouvrir / démarrer le contrôle" onClick={() => controler(m)}><Icone nom="controles" /></button>}
                        {droits.gererDonnees && <>
                          <button className="btn-icone" title="Modifier" onClick={() => { setEdition(m); setVue("form-marche"); }}><Icone nom="crayon" /></button>
                          <button className="btn-icone danger" title="Supprimer" onClick={() => setASupprimer({ type: "marche", id: m.id, libelle: m.reference })}><Icone nom="corbeille" /></button>
                        </>}
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        <Pagination total={liste.length} page={page} taille={TAILLE_PAGE} onChange={setPage} />
      </div>

      <ConfirmDialog ouvert={!!aSupprimer} titre="Confirmer la suppression"
        message={aSupprimer?.type === "marche"
          ? `Supprimer le marché « ${aSupprimer?.libelle} » ? Ses contrôles et documents rattachés seront aussi supprimés. Cette action est irréversible.`
          : `Supprimer l'entité « ${aSupprimer?.libelle} » ? Cette action est irréversible.`}
        onConfirmer={confirmerSuppression} onAnnuler={() => setASupprimer(null)} />
    </>
  );
}
