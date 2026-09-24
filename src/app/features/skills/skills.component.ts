import { Component, ChangeDetectionStrategy, computed } from '@angular/core';
import { I18nService } from '../../core/i18n.service';
import { PortfolioDataService } from '../../core/portfolio-data.service';

@Component({
  selector: 'app-skills',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="skills">
      <div class="wrap">
        <div class="section-head"><span class="tick"></span><h2>{{ i18n.t('skills.title') }}</h2></div>
        <div class="skill-groups">
          @for (group of sortedGroups(); track group.id) {
            <div class="skill-group">
              <h3>{{ i18n.pick(group.nameFr, group.nameEn) }}</h3>
              <div class="chip-row">
                @for (skill of group.skills; track skill.fr) {
                  <span class="chip">{{ i18n.pick(skill.fr, skill.en) }}</span>
                }
              </div>
            </div>
          } @empty {
            @if (data.status() === 'loading') {
              @for (i of [1, 2, 3]; track i) {
                <div class="skill-group" aria-hidden="true">
                  <span class="skeleton" style="width:90px"></span>
                  <div class="chip-row">
                    @for (w of [70, 110, 90, 60, 100]; track $index) {
                      <span class="skeleton chip-skeleton" [style.width.px]="w"></span>
                    }
                  </div>
                </div>
              }
            }
          }
        </div>
      </div>
    </section>
  `,
})
export class SkillsComponent {
  constructor(readonly i18n: I18nService, readonly data: PortfolioDataService) {}

  readonly sortedGroups = computed(() => [...this.data.skillGroups()].sort((a, b) => a.order - b.order));
}
