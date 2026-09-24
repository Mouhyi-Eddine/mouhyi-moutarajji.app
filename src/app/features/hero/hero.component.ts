import { Component, ChangeDetectionStrategy } from '@angular/core';
import { I18nService } from '../../core/i18n.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="hero" id="top">
      <div class="wrap">
        <p class="kicker">{{ i18n.t('hero.kicker') }}</p>
        <h1>{{ i18n.t('hero.title') }}</h1>
        <p class="lead">{{ i18n.t('hero.lead') }}</p>
        <div class="cta-row">
          <a href="#experience" class="btn btn-primary">{{ i18n.t('hero.cta1') }}</a>
          <a href="#contact" class="btn btn-ghost">{{ i18n.t('hero.cta2') }}</a>
        </div>

        <div class="schema" aria-hidden="true">
          <svg viewBox="0 0 860 140" preserveAspectRatio="xMidYMid meet">
            <path class="schema-path" d="M20,100 L120,100 L160,50 L260,50 L300,110 L420,110 L460,40 L560,40 L600,90 L700,90 L740,60 L840,60"/>
            <g>
              <circle class="schema-dot" cx="20" cy="100" r="4" style="animation-delay:.4s"/>
              <circle class="schema-dot" cx="160" cy="50" r="4" style="animation-delay:.7s"/>
              <circle class="schema-dot" cx="300" cy="110" r="4" style="animation-delay:1s"/>
              <circle class="schema-dot" cx="460" cy="40" r="4" style="animation-delay:1.3s"/>
              <circle class="schema-dot" cx="600" cy="90" r="4" style="animation-delay:1.6s"/>
              <circle class="schema-dot" cx="840" cy="60" r="4" style="animation-delay:1.9s"/>
            </g>
            <text class="schema-label" x="0" y="122" style="animation-delay:.5s">2018</text>
            <text class="schema-label" x="140" y="38" style="animation-delay:.8s">VINCI</text>
            <text class="schema-label" x="272" y="128" style="animation-delay:1.1s">MAUGIN</text>
            <text class="schema-label" x="436" y="28" style="animation-delay:1.4s">CNAF</text>
            <text class="schema-label" x="572" y="112" style="animation-delay:1.7s">RATP</text>
            <text class="schema-label" x="790" y="48" style="animation-delay:2s">2026</text>
          </svg>
        </div>
      </div>
    </section>
  `,
})
export class HeroComponent {
  constructor(readonly i18n: I18nService) {}
}
