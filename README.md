# Frontend — Contrôle a posteriori des marchés publics

Interface React (Vite) : tableau de bord, entités & marchés, contrôles, documents, workflow,
rapports, recommandations, paramètres, mode clair/sombre, recherche globale, notifications.

## Installation
```bash
npm install
npm install axios recharts
npm run dev
```
Le backend Flask doit tourner sur http://127.0.0.1:5000 (voir `src/services/api.js`).


## Structure de `src`
```
App.jsx, main.jsx, index.css, theme.css
pages/        Login, Dashboard, EntitesMarches, Controles, DetailControle, Documents,
              Workflow, Rapports, Recommandations, Parametres
components/   layout (Sidebar, Topbar), ui (Icone, ConfirmDialog, Pagination), FormEntite, FormMarche
services/     appels à l'API (un fichier par domaine)
context/      AuthContext (connexion, droits)
theme/        ThemeContext (clair/sombre), colors.js (palette des graphiques)
utils/        format, erreurs, permissions
```

## Droits par rôle (interface)
Administrateur : tout · Assistant contrôleur : entités, marchés, documents · Contrôleur vérificateur : documents ·
Membre / Chef de contrôle : contrôles, notes, constats, recommandations · PCNM / Validateur : validation.

