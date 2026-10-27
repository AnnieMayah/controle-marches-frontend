/* Jeu d'icônes ligne (24x24), sans dépendance externe. */
const CHEMINS = {
  logo: <><path d="M12 3 4.5 6v5.5c0 4.6 3.1 8.4 7.5 9.5 4.4-1.1 7.5-4.9 7.5-9.5V6L12 3Z" /><path d="m9 12 2.2 2.2L15.5 10" /></>,
  accueil: <><path d="M4 11.5 12 4l8 7.5" /><path d="M6 10v9h12v-9" /></>,
  entites: <><rect x="4" y="3" width="16" height="18" rx="1.5" /><path d="M8 8h2M14 8h2M8 12h2M14 12h2M10 21v-4h4v4" /></>,
  controles: <><rect x="5" y="4" width="14" height="17" rx="1.5" /><path d="m9 12.5 2 2 4-4.5" /></>,
  documents: <><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4" /></>,
  workflow: <><circle cx="6" cy="6" r="2.2" /><circle cx="6" cy="18" r="2.2" /><circle cx="18" cy="12" r="2.2" /><path d="M6 8.2v7.6M8 6h4a4 4 0 0 1 4 4M8 18h4a4 4 0 0 0 4-4" /></>,
  rapports: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 17v-4M12 17V8M16 17v-6" /></>,
  parametres: <><path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" /></>,
  recommandations: <><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z" /></>,
  recherche: <><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></>,
  cloche: <><path d="M6 16v-5a6 6 0 1 1 12 0v5l1.5 2h-15L6 16Z" /><path d="M10 21h4" /></>,
  soleil: <><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" /></>,
  lune: <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" />,
  deconnexion: <path d="M10 4H5v16h5M15 8l4 4-4 4M19 12H9" />,
  plus: <path d="M12 5v14M5 12h14" />,
  oeil: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></>,
  oeil_barre: <><path d="M3 3l18 18" /><path d="M10.6 5.6A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16.6 16.6 0 0 1-3.2 4M6.4 7.2A16.5 16.5 0 0 0 2.5 12S6 18.5 12 18.5a9.5 9.5 0 0 0 4.2-1" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>,
  detection: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4" /><path d="M12 12l5-5M12 3.5V6M20.5 12H18" /></>,
  livre: <><path d="M5 4h9a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Z" /><path d="M5 17a3 3 0 0 1 3-3h9" /></>,
  crayon: <><path d="M4 20h4L19 9l-4-4L4 16v4Z" /><path d="m13.5 6.5 4 4" /></>,
  corbeille: <path d="M4 7h16M9 7V4h6v3M6.5 7l1 13h9l1-13M10 11v6M14 11v6" />,
  telecharger: <path d="M12 4v11M7.5 11 12 15.5 16.5 11M5 20h14" />,
  televerser: <path d="M12 16V5M7.5 9 12 4.5 16.5 9M5 20h14" />,
  chevron: <path d="m6 9 6 6 6-6" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  alerte: <><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5M12 16.5v.01" /></>,
  fleche_haut: <path d="M12 19V5M6 11l6-6 6 6" />,
  fleche_bas: <path d="M12 5v14M6 13l6 6 6-6" />,
  croix: <path d="M6 6l12 12M18 6 6 18" />,
  calendrier: <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 10h16M9 3v4M15 3v4" /></>,
};

export default function Icone({ nom, taille = 18 }) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {CHEMINS[nom]}
    </svg>
  );
}
