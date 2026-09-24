import { Component, ChangeDetectionStrategy, input, signal, computed } from '@angular/core';
import { I18nService } from '../../core/i18n.service';
import { RevealDirective } from '../../core/reveal.directive';
import { Experience } from '../../models/portfolio.models';

@Component({
  selector: 'app-experience-card',
  standalone: true,
  imports: [RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="exp-card" appReveal>
      <div class="exp-head">
        <span class="company">{{ exp().company }}</span>
        <span class="period mono">{{ i18n.period(exp().start, exp().end, exp().period) }}</span>
      </div>
      <div class="exp-role">
        {{ i18n.pick(exp().roleFr, exp().roleEn) }} <span class="loc">— {{ exp().location }}</span>
      </div>
      <p class="exp-context">{{ i18n.pick(exp().contextFr, exp().contextEn) }}</p>
      <ul class="exp-bullets">
        @for (bullet of visibleBullets(); track $index) {
          <li>{{ bullet }}</li>
        }
        @if (expanded()) {
          @for (bullet of restBullets(); track $index) {
            <li>{{ bullet }}</li>
          }
        }
      </ul>
      @if (restBullets().length > 0) {
        <button class="toggle-btn" type="button" [class.open]="expanded()" [attr.aria-expanded]="expanded()"
                (click)="toggle()">
          <span class="chev">▾</span>
          <span class="label">
            {{ expanded() ? i18n.t('exp.showLess') : i18n.t('exp.showMore', { n: restBullets().length }) }}
          </span>
        </button>
      }
      <div class="exp-tags">
        @for (tag of exp().tags; track tag) {
          <span>{{ tag }}</span>
        }
      </div>
    </article>
  `,
})
export class ExperienceCardComponent {
  readonly exp = input.required<Experience>();
  readonly expanded = signal(false);

  constructor(readonly i18n: I18nService) {}

  // pick() attend des strings ; pour les tableaux (bulletsFr/bulletsEn) on sélectionne directement selon la langue.
  readonly bullets = computed(() => (this.i18n.lang() === 'en' ? this.exp().bulletsEn : this.exp().bulletsFr));
  readonly visibleBullets = computed(() => this.bullets().slice(0, 3));
  readonly restBullets = computed(() => this.bullets().slice(3));

  toggle(): void {
    this.expanded.update((v) => !v);
  }
}
