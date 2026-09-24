import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PortfolioDataService } from '../../core/portfolio-data.service';
import { Experience } from '../../models/portfolio.models';
import { AdminDataService } from '../admin-data.service';
import { describeWriteError } from '../firestore-error';
import { endAfterStart, nextFreeOrder, uniqueOrder } from '../form-utils';

/** Une ligne de textarea = une réalisation ; les tags sont séparés par des virgules. */
const toLines = (text: string): string[] => text.split('\n').map((l) => l.trim()).filter(Boolean);
const toTags = (text: string): string[] => text.split(',').map((t) => t.trim()).filter(Boolean);

@Component({
  selector: 'app-experience-form',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: '../admin.css',
  styles: [':host{min-height:0; padding:0;}'],
  template: `
    <form class="card" [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <h2>{{ experience().id ? 'Modifier l’expérience' : 'Nouvelle expérience' }}</h2>
      <p class="hint"><span class="req">*</span> champ obligatoire</p>

      <div class="grid-2">
        <label>Entreprise <span class="req">*</span><input formControlName="company" /></label>
        <label>Lieu <span class="req">*</span><input formControlName="location" /></label>
        <label>Poste (FR) <span class="req">*</span><input formControlName="roleFr" /></label>
        <label>Poste (EN) <span class="req">*</span><input formControlName="roleEn" /></label>
        <label>Début <span class="req">*</span><input type="month" formControlName="start" /></label>
        <label>
          Fin
          <input type="month" formControlName="end" [class.invalid]="form.hasError('endBeforeStart')" />
          @if (form.hasError('endBeforeStart')) {
            <span class="error">La fin ne peut pas précéder le début.</span>
          } @else {
            <span class="hint">Laisser vide si la mission est en cours.</span>
          }
        </label>
        <label>
          Ordre d'affichage <span class="req">*</span>
          <input type="number" formControlName="order" min="0" step="1" />
          @if (form.controls.order.getError('orderTaken'); as other) {
            <span class="error" role="alert">
              L'ordre {{ form.controls.order.value }} est déjà utilisé par « {{ other }} ». Choisissez une autre valeur (ex. {{ suggestedOrder() }}).
            </span>
          } @else {
            <span class="hint">Valeur unique ; la plus grande s'affiche en premier.</span>
          }
        </label>
      </div>

      <div class="grid-pairs">
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

      @if (error()) {
        <p class="error" role="alert">{{ error() }}</p>
      }

      <div class="actions">
        <button class="btn-sm primary" type="submit" [disabled]="form.invalid || pending()">
          {{ pending() ? 'Enregistrement…' : 'Enregistrer' }}
        </button>
        <button class="btn-sm" type="button" (click)="done.emit()">Annuler</button>
        @if (form.invalid) {
          <span class="form-status">Complétez ou corrigez les champs en rouge pour enregistrer.</span>
        }
      </div>
    </form>
  `,
})
export class ExperienceFormComponent {
  private readonly admin = inject(AdminDataService);
  private readonly data = inject(PortfolioDataService);

  /** id vide = création. */
  readonly experience = input.required<Experience>();
  readonly done = output<void>();

  readonly pending = signal(false);
  readonly error = signal<string | null>(null);

  /** Id de l'expérience éditée, lisible par le validateur avant que l'input ne soit fixé. */
  private editingId = '';

  /** Les autres expériences (celle en cours d'édition exclue), pour l'unicité de l'ordre. */
  private readonly others = () =>
    this.data.experiences()
      .filter((e) => e.id !== this.editingId)
      .map((e) => ({ order: e.order, label: e.company }));

  readonly suggestedOrder = () => nextFreeOrder(this.others().map((o) => o.order));

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
    order: [0, [Validators.required, Validators.min(0), uniqueOrder(this.others)]],
  }, { validators: endAfterStart });

  constructor() {
    // Recharge le formulaire à chaque changement de l'expérience éditée.
    effect(() => {
      const e = this.experience();
      this.editingId = e.id;
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
    // Les autres expériences peuvent changer (rechargement) : l'unicité est réévaluée.
    effect(() => {
      this.data.experiences();
      this.form.controls.order.updateValueAndValidity();
    });
  }

  async submit(): Promise<void> {
    if (this.form.invalid) return;
    this.pending.set(true);
    this.error.set(null);
    try {
      // Vérification au moment de la sauvegarde, sur des données fraîches
      // (une autre expérience a pu prendre cet ordre depuis l'ouverture du formulaire).
      await this.data.reload();
      this.form.controls.order.updateValueAndValidity();
      const clash = this.form.controls.order.getError('orderTaken') as string | null;
      if (clash) {
        this.error.set(`Enregistrement impossible : l'ordre ${this.form.controls.order.value} est déjà utilisé par « ${clash} ».`);
        return;
      }
      const v = this.form.getRawValue();
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
