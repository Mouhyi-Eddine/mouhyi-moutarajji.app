import { Component, ChangeDetectionStrategy } from '@angular/core';
import { I18nService } from '../../core/i18n.service';
import { PortfolioDataService } from '../../core/portfolio-data.service';
import { CvDownloadButtonComponent } from '../../cv/cv-download-button.component';
import { HeroTimelineComponent } from './hero-timeline.component';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [HeroTimelineComponent, CvDownloadButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="hero" id="top">
      <div class="wrap">
        @if (data.availableFrom(); as date) {
          <p class="availability">
            <span class="availability-dot" aria-hidden="true"></span>
            {{ i18n.t('hero.available', { date: i18n.day(date) }) }}
          </p>
        }
        <p class="kicker">
          <span>{{ i18n.t('hero.role') }}@if (data.yearsOfExperience(); as years) { · {{ i18n.t('hero.years', { years }) }}}</span>
        </p>
        <h1>{{ i18n.t('hero.title') }}</h1>
        <p class="lead">{{ i18n.t('hero.lead') }}</p>
        <div class="cta-row">
          <a href="#experience" class="btn btn-primary">{{ i18n.t('hero.cta1') }}</a>
          <app-cv-download-button />
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
