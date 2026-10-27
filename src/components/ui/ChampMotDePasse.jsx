import { useState } from "react";
import Icone from "./Icone";

/** Champ mot de passe avec bouton « œil » pour afficher / masquer la saisie. */
export default function ChampMotDePasse({ id, valeur, onChange, autoComplete, placeholder, invalide, autoFocus }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="champ-mdp">
      <input id={id} className={`input ${invalide ? "invalide" : ""}`} type={visible ? "text" : "password"} value={valeur}
             onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} placeholder={placeholder} autoFocus={autoFocus} />
      <button type="button" className="champ-mdp-bouton" onClick={() => setVisible(!visible)}
              aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"} title={visible ? "Masquer" : "Afficher"}>
        <Icone nom={visible ? "oeil_barre" : "oeil"} />
      </button>
    </div>
  );
}
