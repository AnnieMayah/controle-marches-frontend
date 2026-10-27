import { LIBELLES_ROLES } from "../utils/format";

const DROITS = [
  ["Administrateur", "Tout : entités, marchés, documents, contrôles, validation, comptes"],
  ["Assistant contrôleur", "Entités, marchés, documents"],
  ["Contrôleur vérificateur", "Documents"],
  ["Membre / Chef de contrôle", "Démarrer un contrôle, noter les étapes, constats, recommandations"],
  ["PCNM / Validateur", "Valider définitivement un contrôle"],
  ["Invité, Entité", "Consultation en lecture seule"],
];

const SECTIONS = [
  ["1. Premiers pas : connexion, compte, mot de passe", (
    <>
      <ol>
        <li><strong>Se connecter</strong> : saisis ton identifiant et ton mot de passe. L'icône en forme d'œil, à droite du champ, affiche ou masque le mot de passe.</li>
        <li><strong>Créer un compte</strong> : clique sur « Créer un compte », remplis le formulaire (nom, e-mail, identifiant, mot de passe) puis saisis le code à 6 chiffres reçu par e-mail. Le compte est créé avec le rôle <em>Invité</em> (lecture seule) ; un administrateur peut ensuite te donner d'autres droits.</li>
        <li><strong>Mot de passe oublié</strong> : clique sur « Mot de passe oublié ? », saisis ton adresse e-mail, puis le code reçu et ton nouveau mot de passe. Le code est valable 10 minutes, utilisable une seule fois, avec 5 essais maximum.</li>
      </ol>
      <div className="astuce">Mot de passe : 8 caractères minimum, avec au moins une lettre et un chiffre. Si aucun e-mail n'arrive en phase de test, le code s'affiche dans la console du serveur (mode développement).</div>
      <p>En haut de l'écran : la <strong>recherche globale</strong> (entités, marchés, contrôles), la <strong>cloche</strong> (activité récente) et ton <strong>profil</strong>. Le bouton soleil/lune du menu bascule entre mode clair et mode sombre.</p>
    </>)],
  ["2. Rôles et droits", (
    <>
      <p>Les boutons affichés dépendent de ton rôle :</p>
      <div className="table-wrap"><table className="table"><thead><tr><th>Rôle</th><th>Ce qu'il peut faire</th></tr></thead>
        <tbody>{DROITS.map(([r, d]) => <tr key={r}><td>{r}</td><td>{d}</td></tr>)}</tbody></table></div>
      <p>Rôles disponibles dans l'application : {Object.values(LIBELLES_ROLES).join(", ")}.</p>
    </>)],
  ["3. Entités & Marchés", (
    <ul>
      <li>Deux onglets : <strong>Entités</strong> et <strong>Marchés</strong>, avec filtre et pagination.</li>
      <li><strong>Ajouter</strong> : bouton en haut à droite. Les champs marqués d'une étoile sont obligatoires ; le montant doit être supérieur à 0 et la référence d'un marché est unique.</li>
      <li><strong>Modifier</strong> (crayon) ou <strong>supprimer</strong> (corbeille, avec confirmation). Une entité qui a encore des marchés ne peut pas être supprimée.</li>
      <li>L'icône « œil » d'une entité affiche ses marchés ; l'icône « contrôle » d'un marché ouvre ou démarre son contrôle.</li>
      <li>Les cases <em>Hors PPM</em> et <em>Marché de régularisation</em> rendent le marché automatiquement non conforme.</li>
    </ul>)],
  ["4. Documents", (
    <ol>
      <li>Choisis un marché : l'application indique les <strong>pièces manquantes</strong> (base d'un éventuel PV de carence).</li>
      <li>Choisis le type de document, sélectionne le fichier puis clique sur « Déposer ».</li>
      <li>Pour chaque pièce : aperçu / téléchargement, <strong>modification du type</strong> (crayon) et suppression (corbeille).</li>
    </ol>)],
  ["5. Contrôles : noter, constater, valider", (
    <>
      <ol>
        <li><strong>Démarrer</strong> : « Nouveau contrôle » (page Contrôles) ou l'icône « contrôle » sur un marché.</li>
        <li><strong>Notation des étapes</strong> : pour chacune des 7 étapes (planification, documents de mise en concurrence, mise en concurrence, ouverture des plis, évaluation, attribution, gestion contractuelle), choisis une note de 0 à 4 puis « Enregistrer ».</li>
        <li><strong>Constats</strong> : enregistre les irrégularités (étape concernée, description, texte applicable, risque, recommandation). Coche « impacte l'attribution » si l'irrégularité remet en cause l'attribution : le marché devient non conforme.</li>
        <li><strong>Valider</strong> : possible quand les 7 étapes sont notées, par un PCNM / validateur. Le contrôle est alors verrouillé.</li>
      </ol>
      <div className="astuce">Barème : 0 importantes irrégularités · 1 irrégularités · 2 généralement acceptable · 3 acceptable · 4 excellente maîtrise. Conforme si la moyenne est ≥ 2, sauf marché hors PPM, de régularisation ou irrégularité impactant l'attribution.</div>
    </>)],
  ["6. Détection automatique (aide à la décision)", (
    <>
      <p>Le module applique des règles métier pour repérer les marchés à risque. Tu le trouves à <strong>trois endroits</strong> :</p>
      <ul>
        <li>le menu <strong>Détection automatique</strong> : tous les marchés avec leur niveau de risque (Élevé, Moyen, Faible, RAS), leur score sur 7 et la liste des anomalies ;</li>
        <li>l'onglet <strong>Détection automatique</strong> de chaque contrôle, avec le bouton « Utiliser comme constat » ;</li>
        <li>la carte <strong>Marchés à surveiller</strong> du tableau de bord.</li>
      </ul>
      <p>Règles : mode non concurrentiel avec montant élevé, hors PPM, marché de régularisation, contrat ou PV d'ouverture des plis manquants, entité ayant un mauvais historique. Les suggestions sont à confirmer par le contrôleur.</p>
    </>)],
  ["7. Workflow de contrôle", (
    <p>La page affiche les contrôles par phase : <em>À démarrer</em>, <em>En analyse</em>, <em>À valider</em>, <em>Validés</em>. Clique sur une phase pour filtrer, sur l'œil pour ouvrir le contrôle.</p>)],
  ["8. Tableau de bord", (
    <ul>
      <li>Cartes de chiffres clés, répartition par nature, évolution des contrôles, derniers contrôles.</li>
      <li>Taux de conformité par entité (histogramme) et marchés à surveiller.</li>
      <li><strong>Montants par nature</strong> et <strong>par mode de passation</strong> : le bouton <em>Tableau / Camembert</em> de chaque carte permet de passer d'un affichage à l'autre.</li>
      <li>Seuls les contrôles <strong>validés</strong> comptent dans les statistiques de conformité.</li>
    </ul>)],
  ["9. Rapports et exports", (
    <ul>
      <li><strong>Rapport d'un marché (PDF)</strong> : icône de téléchargement dans la liste des rapports ou bouton « Voir le rapport » d'un contrôle.</li>
      <li><strong>Rapport global de mission (Word)</strong> : page Rapports, carte du haut. Choisis l'exercice, la période et la région, puis « Générer le rapport Word ». Le document reprend le format des rapports de la Commission : couverture, introduction, méthodologie, tableaux, camemberts, histogrammes, irrégularités, recommandations, conclusion, annexes.</li>
      <li>Les passages surlignés en jaune <strong>[À compléter]</strong> demandent ton jugement : rédige-les dans Word. À l'ouverture, accepte la mise à jour des champs pour afficher la table des matières.</li>
      <li><strong>Export CSV</strong> de la liste des rapports, lisible dans Excel.</li>
    </ul>)],
  ["10. Recommandations", (
    <p>Enregistre les recommandations par entité et suis leur mise en œuvre : <em>Émise</em>, <em>En cours</em>, <em>Appliquée</em>, <em>Non appliquée</em> (changement de statut directement dans le tableau).</p>)],
  ["11. Paramètres et administration", (
    <ul>
      <li>Consulter ton profil, changer ton mot de passe, choisir le mode clair ou sombre.</li>
      <li>Administrateur : créer des comptes, <strong>attribuer les rôles</strong> (notamment aux comptes créés depuis l'écran de connexion), activer ou désactiver un compte.</li>
    </ul>)],
  ["12. Questions fréquentes", (
    <ul>
      <li><strong>« Impossible de joindre le serveur »</strong> : le backend n'est pas démarré (<code>python app.py</code>) ou PostgreSQL est arrêté.</li>
      <li><strong>Je ne vois pas certains boutons</strong> : ton rôle n'a pas ce droit, demande à un administrateur.</li>
      <li><strong>Les statistiques sont vides</strong> : aucun contrôle n'est encore validé.</li>
      <li><strong>Je ne peux plus modifier un contrôle</strong> : il est validé, donc verrouillé.</li>
      <li><strong>Le code n'arrive pas</strong> : vérifie les courriers indésirables, attends 60 secondes puis « Renvoyer le code ».</li>
    </ul>)],
];

export default function Guide() {
  return (
    <>
      <div className="page-header"><div><h1>Guide d'utilisation</h1><p>Tout pour prendre en main l'application, étape par étape.</p></div></div>
      <div className="guide">
        {SECTIONS.map(([titre, contenu], i) => (
          <details key={titre} open={i === 0}><summary>{titre}</summary><div className="contenu">{contenu}</div></details>
        ))}
      </div>
    </>
  );
}
