/**
 * Toutes les entités ont un champ fr/en séparé plutôt qu'un objet imbriqué
 * { fr, en } : plus simple à stocker dans Firestore et à éditer avec des
 * Reactive Forms plats (pas de FormGroup imbriqué nécessaire).
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
  period: string;
  location: string;
  contextFr: string;
  contextEn: string;
  bulletsFr: string[];
  bulletsEn: string[];
  tags: string[];
  order: number; // ordre d'affichage décroissant (le plus récent = order le plus haut)
}

export interface Education {
  id: string;
  titleFr: string;
  titleEn: string;
  school: string;
  date: string;
  order: number;
}

export interface Agency {
  id: string;
  name: string;
  roleFr: string;
  roleEn: string;
  date: string;
  order: number;
}

export type Lang = 'fr' | 'en';
