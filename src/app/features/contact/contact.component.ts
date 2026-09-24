import { Component, ChangeDetectionStrategy } from '@angular/core';
import { I18nService } from '../../core/i18n.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="contact">
      <div class="wrap">
        <div class="contact-box">
          <h2>{{ i18n.t('contact.title') }}</h2>
          <div class="contact-links">
            <a href="mailto:moutarajji.mouhyi@gmail.com" [attr.aria-label]="i18n.t('contact.mailLabel')">
              <svg class="contact-icon" aria-hidden="true" viewBox="0 0 24 24" focusable="false">
                <path d="M3 5h18v14H3z" fill="none" stroke="currentColor" stroke-width="1.8"/>
                <path d="m4 7 8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>moutarajji.mouhyi&#64;gmail.com</span>
            </a>
            <a href="https://www.linkedin.com/in/mouhyi-moutarajji-47801814b" target="_blank" rel="noopener"
               [attr.aria-label]="i18n.t('contact.linkedinLabel')">
              <svg class="contact-icon" aria-hidden="true" viewBox="0 0 24 24" focusable="false">
                <rect x="4" y="4" width="16" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/>
                <path d="M8 10v6M8 8v.01M12 16v-3.2a2.8 2.8 0 0 1 5.6 0V16M12 10v6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
              <span>LinkedIn</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class ContactComponent {
  constructor(readonly i18n: I18nService) {}
}
