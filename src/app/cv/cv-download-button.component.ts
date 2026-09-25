import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { I18nService } from '../core/i18n.service';
import { PortfolioDataService } from '../core/portfolio-data.service';
import { CvPdfService } from './cv-pdf.service';

@Component({
  selector: 'app-cv-download-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'cv-download' },
  template: `
    <button type="button" class="btn" [class.btn-primary]="variant() === 'primary'" [class.btn-ghost]="variant() === 'ghost'"
            [disabled]="cv.busy() || !data.hasData()" [attr.aria-busy]="cv.busy()"
            [attr.aria-label]="cv.busy() ? i18n.t('cv.generating') : i18n.t('cv.downloadLabel')" (click)="cv.open()">
      <svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19h14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      {{ cv.busy() ? i18n.t('cv.generating') : i18n.t('cv.download') }}
    </button>
    @if (cv.error(); as error) {
      <p class="cv-error" role="alert">{{ i18n.t(error) }}</p>
    }
  `,
})
export class CvDownloadButtonComponent {
  readonly variant = input<'primary' | 'ghost'>('ghost');
  readonly cv = inject(CvPdfService);
  readonly data = inject(PortfolioDataService);
  readonly i18n = inject(I18nService);
}
