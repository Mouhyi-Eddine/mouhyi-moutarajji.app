import { Component, ChangeDetectionStrategy, ElementRef, Injector, afterNextRender, computed, inject, signal } from '@angular/core';
import { I18nService } from '../../core/i18n.service';
import { PortfolioDataService } from '../../core/portfolio-data.service';
import { ExperienceCardComponent } from './experience-card.component';
import { ExperienceFilterService } from './experience-filter.service';

/** Hauteur de l'en-tête fixe + marge : la barre de filtre doit rester visible sous le menu. */
const NAV_OFFSET = 88;

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [ExperienceCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="experience">
      <div class="wrap">
        <div class="section-head">
          <span class="tick"></span>
          <h2 tabindex="-1">{{ i18n.t('exp.title') }}</h2>
          @if (data.hasData()) {
            <span class="count">
              @if (filter.tag()) { {{ visibleExperiences().length }} / }{{ sortedExperiences().length }} {{ i18n.t('exp.missions') }}
            </span>
          }
        </div>

        @if (filter.tag(); as tag) {
          <div class="exp-filter">
            <span class="exp-filter-label">
              {{ i18n.t('exp.filterBy') }} <strong class="tag active">{{ tag }}</strong>
              <span class="exp-filter-count">· {{ i18n.t(visibleExperiences().length === 1 ? 'exp.filterCountOne' : 'exp.filterCount', { n: visibleExperiences().length, total: sortedExperiences().length }) }}</span>
            </span>
            <button type="button" class="exp-filter-reset" (click)="clearFilter()" [attr.aria-label]="i18n.t('exp.filterResetLabel', { tag })">
              <span aria-hidden="true">✕</span> {{ i18n.t('exp.filterReset') }}
            </button>
          </div>
        } @else if (data.hasData()) {
          <p class="exp-filter-hint">{{ i18n.t('exp.filterHint') }}</p>
        }

        <!-- Annonce du résultat aux lecteurs d'écran (présente dès le départ pour être prise en compte). -->
        <p class="sr-only" aria-live="polite" aria-atomic="true">{{ announcement() }}</p>

        <div class="timeline" [attr.aria-busy]="!data.hasData()">
          @for (exp of visibleExperiences(); track exp.id) {
            <app-experience-card [exp]="exp" (tagClick)="selectTag($event)" />
          } @empty {
            @if (data.status() === 'loading') {
              @for (i of [1, 2, 3]; track i) {
                <div class="exp-card skeleton-card" aria-hidden="true">
                  <span class="skeleton" style="width:40%"></span>
                  <span class="skeleton" style="width:60%"></span>
                  <span class="skeleton" style="width:90%"></span>
                  <span class="skeleton" style="width:75%"></span>
                </div>
              }
            }
          }
        </div>
      </div>
    </section>
  `,
})
export class ExperienceComponent {
  readonly i18n = inject(I18nService);
  readonly data = inject(PortfolioDataService);
  readonly filter = inject(ExperienceFilterService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  readonly announcement = signal('');

  // order décroissant = mission la plus récente en premier (comme la timeline visuelle).
  readonly sortedExperiences = computed(() => [...this.data.experiences()].sort((a, b) => b.order - a.order));
  readonly visibleExperiences = computed(() => this.sortedExperiences().filter((e) => this.filter.matches(e)));

  /** Clic sur une techno : filtre (ou retire le filtre si c'était déjà la techno active). */
  selectTag(tag: string): void {
    this.filter.toggle(tag);
    const active = this.filter.tag();
    if (!active) {
      // Le bouton cliqué reste affiché et garde le focus.
      this.announce(this.i18n.t('exp.filterCleared', { total: this.sortedExperiences().length }));
      return;
    }
    const n = this.visibleExperiences().length;
    this.announce(this.i18n.t(n === 1 ? 'exp.filterAnnounceOne' : 'exp.filterAnnounce', { n, tag: active }));
    // La liste raccourcit : on remonte au début des résultats, et le focus va sur « Tout afficher ».
    afterNextRender(
      () => {
        const head = this.host.nativeElement.querySelector<HTMLElement>('.section-head');
        if (head && head.getBoundingClientRect().top < NAV_OFFSET) {
          const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
          window.scrollTo({ top: head.getBoundingClientRect().top + scrollY - NAV_OFFSET, behavior: reduce ? 'auto' : 'smooth' });
        }
        this.host.nativeElement.querySelector<HTMLElement>('.exp-filter-reset')?.focus({ preventScroll: true });
      },
      { injector: this.injector },
    );
  }

  clearFilter(): void {
    this.filter.clear();
    this.announce(this.i18n.t('exp.filterCleared', { total: this.sortedExperiences().length }));
    // Le bouton disparaît : le focus revient sur le titre de la section.
    afterNextRender(() => this.host.nativeElement.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true }), {
      injector: this.injector,
    });
  }

  /** Vidé puis rempli : un même message répété est quand même relu. */
  private announce(message: string): void {
    this.announcement.set('');
    setTimeout(() => this.announcement.set(message), 50);
  }
}
