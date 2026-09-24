import { Component, ChangeDetectionStrategy, computed } from '@angular/core';
import { I18nService } from '../../core/i18n.service';
import { PortfolioDataService } from '../../core/portfolio-data.service';

@Component({
  selector: 'app-education',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="education">
      <div class="wrap">
        <div class="section-head"><span class="tick"></span><h2>{{ i18n.t('edu.title') }}</h2></div>
        <div class="edu-list">
          @for (item of sortedEducation(); track item.id) {
            <div class="edu-row">
              <div>
                <div class="title">{{ i18n.pick(item.titleFr, item.titleEn) }}</div>
                <div class="school">{{ item.school }}</div>
              </div>
              <div class="date">{{ i18n.month(item.date) }}</div>
            </div>
          }
        </div>

        <div class="section-head section-head-sub"><span class="tick"></span><h2>{{ i18n.t('agency.title') }}</h2></div>
        <div class="agency-grid">
          @for (agency of sortedAgencies(); track agency.id) {
            <div class="agency-card">
              <div class="name">{{ agency.name }}</div>
              <div class="role">{{ i18n.pick(agency.roleFr, agency.roleEn) }}</div>
              <div class="date">{{ i18n.period(agency.start, agency.end, agency.date, false) }}</div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class EducationComponent {
  constructor(readonly i18n: I18nService, private readonly data: PortfolioDataService) {}

  readonly sortedEducation = computed(() => [...this.data.education()].sort((a, b) => b.order - a.order));
  readonly sortedAgencies = computed(() => [...this.data.agencies()].sort((a, b) => b.order - a.order));
}
