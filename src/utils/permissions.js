/**
 * Droits par rôle — appliqués dans l'INTERFACE (affichage des boutons).
 * Le backend n'impose pas encore ces restrictions (projet académique).
 */
export function droitsPour(role) {
  return {
    gererDonnees: ["ADMIN", "COLLECTE"].includes(role),                     // entités, marchés
    gererDocuments: ["ADMIN", "COLLECTE", "VERIFICATION"].includes(role),   // pièces justificatives
    noter: ["ADMIN", "ANALYSE"].includes(role),                              // contrôles, notes, constats, recommandations
    valider: ["ADMIN", "PCNM", "VALIDATION"].includes(role),                 // validation finale
    administrer: role === "ADMIN",                                           // gestion des comptes
  };
}
