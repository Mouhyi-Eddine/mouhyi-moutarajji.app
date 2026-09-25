import { Lang, Profile, ProfileTexts } from '../models/portfolio.models';
import { interpolate } from './i18n.service';

/**
 * Textes par défaut de la section Profil, utilisés tant que le document
 * Firestore `profile/main` n'existe pas (ou pour un champ laissé vide).
 * Le panel admin part de ces valeurs à la première édition.
 */
export const DEFAULT_PROFILE: ProfileTexts = {
  aboutP1Fr:
    "Ingénieur en informatique avec {years} ans d'expérience, j'ai construit une expertise solide sur le développement logiciel et la gestion de projets, principalement sur des applications métier en environnement Java / Angular.",
  aboutP1En:
    "I'm a software engineer with {years} years of experience designing and building business applications, mostly with Java and Angular, and a solid grounding in both hands-on development and project delivery.",
  aboutP2Fr:
    "Je maintiens une veille active sur les technologies émergentes, et j'aime particulièrement les missions où il faut reprendre l'existant : comprendre une architecture en place, la moderniser par étapes, sans interrompre le service.",
  aboutP2En:
    'I keep a close eye on emerging technologies, and I especially enjoy taking over existing systems: understanding the architecture already in place, then modernizing it step by step without disrupting the service.',
  statYearsFr: "ans d'expérience",
  statYearsEn: 'years of experience',
  statMissionsFr: 'missions clients',
  statMissionsEn: 'client assignments',
  statLanguagesFr: 'langues parlées',
  statLanguagesEn: 'languages spoken',
};

type ProfileText = 'aboutP1' | 'aboutP2' | 'statYears' | 'statMissions' | 'statLanguages';

/** Texte du profil dans la langue demandée : valeur Firestore, sinon valeur par défaut. */
export function profileText(profile: Profile | null, key: ProfileText, lang: Lang, years: number | null): string {
  const field = `${key}${lang === 'en' ? 'En' : 'Fr'}` as keyof ProfileTexts;
  const text = profile?.[field]?.trim() || DEFAULT_PROFILE[field];
  return interpolate(text, { years: years ?? '—' });
}
