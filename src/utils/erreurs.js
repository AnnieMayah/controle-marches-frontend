/** Transforme une erreur axios en message clair pour l'utilisateur. */
export function formaterErreur(err) {
  if (!err.response) return "Impossible de joindre le serveur. Vérifie que le backend est démarré.";
  const statut = err.response.status;
  const detail = err.response.data?.erreur;
  if (detail) return detail;
  if (statut === 400) return "Les informations saisies sont incomplètes ou incorrectes.";
  if (statut === 401) return "Identifiants incorrects.";
  if (statut === 404) return "Élément introuvable — il a peut-être été supprimé.";
  if (statut === 409) return "Cette opération est en conflit avec des données existantes.";
  if (statut >= 500) return "Erreur interne du serveur. Réessaie dans un instant.";
  return "Une erreur inattendue est survenue.";
}
