/**
 * Textes français harmonisés avec la version anglaise (content-en.ts) :
 * réalisations formulées avec des verbes d'action à l'infinitif (équivalent
 * français des « Migrated…, Built… » anglais), intitulés de poste unifiés.
 * Chaque liste a le même nombre d'éléments, dans le même ordre, que sa version anglaise.
 *
 * Source unique pour seed-data.ts et pour `npm run apply:content`.
 */

export const EXPERIENCES_FR: Record<string, { roleFr: string; bulletsFr: string[] }> = {
  open: {
    roleFr: 'Concepteur Développeur Senior',
    bulletsFr: ['Mission en cours'],
  },
  ratp: {
    roleFr: 'Ingénieur logiciel',
    bulletsFr: [
      "Assurer la maintenance corrective et évolutive (TMA) de l'application existante",
      "Contribuer à la refonte complète de l'application",
      'Migrer le back-end de Java 8 vers Java 21',
      "Migrer le front-end d'AngularJS vers Angular 19",
      'Concevoir et développer de nouvelles interfaces utilisateur en Angular 19',
      'Reconstruire et moderniser les fonctionnalités existantes dans la nouvelle version',
      'Écrire les tests unitaires et augmenter la couverture de tests',
      'Créer et automatiser des scénarios de tests API avec Bruno',
      'Réaliser les tests fonctionnels et valider les évolutions',
      'Corriger les anomalies',
      "Participer aux revues de code et à l'amélioration continue",
      'Rédiger la documentation technique',
    ],
  },
  cnaf: {
    roleFr: 'Ingénieur logiciel',
    bulletsFr: [
      'Livrer des user stories sur plusieurs téléprocédures (AJPA, DPA, DPN, DPF…)',
      'Développer de nouvelles fonctionnalités front en Angular 17/19',
      "Implémenter de nouveaux endpoints d'API en Java / Spring Boot",
      'Corriger les anomalies et stabiliser Saxo',
      "Suivre une formation à l'accessibilité numérique",
      "Améliorer l'accessibilité des téléprocédures",
      'Transmettre les connaissances et accompagner les nouveaux arrivants',
      "Tenir la documentation à jour et contribuer à l'amélioration continue",
    ],
  },
  emerga: {
    roleFr: 'Développeur Fullstack',
    bulletsFr: [
      'Analyser et chiffrer les spécifications client et la conception technique',
      'Développer de nouvelles fonctionnalités front en React.js',
      "Implémenter de nouveaux endpoints d'API",
      'Créer des canaux WebSocket entre les deux applications (EmerGa ↔ Sinapse)',
      'Écrire de nouvelles migrations PostgreSQL',
      "Refondre le code React et réorganiser l'architecture du projet",
    ],
  },
  maugin: {
    roleFr: 'Développeur Fullstack',
    bulletsFr: [
      'Recueillir le contexte métier des problèmes remontés',
      'Analyser les pistes de résolution possibles',
      'Étudier les solutions avec le client',
      'Piloter les montées de version des frameworks',
      'Implémenter de nouvelles fonctionnalités et de nouvelles pages en Angular',
      "Améliorer l'API et créer de nouveaux endpoints en NestJS",
      'Produire les livrables du projet',
      'Gérer les livraisons et coordonner les tests',
      'Développer les fonctionnalités et écrire les tests unitaires',
    ],
  },
  sncf: {
    roleFr: 'Développeur logiciel',
    bulletsFr: [
      "Analyser et chiffrer les demandes d'évolution",
      'Animer des ateliers avec le client pour préciser les besoins',
      'Réaliser des POC pour choisir une librairie adaptée',
      'Implémenter un éditeur graphique de schémas avec JointJS',
      'Développer les user stories conformément aux spécifications',
      "Mettre en place l'import / export des schémas au format CSV",
      'Développer un algorithme de parcours de graphe et des règles de calcul',
      'Écrire les tests unitaires',
      'Packager et livrer une application Windows avec Electron',
      'Rédiger et exécuter les tests fonctionnels',
    ],
  },
  vinci: {
    roleFr: 'Développeur Fullstack',
    bulletsFr: [
      "Analyser et chiffrer les demandes d'évolution",
      "Migrer l'application de Java 8 vers Java 17",
      'Concevoir des API Java / Spring Boot fiables et sécurisées',
      'Analyser et corriger les anomalies',
      'Développer plusieurs services Java',
      "Refondre le front-end et l'IHM, avec de nouveaux écrans et fonctionnalités",
      'Refactoriser et optimiser les services back-end existants',
      'Corriger les bugs en production',
      'Monter de version plusieurs librairies (Aspose, Hibernate, jQuery…)',
      'Réaliser des revues de code et du refactoring',
    ],
  },
  'netng-acoshop': {
    roleFr: 'Développeur Fullstack',
    bulletsFr: [
      "Générer des devis d'achat pour les sous-traitants et les salariés",
      'Implémenter la confirmation des devis et la génération des bons de commande',
      'Générer les devis au format PDF',
      'Envoyer les devis par e-mail aux clients',
      "Permettre la modification des devis (ajout et suppression d'articles, quantités)",
      "Ajouter l'enregistrement de brouillons d'achat (panier)",
      "Permettre de dupliquer une demande d'achat existante en nouveau brouillon",
      "Corriger les anomalies de l'application",
      "Corriger un bug d'authentification sur mobile",
    ],
  },
  'netng-solocal': {
    roleFr: 'Développeur Fullstack',
    bulletsFr: [
      'Analyser et chiffrer les spécifications client et la conception technique',
      'Développer plusieurs services en Python',
      'Concevoir une API RESTful',
      "Mettre en place l'authentification et un système de gestion des accès",
      'Développer une plateforme web avec Nagare',
      'Corriger les bugs en production',
      'Réaliser des revues de code et du refactoring',
    ],
  },
  rectorat: {
    roleFr: 'Développeur Fullstack',
    bulletsFr: [
      'Analyser et chiffrer les spécifications client et la conception technique',
      'Développer de nouvelles fonctionnalités',
      'Développer plusieurs web services en Java / Kotlin',
      'Développer une plateforme web en JavaScript, jQuery et HTML',
      "Développer une API web d'ajout de documentation",
      'Travailler en TDD (développement piloté par les tests)',
      'Réaliser des revues de code et du refactoring',
      'Améliorer la qualité du code avec SonarQube',
      "Intégrer Keycloak pour l'authentification",
    ],
  },
};

export const AGENCIES_FR: Record<string, { roleFr: string }> = {
  'open-agency': { roleFr: 'Concepteur Développeur Senior' },
  sogeti: { roleFr: 'Ingénieur logiciel' },
  extia: { roleFr: 'Ingénieur logiciel' },
  'rectorat-agency': { roleFr: 'Développeur Fullstack' },
};
