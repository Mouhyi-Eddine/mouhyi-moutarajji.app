import { Injectable, signal, effect } from '@angular/core';
import { Lang } from '../models/portfolio.models';

const STR: Record<Lang, Record<string, string>> = {
  fr: {
    'nav.about': 'Profil',
    'nav.skills': 'Compétences',
    'nav.experience': 'Expériences',
    'nav.education': 'Formation',
    'nav.contact': 'Contact',
    'hero.kicker': "Ingénieur logiciel · 8 ans d'expérience",
    'hero.title': 'Ingénieur logiciel senior — Java / Angular',
    'hero.lead':
      "Java & Angular full-stack. Ingénieur logiciel pour la RATP, la CNAF, SNCF, VINCI et d'autres, avec un fil rouge : faire évoluer des applications existantes sans casser ce qui marche.",
    'hero.cta1': 'Voir les expériences',
    'hero.cta2': 'Me contacter',
    'about.title': 'Profil',
    'about.p1':
      "Ingénieur en informatique avec 8 ans d'expérience, j'ai construit une expertise solide sur le développement logiciel et la gestion de projets, principalement sur des applications métier en environnement Java / Angular.",
    'about.p2':
      "Je maintiens une veille active sur les technologies émergentes, et j'aime particulièrement les missions où il faut reprendre l'existant : comprendre une architecture en place, la moderniser par étapes, sans interrompre le service.",
    'about.stat1': "ans d'expérience",
    'about.stat2': 'missions clients',
    'about.stat3': 'langues parlées',
    'skills.title': 'Compétences techniques',
    'exp.title': 'Expériences professionnelles',
    'exp.missions': 'missions',
    'exp.showMore': 'Voir les {n} autres réalisations',
    'exp.showLess': 'Réduire',
    'edu.title': 'Formation',
    'agency.title': 'Sociétés de conseil',
    'contact.title': 'Discutons de votre projet.',
    'contact.mailLabel': 'Envoyer un e-mail à Mouhyi Eddine Moutarajji',
    'contact.linkedinLabel': 'LinkedIn (ouvre un nouvel onglet)',
    'footer': 'Mouhyi Eddine Moutarajji — Rennes, France',
    'skip.link': 'Aller au contenu',
    'data.error': 'Le contenu détaillé est momentanément indisponible. Merci de réessayer dans quelques instants.',
  },
  en: {
    'nav.about': 'Profile',
    'nav.skills': 'Skills',
    'nav.experience': 'Experience',
    'nav.education': 'Education',
    'nav.contact': 'Contact',
    'hero.kicker': 'Software engineer · 8 years of experience',
    'hero.title': 'Senior Software Engineer — Java / Angular',
    'hero.lead':
      'Java & Angular full-stack. Software engineer for RATP, CNAF, SNCF, VINCI and others, with a common thread: evolving existing applications without breaking what works.',
    'hero.cta1': 'View experience',
    'hero.cta2': 'Get in touch',
    'about.title': 'Profile',
    'about.p1':
      "Software engineer with 8 years of experience, I've built solid expertise in software development and project management, mainly on business applications in Java / Angular environments.",
    'about.p2':
      'I keep an active watch on emerging technologies, and I particularly enjoy missions that involve picking up existing systems: understanding an architecture already in place and modernizing it step by step, without interrupting the service.',
    'about.stat1': 'years of experience',
    'about.stat2': 'client missions',
    'about.stat3': 'languages spoken',
    'skills.title': 'Technical skills',
    'exp.title': 'Professional experience',
    'exp.missions': 'missions',
    'exp.showMore': 'Show {n} more achievements',
    'exp.showLess': 'Show less',
    'edu.title': 'Education',
    'agency.title': 'Consulting firms',
    'contact.title': "Let's talk about your project.",
    'contact.mailLabel': 'Send an email to Mouhyi Eddine Moutarajji',
    'contact.linkedinLabel': 'LinkedIn (opens in a new tab)',
    'footer': 'Mouhyi Eddine Moutarajji — Rennes, France',
    'skip.link': 'Skip to content',
    'data.error': 'Detailed content is temporarily unavailable. Please try again in a moment.',
  },
};

const TITLE: Record<Lang, string> = {
  fr: 'Mouhyi Eddine Moutarajji — Ingénieur logiciel senior Java / Angular',
  en: 'Mouhyi Eddine Moutarajji — Senior Software Engineer Java / Angular',
};

const DESCRIPTION: Record<Lang, string> = {
  fr: "Mouhyi Eddine Moutarajji, ingénieur logiciel senior Java / Angular, 8 ans d'expérience — RATP, CNAF, SNCF, VINCI.",
  en: 'Mouhyi Eddine Moutarajji, senior software engineer in Java / Angular, with 8 years of experience — RATP, CNAF, SNCF, VINCI.',
};

function detectInitialLang(): Lang {
  try {
    const stored = localStorage.getItem('mm_lang');
    if (stored === 'fr' || stored === 'en') return stored;
  } catch {
    /* localStorage indisponible (mode privé, etc.) : on ignore */
  }
  return navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'fr';
}

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly lang = signal<Lang>(detectInitialLang());

  constructor() {
    // Effet de bord : <html lang>, <title>, <meta name="description">, persistance.
    effect(() => {
      const lang = this.lang();
      document.documentElement.lang = lang;
      document.title = TITLE[lang];
      document.querySelector('meta[name="description"]')?.setAttribute('content', DESCRIPTION[lang]);
      try {
        localStorage.setItem('mm_lang', lang);
      } catch {
        /* ignore */
      }
    });
  }

  setLang(lang: Lang): void {
    this.lang.set(lang);
  }

  /** Traduction d'une clé statique, avec interpolation simple {n}. */
  t(key: string, vars?: Record<string, string | number>): string {
    const value = STR[this.lang()][key] ?? STR.fr[key] ?? key;
    if (!vars) return value;
    return Object.entries(vars).reduce((acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)), value);
  }

  /** Choisit le champ FR ou EN selon la langue courante. */
  pick(fr: string, en: string): string {
    return this.lang() === 'en' ? en : fr;
  }
}
