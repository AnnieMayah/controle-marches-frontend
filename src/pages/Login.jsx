import { useEffect, useState } from "react";
import Icone from "../components/ui/Icone";
import ChampMotDePasse from "../components/ui/ChampMotDePasse";
import { useAuth } from "../context/AuthContext";
import { inscription, verifierInscription, renvoyerCode, motDePasseOublie, reinitialiserMotDePasse } from "../services/auth";
import { formaterErreur } from "../utils/erreurs";
import { validerEmail, validerMotDePasse } from "../utils/validation";

const DELAI_RENVOI = 60;

/** Compte à rebours avant de pouvoir redemander un code. */
function useCompteARebours() {
  const [reste, setReste] = useState(DELAI_RENVOI);
  useEffect(() => { if (reste <= 0) return; const t = setTimeout(() => setReste(reste - 1), 1000); return () => clearTimeout(t); }, [reste]);
  return [reste, () => setReste(DELAI_RENVOI)];
}

function Message({ modeDev, email }) {
  return modeDev
    ? <div className="alerte alerte-info">Aucun serveur d'e-mail n'est configuré : le code est affiché dans la <strong>console du backend</strong> (mode développement).</div>
    : <div className="alerte alerte-succes">Si l'adresse <strong>{email}</strong> est valide, un code à 6 chiffres vient d'être envoyé. Pense à vérifier les courriers indésirables.</div>;
}

function Champ({ id, libelle, erreur, children }) {
  return <div className="champ"><label htmlFor={id}>{libelle}</label>{children}{erreur && <div className="champ-erreur">{erreur}</div>}</div>;
}

/* ---------------------------------------------------------------- connexion */
function FormConnexion({ info, loginInitial, aller }) {
  const { seConnecter } = useAuth();
  const [login, setLogin] = useState(loginInitial || "");
  const [mdp, setMdp] = useState("");
  const [erreur, setErreur] = useState(null);
  const [envoi, setEnvoi] = useState(false);

  const soumettre = async (e) => {
    e.preventDefault(); setErreur(null);
    if (!login.trim() || !mdp) { setErreur("Saisis ton identifiant et ton mot de passe."); return; }
    setEnvoi(true);
    try { await seConnecter(login.trim(), mdp); } catch (err) { setErreur(formaterErreur(err)); setEnvoi(false); }
  };

  return (
    <form onSubmit={soumettre} noValidate>
      <h2>Connexion</h2><p>Accède à ton espace de contrôle.</p>
      {info && <div className="alerte alerte-succes">{info}</div>}
      <Champ id="login" libelle="Identifiant"><input id="login" className="input" value={login} onChange={(e) => setLogin(e.target.value)} autoFocus={!loginInitial} autoComplete="username" /></Champ>
      <Champ id="mdp" libelle="Mot de passe"><ChampMotDePasse id="mdp" valeur={mdp} onChange={setMdp} autoComplete="current-password" autoFocus={!!loginInitial} /></Champ>
      <div className="login-liens"><span /><button type="button" className="lien-bouton" onClick={() => aller("oubli")}>Mot de passe oublié ?</button></div>
      {erreur && <div className="alerte alerte-erreur">{erreur}</div>}
      <button className="btn" type="submit" disabled={envoi} style={{ width: "100%", justifyContent: "center" }}>{envoi ? "Connexion…" : "Se connecter"}</button>
      <div className="login-pied">Pas encore de compte ? <button type="button" className="lien-bouton" onClick={() => aller("inscription")}>Créer un compte</button></div>
    </form>
  );
}

/* ---------------------------------------------------------------- inscription */
function FormInscription({ aller, onCodeEnvoye }) {
  const [f, setF] = useState({ nom: "", prenom: "", email: "", login: "", mdp: "", confirmation: "" });
  const [erreurs, setErreurs] = useState({});
  const [erreurServeur, setErreurServeur] = useState(null);
  const [envoi, setEnvoi] = useState(false);
  const maj = (k) => (v) => setF((x) => ({ ...x, [k]: v }));

  const soumettre = async (e) => {
    e.preventDefault(); setErreurServeur(null);
    const err = {};
    if (!f.nom.trim()) err.nom = "Le nom est obligatoire.";
    const em = validerEmail(f.email); if (em) err.email = em;
    if (f.login.trim().length < 3) err.login = "Au moins 3 caractères.";
    const mp = validerMotDePasse(f.mdp); if (mp) err.mdp = mp;
    if (!err.mdp && f.mdp !== f.confirmation) err.confirmation = "La confirmation ne correspond pas.";
    setErreurs(err);
    if (Object.keys(err).length) return;
    setEnvoi(true);
    try {
      const r = await inscription({ nom: f.nom, prenom: f.prenom, email: f.email, login: f.login, mot_de_passe: f.mdp });
      onCodeEnvoye(r.email, r.mode_dev);
    } catch (ex) { setErreurServeur(formaterErreur(ex)); setEnvoi(false); }
  };

  return (
    <form onSubmit={soumettre} noValidate>
      <button type="button" className="retour" onClick={() => aller("connexion")}>‹ Retour à la connexion</button>
      <h2>Créer un compte</h2><p>Un code de vérification sera envoyé à ton adresse e-mail.</p>
      <div className="form-grille">
        <Champ id="nom" libelle="Nom *" erreur={erreurs.nom}><input id="nom" className={`input ${erreurs.nom ? "invalide" : ""}`} value={f.nom} onChange={(e) => maj("nom")(e.target.value)} autoFocus /></Champ>
        <Champ id="prenom" libelle="Prénom"><input id="prenom" className="input" value={f.prenom} onChange={(e) => maj("prenom")(e.target.value)} /></Champ>
      </div>
      <Champ id="email" libelle="Adresse e-mail *" erreur={erreurs.email}><input id="email" type="email" className={`input ${erreurs.email ? "invalide" : ""}`} value={f.email} onChange={(e) => maj("email")(e.target.value)} autoComplete="email" /></Champ>
      <Champ id="nouveau-login" libelle="Identifiant *" erreur={erreurs.login}><input id="nouveau-login" className={`input ${erreurs.login ? "invalide" : ""}`} value={f.login} onChange={(e) => maj("login")(e.target.value)} autoComplete="username" /></Champ>
      <Champ id="nouveau-mdp" libelle="Mot de passe *" erreur={erreurs.mdp}>
        <ChampMotDePasse id="nouveau-mdp" valeur={f.mdp} onChange={maj("mdp")} autoComplete="new-password" invalide={!!erreurs.mdp} />
        <div className="indication">8 caractères minimum, avec au moins une lettre et un chiffre.</div>
      </Champ>
      <Champ id="confirmation" libelle="Confirmer le mot de passe *" erreur={erreurs.confirmation}><ChampMotDePasse id="confirmation" valeur={f.confirmation} onChange={maj("confirmation")} autoComplete="new-password" invalide={!!erreurs.confirmation} /></Champ>
      {erreurServeur && <div className="alerte alerte-erreur">{erreurServeur}</div>}
      <button className="btn" type="submit" disabled={envoi} style={{ width: "100%", justifyContent: "center" }}>{envoi ? "Envoi du code…" : "Recevoir le code par e-mail"}</button>
      <p className="indication" style={{ marginTop: 12 }}>Le compte est créé avec le rôle « Invité » (lecture seule). Un administrateur peut ensuite t'attribuer d'autres droits.</p>
    </form>
  );
}

/* ---------------------------------------------------------------- saisie du code d'inscription */
function FormCodeInscription({ email, modeDev: modeDevInitial, aller, onCree }) {
  const [code, setCode] = useState("");
  const [modeDev, setModeDev] = useState(modeDevInitial);
  const [erreur, setErreur] = useState(null);
  const [envoi, setEnvoi] = useState(false);
  const [reste, relancer] = useCompteARebours();

  const soumettre = async (e) => {
    e.preventDefault(); setErreur(null);
    if (code.length !== 6) { setErreur("Saisis le code à 6 chiffres."); return; }
    setEnvoi(true);
    try { onCree(await verifierInscription(email, code)); } catch (ex) { setErreur(formaterErreur(ex)); setEnvoi(false); }
  };
  const renvoyer = async () => {
    setErreur(null);
    try { const r = await renvoyerCode(email, "INSCRIPTION"); setModeDev(r.mode_dev); relancer(); } catch (ex) { setErreur(formaterErreur(ex)); }
  };

  return (
    <form onSubmit={soumettre} noValidate>
      <button type="button" className="retour" onClick={() => aller("inscription")}>‹ Modifier mes informations</button>
      <h2>Vérifie ton adresse e-mail</h2>
      <Message modeDev={modeDev} email={email} />
      <Champ id="code" libelle="Code de vérification">
        <input id="code" className="input code-input" inputMode="numeric" maxLength={6} value={code} autoFocus autoComplete="one-time-code"
               onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} placeholder="••••••" />
        <div className="indication">Le code est valable 10 minutes.</div>
      </Champ>
      {erreur && <div className="alerte alerte-erreur">{erreur}</div>}
      <button className="btn" type="submit" disabled={envoi} style={{ width: "100%", justifyContent: "center" }}>{envoi ? "Vérification…" : "Valider et créer mon compte"}</button>
      <div className="login-pied"><button type="button" className="lien-bouton" disabled={reste > 0} onClick={renvoyer}>{reste > 0 ? `Renvoyer le code (${reste} s)` : "Renvoyer le code"}</button></div>
    </form>
  );
}

/* ---------------------------------------------------------------- mot de passe oublié */
function FormOubli({ aller, onCodeEnvoye }) {
  const [email, setEmail] = useState("");
  const [erreur, setErreur] = useState(null);
  const [envoi, setEnvoi] = useState(false);

  const soumettre = async (e) => {
    e.preventDefault(); setErreur(null);
    const em = validerEmail(email); if (em) { setErreur(em); return; }
    setEnvoi(true);
    try { const r = await motDePasseOublie(email.trim()); onCodeEnvoye(r.email, r.mode_dev); } catch (ex) { setErreur(formaterErreur(ex)); setEnvoi(false); }
  };
  return (
    <form onSubmit={soumettre} noValidate>
      <button type="button" className="retour" onClick={() => aller("connexion")}>‹ Retour à la connexion</button>
      <h2>Mot de passe oublié</h2><p>Saisis l'adresse e-mail de ton compte : nous t'enverrons un code de vérification.</p>
      <Champ id="email-oubli" libelle="Adresse e-mail"><input id="email-oubli" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus autoComplete="email" /></Champ>
      {erreur && <div className="alerte alerte-erreur">{erreur}</div>}
      <button className="btn" type="submit" disabled={envoi} style={{ width: "100%", justifyContent: "center" }}>{envoi ? "Envoi…" : "Envoyer le code"}</button>
    </form>
  );
}

function FormReinit({ email, modeDev: modeDevInitial, aller, onTermine }) {
  const [code, setCode] = useState("");
  const [mdp, setMdp] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [modeDev, setModeDev] = useState(modeDevInitial);
  const [erreur, setErreur] = useState(null);
  const [envoi, setEnvoi] = useState(false);
  const [reste, relancer] = useCompteARebours();

  const soumettre = async (e) => {
    e.preventDefault(); setErreur(null);
    if (code.length !== 6) { setErreur("Saisis le code à 6 chiffres reçu par e-mail."); return; }
    const mp = validerMotDePasse(mdp); if (mp) { setErreur("Nouveau mot de passe : " + mp); return; }
    if (mdp !== confirmation) { setErreur("La confirmation ne correspond pas au nouveau mot de passe."); return; }
    setEnvoi(true);
    try { await reinitialiserMotDePasse(email, code, mdp); onTermine(); } catch (ex) { setErreur(formaterErreur(ex)); setEnvoi(false); }
  };
  const renvoyer = async () => {
    setErreur(null);
    try { const r = await renvoyerCode(email, "REINITIALISATION"); setModeDev(r.mode_dev); relancer(); } catch (ex) { setErreur(formaterErreur(ex)); }
  };

  return (
    <form onSubmit={soumettre} noValidate>
      <button type="button" className="retour" onClick={() => aller("oubli")}>‹ Changer d'adresse</button>
      <h2>Nouveau mot de passe</h2>
      <Message modeDev={modeDev} email={email} />
      <Champ id="code-reinit" libelle="Code de vérification">
        <input id="code-reinit" className="input code-input" inputMode="numeric" maxLength={6} value={code} autoFocus autoComplete="one-time-code"
               onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} placeholder="••••••" />
      </Champ>
      <Champ id="reinit-mdp" libelle="Nouveau mot de passe">
        <ChampMotDePasse id="reinit-mdp" valeur={mdp} onChange={setMdp} autoComplete="new-password" />
        <div className="indication">8 caractères minimum, avec au moins une lettre et un chiffre.</div>
      </Champ>
      <Champ id="reinit-conf" libelle="Confirmer le nouveau mot de passe"><ChampMotDePasse id="reinit-conf" valeur={confirmation} onChange={setConfirmation} autoComplete="new-password" /></Champ>
      {erreur && <div className="alerte alerte-erreur">{erreur}</div>}
      <button className="btn" type="submit" disabled={envoi} style={{ width: "100%", justifyContent: "center" }}>{envoi ? "Enregistrement…" : "Changer le mot de passe"}</button>
      <div className="login-pied"><button type="button" className="lien-bouton" disabled={reste > 0} onClick={renvoyer}>{reste > 0 ? `Renvoyer le code (${reste} s)` : "Renvoyer le code"}</button></div>
    </form>
  );
}

/* ---------------------------------------------------------------- écran principal */
export default function Login() {
  const [ecran, setEcran] = useState("connexion");
  const [info, setInfo] = useState(null);
  const [loginInitial, setLoginInitial] = useState("");
  const [email, setEmail] = useState("");
  const [modeDev, setModeDev] = useState(false);

  const aller = (e) => { setEcran(e); if (e !== "connexion") setInfo(null); };
  const codeEnvoye = (suite) => (adresse, dev) => { setEmail(adresse); setModeDev(dev); setEcran(suite); };

  return (
    <div className="login-fond">
      <div className="login-carte">
        <div className="login-logo"><Icone nom="logo" taille={38} /><strong>Contrôle a posteriori<br />des marchés publics</strong></div>
        {ecran === "connexion" && <FormConnexion info={info} loginInitial={loginInitial} aller={aller} />}
        {ecran === "inscription" && <FormInscription aller={aller} onCodeEnvoye={codeEnvoye("code-inscription")} />}
        {ecran === "code-inscription" && <FormCodeInscription email={email} modeDev={modeDev} aller={aller}
          onCree={(u) => { setLoginInitial(u.login); setInfo("Compte créé avec succès. Connecte-toi avec ton identifiant et ton mot de passe."); setEcran("connexion"); }} />}
        {ecran === "oubli" && <FormOubli aller={aller} onCodeEnvoye={codeEnvoye("reinit")} />}
        {ecran === "reinit" && <FormReinit email={email} modeDev={modeDev} aller={aller}
          onTermine={() => { setInfo("Mot de passe modifié. Tu peux maintenant te connecter."); setEcran("connexion"); }} />}
      </div>
    </div>
  );
}
