import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import type { CvContent } from './cv-content';

/**
 * CV « classique épuré » : une colonne, bandeau d'en-tête sombre, titres de
 * section en couleur accent. Structure linéaire (titres standards, contenu
 * dans l'ordre de lecture) : la plus sûre pour les logiciels de tri de CV (ATS).
 * Tout le texte reste du vrai texte PDF. Police : Roboto (embarquée par
 * pdfmake), unités en points (A4 = 595 × 842).
 *
 * Coupures de page : une expérience n'est pas insécable en bloc (sinon de
 * grands blancs apparaissent) ; seul son en-tête l'est, et `pageBreakBefore`
 * renvoie à la page suivante un titre qui tomberait en bas de page.
 */

const A4_WIDTH = 595.28;
const M = 48;
const INK = '#1F2933';
const GRAY = '#5B6770';
const ACCENT = '#1B6F93';
const DARK = '#0F1F2E';
const WIDTH = A4_WIDTH - 2 * M;

/** Niveaux utilisés par `pageBreakBefore`. */
const SECTION = 1;
const ENTRY = 2;

export function buildCvDocument(raw: CvContent): TDocumentDefinitions {
  const cv = sanitize(raw);
  return {
    pageSize: 'A4',
    pageMargins: [M, 40, M, 46],
    info: {
      title: `${cv.name} — CV`,
      author: cv.name,
      subject: cv.title,
      keywords: cv.skills.flatMap((g) => g.items).join(', '),
    },
    defaultStyle: {
      font: 'Roboto',
      fontSize: 9.5,
      lineHeight: 1.25,
      color: INK,
      // Pas de ligatures « fi », « fl » : sinon l'extraction de texte (ATS) donne « confguration ».
      fontFeatures: { liga: false, clig: false } as never,
    },
    // Titre de section dans les 14 % bas de page, ou en-tête d'expérience dans les 20 % : page suivante.
    pageBreakBefore: (node) =>
      (node.headlineLevel === SECTION && node.startPosition.verticalRatio > 0.86) ||
      (node.headlineLevel === ENTRY && node.startPosition.verticalRatio > 0.8),
    content: content(cv),
    footer: (current: number, total: number) => ({
      text: `${current} / ${total}`,
      alignment: 'right',
      margin: [M, 14, M, 0],
      fontSize: 7,
      color: '#9AA5AE',
    }),
  };
}

/** Caractères absents de Roboto remplacés par un équivalent affichable. */
const GLYPH_FALLBACKS: [RegExp, string][] = [
  [/↔|⇄|⟷/g, '<->'],
  [/→|⟶/g, '->'],
  [/←|⟵/g, '<-'],
];

function sanitize<T>(value: T): T {
  if (typeof value === 'string') return GLYPH_FALLBACKS.reduce((s, [re, r]) => s.replace(re, r), value as string) as T;
  if (Array.isArray(value)) return value.map(sanitize) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, sanitize(v)])) as T;
  }
  return value;
}

/**
 * Liste de réalisations. Pas de `ul` pdfmake : une puce coupée par un saut de
 * page y disparaît. Chaque ligne « puce + texte » est insécable, la liste se
 * coupe donc proprement entre deux réalisations.
 */
const bullets = (items: string[]): Content => ({
  stack: items.map((text): Content => ({
    unbreakable: true,
    columns: [
      { text: '•', width: 10, color: ACCENT },
      { text, width: '*' },
    ],
    columnGap: 0,
    margin: [2, 0, 0, 1.5],
  })),
  fontSize: 9,
  margin: [0, 4, 0, 0],
});

const section = (label: string): Content => ({
  headlineLevel: SECTION,
  stack: [
    { text: label.toUpperCase(), fontSize: 10.5, bold: true, color: ACCENT, characterSpacing: 0.8 },
    { canvas: [{ type: 'line', x1: 0, y1: 3, x2: WIDTH, y2: 3, lineWidth: 0.8, lineColor: ACCENT }] },
  ],
  margin: [0, 14, 0, 8],
});

/** Ligne « intitulé à gauche, date à droite ». */
const line = (left: Content[], right: string): Content => ({
  unbreakable: true,
  columns: [
    { text: left, width: '*' },
    { text: right, width: 'auto', fontSize: 8.5, color: GRAY, margin: [8, 1, 0, 0] },
  ],
  margin: [0, 0, 0, 4],
});

function content(cv: CvContent): Content[] {
  const contact = {
    email: { text: cv.email, link: `mailto:${cv.email}` },
    linkedin: { text: cv.linkedinLabel, link: cv.linkedinUrl },
    site: { text: cv.siteLabel, link: cv.siteUrl },
  };

  return [
    // Bandeau d'en-tête pleine largeur (marges négatives pour déborder des marges de page).
    {
      table: {
        widths: ['*'],
        body: [[{
          fillColor: DARK,
          margin: [M, 28, M, 22],
          stack: [
            { text: cv.name, fontSize: 22, bold: true, color: '#FFFFFF' },
            { text: [cv.title, cv.yearsLabel ? `  ·  ${cv.yearsLabel}` : ''], fontSize: 11, color: '#9FD8EC', margin: [0, 4, 0, 10] },
            { text: [contact.email, '   ·   ', cv.location], fontSize: 8.5, color: '#C9D6E0' },
            { text: [contact.linkedin, '   ·   ', contact.site], fontSize: 8.5, color: '#C9D6E0', margin: [0, 2, 0, 0] },
          ],
        }]],
      },
      layout: 'noBorders',
      margin: [-M, -40, -M, 6],
    },

    section(cv.labels.profile),
    ...cv.profile.map((p): Content => ({ text: p, margin: [0, 0, 0, 5] })),

    section(cv.labels.skills),
    ...[...cv.skills, ...(cv.languages ? [cv.languages] : [])].map((g): Content => ({
      text: [{ text: `${g.name} : `, bold: true }, g.items.join(', ')],
      margin: [0, 0, 0, 3],
    })),

    section(cv.labels.experience),
    ...cv.experiences.map((e): Content => ({
      margin: [0, 0, 0, 11],
      stack: [
        {
          headlineLevel: ENTRY,
          unbreakable: true,
          stack: [
            {
              columns: [
                { text: [{ text: e.role, bold: true }, '  —  ', { text: e.company, bold: true, color: ACCENT }], width: '*' },
                { text: e.period, width: 'auto', fontSize: 8.5, color: GRAY, margin: [8, 1, 0, 0] },
              ],
            },
            { text: e.location, fontSize: 8.5, color: GRAY, margin: [0, 1, 0, 3] },
            e.context ? { text: e.context, italics: true, color: GRAY, fontSize: 9 } : '',
          ],
        },
        bullets(e.bullets),
        e.tags.length
          ? { text: [{ text: `${cv.labels.techStack} : `, bold: true }, e.tags.join(', ')], fontSize: 8, color: GRAY, margin: [0, 4, 0, 0] }
          : '',
      ],
    })),

    section(cv.labels.education),
    ...cv.education.map((d) => line([{ text: d.title, bold: true }, `  —  ${d.school}`], d.date)),

    ...(cv.agencies.length ? [section(cv.labels.agencies)] : []),
    ...cv.agencies.map((a) => line([{ text: a.name, bold: true }, `  —  ${a.role}`], a.period)),
  ];
}
