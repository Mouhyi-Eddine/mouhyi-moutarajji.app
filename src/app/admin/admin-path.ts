/**
 * Chemin du panel admin : non listé dans la navigation, accessible seulement
 * en tapant l'URL. C'est de la discrétion, pas de la sécurité (le chemin figure
 * dans le bundle JS) : la vraie protection, ce sont Firebase Auth + les règles
 * Firestore qui n'autorisent l'écriture qu'à l'UID admin.
 * Pour le changer, modifiez uniquement cette constante.
 */
export const ADMIN_PATH = 'panel-94y3q6khdy2y';
