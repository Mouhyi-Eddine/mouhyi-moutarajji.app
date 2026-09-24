/**
 * Textes anglais relus (septembre 2026) : tournures anglaises naturelles
 * plutôt que calques du français (verbes d'action au passé pour les
 * réalisations, intitulés de poste harmonisés, sigles français explicités).
 *
 * Source unique pour seed-data.ts et pour `npm run apply:en-content`, qui
 * pousse ces textes dans Firestore. Chaque liste de réalisations a
 * exactement le même nombre d'éléments que sa version française.
 */

export const EXPERIENCES_EN: Record<string, { roleEn: string; contextEn: string; bulletsEn: string[] }> = {
  open: {
    roleEn: 'Senior Software Engineer',
    contextEn: 'Ongoing software design and development engagement with OPEN.',
    bulletsEn: ['Assignment in progress'],
  },
  ratp: {
    roleEn: 'Software Engineer',
    contextEn:
      'Modernization of a CCTV supervision and management application: viewing, configuring and administering the cameras deployed across metro stations, and handling installation and configuration requests.',
    bulletsEn: [
      'Handled corrective and evolutionary maintenance of the existing application',
      'Contributed to the full redesign of the application',
      'Migrated the back end from Java 8 to Java 21',
      'Migrated the front end from AngularJS to Angular 19',
      'Designed and built new user interfaces in Angular 19',
      'Rebuilt and modernized existing features in the new version',
      'Wrote unit tests and raised test coverage',
      'Created and automated API test scenarios with Bruno',
      'Ran functional tests and validated new features',
      'Fixed bugs',
      'Took part in code reviews and continuous improvement',
      'Wrote technical documentation',
    ],
  },
  cnaf: {
    roleEn: 'Software Engineer',
    contextEn:
      'Online procedures on the caf.fr benefits portal (France Travail integration, reducing benefit non-take-up): change-of-circumstances declarations, activity bonus, RSA income support and bank details.',
    bulletsEn: [
      'Delivered user stories across several online procedures (AJPA, DPA, DPN, DPF…)',
      'Built new front-end features in Angular 17/19',
      'Implemented new API endpoints in Java / Spring Boot',
      'Fixed bugs and stabilized Saxo',
      'Completed digital accessibility training',
      'Improved accessibility across the online procedures',
      'Shared knowledge and onboarded new team members',
      'Kept documentation up to date and drove continuous improvement',
    ],
  },
  emerga: {
    roleEn: 'Full-Stack Developer',
    contextEn: 'EmerGa / SINAPSE: solutions that plug into emergency response and help bystanders act in crisis situations.',
    bulletsEn: [
      'Analyzed and estimated client specifications and technical designs',
      'Built new front-end features in React.js',
      'Implemented new API endpoints',
      'Built WebSocket channels between the two applications (EmerGa ↔ Sinapse)',
      'Wrote new PostgreSQL migrations',
      'Refactored the React code and reorganized the project architecture',
    ],
  },
  maugin: {
    roleEn: 'Full-Stack Developer',
    contextEn: 'Industrial joinery manufacturer (3 plants, ~300 employees): new features for the existing business software.',
    bulletsEn: [
      'Gathered the business context behind reported issues',
      'Analyzed possible ways to resolve them',
      'Evaluated solutions together with the client',
      'Led framework version upgrades',
      'Implemented new features and pages in Angular',
      'Improved the API and added new endpoints in NestJS',
      'Produced project deliverables',
      'Managed releases and coordinated testing',
      'Developed features and wrote unit tests',
    ],
  },
  sncf: {
    roleEn: 'Software Developer',
    contextEn:
      'Modeling tool for power-supply diagrams on secondary railway tracks, where accurate diagram reading and consistent results were critical.',
    bulletsEn: [
      'Analyzed and estimated change requests',
      'Ran workshops with the client to refine requirements',
      'Built proofs of concept to select a suitable library',
      'Implemented a graphical diagram editor with JointJS',
      'Delivered user stories to specification',
      'Built CSV import / export for diagrams',
      'Developed a graph-traversal algorithm and calculation rules',
      'Wrote unit tests',
      'Packaged and shipped a Windows desktop app with Electron',
      'Wrote and ran functional tests',
    ],
  },
  vinci: {
    roleEn: 'Full-Stack Developer',
    contextEn:
      '"Académie" application — front office and back office where employees apply for internal and external training courses; four-person team.',
    bulletsEn: [
      'Analyzed and estimated change requests',
      'Upgraded the application from Java 8 to Java 17',
      'Built reliable, secure Java / Spring Boot APIs',
      'Investigated and fixed bugs',
      'Developed several Java services',
      'Reworked the front end and UI, adding new screens and features',
      'Refactored and optimized existing back-end services',
      'Fixed production bugs',
      'Upgraded several libraries (Aspose, Hibernate, jQuery…)',
      'Performed code reviews and refactoring',
    ],
  },
  'netng-acoshop': {
    roleEn: 'Full-Stack Developer',
    contextEn: 'Acoshop, a purchasing and quoting web application for Acorus subcontractors, including supplier stock management.',
    bulletsEn: [
      'Generated purchase quotes for subcontractors and employees',
      'Implemented quote confirmation and purchase order generation',
      'Generated quote PDFs',
      'Emailed quotes to customers',
      'Enabled quote editing (adding and removing items, changing quantities)',
      'Added saving of purchase drafts (shopping cart)',
      'Allowed duplicating an existing purchase request into a new draft',
      'Fixed bugs across the application',
      'Fixed a mobile authentication bug',
    ],
  },
  'netng-solocal': {
    roleEn: 'Full-Stack Developer',
    contextEn:
      "Search and quality-control tools for websites built by Solocal, with an automatic score out of 100 rating each site's health.",
    bulletsEn: [
      'Analyzed and estimated client specifications and technical designs',
      'Developed several Python services',
      'Built a RESTful API',
      'Implemented authentication and an access-control system',
      'Built a web platform with Nagare',
      'Fixed production bugs',
      'Performed code reviews and refactoring',
    ],
  },
  rectorat: {
    roleEn: 'Full-Stack Developer',
    contextEn:
      'A tool that lets school principals (middle and high schools) view and edit the documentation shown in business applications without involving a developer. Agile team of two developers and a Product Owner.',
    bulletsEn: [
      'Analyzed and estimated client specifications and technical designs',
      'Developed new features',
      'Built several web services in Java / Kotlin',
      'Built a web platform with JavaScript, jQuery and HTML',
      'Developed a web API for adding documentation',
      'Worked test-first (TDD)',
      'Performed code reviews and refactoring',
      'Improved code quality with SonarQube',
      'Integrated Keycloak for authentication',
    ],
  },
};

export const AGENCIES_EN: Record<string, { roleEn: string }> = {
  'open-agency': { roleEn: 'Senior Software Engineer' },
  sogeti: { roleEn: 'Software Engineer' },
  extia: { roleEn: 'Software Engineer' },
  'rectorat-agency': { roleEn: 'Full-Stack Developer' },
};

export const EDUCATION_EN: Record<string, { titleEn: string }> = {
  master2: { titleEn: "Master's Degree — Software Engineering" },
  master1: { titleEn: "Master's Degree, Year 1 — Software Engineering" },
  licence: { titleEn: "Bachelor's Degree — Computer Engineering" },
};

/** Catégories de compétences : nom anglais, et traduction des compétences dont le libellé change (clé = libellé FR). */
export const SKILL_GROUPS_EN: Record<string, { nameEn: string; skills?: Record<string, string> }> = {
  'data-infra': { nameEn: 'Data & infrastructure' },
  'methods-tools': { nameEn: 'Methods & tools' },
  languages: {
    nameEn: 'Languages',
    skills: {
      'Arabe — natif': 'Arabic — native',
      'Français — natif': 'French — native',
      'Anglais — professionnel': 'English — professional proficiency',
    },
  },
};
