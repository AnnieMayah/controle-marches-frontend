import { useCallback, useEffect, useState } from "react";
import ChampMotDePasse from "../components/ui/ChampMotDePasse";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../theme/ThemeContext";
import { changerMotDePasse, getUtilisateurs, creerUtilisateur, basculerActif, changerRole } from "../services/auth";
import { formaterErreur } from "../utils/erreurs";
import { LIBELLES_ROLES } from "../utils/format";
import { validerEmail, validerMotDePasse } from "../utils/validation";

const UTILISATEUR_VIDE = { nom: "", prenom: "", email: "", login: "", mot_de_passe: "", role: "COLLECTE" };

export default function Parametres() {
  const { utilisateur, droits } = useAuth();
  const { theme, basculerTheme } = useTheme();
  const [mdp, setMdp] = useState({ ancien: "", nouveau: "", confirmation: "" });
  const [msgMdp, setMsgMdp] = useState(null);
  const [users, setUsers] = useState([]);
  const [nouveau, setNouveau] = useState(UTILISATEUR_VIDE);
  const [msgUsers, setMsgUsers] = useState(null);

  const chargerUsers = useCallback(() => { if (droits.administrer) getUtilisateurs().then(setUsers).catch(() => {}); }, [droits.administrer]);
  useEffect(() => { chargerUsers(); }, [chargerUsers]);

  const changerMdp = async (e) => {
    e.preventDefault(); setMsgMdp(null);
    if (!mdp.ancien) return setMsgMdp({ ok: false, t: "Saisis ton mot de passe actuel." });
    const erreurRegle = validerMotDePasse(mdp.nouveau);
    if (erreurRegle) return setMsgMdp({ ok: false, t: "Nouveau mot de passe : " + erreurRegle });
    if (mdp.nouveau !== mdp.confirmation) return setMsgMdp({ ok: false, t: "La confirmation ne correspond pas au nouveau mot de passe." });
    try { await changerMotDePasse(utilisateur.id, mdp.ancien, mdp.nouveau); setMdp({ ancien: "", nouveau: "", confirmation: "" }); setMsgMdp({ ok: true, t: "Mot de passe modifié." }); }
    catch (err) { setMsgMdp({ ok: false, t: formaterErreur(err) }); }
  };

  const ajouterUser = async (e) => {
    e.preventDefault(); setMsgUsers(null);
    if (!nouveau.nom.trim() || !nouveau.login.trim()) return setMsgUsers({ ok: false, t: "Le nom et l'identifiant sont obligatoires." });
    if (nouveau.email.trim() && validerEmail(nouveau.email)) return setMsgUsers({ ok: false, t: "Adresse e-mail invalide." });
    const erreurRegle = validerMotDePasse(nouveau.mot_de_passe);
    if (erreurRegle) return setMsgUsers({ ok: false, t: "Mot de passe : " + erreurRegle });
    try { await creerUtilisateur(nouveau); setNouveau(UTILISATEUR_VIDE); setMsgUsers({ ok: true, t: "Compte créé." }); chargerUsers(); }
    catch (err) { setMsgUsers({ ok: false, t: formaterErreur(err) }); }
  };
  const basculer = async (id) => { try { await basculerActif(id); chargerUsers(); } catch (err) { setMsgUsers({ ok: false, t: formaterErreur(err) }); } };
  const modifierRole = async (id, role) => {
    setMsgUsers(null);
    try { await changerRole(id, role, utilisateur.id); setMsgUsers({ ok: true, t: "Rôle mis à jour." }); chargerUsers(); }
    catch (err) { setMsgUsers({ ok: false, t: formaterErreur(err) }); }
  };

  return (
    <>
      <div className="page-header"><div><h1>Paramètres</h1><p>Profil, sécurité et préférences d'affichage.</p></div></div>

      <div className="grille-2">
        <div className="card">
          <div className="card-entete"><h3>Mon profil</h3></div>
          <dl className="info-grille" style={{ margin: 0 }}>
            <div><dt>Nom</dt><dd>{utilisateur.prenom} {utilisateur.nom}</dd></div>
            <div><dt>Identifiant</dt><dd>{utilisateur.login}</dd></div>
            <div><dt>E-mail</dt><dd>{utilisateur.email || "—"}</dd></div>
            <div><dt>Rôle</dt><dd>{LIBELLES_ROLES[utilisateur.role] || utilisateur.role}</dd></div>
          </dl>
          <div className="card-entete" style={{ marginTop: 22 }}><h3>Affichage</h3></div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span>Mode {theme === "dark" ? "sombre" : "clair"}</span>
            <button className="btn btn-secondaire btn-sm" onClick={basculerTheme}>Passer en mode {theme === "dark" ? "clair" : "sombre"}</button>
          </div>
        </div>

        <form className="card" onSubmit={changerMdp} noValidate>
          <div className="card-entete"><h3>Changer le mot de passe</h3></div>
          {[["ancien", "Mot de passe actuel", "current-password"], ["nouveau", "Nouveau mot de passe", "new-password"], ["confirmation", "Confirmer le nouveau mot de passe", "new-password"]].map(([k, lib, ac]) => (
            <div className="champ" key={k}><label htmlFor={`p-${k}`}>{lib}</label>
              <ChampMotDePasse id={`p-${k}`} valeur={mdp[k]} onChange={(v) => setMdp({ ...mdp, [k]: v })} autoComplete={ac} /></div>
          ))}
          <div className="indication" style={{ marginBottom: 10 }}>8 caractères minimum, avec au moins une lettre et un chiffre.</div>
          {msgMdp && <div className={`alerte ${msgMdp.ok ? "alerte-succes" : "alerte-erreur"}`}>{msgMdp.t}</div>}
          <button className="btn" type="submit">Mettre à jour</button>
        </form>
      </div>

      {droits.administrer && (
        <div className="card">
          <div className="card-entete"><h3>Gestion des utilisateurs</h3></div>
          <p style={{ fontSize: 12.5 }}>Les comptes créés depuis l'écran de connexion arrivent avec le rôle « Invité » (lecture seule) : attribue-leur ici le rôle adapté.</p>
          {msgUsers && <div className={`alerte ${msgUsers.ok ? "alerte-succes" : "alerte-erreur"}`}>{msgUsers.t}</div>}
          <div className="table-wrap"><table className="table">
            <thead><tr><th>Nom</th><th>Identifiant</th><th>E-mail</th><th>Rôle</th><th>Statut</th><th></th></tr></thead>
            <tbody>{users.map((u) => (
              <tr key={u.id}><td>{u.prenom} {u.nom}</td><td>{u.login}</td><td>{u.email || "—"}</td>
                <td>{u.id === utilisateur.id ? (LIBELLES_ROLES[u.role] || u.role) : (
                  <select className="input" style={{ minWidth: 190 }} value={u.role} onChange={(e) => modifierRole(u.id, e.target.value)}>
                    {Object.entries(LIBELLES_ROLES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>)}</td>
                <td><span className={`badge ${u.actif ? "badge-success" : "badge-muted"}`}>{u.actif ? "Actif" : "Désactivé"}</span></td>
                <td>{u.id !== utilisateur.id && <button className="btn btn-secondaire btn-sm" onClick={() => basculer(u.id)}>{u.actif ? "Désactiver" : "Réactiver"}</button>}</td></tr>))}</tbody></table></div>

          <form onSubmit={ajouterUser} noValidate style={{ marginTop: 20 }}>
            <h4 style={{ marginBottom: 12 }}>Créer un compte (sans vérification par e-mail)</h4>
            <div className="form-grille">
              <div className="champ"><label>Nom <span className="requis">*</span></label><input className="input" value={nouveau.nom} onChange={(e) => setNouveau({ ...nouveau, nom: e.target.value })} /></div>
              <div className="champ"><label>Prénom</label><input className="input" value={nouveau.prenom} onChange={(e) => setNouveau({ ...nouveau, prenom: e.target.value })} /></div>
              <div className="champ"><label>E-mail</label><input className="input" type="email" value={nouveau.email} onChange={(e) => setNouveau({ ...nouveau, email: e.target.value })} /></div>
              <div className="champ"><label>Identifiant <span className="requis">*</span></label><input className="input" value={nouveau.login} onChange={(e) => setNouveau({ ...nouveau, login: e.target.value })} /></div>
              <div className="champ"><label>Mot de passe <span className="requis">*</span></label><ChampMotDePasse id="nouveau-user-mdp" valeur={nouveau.mot_de_passe} onChange={(v) => setNouveau({ ...nouveau, mot_de_passe: v })} autoComplete="new-password" /></div>
              <div className="champ"><label>Rôle</label>
                <select className="input" value={nouveau.role} onChange={(e) => setNouveau({ ...nouveau, role: e.target.value })}>
                  {Object.entries(LIBELLES_ROLES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
            </div>
            <button className="btn" type="submit">Créer le compte</button>
          </form>
        </div>
      )}
    </>
  );
}
