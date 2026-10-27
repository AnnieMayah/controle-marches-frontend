export const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export const formatMontant = (n) => (n === null || n === undefined ? "—" : `${Number(n).toLocaleString("fr-FR")} Ar`);

export const LIBELLES_ROLES = {
  ADMIN: "Administrateur", COLLECTE: "Assistant contrôleur", VERIFICATION: "Contrôleur vérificateur",
  ANALYSE: "Membre / Chef de contrôle", VALIDATION: "Validateur", PCNM: "PCNM", ENTITE: "Entité", INVITE: "Invité",
};

/** Statut affichable d'un contrôle (libellé + classe de badge). */
export function statutControle(c) {
  if (c.valide) {
    return c.conclusion === "CONFORME"
      ? { label: "Conforme", classe: "badge-success" }
      : { label: "Non conforme", classe: "badge-danger" };
  }
  if (c.nb_etapes_notees === 0) return { label: "À démarrer", classe: "badge-muted" };
  return { label: "En cours", classe: "badge-warning" };
}

/** Phase d'avancement d'un contrôle, utilisée par la page Workflow. */
export function phaseControle(c, totalEtapes = 7) {
  if (c.valide) return "valide";
  if (c.nb_etapes_notees === 0) return "demarrer";
  if (c.nb_etapes_notees >= totalEtapes) return "valider";
  return "analyse";
}

export function exporterCSV(nomFichier, entetes, lignes) {
  const echapper = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const contenu = [entetes, ...lignes].map((l) => l.map(echapper).join(";")).join("\n");
  const blob = new Blob(["\uFEFF" + contenu], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = nomFichier; a.click();
  URL.revokeObjectURL(url);
}
