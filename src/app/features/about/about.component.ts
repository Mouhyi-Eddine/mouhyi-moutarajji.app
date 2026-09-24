import { Component, ChangeDetectionStrategy, computed } from '@angular/core';
import { I18nService } from '../../core/i18n.service';
import { PortfolioDataService } from '../../core/portfolio-data.service';
import { profileText } from '../../core/profile-defaults';

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
            @if (data.hasData()) {
              <p>{{ text('aboutP1') }}</p>
              <p>{{ text('aboutP2') }}</p>
            } @else {
              <div aria-hidden="true">
                @for (w of [100, 96, 88, 60]; track $index) {
                  <span class="skeleton" [style.width.%]="w"></span>
                }
              </div>
            }
          </div>
          <div class="stat-strip">
            <!-- Pas de « 0 » pendant le chargement : un tiret neutre à la place. -->
            <div><div class="num">{{ data.yearsOfExperience() ?? '—' }}</div><div class="lbl">{{ text('statYears') }}</div></div>
            <div><div class="num">{{ data.hasData() ? missionsCount() : '—' }}</div><div class="lbl">{{ text('statMissions') }}</div></div>
            <div><div class="num">{{ data.hasData() ? languagesCount() : '—' }}</div><div class="lbl">{{ text('statLanguages') }}</div></div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class AboutComponent {
  constructor(readonly i18n: I18nService, readonly data: PortfolioDataService) {}

  readonly missionsCount = computed(() => this.data.experiences().length);
  readonly languagesCount = computed(
    () => this.data.skillGroups().find((g) => g.id === 'languages')?.skills.length ?? 0,
  );

  text(key: Parameters<typeof profileText>[1]): string {
    return profileText(this.data.profile(), key, this.i18n.lang(), this.data.yearsOfExperience());
  }
}
