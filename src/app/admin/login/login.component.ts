import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AdminAuthService } from '../admin-auth.service';
import { ADMIN_PATH } from '../admin-path';

@Component({
  selector: 'app-admin-login',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: '../admin.css',
  template: `
    <div class="panel" style="max-width:420px">
      <form class="card" [formGroup]="form" (ngSubmit)="submit()">
        <h2>Connexion</h2>
        <label>
          E-mail
          <input type="email" formControlName="email" autocomplete="username" required />
        </label>
        <label>
          Mot de passe
          <input type="password" formControlName="password" autocomplete="current-password" required />
        </label>
        @if (error()) {
          <p class="error" role="alert">{{ error() }}</p>
        }
        <button class="btn-sm primary" type="submit" [disabled]="form.invalid || pending()">
          {{ pending() ? 'Connexion…' : 'Se connecter' }}
        </button>
      </form>
    </div>
  `,
})
export class LoginComponent {
  private readonly auth = inject(AdminAuthService);
  private readonly router = inject(Router);

  readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  readonly pending = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    inject(Meta).updateTag({ name: 'robots', content: 'noindex, nofollow' });
    // Session déjà active : pas besoin de se reconnecter.
    void this.auth.whenReady().then((user) => user && this.router.navigate(['/', ADMIN_PATH]));
  }

  async submit(): Promise<void> {
    if (this.form.invalid) return;
    this.pending.set(true);
    this.error.set(null);
    try {
      const { email, password } = this.form.getRawValue();
      await this.auth.login(email, password);
      await this.router.navigate(['/', ADMIN_PATH]);
    } catch {
      // Message volontairement générique : ne pas révéler si l'e-mail existe.
      this.error.set('Identifiants invalides.');
    } finally {
      this.pending.set(false);
    }
  }
}
