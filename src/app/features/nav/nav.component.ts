import { Component, ChangeDetectionStrategy, ElementRef, inject, signal } from '@angular/core';
import { I18nService } from '../../core/i18n.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'closeMenu(true)',
    '(document:click)': 'onDocumentClick($event)',
  },
  template: `
    <header class="nav">
      <div class="nav-inner">
        <a href="#top" class="nav-name">Mouhyi Eddine<span>.</span>Moutarajji</a>
        <nav class="primary-nav">
          <ul id="navLinks" class="nav-links" [class.open]="menuOpen()">
            <li><a href="#about" (click)="closeMenu()">{{ i18n.t('nav.about') }}</a></li>
            <li><a href="#skills" (click)="closeMenu()">{{ i18n.t('nav.skills') }}</a></li>
            <li><a href="#experience" (click)="closeMenu()">{{ i18n.t('nav.experience') }}</a></li>
            <li><a href="#education" (click)="closeMenu()">{{ i18n.t('nav.education') }}</a></li>
            <li><a href="#contact" (click)="closeMenu()">{{ i18n.t('nav.contact') }}</a></li>
            <li class="lang-switch">
              <button type="button" [class.active]="i18n.lang() === 'fr'" [attr.aria-pressed]="i18n.lang() === 'fr'"
                      lang="fr" aria-label="Français" (click)="i18n.setLang('fr')">FR</button>
              <button type="button" [class.active]="i18n.lang() === 'en'" [attr.aria-pressed]="i18n.lang() === 'en'"
                      lang="en" aria-label="English" (click)="i18n.setLang('en')">EN</button>
            </li>
          </ul>
        </nav>
        <button class="nav-toggle" type="button" [attr.aria-expanded]="menuOpen()" aria-controls="navLinks"
                [attr.aria-label]="i18n.t(menuOpen() ? 'nav.closeMenu' : 'nav.openMenu')" (click)="toggleMenu()">
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>
    @if (menuOpen()) {
      <div class="nav-backdrop" aria-hidden="true"></div>
    }
  `,
})
export class NavComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly menuOpen = signal(false);

  constructor(readonly i18n: I18nService) {}

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  /** `restoreFocus` : après Échap, le focus revient sur le bouton du menu. */
  closeMenu(restoreFocus = false): void {
    if (!this.menuOpen()) return;
    this.menuOpen.set(false);
    if (restoreFocus) this.host.nativeElement.querySelector<HTMLElement>('.nav-toggle')?.focus();
  }

  /** Clic en dehors de l'en-tête (y compris sur le fond assombri) : fermeture. */
  onDocumentClick(event: MouseEvent): void {
    const header = this.host.nativeElement.querySelector('header');
    if (header && !header.contains(event.target as Node)) this.closeMenu();
  }
}
