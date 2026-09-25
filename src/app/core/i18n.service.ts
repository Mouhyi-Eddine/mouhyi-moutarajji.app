import { Injectable, signal, effect } from '@angular/core';
import { Lang } from '../models/portfolio.models';
import { formatMonth, formatPeriod } from './period';

const STR: Record<Lang, Record<string, string>> = {
  fr: {
    'nav.about': 'Profil',
    'nav.skills': 'Compétences',
    'nav.experience': 'Expériences',
    'nav.education': 'Formation',
    'nav.contact': 'Contact',
    'nav.openMenu': 'Ouvrir le menu',
    'nav.closeMenu': 'Fermer le menu',
    'hero.role': 'Ingénieur logiciel',
    'hero.years': "{years} ans d'expérience",
    'hero.title': 'Ingénieur logiciel · Développeur Web Fullstack',
    'hero.lead':
      "Reprendre l'existant, comprendre pourquoi il tient debout, et le faire avancer sans rien casser — c'est le fil rouge de mes missions pour la RATP, la CNAF, la SNCF, VINCI et d'autres.",
    'hero.cta1': 'Voir les expériences',
    'hero.cta2': 'Me contacter',
    'timeline.label': 'Chronologie : {n} missions de {from} à aujourd’hui ({companies}).',
    'timeline.now': "Aujourd'hui",
    'about.title': 'Profil',
    'skills.title': 'Compétences techniques',
    'exp.title': 'Expériences professionnelles',
    'exp.missions': 'missions',
    'exp.showMore': 'Voir les {n} autres réalisations',
    'exp.showMoreOne': "Voir l'autre réalisation",
    'exp.showLess': 'Réduire',
    'edu.title': 'Formation',
    'agency.title': 'Sociétés de conseil',
    'contact.title': 'Discutons de votre projet.',
    'contact.mailLabel': 'Envoyer un e-mail à Mouhyi Eddine Moutarajji',
    'contact.linkedinLabel': 'LinkedIn (ouvre un nouvel onglet)',
    'footer': 'Mouhyi Eddine Moutarajji — Rennes, France',
    'skip.link': 'Aller au contenu',
    'data.error': 'Le contenu détaillé est momentanément indisponible. Merci de réessayer dans quelques instants.',
    'cv.download': 'Télécharger le CV',
    'cv.downloadLabel': "Télécharger le CV au format PDF (s'ouvre dans un nouvel onglet)",
    'cv.generating': 'Génération du PDF…',
    'cv.error': 'La génération du PDF a échoué. Merci de réessayer.',
    'cv.blocked': "Le navigateur a bloqué l'ouverture du CV. Autorisez les fenêtres pop-up pour ce site, puis réessayez.",
    'cv.techStack': 'Environnement technique',
  },
  en: {
    'nav.about': 'Profile',
    'nav.skills': 'Skills',
    'nav.experience': 'Experience',
    'nav.education': 'Education',
    'nav.contact': 'Contact',
    'nav.openMenu': 'Open menu',
    'nav.closeMenu': 'Close menu',
    'hero.role': 'Software Engineer',
    'hero.years': '{years} years of experience',
    'hero.title': 'Software Engineer · Full-Stack Web Developer',
    'hero.lead':
      "Taking over existing systems, understanding what keeps them standing, and moving them forward without breaking anything — that's the common thread of my work for RATP, CNAF, SNCF, VINCI and others.",
    'hero.cta1': 'See my experience',
    'hero.cta2': 'Get in touch',
    'timeline.label': 'Timeline: {n} assignments from {from} to today ({companies}).',
    'timeline.now': 'Today',
    'about.title': 'Profile',
    'skills.title': 'Technical skills',
    'exp.title': 'Professional experience',
    'exp.missions': 'assignments',
    'exp.showMore': 'Show {n} more achievements',
    'exp.showMoreOne': 'Show 1 more achievement',
    'exp.showLess': 'Show less',
    'edu.title': 'Education',
    'agency.title': 'Consulting firms',
    'contact.title': "Let's talk about your project.",
    'contact.mailLabel': 'Send an email to Mouhyi Eddine Moutarajji',
    'contact.linkedinLabel': 'LinkedIn (opens in a new tab)',
    'footer': 'Mouhyi Eddine Moutarajji — Rennes, France',
    'skip.link': 'Skip to content',
    'data.error': 'Some content is temporarily unavailable. Please try again in a moment.',
    'cv.download': 'Download CV (French)',
    'cv.downloadLabel': 'Download CV (French) as a PDF (opens in a new tab)',
    'cv.generating': 'Generating PDF…',
    'cv.error': "Couldn't generate the PDF. Please try again.",
    'cv.blocked': 'Your browser blocked the CV from opening. Allow pop-ups for this site, then try again.',
  },
};

const TITLE: Record<Lang, string> = {
  fr: 'Mouhyi Eddine Moutarajji — Ingénieur logiciel · Développeur Web Fullstack',
  en: 'Mouhyi Eddine Moutarajji — Software Engineer · Full-Stack Web Developer',
};

const DESCRIPTION: Record<Lang, string> = {
  fr: 'Mouhyi Eddine Moutarajji, ingénieur logiciel et développeur web fullstack à Rennes — missions pour la RATP, la CNAF, la SNCF et VINCI.',
  en: 'Mouhyi Eddine Moutarajji, software engineer and full-stack web developer based in Rennes, France — work for RATP, CNAF, SNCF and VINCI.',
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
  t(key: string, vars?: Record<string, string | number>, lang: Lang = this.lang()): string {
    return interpolate(STR[lang][key] ?? STR.fr[key] ?? key, vars);
  }

  /** Choisit le champ FR ou EN selon la langue courante. */
  pick(fr: string, en: string, lang: Lang = this.lang()): string {
    return lang === 'en' ? en : fr;
  }

  /** Période localisée ; `legacy` = ancien libellé texte des documents pas encore migrés. */
  period(start: string | undefined, end: string | null | undefined, legacy?: string, withDuration = true, lang: Lang = this.lang()): string {
    return start ? formatPeriod(start, end ?? null, lang, withDuration) : (legacy ?? '');
  }

  /** Mois isolé localisé : '10/2019' ou '2019-10' → '10/2019' (FR) / 'Oct 2019' (EN). */
  month(value: string, lang: Lang = this.lang()): string {
    const m = /^(\d{2})\/(\d{4})$/.exec(value);
    return formatMonth(m ? `${m[2]}-${m[1]}` : value, lang);
  }
}

/** Remplace les {clé} par leur valeur. */
export function interpolate(text: string, vars?: Record<string, string | number>): string {
  if (!vars) return text;
  return Object.entries(vars).reduce((acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)), text);
}
