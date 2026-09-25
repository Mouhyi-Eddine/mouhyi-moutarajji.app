import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PortfolioDataService } from '../../core/portfolio-data.service';
import { Education } from '../../models/portfolio.models';
import { AdminDataService } from '../admin-data.service';
import { describeWriteError } from '../firestore-error';
import { nextFreeOrder, uniqueOrder } from '../form-utils';

/** '10/2019' (format stocké) → '2019-10' (valeur d'un <input type="month">) ; accepte aussi '2019-10'. */
function toMonthInput(date: string): string {
  const m = /^(\d{2})\/(\d{4})$/.exec(date);
  return m ? `${m[2]}-${m[1]}` : /^\d{4}-\d{2}$/.test(date) ? date : '';
}

/** '2019-10' → '10/2019' : le format existant de la collection est conservé. */
function toStoredDate(month: string): string {
  const [year, mm] = month.split('-');
  return `${mm}/${year}`;
}

/** Formation : intitulé FR/EN, établissement (non traduit), date d'obtention. */
@Component({
  selector: 'app-education-form',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: '../admin.css',
  styles: [':host{min-height:0; padding:0;}'],
  template: `
    <form class="card" [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <h2>{{ education().id ? 'Modifier la formation' : 'Nouvelle formation' }}</h2>
      <p class="hint"><span class="req">*</span> champ obligatoire</p>

      <div class="grid-pairs">
        <label>Intitulé (FR) <span class="req">*</span><input formControlName="titleFr" placeholder="ex. Master 2 — Ingénierie logicielle" /></label>
        <label>Intitulé (EN) <span class="req">*</span><input formControlName="titleEn" placeholder="ex. Master's Degree — Software Engineering" /></label>
      </div>
      <div class="grid-2">
        <label>Établissement <span class="req">*</span><input formControlName="school" /></label>
        <label>
          Date d'obtention <span class="req">*</span>
          <input type="month" formControlName="date" />
          <span class="hint">Affichée « 10/2019 » en français, « Oct 2019 » en anglais.</span>
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
export class EducationFormComponent {
  private readonly admin = inject(AdminDataService);
  private readonly data = inject(PortfolioDataService);

  /** id vide = création. */
  readonly education = input.required<Education>();
  readonly done = output<void>();

  readonly pending = signal(false);
  readonly error = signal<string | null>(null);

  private editingId = '';
  private readonly others = () =>
    this.data.education()
      .filter((d) => d.id !== this.editingId)
      .map((d) => ({ order: d.order, label: d.titleFr }));

  readonly suggestedOrder = () => nextFreeOrder(this.others().map((o) => o.order));

  readonly form = inject(NonNullableFormBuilder).group({
    titleFr: ['', Validators.required],
    titleEn: ['', Validators.required],
    school: ['', Validators.required],
    date: ['', Validators.required],
    order: [0, [Validators.required, Validators.min(0), uniqueOrder(this.others)]],
  });

  constructor() {
    effect(() => {
      const d = this.education();
      this.editingId = d.id;
      this.form.reset({
        titleFr: d.titleFr,
        titleEn: d.titleEn,
        school: d.school,
        date: toMonthInput(d.date),
        order: d.order,
      });
      this.error.set(null);
    });
    effect(() => {
      this.data.education();
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
      await this.admin.saveEducation({
        id: this.education().id,
        titleFr: v.titleFr.trim(),
        titleEn: v.titleEn.trim(),
        school: v.school.trim(),
        date: toStoredDate(v.date),
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
