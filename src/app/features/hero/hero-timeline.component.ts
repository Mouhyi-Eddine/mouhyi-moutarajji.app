import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { I18nService } from '../../core/i18n.service';
import { formatPeriod } from '../../core/period';
import { PortfolioDataService } from '../../core/portfolio-data.service';

/**
 * Géométrie (px, repère = largeur réelle du conteneur : le texte garde sa taille sur mobile).
 * Les valeurs utilisées en CSS (hauteur, police) sont reprises en dur dans styles.
 */
const HEIGHT = 124;
const PAD_X = 14;
const TRACK_Y = 76;
const BAR_H = 8;
const LANE_H = 17;
const MAX_LANES = 3;
const LABEL_FONT = 11;
const CHAR_W = LABEL_FONT * 0.62; // IBM Plex Mono : chasse fixe
const LABEL_GAP = 10;

interface Bar {
  id: string;
  x: number;
  width: number;
  ongoing: boolean;
  delay: number;
  ariaLabel: string;
  label: { text: string; x: number; y: number; anchor: 'start' | 'middle' | 'end'; lineX: number } | null;
}

/** 'YYYY-MM' → index de mois absolu. */
const monthIndex = (ym: string): number => {
  const [y, m] = ym.split('-').map(Number);
  return y * 12 + m - 1;
};

/** Libellé court : « Net-ng — Acoshop » → « Acoshop », noms longs → premier mot. */
function shortName(company: string): string {
  const name = company.includes('—') ? company.split('—').pop()!.trim() : company.trim();
  return name.length > 14 ? name.split(/\s+/)[0] : name;
}

/**
 * Frise chronologique du hero, générée depuis les expériences Firestore.
 * Tout est dérivé par computed() : données, langue et largeur du conteneur.
 */
@Component({
  selector: 'app-hero-timeline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="schema" [class.play]="visible()">
      @if (layout(); as l) {
        <svg [attr.viewBox]="'0 0 ' + l.width + ' ' + height" [attr.width]="l.width" [attr.height]="height"
             role="group" [attr.aria-label]="l.summary">
          <line class="axis" [attr.x1]="padX" [attr.x2]="l.width - padX" [attr.y1]="trackY" [attr.y2]="trackY" />
          @for (tick of l.ticks; track tick.year) {
            <g class="tick" aria-hidden="true">
              <line [attr.x1]="tick.x" [attr.x2]="tick.x" [attr.y1]="trackY + 7" [attr.y2]="trackY + 12" />
              <text [attr.x]="tick.x" [attr.y]="trackY + 28" text-anchor="middle">{{ tick.year }}</text>
            </g>
          }
          @for (bar of l.bars; track bar.id) {
            <a class="mission" [attr.href]="'#exp-' + bar.id" [attr.aria-label]="bar.ariaLabel" [style.--d]="bar.delay + 'ms'">
              <title>{{ bar.ariaLabel }}</title>
              @if (bar.label; as lb) {
                <line class="leader" [attr.x1]="lb.lineX" [attr.x2]="lb.lineX" [attr.y1]="lb.y + 4" [attr.y2]="trackY - bar_h / 2 - 1" />
                <text class="label" [attr.x]="lb.x" [attr.y]="lb.y" [attr.text-anchor]="lb.anchor">{{ lb.text }}</text>
              }
              <rect class="bar" [attr.x]="bar.x" [attr.y]="trackY - bar_h / 2" [attr.width]="bar.width" [attr.height]="bar_h" rx="3" />
              <!-- Zone de clic élargie autour de la barre -->
              <rect class="hit" [attr.x]="bar.x" [attr.y]="trackY - 14" [attr.width]="bar.width" height="28" />
              @if (bar.ongoing) {
                <circle class="now" [attr.cx]="bar.x + bar.width" [attr.cy]="trackY" r="5" />
              }
            </a>
          }
        </svg>
      } @else {
        <div class="placeholder" aria-hidden="true"><span class="skeleton"></span></div>
      }
    </div>
  `,
  styles: `
    :host { display: block; margin-top: 56px; }
    .schema { border: 1px solid var(--line); border-radius: 6px; background: var(--bg-alt); padding: 8px 0 4px; overflow: hidden; }
    svg { display: block; overflow: visible; }
    .placeholder { height: 124px; display: flex; align-items: center; padding: 0 14px; }
    .placeholder .skeleton { width: 100%; height: 8px; margin: 0; }

    .axis { stroke: var(--line); stroke-width: 1; }
    .tick line { stroke: var(--line); }
    .tick text { font: 400 10px 'IBM Plex Mono', monospace; fill: var(--ink-dimmer); }
    /* Liseré couleur de fond : deux missions qui se chevauchent restent distinctes. */
    .bar { fill: var(--accent); stroke: var(--bg-alt); stroke-width: 2; paint-order: stroke; transition: fill .15s; }
    .hit { fill: transparent; }
    .leader { stroke: var(--line); stroke-width: 1; }
    .label { font: 500 11px 'IBM Plex Mono', monospace; fill: var(--ink-dim); transition: fill .15s; }
    .now { fill: var(--amber); stroke: var(--bg-alt); stroke-width: 2; }

    .mission { cursor: pointer; outline: none; }
    .mission:hover .bar, .mission:focus-visible .bar { fill: #9ADCF2; }
    .mission:hover .label, .mission:focus-visible .label { fill: var(--ink); }
    .mission:focus-visible .bar { stroke: var(--ink); }

    /* Animation : les barres se dessinent chronologiquement dès que la frise est visible. */
    @media (prefers-reduced-motion: no-preference) {
      .bar { transform-box: fill-box; transform-origin: left center; transform: scaleX(0); }
      .label, .leader, .now, .tick { opacity: 0; }
      .play .bar { animation: grow .5s cubic-bezier(.2,.7,.2,1) var(--d) forwards; }
      .play .label, .play .leader { animation: fade .35s ease calc(var(--d) + .3s) forwards; }
      .play .tick { animation: fade .6s ease .1s forwards; }
      .play .now { animation: fade .3s ease calc(var(--d) + .5s) forwards, pulse 2.4s ease-in-out calc(var(--d) + .9s) infinite; }
      @keyframes grow { to { transform: scaleX(1); } }
      @keyframes fade { to { opacity: 1; } }
      @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .35; } }
    }
  `,
})
export class HeroTimelineComponent {
  private readonly data = inject(PortfolioDataService);
  private readonly i18n = inject(I18nService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly height = HEIGHT;
  readonly padX = PAD_X;
  readonly trackY = TRACK_Y;
  readonly bar_h = BAR_H;

  private readonly width = signal(0);
  readonly visible = signal(false);

  readonly layout = computed(() => {
    const width = this.width();
    const lang = this.i18n.lang();
    const exps = this.data.experiences()
      .filter((e) => e.start)
      .sort((a, b) => a.start.localeCompare(b.start));
    if (!width || !exps.length) return null;

    const now = new Date();
    const nowIdx = now.getFullYear() * 12 + now.getMonth();
    const firstYear = Number(exps[0].start.slice(0, 4));
    const minIdx = firstYear * 12; // janvier de la première année
    const maxIdx = nowIdx + 2;
    const inner = width - 2 * PAD_X;
    const x = (idx: number) => PAD_X + ((idx - minIdx) / (maxIdx - minIdx)) * inner;

    // Graduations annuelles, espacées d'au moins 34 px (une année sur deux sur mobile).
    const pxPerYear = (inner * 12) / (maxIdx - minIdx);
    const step = Math.max(1, Math.ceil(34 / pxPerYear));
    const ticks = [];
    for (let y = firstYear; y * 12 <= maxIdx; y += step) ticks.push({ year: y, x: x(y * 12) });

    // Placement des libellés : première rangée libre, sinon libellé masqué (le <title> reste).
    const laneEnd = Array<number>(MAX_LANES).fill(-Infinity);
    const bars: Bar[] = exps.map((e, i) => {
      const startIdx = monthIndex(e.start);
      const endIdx = e.end ? monthIndex(e.end) + 1 : nowIdx + 1;
      const bx = x(startIdx);
      const bw = Math.max(4, x(endIdx) - bx - 2); // 2 px d'écart entre missions contiguës
      const text = shortName(e.company);
      const textW = text.length * CHAR_W;
      const center = bx + bw / 2;
      // Ancrage selon la position : évite de sortir du cadre aux extrémités.
      let anchor: 'start' | 'middle' | 'end' = 'middle';
      let lx = center;
      if (center - textW / 2 < PAD_X) { anchor = 'start'; lx = Math.max(PAD_X, bx); }
      else if (center + textW / 2 > width - PAD_X) { anchor = 'end'; lx = Math.min(width - PAD_X, bx + bw); }
      const left = anchor === 'start' ? lx : anchor === 'end' ? lx - textW : lx - textW / 2;
      const lane = laneEnd.findIndex((end) => left > end + LABEL_GAP);
      let label: Bar['label'] = null;
      if (lane !== -1) {
        laneEnd[lane] = left + textW;
        label = { text, x: lx, y: TRACK_Y - 18 - lane * LANE_H, anchor, lineX: Math.min(Math.max(center, bx + 1), bx + bw - 1) };
      }
      const role = lang === 'en' ? e.roleEn : e.roleFr;
      return {
        id: e.id,
        x: bx,
        width: bw,
        ongoing: !e.end,
        delay: 150 + i * 110,
        ariaLabel: `${e.company} — ${role}, ${formatPeriod(e.start, e.end, lang)}`,
        label,
      };
    });

    const summary = this.i18n.t('timeline.label', {
      n: exps.length,
      from: firstYear,
      companies: exps.map((e) => shortName(e.company)).join(', '),
    });
    return { width, ticks, bars, summary };
  });

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const el = this.host.nativeElement;
      // - 2 : bordures du cadre
      const resize = new ResizeObserver(([entry]) => this.width.set(Math.max(0, Math.floor(entry.contentRect.width) - 2)));
      resize.observe(el);
      destroyRef.onDestroy(() => resize.disconnect());

      if (!('IntersectionObserver' in window)) {
        this.visible.set(true);
        return;
      }
      const io = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          this.visible.set(true);
          io.disconnect();
        }
      }, { threshold: 0.3 });
      io.observe(el);
      destroyRef.onDestroy(() => io.disconnect());
    });
  }
}
