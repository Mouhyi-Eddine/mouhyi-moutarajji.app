import { Component, ChangeDetectionStrategy, computed } from '@angular/core';
import { I18nService } from '../../core/i18n.service';
import { PortfolioDataService } from '../../core/portfolio-data.service';
import { ExperienceCardComponent } from './experience-card.component';

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
          <h2>{{ i18n.t('exp.title') }}</h2>
          @if (data.hasData()) {
            <span class="count">{{ sortedExperiences().length }} {{ i18n.t('exp.missions') }}</span>
          }
        </div>
        <div class="timeline" [attr.aria-busy]="!data.hasData()">
          @for (exp of sortedExperiences(); track exp.id) {
            <app-experience-card [exp]="exp" />
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
  constructor(readonly i18n: I18nService, readonly data: PortfolioDataService) {}

  // order décroissant = mission la plus récente en premier (comme la timeline visuelle).
  readonly sortedExperiences = computed(() => [...this.data.experiences()].sort((a, b) => b.order - a.order));
}
