import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Skill, SkillGroup } from '../../models/portfolio.models';
import { AdminDataService } from '../admin-data.service';
import { describeWriteError } from '../firestore-error';

type SkillForm = FormGroup<{ fr: FormControl<string>; en: FormControl<string> }>;

/**
 * Un document Firestore "skills" = une catégorie (Back-end, Front-end...)
 * contenant sa liste de compétences. Ajouter / modifier / supprimer une
 * compétence = éditer une ligne du FormArray puis enregistrer la catégorie.
 */
@Component({
  selector: 'app-skill-group-form',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: '../admin.css',
  styles: [':host{min-height:0; padding:0;}'],
  template: `
    <form class="card" [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <h2>{{ group().id ? 'Modifier la catégorie' : 'Nouvelle catégorie' }}</h2>
      <p class="hint"><span class="req">*</span> champ obligatoire</p>

      <div class="grid-2">
        <label>Nom de la catégorie (FR) <span class="req">*</span><input formControlName="nameFr" /></label>
        <label>Nom de la catégorie (EN) <span class="req">*</span><input formControlName="nameEn" /></label>
        <label>
          Ordre d'affichage <span class="req">*</span>
          <input type="number" formControlName="order" min="0" />
          <span class="hint">Le plus petit s'affiche en premier.</span>
        </label>
      </div>

      <div formArrayName="skills" class="list">
        <span class="muted">Compétences — nom FR et EN <span class="req">*</span></span>
        @for (skill of form.controls.skills.controls; track skill; let i = $index) {
          <div class="skill-line" [formGroupName]="i">
            <input formControlName="fr" placeholder="Nom (FR)" [attr.aria-label]="'Compétence ' + (i + 1) + ' (FR)'" />
            <input formControlName="en" placeholder="Name (EN)" [attr.aria-label]="'Compétence ' + (i + 1) + ' (EN)'" />
            <button class="btn-sm danger" type="button" (click)="removeSkill(i)">Supprimer</button>
          </div>
        }
        <div><button class="btn-sm" type="button" (click)="addSkill()">+ Ajouter une compétence</button></div>
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
          <span class="form-status">Complétez les champs en rouge pour enregistrer.</span>
        }
      </div>
    </form>
  `,
})
export class SkillGroupFormComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly admin = inject(AdminDataService);

  /** id vide = création. */
  readonly group = input.required<SkillGroup>();
  readonly done = output<void>();

  readonly pending = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.group({
    nameFr: ['', Validators.required],
    nameEn: ['', Validators.required],
    order: [0, [Validators.required, Validators.min(0)]],
    skills: this.fb.array<SkillForm>([]),
  });

  constructor() {
    effect(() => {
      const g = this.group();
      this.form.controls.skills.clear();
      g.skills.forEach((s) => this.form.controls.skills.push(this.skillControl(s)));
      this.form.reset({ nameFr: g.nameFr, nameEn: g.nameEn, order: g.order, skills: g.skills });
      this.error.set(null);
    });
  }

  addSkill(): void {
    this.form.controls.skills.push(this.skillControl({ fr: '', en: '' }));
  }

  removeSkill(index: number): void {
    this.form.controls.skills.removeAt(index);
  }

  async submit(): Promise<void> {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.pending.set(true);
    this.error.set(null);
    try {
      await this.admin.saveSkillGroup({
        id: this.group().id,
        nameFr: v.nameFr.trim(),
        nameEn: v.nameEn.trim(),
        order: v.order,
        skills: v.skills.map((s) => ({ fr: s.fr.trim(), en: s.en.trim() })),
      });
      this.done.emit();
    } catch (err) {
      this.error.set(describeWriteError(err));
    } finally {
      this.pending.set(false);
    }
  }

  private skillControl(skill: Skill): SkillForm {
    return this.fb.group({
      fr: [skill.fr, Validators.required],
      en: [skill.en, Validators.required],
    });
  }
}
