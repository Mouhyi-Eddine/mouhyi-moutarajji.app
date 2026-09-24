import type { Lang } from '../models/portfolio.models';

/** Mois au format 'YYYY-MM' (valeur d'un <input type="month">). */
export type YearMonth = string;

const YM = /^(\d{4})-(\d{2})$/;

function toIndex(ym: YearMonth): number | null {
  const m = YM.exec(ym);
  return m ? Number(m[1]) * 12 + Number(m[2]) - 1 : null;
}

function currentMonth(now: Date): YearMonth {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/** Nombre de mois, bornes incluses (02/2026 → 08/2026 = 7). Fin vide = mois en cours. */
export function monthsBetween(start: YearMonth, end: YearMonth | null, now = new Date()): number {
  const a = toIndex(start);
  const b = toIndex(end || currentMonth(now));
  return a === null || b === null ? 0 : Math.max(1, b - a + 1);
}

/** Années complètes écoulées depuis `start` (pour « 8 ans d'expérience »). */
export function fullYearsSince(start: YearMonth, now = new Date()): number {
  const a = toIndex(start);
  const b = toIndex(currentMonth(now));
  return a === null || b === null ? 0 : Math.floor((b - a) / 12);
}

/** '2026-02' → '02/2026' */
export function formatMonth(ym: YearMonth): string {
  const m = YM.exec(ym);
  return m ? `${m[2]}/${m[1]}` : ym;
}

export function formatDuration(months: number, lang: Lang): string {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts: string[] = [];
  if (lang === 'fr') {
    if (years) parts.push(`${years} ${years > 1 ? 'ans' : 'an'}`);
    if (rest) parts.push(`${rest} mois`);
  } else {
    if (years) parts.push(`${years} ${years > 1 ? 'years' : 'year'}`);
    if (rest) parts.push(`${rest} ${rest > 1 ? 'months' : 'month'}`);
  }
  return parts.join(' ');
}

/** '02/2026 – 08/2026 · 7 mois' ; fin vide → '09/2026 – aujourd'hui · 1 mois'. */
export function formatPeriod(start: YearMonth, end: YearMonth | null, lang: Lang, withDuration = true): string {
  const to = end ? formatMonth(end) : lang === 'fr' ? "aujourd'hui" : 'present';
  const range = `${formatMonth(start)} – ${to}`;
  return withDuration ? `${range} · ${formatDuration(monthsBetween(start, end), lang)}` : range;
}
