import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { formatPeriod } from '../../core/period';
import { PortfolioDataService } from '../../core/portfolio-data.service';
import { Agency, Education, Experience, SkillGroup } from '../../models/portfolio.models';
import { AdminAuthService } from '../admin-auth.service';
import { AdminDataService } from '../admin-data.service';
import { AdminPath } from '../admin-path';
import { describeWriteError } from '../firestore-error';
import { nextFreeOrder } from '../form-utils';
import { AgencyFormComponent } from './agency-form.component';
import { EducationFormComponent } from './education-form.component';
import { ExperienceFormComponent } from './experience-form.component';
import { ProfileFormComponent } from './profile-form.component';
import { SkillGroupFormComponent } from './skill-group-form.component';

type Tab = 'experiences' | 'skills' | 'education' | 'agencies' | 'profile';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink, ExperienceFormComponent, SkillGroupFormComponent, EducationFormComponent, AgencyFormComponent, ProfileFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: '../admin.css',
  template: `
    <div class="panel">
      <a class="back-link" routerLink="/">← Retour au portfolio</a>
      <div class="panel-head">
        <div>
          <h1>Administration du portfolio</h1>
          <span class="muted">Connecté : {{ auth.user()?.email }}</span>
        </div>
        <div class="actions">
          <a class="btn-sm" routerLink="/" target="_blank" rel="noopener">Voir le site ↗</a>
          <button class="btn-sm" type="button" (click)="logout()">Se déconnecter</button>
        </div>
      </div>

      <div class="tabs" role="tablist">
        <button type="button" role="tab" [attr.aria-selected]="tab() === 'experiences'" (click)="selectTab('experiences')">
          Expériences ({{ experiences().length }})
        </button>
        <button type="button" role="tab" [attr.aria-selected]="tab() === 'skills'" (click)="selectTab('skills')">
          Compétences ({{ skillGroups().length }})
        </button>
        <button type="button" role="tab" [attr.aria-selected]="tab() === 'education'" (click)="selectTab('education')">
          Formation ({{ education().length }})
        </button>
        <button type="button" role="tab" [attr.aria-selected]="tab() === 'agencies'" (click)="selectTab('agencies')">
          Sociétés de conseil ({{ agencies().length }})
        </button>
        <button type="button" role="tab" [attr.aria-selected]="tab() === 'profile'" (click)="selectTab('profile')">
          Profil
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
        @case ('education') {
          @if (editingEducation(); as item) {
            <app-education-form [education]="item" (done)="editingEducation.set(null)" />
          } @else {
            <div class="actions" style="margin-bottom:16px">
              <button class="btn-sm primary" type="button" (click)="newEducation()">+ Nouvelle formation</button>
            </div>
          }
          <div class="list">
            @for (item of education(); track item.id) {
              <div class="row">
                <div>
                  <strong>{{ item.titleFr }}</strong> — {{ item.school }}
                  <div class="meta">{{ item.date }} · ordre {{ item.order }}</div>
                </div>
                <div class="actions">
                  <button class="btn-sm" type="button" (click)="editingEducation.set(item)">Modifier</button>
                  <button class="btn-sm danger" type="button" (click)="deleteEducation(item)">Supprimer</button>
                </div>
              </div>
            } @empty {
              <p class="muted">Aucune formation.</p>
            }
          </div>
        }
        @case ('agencies') {
          @if (editingAgency(); as agency) {
            <app-agency-form [agency]="agency" (done)="editingAgency.set(null)" />
          } @else {
            <div class="actions" style="margin-bottom:16px">
              <button class="btn-sm primary" type="button" (click)="newAgency()">+ Nouvelle société</button>
            </div>
          }
          <div class="list">
            @for (agency of agencies(); track agency.id) {
              <div class="row">
                <div>
                  <strong>{{ agency.name }}</strong> — {{ agency.roleFr }}
                  <div class="meta">{{ agencyPeriod(agency) }} · ordre {{ agency.order }}</div>
                </div>
                <div class="actions">
                  <button class="btn-sm" type="button" (click)="editingAgency.set(agency)">Modifier</button>
                  <button class="btn-sm danger" type="button" (click)="deleteAgency(agency)">Supprimer</button>
                </div>
              </div>
            } @empty {
              <p class="muted">Aucune société de conseil.</p>
            }
          </div>
        }
        @case ('profile') {
          <app-profile-form />
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
  readonly editingEducation = signal<Education | null>(null);
  readonly editingAgency = signal<Agency | null>(null);
  readonly error = signal<string | null>(null);

  readonly experiences = computed(() => [...this.data.experiences()].sort((a, b) => b.order - a.order));
  readonly skillGroups = computed(() => [...this.data.skillGroups()].sort((a, b) => a.order - b.order));
  readonly education = computed(() => [...this.data.education()].sort((a, b) => b.order - a.order));
  readonly agencies = computed(() => [...this.data.agencies()].sort((a, b) => b.order - a.order));

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
    this.editingEducation.set(null);
    this.editingAgency.set(null);
  }

  agencyPeriod(agency: Agency): string {
    return agency.start ? formatPeriod(agency.start, agency.end, 'fr', false) : (agency.date ?? '?');
  }

  newEducation(): void {
    this.editingEducation.set({ id: '', titleFr: '', titleEn: '', school: '', date: '', order: nextFreeOrder(this.education().map((d) => d.order)) });
  }

  deleteEducation(item: Education): Promise<void> {
    return this.confirmAndRun(`Supprimer la formation « ${item.titleFr} » ?`, () => this.admin.deleteEducation(item.id));
  }

  newAgency(): void {
    this.editingAgency.set({ id: '', name: '', roleFr: '', roleEn: '', start: '', end: null, order: nextFreeOrder(this.agencies().map((a) => a.order)) });
  }

  deleteAgency(agency: Agency): Promise<void> {
    return this.confirmAndRun(`Supprimer la société « ${agency.name} » ?`, () => this.admin.deleteAgency(agency.id));
  }

  newExperience(): void {
    const maxOrder = nextFreeOrder(this.experiences().map((e) => e.order)) - 1;
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
