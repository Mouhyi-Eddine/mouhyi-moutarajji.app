import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PortfolioDataService } from '../../core/portfolio-data.service';
import { formatDay, upcomingAvailability } from '../../core/availability';
import { DEFAULT_PROFILE } from '../../core/profile-defaults';
import { Profile, ProfileTexts } from '../../models/portfolio.models';
import { AdminDataService } from '../admin-data.service';
import { describeWriteError } from '../firestore-error';

/**
 * Édition de la section « Profil » du site public (document profile/main).
 * Tant que le document n'existe pas, le formulaire part des textes par défaut.
 * La date de disponibilité est facultative : vide ou passée, aucun badge n'est affiché.
 */
@Component({
  selector: 'app-profile-form',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: '../admin.css',
  styles: [':host{min-height:0; padding:0;} textarea{min-height:150px;}'],
  template: `
    <form class="card" [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <h2>Profil</h2>
      <p class="hint">
        <span class="req">*</span> champ obligatoire.
        Dans les paragraphes, <code>{{ '{' }}years{{ '}' }}</code> est remplacé par le nombre d'années d'expérience calculé
        (actuellement {{ data.yearsOfExperience() ?? '—' }}).
        @if (!data.profile()) { Aucun profil enregistré : les textes ci-dessous sont ceux affichés par défaut. }
      </p>

      <p class="muted">Disponibilité (badge dans l'en-tête du site et sur le CV)</p>
      <div class="grid-2">
        <label>
          Disponible à partir du
          <input type="date" formControlName="availableFrom" />
          @switch (availabilityState()) {
            @case ('shown') {
              <span class="hint">Badge affiché : « {{ availabilityPreview() }} » (« Available from … » en anglais).</span>
            }
            @case ('past') {
              <span class="warn">Date passée : le badge n'est plus affiché. Mettez-la à jour ou retirez-la.</span>
            }
            @default {
              <span class="hint">Laisser vide pour ne pas afficher de badge.</span>
            }
          }
        </label>
        <div class="field-action">
          <button class="btn-sm" type="button" (click)="clearAvailability()" [disabled]="!form.controls.availableFrom.value">
            Retirer la date
          </button>
        </div>
      </div>

      <p class="muted">Textes de la section Profil</p>
      <div class="grid-pairs">
        <label>Présentation — paragraphe 1 (FR) <span class="req">*</span><textarea formControlName="aboutP1Fr"></textarea></label>
        <label>Presentation — paragraph 1 (EN) <span class="req">*</span><textarea formControlName="aboutP1En"></textarea></label>
        <label>Présentation — paragraphe 2 (FR) <span class="req">*</span><textarea formControlName="aboutP2Fr"></textarea></label>
        <label>Presentation — paragraph 2 (EN) <span class="req">*</span><textarea formControlName="aboutP2En"></textarea></label>
      </div>

      <p class="muted">Libellés des statistiques (sous les chiffres, calculés automatiquement)</p>
      <div class="grid-pairs">
        <label>Années d'expérience (FR) <span class="req">*</span><input formControlName="statYearsFr" /></label>
        <label>Years of experience (EN) <span class="req">*</span><input formControlName="statYearsEn" /></label>
        <label>Missions (FR) <span class="req">*</span><input formControlName="statMissionsFr" /></label>
        <label>Assignments (EN) <span class="req">*</span><input formControlName="statMissionsEn" /></label>
        <label>Langues (FR) <span class="req">*</span><input formControlName="statLanguagesFr" /></label>
        <label>Languages (EN) <span class="req">*</span><input formControlName="statLanguagesEn" /></label>
      </div>

      @if (error()) {
        <p class="error" role="alert">{{ error() }}</p>
      }
      @if (saved()) {
        <p class="hint" role="status">Profil enregistré.</p>
      }

      <div class="actions">
        <button class="btn-sm primary" type="submit" [disabled]="form.invalid || form.pristine || pending()">
          {{ pending() ? 'Enregistrement…' : 'Enregistrer' }}
        </button>
        <button class="btn-sm" type="button" (click)="resetToDefaults()">Rétablir les textes par défaut</button>
        @if (form.invalid) {
          <span class="form-status">Complétez les champs en rouge pour enregistrer.</span>
        } @else if (form.pristine) {
          <span class="form-status">Aucune modification.</span>
        }
      </div>
    </form>
  `,
})
export class ProfileFormComponent {
  readonly data = inject(PortfolioDataService);
  private readonly admin = inject(AdminDataService);

  readonly pending = signal(false);
  readonly error = signal<string | null>(null);
  readonly saved = signal(false);

  private readonly fb = inject(NonNullableFormBuilder);
  readonly form = this.fb.group({
    ...(Object.fromEntries(Object.keys(DEFAULT_PROFILE).map((k) => [k, ['', Validators.required]])) as {
      [K in keyof ProfileTexts]: [string, typeof Validators.required];
    }),
    availableFrom: ['', Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)],
  });

  constructor() {
    // Valeurs enregistrées, sinon textes par défaut (champ par champ).
    effect(() => {
      const current = this.data.profile();
      this.form.reset({ ...DEFAULT_PROFILE, availableFrom: '', ...stripEmpty(current) });
    });
  }

  /** 'shown' : badge visible ; 'past' : date renseignée mais passée ; 'none' : pas de date. */
  availabilityState(): 'shown' | 'past' | 'none' {
    const value = this.form.controls.availableFrom.value;
    return !value ? 'none' : upcomingAvailability(value) ? 'shown' : 'past';
  }

  availabilityPreview(): string {
    return `Disponible à partir du ${formatDay(this.form.controls.availableFrom.value, 'fr')}`;
  }

  clearAvailability(): void {
    this.form.controls.availableFrom.setValue('');
    this.form.markAsDirty();
    this.saved.set(false);
  }

  /** Rétablit les textes seulement : la date de disponibilité n'est pas touchée. */
  resetToDefaults(): void {
    this.form.patchValue({ ...DEFAULT_PROFILE });
    this.form.markAsDirty();
    this.saved.set(false);
  }

  async submit(): Promise<void> {
    if (this.form.invalid) return;
    this.pending.set(true);
    this.error.set(null);
    this.saved.set(false);
    try {
      const v = this.form.getRawValue();
      const profile = Object.fromEntries(Object.entries(v).map(([k, val]) => [k, val.trim()])) as unknown as Profile;
      await this.admin.saveProfile(profile);
      this.saved.set(true);
    } catch (err) {
      this.error.set(describeWriteError(err));
    } finally {
      this.pending.set(false);
    }
  }
}

function stripEmpty(profile: Profile | null): Partial<Profile> {
  if (!profile) return {};
  return Object.fromEntries(Object.entries(profile).filter(([, v]) => typeof v === 'string' && v.trim())) as Partial<Profile>;
}
