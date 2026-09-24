import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { formatPeriod } from '../../core/period';
import { PortfolioDataService } from '../../core/portfolio-data.service';
import { Experience, SkillGroup } from '../../models/portfolio.models';
import { AdminAuthService } from '../admin-auth.service';
import { AdminDataService } from '../admin-data.service';
import { AdminPath } from '../admin-path';
import { describeWriteError } from '../firestore-error';
import { ExperienceFormComponent } from './experience-form.component';
import { SkillGroupFormComponent } from './skill-group-form.component';

type Tab = 'experiences' | 'skills';

@Component({
  selector: 'app-admin-dashboard',
  imports: [ExperienceFormComponent, SkillGroupFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: '../admin.css',
  template: `
    <div class="panel">
      <div class="panel-head">
        <div>
          <h1>Administration du portfolio</h1>
          <span class="muted">Connecté : {{ auth.user()?.email }}</span>
        </div>
        <button class="btn-sm" type="button" (click)="logout()">Se déconnecter</button>
      </div>

      <div class="tabs" role="tablist">
        <button type="button" role="tab" [attr.aria-selected]="tab() === 'experiences'" (click)="selectTab('experiences')">
          Expériences ({{ experiences().length }})
        </button>
        <button type="button" role="tab" [attr.aria-selected]="tab() === 'skills'" (click)="selectTab('skills')">
          Compétences ({{ skillGroups().length }})
        </button>
      </div>

      @if (data.status() === 'loading') {
        <p class="muted">Chargement…</p>
      } @else if (data.status() === 'error') {
        <p class="error">Lecture Firestore impossible. Vérifiez la configuration (environment.ts) et la console du navigateur.</p>
      }
      @if (error()) {
        <p class="error" role="alert">{{ error() }}</p>
      }

      @switch (tab()) {
        @case ('experiences') {
          @if (editingExperience(); as exp) {
            <app-experience-form [experience]="exp" (done)="editingExperience.set(null)" />
          } @else {
            <div class="actions" style="margin-bottom:16px">
              <button class="btn-sm primary" type="button" (click)="newExperience()">+ Nouvelle expérience</button>
            </div>
          }
          <div class="list">
            @for (exp of experiences(); track exp.id) {
              <div class="row">
                <div>
                  <strong>{{ exp.company }}</strong> — {{ exp.roleFr }}
                  <div class="meta">{{ periodOf(exp) }} · ordre {{ exp.order }}</div>
                </div>
                <div class="actions">
                  <button class="btn-sm" type="button" (click)="editingExperience.set(exp)">Modifier</button>
                  <button class="btn-sm danger" type="button" (click)="deleteExperience(exp)">Supprimer</button>
                </div>
              </div>
            } @empty {
              <p class="muted">Aucune expérience.</p>
            }
          </div>
        }
        @case ('skills') {
          @if (editingSkillGroup(); as group) {
            <app-skill-group-form [group]="group" (done)="editingSkillGroup.set(null)" />
          } @else {
            <div class="actions" style="margin-bottom:16px">
              <button class="btn-sm primary" type="button" (click)="newSkillGroup()">+ Nouvelle catégorie</button>
            </div>
          }
          <div class="list">
            @for (group of skillGroups(); track group.id) {
              <div class="row">
                <div>
                  <strong>{{ group.nameFr }}</strong>
                  <div class="meta">{{ group.skills.length }} compétence(s) · ordre {{ group.order }}</div>
                </div>
                <div class="actions">
                  <button class="btn-sm" type="button" (click)="editingSkillGroup.set(group)">Modifier</button>
                  <button class="btn-sm danger" type="button" (click)="deleteSkillGroup(group)">Supprimer</button>
                </div>
              </div>
            } @empty {
              <p class="muted">Aucune catégorie.</p>
            }
          </div>
        }
      }
    </div>
  `,
})
export class AdminDashboardComponent {
  readonly auth = inject(AdminAuthService);
  readonly data = inject(PortfolioDataService);
  private readonly admin = inject(AdminDataService);
  private readonly router = inject(Router);
  private readonly path = inject(AdminPath);

  readonly tab = signal<Tab>('experiences');
  readonly editingExperience = signal<Experience | null>(null);
  readonly editingSkillGroup = signal<SkillGroup | null>(null);
  readonly error = signal<string | null>(null);

  readonly experiences = computed(() => [...this.data.experiences()].sort((a, b) => b.order - a.order));
  readonly skillGroups = computed(() => [...this.data.skillGroups()].sort((a, b) => a.order - b.order));

  constructor() {
    inject(Meta).updateTag({ name: 'robots', content: 'noindex, nofollow' });
  }

  periodOf(exp: Experience): string {
    return exp.start ? formatPeriod(exp.start, exp.end, 'fr') : `${exp.period ?? '?'} (à migrer)`;
  }

  selectTab(tab: Tab): void {
    this.tab.set(tab);
    this.editingExperience.set(null);
    this.editingSkillGroup.set(null);
  }

  newExperience(): void {
    const maxOrder = Math.max(0, ...this.experiences().map((e) => e.order));
    this.editingExperience.set({
      id: '', company: '', roleFr: '', roleEn: '', start: '', end: null, location: '',
      contextFr: '', contextEn: '', bulletsFr: [], bulletsEn: [], tags: [], order: maxOrder + 1,
    });
  }

  newSkillGroup(): void {
    const maxOrder = Math.max(0, ...this.skillGroups().map((g) => g.order));
    this.editingSkillGroup.set({ id: '', nameFr: '', nameEn: '', order: maxOrder + 1, skills: [] });
  }

  deleteExperience(exp: Experience): Promise<void> {
    return this.confirmAndRun(`Supprimer l'expérience « ${exp.company} » ?`, () => this.admin.deleteExperience(exp.id));
  }

  deleteSkillGroup(group: SkillGroup): Promise<void> {
    return this.confirmAndRun(
      `Supprimer la catégorie « ${group.nameFr} » et ses ${group.skills.length} compétence(s) ?`,
      () => this.admin.deleteSkillGroup(group.id),
    );
  }

  async logout(): Promise<void> {
    await this.auth.logout();
    await this.router.navigate(this.path.url('login'));
  }

  private async confirmAndRun(message: string, action: () => Promise<void>): Promise<void> {
    if (!confirm(message)) return;
    this.error.set(null);
    try {
      await action();
    } catch (err) {
      this.error.set(describeWriteError(err));
    }
  }
}
