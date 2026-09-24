/**
 * Toutes les entités ont un champ fr/en séparé plutôt qu'un objet imbriqué
 * { fr, en } : plus simple à stocker dans Firestore et à éditer avec des
 * Reactive Forms plats (pas de FormGroup imbriqué nécessaire).
 *
 * Les périodes sont stockées en dates 'YYYY-MM' (neutres en langue) ; le
 * libellé et la durée sont calculés à l'affichage (core/period.ts).
 */

export interface Skill {
  fr: string;
  en: string;
}

export interface SkillGroup {
  id: string;
  nameFr: string;
  nameEn: string;
  order: number;
  skills: Skill[];
}

export interface Experience {
  id: string;
  company: string;
  roleFr: string;
  roleEn: string;
  start: string; // 'YYYY-MM'
  end: string | null; // 'YYYY-MM', null = mission en cours
  location: string;
  contextFr: string;
  contextEn: string;
  bulletsFr: string[];
  bulletsEn: string[];
  tags: string[];
  order: number; // ordre d'affichage décroissant (le plus récent = order le plus haut)
  /** @deprecated ancien libellé texte, lu uniquement si `start` est absent (données non migrées). */
  period?: string;
}

export interface Education {
  id: string;
  titleFr: string;
  titleEn: string;
  school: string;
  date: string; // 'MM/YYYY', neutre en langue
  order: number;
}

export interface Agency {
  id: string;
  name: string;
  roleFr: string;
  roleEn: string;
  start: string; // 'YYYY-MM'
  end: string | null; // null = en cours
  order: number;
  /** @deprecated ancien libellé texte, lu uniquement si `start` est absent. */
  date?: string;
}

/**
 * Section « Profil » du site public (document unique `profile/main`).
 * `{years}` dans les paragraphes est remplacé par le nombre d'années calculé.
 * Un champ vide = texte par défaut de l'application.
 */
export interface Profile {
  aboutP1Fr: string;
  aboutP1En: string;
  aboutP2Fr: string;
  aboutP2En: string;
  statYearsFr: string;
  statYearsEn: string;
  statMissionsFr: string;
  statMissionsEn: string;
  statLanguagesFr: string;
  statLanguagesEn: string;
}

export type Lang = 'fr' | 'en';
