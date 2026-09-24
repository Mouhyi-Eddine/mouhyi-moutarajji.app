import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PortfolioDataService } from '../../core/portfolio-data.service';
import { Agency } from '../../models/portfolio.models';
import { AdminDataService } from '../admin-data.service';
import { describeWriteError } from '../firestore-error';
import { endAfterStart, nextFreeOrder, uniqueOrder } from '../form-utils';

/** Société de conseil : nom (non traduit), poste FR/EN, dates neutres en langue. */
@Component({
  selector: 'app-agency-form',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: '../admin.css',
  styles: [':host{min-height:0; padding:0;}'],
  template: `
    <form class="card" [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <h2>{{ agency().id ? 'Modifier la société' : 'Nouvelle société de conseil' }}</h2>
      <p class="hint"><span class="req">*</span> champ obligatoire</p>

      <div class="grid-2">
        <label>Nom de la société <span class="req">*</span><input formControlName="name" /></label>
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
        <label>Poste (FR) <span class="req">*</span><input formControlName="roleFr" /></label>
        <label>Poste (EN) <span class="req">*</span><input formControlName="roleEn" /></label>
        <label>Début <span class="req">*</span><input type="month" formControlName="start" /></label>
        <label>
          Fin
          <input type="month" formControlName="end" [class.invalid]="form.hasError('endBeforeStart')" />
          @if (form.hasError('endBeforeStart')) {
            <span class="error">La fin ne peut pas précéder le début.</span>
          } @else {
            <span class="hint">Laisser vide si le contrat est en cours.</span>
          }
        </label>
      </div>

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
export class AgencyFormComponent {
  private readonly admin = inject(AdminDataService);
  private readonly data = inject(PortfolioDataService);

  /** id vide = création. */
  readonly agency = input.required<Agency>();
  readonly done = output<void>();

  readonly pending = signal(false);
  readonly error = signal<string | null>(null);

  private editingId = '';
  private readonly others = () =>
    this.data.agencies()
      .filter((a) => a.id !== this.editingId)
      .map((a) => ({ order: a.order, label: a.name }));

  readonly suggestedOrder = () => nextFreeOrder(this.others().map((o) => o.order));

  readonly form = inject(NonNullableFormBuilder).group({
    name: ['', Validators.required],
    roleFr: ['', Validators.required],
    roleEn: ['', Validators.required],
    start: ['', Validators.required],
    end: [''],
    order: [0, [Validators.required, Validators.min(0), uniqueOrder(this.others)]],
  }, { validators: endAfterStart });

  constructor() {
    effect(() => {
      const a = this.agency();
      this.editingId = a.id;
      this.form.reset({
        name: a.name,
        roleFr: a.roleFr,
        roleEn: a.roleEn,
        start: a.start ?? '',
        end: a.end ?? '',
        order: a.order,
      });
      this.error.set(null);
    });
    effect(() => {
      this.data.agencies();
      this.form.controls.order.updateValueAndValidity();
    });
  }

  async submit(): Promise<void> {
    if (this.form.invalid) return;
    this.pending.set(true);
    this.error.set(null);
    try {
      await this.data.reload();
      this.form.controls.order.updateValueAndValidity();
      const clash = this.form.controls.order.getError('orderTaken') as string | null;
      if (clash) {
        this.error.set(`Enregistrement impossible : l'ordre ${this.form.controls.order.value} est déjà utilisé par « ${clash} ».`);
        return;
      }
      const v = this.form.getRawValue();
      await this.admin.saveAgency({
        id: this.agency().id,
        name: v.name.trim(),
        roleFr: v.roleFr.trim(),
        roleEn: v.roleEn.trim(),
        start: v.start,
        end: v.end || null,
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
