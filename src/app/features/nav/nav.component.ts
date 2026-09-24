import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { I18nService } from '../../core/i18n.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="nav">
      <div class="nav-inner">
        <a href="#top" class="nav-name">Mouhyi Eddine<span>.</span>Moutarajji</a>
        <nav class="primary-nav">
          <ul class="nav-links" [class.open]="menuOpen()">
            <li><a href="#about" (click)="closeMenu()">{{ i18n.t('nav.about') }}</a></li>
            <li><a href="#skills" (click)="closeMenu()">{{ i18n.t('nav.skills') }}</a></li>
            <li><a href="#experience" (click)="closeMenu()">{{ i18n.t('nav.experience') }}</a></li>
            <li><a href="#education" (click)="closeMenu()">{{ i18n.t('nav.education') }}</a></li>
            <li><a href="#contact" (click)="closeMenu()">{{ i18n.t('nav.contact') }}</a></li>
            <li class="lang-switch">
              <button type="button" [class.active]="i18n.lang() === 'fr'" [attr.aria-pressed]="i18n.lang() === 'fr'"
                      aria-label="Français" (click)="i18n.setLang('fr')">FR</button>
              <button type="button" [class.active]="i18n.lang() === 'en'" [attr.aria-pressed]="i18n.lang() === 'en'"
                      aria-label="English" (click)="i18n.setLang('en')">EN</button>
            </li>
          </ul>
        </nav>
        <button class="nav-toggle" [attr.aria-expanded]="menuOpen()" aria-controls="navLinks"
                [attr.aria-label]="menuOpen() ? 'Fermer le menu' : 'Ouvrir le menu'" (click)="toggleMenu()">
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>
  `,
})
export class NavComponent {
  readonly menuOpen = signal(false);

  constructor(readonly i18n: I18nService) {}

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }
}
