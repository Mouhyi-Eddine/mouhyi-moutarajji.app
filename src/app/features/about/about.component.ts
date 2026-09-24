import { Component, ChangeDetectionStrategy, computed } from '@angular/core';
import { I18nService } from '../../core/i18n.service';
import { PortfolioDataService } from '../../core/portfolio-data.service';

@Component({
  selector: 'app-about',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="about">
      <div class="wrap">
        <div class="section-head"><span class="tick"></span><h2>{{ i18n.t('about.title') }}</h2></div>
        <div class="grid">
          <div>
            <p>{{ i18n.t('about.p1') }}</p>
            <p>{{ i18n.t('about.p2') }}</p>
          </div>
          <div class="stat-strip">
            <div><div class="num">8</div><div class="lbl">{{ i18n.t('about.stat1') }}</div></div>
            <div><div class="num">{{ missionsCount() }}</div><div class="lbl">{{ i18n.t('about.stat2') }}</div></div>
            <div><div class="num">{{ languagesCount() }}</div><div class="lbl">{{ i18n.t('about.stat3') }}</div></div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class AboutComponent {
  constructor(readonly i18n: I18nService, private readonly data: PortfolioDataService) {}

  readonly missionsCount = computed(() => this.data.experiences().length);
  readonly languagesCount = computed(
    () => this.data.skillGroups().find((g) => g.id === 'languages')?.skills.length ?? 0,
  );
}
