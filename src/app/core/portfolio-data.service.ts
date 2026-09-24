import { Injectable, inject, signal } from '@angular/core';
import { collection, getDocs } from 'firebase/firestore/lite';
import { Agency, Education, Experience, SkillGroup } from '../models/portfolio.models';
import { COLLECTIONS } from './collections';
import { FIRESTORE } from './firebase';

export type LoadStatus = 'loading' | 'ready' | 'error';

/**
 * Données du portfolio lues depuis Firestore et exposées via des signals en
 * lecture seule. L'interface publique (skillGroups, experiences, education,
 * agencies) est identique à l'étape 1 : les composants ne savent pas d'où
 * viennent les données.
 *
 * Le tri reste fait côté composants (computed) : pas de orderBy() dans la
 * requête, qui exclurait silencieusement un document sans champ `order`.
 */
@Injectable({ providedIn: 'root' })
export class PortfolioDataService {
  private readonly db = inject(FIRESTORE);

  private readonly _skillGroups = signal<SkillGroup[]>([]);
  private readonly _experiences = signal<Experience[]>([]);
  private readonly _education = signal<Education[]>([]);
  private readonly _agencies = signal<Agency[]>([]);
  private readonly _status = signal<LoadStatus>('loading');

  readonly skillGroups = this._skillGroups.asReadonly();
  readonly experiences = this._experiences.asReadonly();
  readonly education = this._education.asReadonly();
  readonly agencies = this._agencies.asReadonly();
  readonly status = this._status.asReadonly();

  constructor() {
    void this.reload();
  }

  /** Relit les 4 collections. Appelé au démarrage, puis par le panel admin après chaque écriture. */
  async reload(): Promise<void> {
    this._status.set('loading');
    try {
      const [skillGroups, experiences, education, agencies] = await Promise.all([
        this.readAll<SkillGroup>(COLLECTIONS.skills),
        this.readAll<Experience>(COLLECTIONS.experiences),
        this.readAll<Education>(COLLECTIONS.education),
        this.readAll<Agency>(COLLECTIONS.agencies),
      ]);
      this._skillGroups.set(skillGroups);
      this._experiences.set(experiences);
      this._education.set(education);
      this._agencies.set(agencies);
      this._status.set('ready');
    } catch (err) {
      console.error('[PortfolioDataService] Lecture Firestore impossible', err);
      this._status.set('error');
    }
  }

  private async readAll<T extends { id: string }>(name: string): Promise<T[]> {
    const snapshot = await getDocs(collection(this.db, name));
    // L'id Firestore du document fait foi (il n'est pas stocké dans les champs).
    return snapshot.docs.map((d) => ({ ...d.data(), id: d.id }) as T);
  }
}
