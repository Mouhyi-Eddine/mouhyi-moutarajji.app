import { Component, ChangeDetectionStrategy } from '@angular/core';
import { I18nService } from '../../core/i18n.service';
import { PortfolioDataService } from '../../core/portfolio-data.service';
import { NavComponent } from '../nav/nav.component';
import { HeroComponent } from '../hero/hero.component';
import { AboutComponent } from '../about/about.component';
import { SkillsComponent } from '../skills/skills.component';
import { ExperienceComponent } from '../experience/experience.component';
import { EducationComponent } from '../education/education.component';
import { ContactComponent } from '../contact/contact.component';

@Component({
  selector: 'app-public-site',
  standalone: true,
  imports: [NavComponent, HeroComponent, AboutComponent, SkillsComponent, ExperienceComponent, EducationComponent, ContactComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="skip-link" href="#main-content">{{ i18n.t('skip.link') }}</a>
    <app-nav />
    <main id="main-content">
      <app-hero />
      @if (data.status() === 'error') {
        <p class="data-error wrap" role="status">{{ i18n.t('data.error') }}</p>
      }
      <app-about />
      <app-skills />
      <app-experience />
      <app-education />
      <app-contact />
    </main>
    <footer>{{ i18n.t('footer') }}</footer>
  `,
})
export class PublicSiteComponent {
  constructor(readonly i18n: I18nService, readonly data: PortfolioDataService) {}
}
