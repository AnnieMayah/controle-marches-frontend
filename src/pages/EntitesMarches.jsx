import { useCallback, useEffect, useState } from "react";
import Icone from "../components/ui/Icone";
import Pagination from "../components/ui/Pagination";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import FormEntite from "../components/FormEntite";
import FormMarche from "../components/FormMarche";
import { useAuth } from "../context/AuthContext";
import { getEntites, supprimerEntite } from "../services/entites";
import { getMarches, supprimerMarche } from "../services/marches";
import { getPrmp, creerPrmp, modifierPrmp, supprimerPrmp } from "../services/prmp";
import { creerOuRecupererControle } from "../services/controles";
import { formaterErreur } from "../utils/erreurs";
import { formatDate, formatMontant } from "../utils/format";

const TAILLE_PAGE = 8;
const VIDE_PRMP = { id: null, nom: "", id_entite: "", email: "" };
const REGEX_EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const FORMES_CONTRAT = { QUANTITE_FIXE: "À quantité fixe", COMMANDES: "À commandes" };
const FORMES_PRIX = { UNITAIRE: "Unitaire", FORFAITAIRE: "Forfaitaire" };

export default function EntitesMarches({ params, naviguer }) {
  const { droits } = useAuth();
  const [onglet, setOnglet] = useState(params.onglet || "entites");
  const [vue, setVue] = useState("liste");
  const [edition, setEdition] = useState(null);
  const [entites, setEntites] = useState([]);
  const [prmps, setPrmps] = useState([]);
  const [marches, setMarches] = useState([]);
  const [recherche, setRecherche] = useState(params.recherche || "");
  const [filtre, setFiltre] = useState("");
  const [page, setPage] = useState(1);
  const [aSupprimer, setASupprimer] = useState(null);
  const [message, setMessage] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [detailMarche, setDetailMarche] = useState(null);
  const [formPrmp, setFormPrmp] = useState(VIDE_PRMP);

  const charger = useCallback(() => {
    Promise.all([getEntites(), getPrmp(), getMarches()])
      .then(([e, p, m]) => { setEntites(e); setPrmps(p); setMarches(m); })
      .catch((err) => setErreur(formaterErreur(err)))
      .finally(() => setChargement(false));
  }, []);
  useEffect(() => { charger(); }, [charger]);
  useEffect(() => { if (!message) return; const t = setTimeout(() => setMessage(null), 4000); return () => clearTimeout(t); }, [message]);

  const changerOnglet = (o) => { setOnglet(o); setFiltre(""); setRecherche(""); setPage(1); setFormPrmp(VIDE_PRMP); };
  const termine = (msg) => { setVue("liste"); setEdition(null); setMessage(msg); charger(); };

  if (vue === "form-entite") return <FormEntite entite={edition} onTermine={termine} onAnnuler={() => { setVue("liste"); setEdition(null); }} />;
  if (vue === "form-marche") return <FormMarche marche={edition} onTermine={termine} onAnnuler={() => { setVue("liste"); setEdition(null); }} />;

  const q = recherche.trim().toLowerCase();
  const nbMarchesParEntite = (id) => marches.filter((m) => m.id_entite === id).length;

  const entitesFiltrees = entites.filter((e) =>
    (!filtre || e.type === filtre) && (!q || `${e.nom} ${e.region || ""}`.toLowerCase().includes(q)));
  const prmpsFiltres = prmps.filter((p) =>
    (!filtre || String(p.id_entite) === filtre) && (!q || `${p.nom} ${p.entite} ${p.email || ""}`.toLowerCase().includes(q)));
  const marchesFiltres = marches.filter((m) =>
    (!filtre || m.nature === filtre) && (!q || `${m.reference} ${m.objet} ${m.entite} ${m.prmp || ""} ${m.titulaire || ""} ${m.compte || ""}`.toLowerCase().includes(q)));

  const liste = onglet === "entites" ? entitesFiltrees : onglet === "prmp" ? prmpsFiltres : marchesFiltres;
  const visibles = liste.slice((page - 1) * TAILLE_PAGE, page * TAILLE_PAGE);

  const enregistrerPrmp = async (e) => {
    e.preventDefault(); setErreur(null);
    if (!formPrmp.nom.trim()) { setErreur("Le nom de la PRMP est obligatoire."); return; }
    if (!formPrmp.id_entite) { setErreur("Choisis l'entité de cette PRMP."); return; }
    const email = formPrmp.email.trim();
    if (email && !REGEX_EMAIL.test(email)) { setErreur("L'adresse e-mail n'est pas valide."); return; }
    const donnees = { nom: formPrmp.nom.trim(), id_entite: Number(formPrmp.id_entite), email };
    try {
      if (formPrmp.id) await modifierPrmp(formPrmp.id, donnees); else await creerPrmp(donnees);
      setMessage(formPrmp.id ? "PRMP modifiée." : "PRMP ajoutée.");
      setFormPrmp(VIDE_PRMP);
      charger();
    } catch (err) { setErreur(formaterErreur(err)); }
  };

  const confirmerSuppression = async () => {
    const cible = aSupprimer; setASupprimer(null); setErreur(null);
    try {
      if (cible.type === "entite") await supprimerEntite(cible.id);
      else if (cible.type === "prmp") await supprimerPrmp(cible.id);
      else await supprimerMarche(cible.id);
      setMessage(cible.type === "entite" ? "Entité supprimée." : cible.type === "prmp" ? "PRMP supprimée." : "Marché supprimé.");
      charger();
    } catch (err) { setErreur(formaterErreur(err)); }
  };

  const controler = async (marche) => {
    try { const c = await creerOuRecupererControle(marche.id); naviguer("detail-controle", { idControle: c.id }); }
    catch (err) { setErreur(formaterErreur(err)); }
  };

  const natures = [...new Set(marches.map((m) => m.nature))];

  const messageSuppression = aSupprimer?.type === "marche"
    ? `Supprimer le marché « ${aSupprimer?.libelle} » ? Ses contrôles et documents rattachés seront aussi supprimés. Cette action est irréversible.`
    : aSupprimer?.type === "prmp"
    ? `Supprimer la PRMP « ${aSupprimer?.libelle} » ? Cette action est irréversible. Une PRMP rattachée à des marchés ne peut pas être supprimée.`
    : `Supprimer l'entité « ${aSupprimer?.libelle} » ? Cette action est irréversible.`;

  return (
    <>
      <div className="page-header">
        <div><h1>Entités &amp; Marchés</h1><p>Liste des entités, des PRMP et des marchés publics à contrôler.</p></div>
        {droits.gererDonnees && onglet !== "prmp" && (
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
          <button className={`tab ${onglet === "prmp" ? "actif" : ""}`} onClick={() => changerOnglet("prmp")}>PRMP ({prmps.length})</button>
          <button className={`tab ${onglet === "marches" ? "actif" : ""}`} onClick={() => changerOnglet("marches")}>Marchés ({marches.length})</button>
        </div>

        {onglet === "prmp" && droits.gererDonnees && (
          <form onSubmit={enregistrerPrmp} noValidate style={{ marginBottom: 16 }}>
            <h3 style={{ marginBottom: 12 }}>{formPrmp.id ? "Modifier la PRMP" : "Ajouter une PRMP"}</h3>
            <div className="form-grille">
              <div className="champ"><label>Nom de la PRMP <span className="requis">*</span></label>
                <input className="input" value={formPrmp.nom} onChange={(e) => setFormPrmp({ ...formPrmp, nom: e.target.value })} placeholder="Ex : Rakoto Hery" /></div>
              <div className="champ"><label>Entité <span className="requis">*</span></label>
                <select className="input" value={formPrmp.id_entite} onChange={(e) => setFormPrmp({ ...formPrmp, id_entite: e.target.value })}>
                  <option value="">Sélectionner une entité</option>
                  {entites.map((x) => <option key={x.id} value={x.id}>{x.nom}</option>)}
                </select></div>
              <div className="champ"><label>E-mail</label>
                <input className="input" type="email" value={formPrmp.email} onChange={(e) => setFormPrmp({ ...formPrmp, email: e.target.value })} placeholder="Ex : rakoto.hery@exemple.mg" /></div>
            </div>
            <div className="form-actions">
              <button className="btn" type="submit">{formPrmp.id ? "Enregistrer" : "Ajouter"}</button>
              {formPrmp.id && <button className="btn btn-secondaire" type="button" onClick={() => { setFormPrmp(VIDE_PRMP); setErreur(null); }}>Annuler</button>}
            </div>
          </form>
        )}

        <div className="barre-filtres">
          <input className="input" style={{ minWidth: 240 }} placeholder="Filtrer…" value={recherche} onChange={(e) => { setRecherche(e.target.value); setPage(1); }} />
          {onglet === "entites" ? (
            <select className="input" value={filtre} onChange={(e) => { setFiltre(e.target.value); setPage(1); }}>
              <option value="">Tous les types</option><option value="STD">STD</option><option value="CTD">CTD</option><option value="EPN">EPN</option>
            </select>
          ) : onglet === "prmp" ? (
            <select className="input" value={filtre} onChange={(e) => { setFiltre(e.target.value); setPage(1); }}>
              <option value="">Toutes les entités</option>{entites.map((x) => <option key={x.id} value={x.id}>{x.nom}</option>)}
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
            ) : onglet === "prmp" ? (
              <table className="table">
                <thead><tr><th>N°</th><th>Nom de la PRMP</th><th>Entité</th><th>E-mail</th><th className="num">Nb marchés</th><th className="num">Actions</th></tr></thead>
                <tbody>
                  {visibles.map((p) => (
                    <tr key={p.id}>
                      <td className="nowrap">PRMP-{String(p.id).padStart(3, "0")}</td><td>{p.nom}</td><td>{p.entite}</td><td>{p.email || "—"}</td><td className="num">{p.nb_marches}</td>
                      <td><div className="actions">
                        {droits.gererDonnees && <>
                          <button className="btn-icone" title="Modifier" onClick={() => { setFormPrmp({ id: p.id, nom: p.nom, id_entite: String(p.id_entite), email: p.email || "" }); setErreur(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}><Icone nom="crayon" /></button>
                          <button className="btn-icone danger" title="Supprimer" onClick={() => setASupprimer({ type: "prmp", id: p.id, libelle: p.nom })}><Icone nom="corbeille" /></button>
                        </>}
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="table">
                <thead><tr><th>Référence</th><th>Objet</th><th>Entité</th><th>PRMP</th><th>Nature</th><th>Compte</th><th>Mode de passation</th><th className="num">Montant</th><th>Année</th><th>Particularité</th><th className="num">Actions</th></tr></thead>
                <tbody>
                  {visibles.map((m) => (
                    <tr key={m.id}>
                      <td className="nowrap">{m.reference}</td><td style={{ maxWidth: 220 }}>{m.objet}</td><td>{m.entite}</td><td>{m.prmp || "—"}</td><td>{m.nature}</td><td className="nowrap">{m.compte || "—"}</td><td>{m.mode_passation}</td>
                      <td className="num">{formatMontant(m.montant)}</td><td>{m.annee_exercice}</td>
                      <td>{m.hors_ppm && <span className="badge badge-danger">Hors PPM</span>} {m.marche_regularisation && <span className="badge badge-warning">Régularisation</span>}</td>
                      <td><div className="actions">
                        <button className="btn-icone" title="Voir les informations" onClick={() => setDetailMarche(m)}><Icone nom="oeil" /></button>
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

      {detailMarche && (
        <div onClick={() => setDetailMarche(null)}
             style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div className="card" onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 720, maxHeight: "85vh", overflowY: "auto" }}>
            <div className="card-entete">
              <h3>Marché {detailMarche.reference}</h3>
              <button className="btn-icone" title="Fermer" onClick={() => setDetailMarche(null)}>✕</button>
            </div>
            <dl className="info-grille" style={{ margin: 0 }}>
              {[
                ["N° de saisie", detailMarche.numero_saisie || "—"],
                ["Direction / Service", detailMarche.direction_service || "—"],
                ["Forme du contrat", FORMES_CONTRAT[detailMarche.forme_contrat] || "—"],
                ["Forme du prix", FORMES_PRIX[detailMarche.forme_prix] || "—"],
                ["Montant minimum", detailMarche.montant_min != null ? formatMontant(detailMarche.montant_min) : "—"],
                ["Montant maximum", detailMarche.montant_max != null ? formatMontant(detailMarche.montant_max) : "—"],
                ["Montant du TEF", detailMarche.montant_tef != null ? formatMontant(detailMarche.montant_tef) : "—"],
                ["Délai d'exécution", detailMarche.delai_execution || "—"],
                ["Financement", detailMarche.financement || "—"],
                ["Date de signature", detailMarche.date_signature ? formatDate(detailMarche.date_signature) : "—"],
                ["Date d'approbation", detailMarche.date_approbation ? formatDate(detailMarche.date_approbation) : "—"],
                ["Date de notification", detailMarche.date_notification ? formatDate(detailMarche.date_notification) : "—"],
              ].map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
            </dl>
          </div>
        </div>
      )}

      <ConfirmDialog ouvert={!!aSupprimer} titre="Confirmer la suppression"
        message={messageSuppression}
        onConfirmer={confirmerSuppression} onAnnuler={() => setASupprimer(null)} />
    </>
  );
}