import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { Experience } from '../../models/portfolio.models';
import { AdminDataService } from '../admin-data.service';
import { describeWriteError } from '../firestore-error';

/** Une ligne de textarea = une réalisation ; les tags sont séparés par des virgules. */
const toLines = (text: string): string[] => text.split('\n').map((l) => l.trim()).filter(Boolean);
const toTags = (text: string): string[] => text.split(',').map((t) => t.trim()).filter(Boolean);

/** Les valeurs 'YYYY-MM' se comparent directement comme des chaînes. */
const endAfterStart: ValidatorFn = (group) => {
  const { start, end } = (group as FormGroup).getRawValue() as { start: string; end: string };
  return start && end && end < start ? { endBeforeStart: true } : null;
};

@Component({
  selector: 'app-experience-form',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: '../admin.css',
  styles: [':host{min-height:0; padding:0;}'],
  template: `
    <form class="card" [formGroup]="form" (ngSubmit)="submit()">
      <h2>{{ experience().id ? 'Modifier l’expérience' : 'Nouvelle expérience' }}</h2>

      <div class="grid-2">
        <label>Entreprise *<input formControlName="company" /></label>
        <label>Lieu *<input formControlName="location" /></label>
        <label>Poste (FR) *<input formControlName="roleFr" /></label>
        <label>Poste (EN) *<input formControlName="roleEn" /></label>
        <label>Début *<input type="month" formControlName="start" /></label>
        <label>
          Fin
          <input type="month" formControlName="end" />
          <span class="hint">Laisser vide si la mission est en cours.</span>
        </label>
        <label>
          Ordre d'affichage *
          <input type="number" formControlName="order" min="0" />
          <span class="hint">Le plus grand s'affiche en premier.</span>
        </label>
      </div>

      <div class="grid-2">
        <label>Contexte (FR)<textarea formControlName="contextFr"></textarea></label>
        <label>Contexte (EN)<textarea formControlName="contextEn"></textarea></label>
        <label>
          Réalisations (FR)
          <textarea formControlName="bulletsFr" rows="8"></textarea>
          <span class="hint">Une réalisation par ligne.</span>
        </label>
        <label>
          Réalisations (EN)
          <textarea formControlName="bulletsEn" rows="8"></textarea>
          <span class="hint">One achievement per line.</span>
        </label>
      </div>

      <label>
        Tags techno
        <input formControlName="tags" placeholder="Java, Angular, Spring Boot" />
        <span class="hint">Séparés par des virgules.</span>
      </label>

      @if (form.hasError('endBeforeStart')) {
        <p class="error">La date de fin est antérieure à la date de début.</p>
      } @else if (form.invalid && form.touched) {
        <p class="error">Les champs marqués * sont obligatoires.</p>
      }
      @if (error()) {
        <p class="error" role="alert">{{ error() }}</p>
      }

      <div class="actions">
        <button class="btn-sm primary" type="submit" [disabled]="pending()">
          {{ pending() ? 'Enregistrement…' : 'Enregistrer' }}
        </button>
        <button class="btn-sm" type="button" (click)="done.emit()">Annuler</button>
      </div>
    </form>
  `,
})
export class ExperienceFormComponent {
  private readonly admin = inject(AdminDataService);

  /** id vide = création. */
  readonly experience = input.required<Experience>();
  readonly done = output<void>();

  readonly pending = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = inject(NonNullableFormBuilder).group({
    company: ['', Validators.required],
    roleFr: ['', Validators.required],
    roleEn: ['', Validators.required],
    start: ['', Validators.required],
    end: [''],
    location: ['', Validators.required],
    contextFr: [''],
    contextEn: [''],
    bulletsFr: [''],
    bulletsEn: [''],
    tags: [''],
    order: [0, [Validators.required, Validators.min(0)]],
  }, { validators: endAfterStart });

  constructor() {
    // Recharge le formulaire à chaque changement de l'expérience éditée.
    effect(() => {
      const e = this.experience();
      this.form.reset({
        company: e.company,
        roleFr: e.roleFr,
        roleEn: e.roleEn,
        start: e.start ?? '',
        end: e.end ?? '',
        location: e.location,
        contextFr: e.contextFr,
        contextEn: e.contextEn,
        bulletsFr: e.bulletsFr.join('\n'),
        bulletsEn: e.bulletsEn.join('\n'),
        tags: e.tags.join(', '),
        order: e.order,
      });
      this.error.set(null);
    });
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.pending.set(true);
    this.error.set(null);
    try {
      await this.admin.saveExperience({
        id: this.experience().id,
        company: v.company.trim(),
        roleFr: v.roleFr.trim(),
        roleEn: v.roleEn.trim(),
        start: v.start,
        end: v.end || null,
        location: v.location.trim(),
        contextFr: v.contextFr.trim(),
        contextEn: v.contextEn.trim(),
        bulletsFr: toLines(v.bulletsFr),
        bulletsEn: toLines(v.bulletsEn),
        tags: toTags(v.tags),
        order: v.order,
      });
      this.done.emit();
    } catch (err) {
      this.error.set(describeWriteError(err));
    } finally {
      this.pending.set(false);
    }
  }
}
