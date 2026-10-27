/** Règles de saisie (mêmes règles que le backend). Retournent un message d'erreur ou null. */
export const validerEmail = (email) => (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test((email || "").trim()) ? null : "Saisis une adresse e-mail valide.");

export function validerMotDePasse(mdp) {
  if ((mdp || "").length < 8) return "Au moins 8 caractères.";
  if (!/[A-Za-z]/.test(mdp) || !/\d/.test(mdp)) return "Au moins une lettre et un chiffre.";
  return null;
}
