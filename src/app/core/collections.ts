/**
 * Noms des collections Firestore. Fichier volontairement sans aucun import
 * pour pouvoir être partagé avec le script Node d'import (scripts/).
 */
export const COLLECTIONS = {
  experiences: 'experiences',
  skills: 'skills',
  education: 'education',
  agencies: 'agencies',
  profile: 'profile',
} as const;

/** La section Profil est un document unique. */
export const PROFILE_DOC_ID = 'main';
