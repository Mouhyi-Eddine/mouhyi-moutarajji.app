import { Injectable, signal } from '@angular/core';
import { Agency, Education, Experience, SkillGroup } from '../models/portfolio.models';

/**
 * ÉTAPE 1 : les données sont codées en dur ici, exposées via des signals en
 * lecture seule. À l'étape 2, seul le contenu de cette classe changera
 * (lecture Firestore avec collectionData() + toSignal()) : aucun composant
 * ne dépend de la provenance des données, uniquement de ces signals publics.
 */
@Injectable({ providedIn: 'root' })
export class PortfolioDataService {
  private readonly _skillGroups = signal<SkillGroup[]>(SKILL_GROUPS);
  private readonly _experiences = signal<Experience[]>(EXPERIENCES);
  private readonly _education = signal<Education[]>(EDUCATION);
  private readonly _agencies = signal<Agency[]>(AGENCIES);

  readonly skillGroups = this._skillGroups.asReadonly();
  readonly experiences = this._experiences.asReadonly();
  readonly education = this._education.asReadonly();
  readonly agencies = this._agencies.asReadonly();
}

const SKILL_GROUPS: SkillGroup[] = [
  {
    id: 'backend',
    nameFr: 'Back-end',
    nameEn: 'Back-end',
    order: 1,
    skills: [
      'Java', 'Spring Boot', 'Spring Security', 'Node.js', 'NestJS', 'Python',
      'Kotlin', "REST APIs", 'WebSocket', 'Apache Struts', 'Hibernate',
    ].map((v) => ({ fr: v, en: v })),
  },
  {
    id: 'frontend',
    nameFr: 'Front-end',
    nameEn: 'Front-end',
    order: 2,
    skills: [
      'Angular', 'React.js', 'TypeScript', 'JavaScript', 'HTML', 'CSS',
      'jQuery', 'NG-ZORRO', 'JointJS', 'Electron',
    ].map((v) => ({ fr: v, en: v })),
  },
  {
    id: 'data-infra',
    nameFr: 'Données & infra',
    nameEn: 'Data & infra',
    order: 3,
    skills: [
      'PostgreSQL', 'SQL', 'SQLAlchemy', 'Docker', 'GitLab CI', 'Jenkins',
      'RabbitMQ', 'Keycloak', 'PowerShell',
    ].map((v) => ({ fr: v, en: v })),
  },
  {
    id: 'methods-tools',
    nameFr: 'Méthodes & outils',
    nameEn: 'Methods & tools',
    order: 4,
    skills: [
      'Scrum', 'Agile', 'TDD', 'User Stories', 'Product Ownership', 'Git',
      'GitLab', 'SonarQube', 'Bruno', 'V-Model', 'Nagare',
    ].map((v) => ({ fr: v, en: v })),
  },
  {
    id: 'languages',
    nameFr: 'Langues',
    nameEn: 'Languages',
    order: 5,
    skills: [
      { fr: 'Arabe — natif', en: 'Arabic — native' },
      { fr: 'Français — natif', en: 'French — native' },
      { fr: 'Anglais — professionnel', en: 'English — professional' },
    ],
  },
];

const EXPERIENCES: Experience[] = [
  {
    id: 'open', company: 'OPEN', order: 10, location: 'Rennes', period: 'Depuis 09/2026 · En cours',
    roleFr: 'Concepteur Développeur Senior', roleEn: 'Senior Software Engineer',
    contextFr: "Mission en cours de conception et de développement logiciel au sein d'OPEN.",
    contextEn: 'Current software design and development assignment at OPEN.',
    bulletsFr: ['Mission en cours'], bulletsEn: ['Ongoing assignment'],
    tags: ['Java', 'Angular', 'Git'],
  },
  {
    id: 'ratp', company: 'RATP', order: 9, location: 'Rennes', period: '02/2026 – 08/2026 · 7 mois',
    roleFr: 'Ingénieur logiciel', roleEn: 'Software engineer',
    contextFr: "Modernisation d'une application de supervision et de gestion des équipements de vidéosurveillance : consultation, configuration et administration des caméras déployées sur les stations de métro, gestion des demandes d'installation et de paramétrage.",
    contextEn: 'Modernization of a monitoring and management application for CCTV equipment: viewing, configuring and administering cameras deployed across metro stations, managing installation and configuration requests.',
    bulletsFr: [
      "Réalisation des activités de TMA sur l'application existante",
      "Participation à la refonte complète de l'application",
      'Migration du Back-End de Java 8 vers Java 21',
      "Migration du Front-End d'AngularJS vers Angular 19",
      'Conception et développement de nouvelles interfaces utilisateurs (IHM) en Angular 19',
      'Recréation et modernisation des fonctionnalités existantes dans la nouvelle version',
      'Réalisation des tests unitaires et amélioration de la couverture de tests',
      'Création et automatisation de scénarios de tests API avec Bruno',
      'Réalisation des tests fonctionnels et validation des évolutions',
      "Correction d'anomalies", "Participation aux revues de code et à l'amélioration continue",
      'Documentation technique',
    ],
    bulletsEn: [
      'Maintenance (TMA) on the existing application',
      'Participation in the complete redesign of the application',
      'Back-end migration from Java 8 to Java 21',
      'Front-end migration from AngularJS to Angular 19',
      'Design and development of new user interfaces in Angular 19',
      'Recreation and modernization of existing features in the new version',
      'Unit testing and improved test coverage',
      'Creation and automation of API test scenarios with Bruno',
      'Functional testing and validation of new features',
      'Bug fixing', 'Participation in code reviews and continuous improvement',
      'Technical documentation',
    ],
    tags: ['Angular', 'Bruno', 'Git', 'Java', 'REST APIs', 'Scrum', 'Spring Boot', 'TypeScript'],
  },
  {
    id: 'cnaf', company: 'CNAF', order: 8, location: 'Rennes', period: '06/2025 – 02/2026 · 9 mois',
    roleFr: 'Ingénieur logiciel', roleEn: 'Software engineer',
    contextFr: "Téléprocédures du portail caf.fr (France Travail, lutte contre le non-droit) : déclarations de situation, prime d'activité, RSA, coordonnées bancaires.",
    contextEn: 'Online procedures on the caf.fr portal (France Travail, tackling non-take-up of benefits): situation declarations, activity bonus, RSA benefits, bank details.',
    bulletsFr: [
      'Réalisation de multiples user stories sur différentes téléprocédures (AJPA, DPA, DPN, DPF...)',
      'Développement de nouvelles fonctionnalités front en Angular 17/19',
      "Implémentation de nouveaux endpoints dans l'API en Java / Spring Boot",
      "Correction d'anomalies et stabilisation de Saxo", "Formation sur l'accessibilité numérique",
      "Amélioration de l'accessibilité numérique sur les différentes téléprocédures",
      'Transmission de connaissances et accompagnement des nouveaux arrivants',
      'Mise à jour de la documentation et amélioration continue',
    ],
    bulletsEn: [
      'Delivery of multiple user stories across several online procedures (AJPA, DPA, DPN, DPF...)',
      'Development of new front-end features in Angular 17/19',
      'Implementation of new API endpoints in Java / Spring Boot',
      'Bug fixing and stabilization of Saxo', 'Training on digital accessibility',
      'Improving digital accessibility across the online procedures',
      'Knowledge sharing and onboarding of new team members',
      'Documentation updates and continuous improvement',
    ],
    tags: ['Angular', 'Git', 'GitLab', 'JavaScript', 'Jenkins', 'PostgreSQL', 'Scrum', 'Spring Boot', 'SQL', 'TypeScript'],
  },
  {
    id: 'emerga', company: 'EmerGa', order: 7, location: 'Rennes', period: '08/2024 – 06/2025 · 11 mois',
    roleFr: 'Développeur Fullstack', roleEn: 'Fullstack Developer',
    contextFr: "EmerGa / SINAPSE : solutions conçues pour s'intégrer à l'action de secours et aider les témoins de situations de crise.",
    contextEn: 'EmerGa / SINAPSE: solutions designed to support emergency response and help bystanders in crisis situations.',
    bulletsFr: [
      'Analyse et chiffrage de spécifications client et de conception technique',
      'Développement de nouvelles fonctionnalités front en React.js',
      "Implémentation de nouveaux endpoints dans l'API",
      'Création de nouvelles WebSocket pour communiquer entre les deux applications (EmerGa ↔ Sinapse)',
      'Développement de nouvelles migrations PostgreSQL',
      "Refonte du code React et réorganisation de l'architecture du projet",
    ],
    bulletsEn: [
      'Analysis and estimation of client specifications and technical design',
      'Development of new front-end features in React.js',
      'Implementation of new API endpoints',
      'Creation of new WebSocket connections between the two applications (EmerGa ↔ Sinapse)',
      'Development of new PostgreSQL migrations',
      'React code rework and reorganization of the project architecture',
    ],
    tags: ['Docker', 'Git', 'GitLab', 'Node.js', 'PostgreSQL', 'React.js', 'REST APIs', 'Scrum', 'TypeScript', 'WebSocket'],
  },
  {
    id: 'maugin', company: 'GROUPE MAUGIN', order: 6, location: 'Rennes', period: '07/2023 – 08/2024 · 1 an 2 mois',
    roleFr: 'Développeur FullStack', roleEn: 'Fullstack Developer',
    contextFr: 'Menuiserie industrielle (3 usines, ~300 collaborateurs) : mise en place de nouvelles fonctionnalités sur le logiciel métier existant.',
    contextEn: 'Industrial joinery company (3 factories, ~300 employees): building new features on top of the existing business software.',
    bulletsFr: [
      'Recueil du contexte métier des problèmes observés', 'Analyse des différentes hypothèses de résolution',
      'Étude des solutions possibles en concertation avec le client',
      'Conduite des travaux de migration de version des frameworks utilisés',
      'Implémentation de nouvelles fonctionnalités et développement de nouvelles pages en Angular',
      "Amélioration de l'API et création de nouveaux endpoints en NestJS",
      'Réalisation des livrables', 'Livraison et conduite des tests',
      'Réalisation des développements et des tests unitaires',
    ],
    bulletsEn: [
      'Gathering business context for the issues observed', 'Analysis of possible resolution approaches',
      'Study of possible solutions together with the client', 'Leading framework version migrations',
      'Implementation of new features and new pages in Angular', 'API improvements and new endpoints in NestJS',
      'Delivery of project outputs', 'Release management and test coordination',
      'Development work and unit testing',
    ],
    tags: ['Angular', 'Docker', 'GitLab', 'JavaScript', 'NestJS', 'NG-ZORRO', 'PostgreSQL', 'Scrum', 'TypeScript'],
  },
  {
    id: 'sncf', company: 'SNCF', order: 5, location: 'Rennes', period: '01/2023 – 06/2023 · 6 mois',
    roleFr: 'Développeur', roleEn: 'Developer',
    contextFr: 'Outil de modélisation des schémas d\'alimentation électrique pour voies secondaires, avec exigence de rigueur sur la lecture du schéma et la cohérence des résultats.',
    contextEn: 'Modeling tool for electrical supply diagrams on secondary tracks, requiring strict accuracy in diagram reading and result consistency.',
    bulletsFr: [
      'Analyse des demandes d\'évolutions et chiffrage', 'Mise en place d\'ateliers de travail avec le client pour préciser les besoins',
      'Réalisation de POC pour trouver la librairie compatible',
      "Implémentation d'une interface graphique de modélisation de schémas avec la librairie JointJS",
      'Développement des user stories telles que décrites', 'Export / import des schémas au format CSV',
      'Développement d\'un algorithme de parcours des éléments et de règles de calcul',
      'Développement des tests unitaires', 'Déploiement d\'une application Windows avec Electron',
      'Rédaction et réalisation de tests fonctionnels',
    ],
    bulletsEn: [
      'Analysis and estimation of change requests', 'Running workshops with the client to clarify requirements',
      'Building POCs to find a suitable library',
      'Implementation of a graphical diagram modeling interface using the JointJS library',
      'Development of the user stories as described', 'CSV export / import of diagrams',
      'Development of a traversal algorithm and calculation rules',
      'Unit testing', 'Deployment of a Windows application with Electron',
      'Writing and running functional tests',
    ],
    tags: ['Angular', 'Electron', 'GitLab', 'JointJS', 'TypeScript', 'User Stories'],
  },
  {
    id: 'vinci', company: 'VINCI', order: 4, location: 'Le Mans', period: '01/2021 – 12/2022 · 2 ans',
    roleFr: 'Développeur Full Stack', roleEn: 'Full Stack Developer',
    contextFr: 'Application « Académie » — front-office et back-office permettant aux collaborateurs de postuler à des formations internes et externes, au sein d\'une équipe de 4 personnes.',
    contextEn: '"Académie" application — front-office and back-office allowing employees to apply for internal and external training, within a 4-person team.',
    bulletsFr: [
      'Analyse des demandes d\'évolutions et chiffrage', 'Refonte de l\'application de Java 8 vers Java 17',
      'Création d\'API Java / Spring Boot fiables et sécurisées', 'Analyse et correction d\'anomalies',
      'Développement de plusieurs services en Java', 'Refonte du front et de l\'IHM, apport de nouveauté sur les écrans',
      'Refactorisation et optimisation des services backend existants', 'Correction de bugs en environnement de production',
      'Montée de version de plusieurs technologies (Aspose, Hibernate, jQuery...)', 'Revue de code et refactoring',
    ],
    bulletsEn: [
      'Analysis and estimation of change requests', 'Application rework from Java 8 to Java 17',
      'Building reliable, secure Java / Spring Boot APIs', 'Bug analysis and fixing',
      'Development of several Java services', 'Front-end and UI rework, bringing new screens and features',
      'Refactoring and optimization of existing backend services', 'Bug fixing in production',
      'Upgrading several technologies (Aspose, Hibernate, jQuery...)', 'Code review and refactoring',
    ],
    tags: ['Apache Struts', 'CSS', 'Git', 'GitLab', 'Hibernate', 'HTML', 'Java', 'JavaScript', 'jQuery', 'PostgreSQL', 'REST APIs', 'Spring Boot', 'Spring Security', 'TypeScript', 'V-Model'],
  },
  {
    id: 'netng-acoshop', company: 'Net-ng — Acoshop', order: 3, location: 'Rennes', period: '09/2020 – 11/2020 · 3 mois',
    roleFr: 'Développeur FullStack', roleEn: 'Fullstack Developer',
    contextFr: "Acoshop, application web d'achats et de devis pour les sous-traitants d'Acorus, avec gestion des stocks fournisseurs.",
    contextEn: 'Acoshop, a web application for purchases and quotes for Acorus subcontractors, including supplier stock management.',
    bulletsFr: [
      'Génération d\'un devis d\'achat pour les sous-traitants et salariés', 'Confirmation du devis et génération d\'un bon d\'achat',
      'Génération de PDF de devis', 'Envoi par mail des devis au client',
      'Modification du devis (ajout, suppression, quantité des articles)', 'Enregistrement d\'un brouillon d\'achat (panier)',
      'Duplication d\'une intention d\'achat existante vers un nouveau brouillon',
      'Correction de bugs et anomalies de l\'application', 'Correction d\'un bug d\'authentification sur mobile',
    ],
    bulletsEn: [
      'Generating purchase quotes for subcontractors and employees', 'Confirming a quote and generating a purchase order',
      'Generating quote PDFs', 'Emailing quotes to the client',
      'Editing quotes (adding, removing, changing item quantities)', 'Saving a purchase draft (cart)',
      'Duplicating an existing purchase intent into a new draft',
      'Bug and issue fixing across the application', 'Fixing a mobile authentication bug',
    ],
    tags: ['CSS', 'Git', 'GitLab', 'GitLab CI', 'HTML', 'Nagare', 'PostgreSQL', 'Python', 'Scrum', 'SQLAlchemy'],
  },
  {
    id: 'netng-solocal', company: 'Net-ng — Solocal', order: 2, location: 'Rennes', period: '10/2019 – 09/2020 · 1 an',
    roleFr: 'Développeur FullStack', roleEn: 'Fullstack Developer',
    contextFr: 'Outils de recherche de sites réalisés par Solocal et de contrôle qualité, avec notation automatique sur 100 pour évaluer l\'état des sites.',
    contextEn: 'Search and quality-control tools for websites built by Solocal, with an automatic score out of 100 to assess site health.',
    bulletsFr: [
      'Analyse et chiffrage de spécifications client et de conception technique', 'Développement de plusieurs services en Python',
      "Développement d'une API RESTful", 'Gestion des authentifications et mise en place d\'un système de gestion des accès',
      'Développement d\'une plateforme web en Nagare', 'Correction de bugs en production', 'Revue de code et refactoring',
    ],
    bulletsEn: [
      'Analysis and estimation of client specifications and technical design', 'Development of several Python services',
      'Development of a RESTful API', 'Managing authentication and building an access-control system',
      'Development of a web platform in Nagare', 'Production bug fixing', 'Code review and refactoring',
    ],
    tags: ['CSS', 'Docker', 'Git', 'GitLab', 'GitLab CI', 'HTML', 'Nagare', 'PostgreSQL', 'Python', 'RabbitMQ', 'REST APIs', 'Scrum'],
  },
  {
    id: 'rectorat', company: 'Rectorat de l\'académie de Rennes', order: 1, location: 'Rennes', period: '09/2018 – 11/2019 · 1 an 3 mois',
    roleFr: 'Développeur fullstack', roleEn: 'Fullstack Developer',
    contextFr: 'Outil dynamique permettant aux chefs d\'établissement (collèges, lycées) d\'accéder à la documentation et de la modifier sur les pages web des applications métier, sans solliciter les développeurs. Équipe agile de 2 développeurs et un Product Owner.',
    contextEn: 'Dynamic tool allowing school administrators (middle and high schools) to access and edit documentation on business application web pages without needing a developer. Agile team of 2 developers and a Product Owner.',
    bulletsFr: [
      'Analyse et chiffrage de spécifications client et de conception technique', 'Développement de nouvelles fonctionnalités',
      'Développement de plusieurs web services en Java / Kotlin', 'Développement d\'une plateforme web en JavaScript, jQuery, HTML',
      'Développement d\'une API web pour l\'ajout de documentation', 'Développement en méthodologie TDD (Test Driven Development)',
      'Revue de code et refactoring', 'Amélioration de la qualité du code avec SonarQube',
      'Utilisation de Keycloak comme plateforme d\'authentification',
    ],
    bulletsEn: [
      'Analysis and estimation of client specifications and technical design', 'Development of new features',
      'Development of several Java / Kotlin web services', 'Development of a web platform in JavaScript, jQuery, HTML',
      'Development of a web API for adding documentation', 'Development using TDD (Test Driven Development)',
      'Code review and refactoring', 'Improving code quality with SonarQube',
      'Using Keycloak as the authentication platform',
    ],
    tags: ['TDD', 'Java', 'Kotlin', 'JavaScript', 'jQuery', 'HTML', 'SonarQube', 'Keycloak', 'Product Ownership', 'Scrum'],
  },
];

const EDUCATION: Education[] = [
  { id: 'master2', titleFr: 'Master 2 — Ingénierie logicielle', titleEn: 'Master 2 — Software Engineering', school: 'Université de Rennes', date: '10/2019', order: 3 },
  { id: 'master1', titleFr: 'Master 1 — Ingénierie logicielle', titleEn: 'Master 1 — Software Engineering', school: 'Université de Rennes', date: '09/2018', order: 2 },
  { id: 'licence', titleFr: 'Licence — Ingénierie informatique', titleEn: "Bachelor's — Computer Engineering", school: 'Université de Rennes', date: '12/2017', order: 1 },
];

const AGENCIES: Agency[] = [
  { id: 'open-agency', name: 'OPEN', roleFr: 'Concepteur Développeur Senior', roleEn: 'Senior Developer / Designer', date: 'depuis 09/2026', order: 4 },
  { id: 'sogeti', name: 'SOGETI', roleFr: 'Ingénieur logiciel', roleEn: 'Software Engineer', date: '06/2025 – 08/2026', order: 3 },
  { id: 'extia', name: 'EXTIA', roleFr: 'Ingénieur logiciel', roleEn: 'Software Engineer', date: '10/2019 – 05/2025', order: 2 },
  { id: 'rectorat-agency', name: "Rectorat de l'académie de Rennes", roleFr: 'Développeur fullstack', roleEn: 'Fullstack Developer', date: '09/2018 – 11/2019', order: 1 },
];
