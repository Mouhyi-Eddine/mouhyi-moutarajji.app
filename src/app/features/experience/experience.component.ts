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
          <span class="count">{{ sortedExperiences().length }} {{ i18n.t('exp.missions') }}</span>
        </div>
        <div class="timeline">
          @for (exp of sortedExperiences(); track exp.id) {
            <app-experience-card [exp]="exp" />
          }
        </div>
      </div>
    </section>
  `,
})
export class ExperienceComponent {
  constructor(readonly i18n: I18nService, private readonly data: PortfolioDataService) {}

  // order décroissant = mission la plus récente en premier (comme la timeline visuelle).
  readonly sortedExperiences = computed(() => [...this.data.experiences()].sort((a, b) => b.order - a.order));
}
