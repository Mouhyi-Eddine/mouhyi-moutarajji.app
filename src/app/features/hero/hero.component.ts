import { Component, ChangeDetectionStrategy } from '@angular/core';
import { I18nService } from '../../core/i18n.service';
import { PortfolioDataService } from '../../core/portfolio-data.service';
import { HeroTimelineComponent } from './hero-timeline.component';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [HeroTimelineComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="hero" id="top">
      <div class="wrap">
        <p class="kicker">
          <span>{{ i18n.t('hero.role') }}@if (data.yearsOfExperience(); as years) { · {{ i18n.t('hero.years', { years }) }}}</span>
        </p>
        <h1>{{ i18n.t('hero.title') }}</h1>
        <p class="lead">{{ i18n.t('hero.lead') }}</p>
        <div class="cta-row">
          <a href="#experience" class="btn btn-primary">{{ i18n.t('hero.cta1') }}</a>
          <a href="#contact" class="btn btn-ghost">{{ i18n.t('hero.cta2') }}</a>
        </div>
        <app-hero-timeline />
      </div>
    </section>
  `,
})
export class HeroComponent {
  constructor(readonly i18n: I18nService, readonly data: PortfolioDataService) {}
}
