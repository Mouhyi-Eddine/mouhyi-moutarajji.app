import type { Lang } from '../models/portfolio.models';

/** Jour au format 'YYYY-MM-DD' (valeur d'un <input type="date">). */
export type IsoDay = string;

const DAY = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Date du jour, dans le fuseau du visiteur, au format 'YYYY-MM-DD'. */
export function today(now = new Date()): IsoDay {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/**
 * Date de disponibilité à afficher, ou null : vide, mal formée ou déjà passée
 * (un badge « disponible depuis » une date passée ferait mauvais effet).
 * Le jour même reste affiché. Les dates 'YYYY-MM-DD' se comparent comme des chaînes.
 */
export function upcomingAvailability(value: string | null | undefined, now = new Date()): IsoDay | null {
  return value && DAY.test(value) && value >= today(now) ? value : null;
}

const LONG_DATE: Record<Lang, Intl.DateTimeFormat> = {
  fr: new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }),
  en: new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }),
};

/** '2026-10-01' → '1er octobre 2026' (FR) / 'October 1, 2026' (EN). */
export function formatDay(value: IsoDay, lang: Lang): string {
  const m = DAY.exec(value);
  if (!m) return value;
  const text = LONG_DATE[lang].format(new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))));
  return lang === 'fr' ? text.replace(/^1 /, '1er ') : text;
}
