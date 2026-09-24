import { Injectable, computed, inject, isDevMode, signal } from '@angular/core';
import { collection, getDocs } from 'firebase/firestore/lite';
import { Agency, Education, Experience, SkillGroup } from '../models/portfolio.models';
import { COLLECTIONS } from './collections';
import { FIRESTORE } from './firebase';
import { fullYearsSince } from './period';

export type LoadStatus = 'loading' | 'ready' | 'error';

interface PortfolioData {
  skillGroups: SkillGroup[];
  experiences: Experience[];
  education: Education[];
  agencies: Agency[];
}

/** Début de carrière, utilisé seulement tant qu'aucune expérience n'est chargée. */
const CAREER_START_FALLBACK = '2018-09';

/**
 * Données du portfolio exposées via des signals en lecture seule.
 *
 * Deux sources, en parallèle :
 * 1. `portfolio-data.json`, instantané de Firestore généré au build
 *    (scripts/snapshot-firestore.mts) : affichage quasi immédiat, et le site
 *    reste complet si Firestore est indisponible.
 * 2. Firestore : fait foi dès qu'il répond (modifications faites depuis le
 *    dernier déploiement).
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
  private readonly _hasData = signal(false);
  private liveLoaded = false;

  readonly skillGroups = this._skillGroups.asReadonly();
  readonly experiences = this._experiences.asReadonly();
  readonly education = this._education.asReadonly();
  readonly agencies = this._agencies.asReadonly();
  /** État de la dernière lecture Firestore. */
  readonly status = this._status.asReadonly();
  /** Vrai dès qu'une source (instantané ou Firestore) a fourni les données. */
  readonly hasData = this._hasData.asReadonly();

  readonly yearsOfExperience = computed(() => {
    const starts = this._experiences().map((e) => e.start).filter(Boolean).sort();
    return fullYearsSince(starts[0] ?? CAREER_START_FALLBACK);
  });

  constructor() {
    void this.loadSnapshot();
    void this.reload();
  }

  /** Relit les 4 collections Firestore. Appelé au démarrage, puis par le panel admin après chaque écriture. */
  async reload(): Promise<void> {
    this._status.set('loading');
    try {
      const [skillGroups, experiences, education, agencies] = await Promise.all([
        this.readAll<SkillGroup>(COLLECTIONS.skills),
        this.readAll<Experience>(COLLECTIONS.experiences),
        this.readAll<Education>(COLLECTIONS.education),
        this.readAll<Agency>(COLLECTIONS.agencies),
      ]);
      this.liveLoaded = true;
      this.apply({ skillGroups, experiences, education, agencies });
      this._status.set('ready');
    } catch (err) {
      if (isDevMode()) console.error('[PortfolioDataService] Lecture Firestore impossible', err);
      this._status.set('error');
    }
  }

  private async loadSnapshot(): Promise<void> {
    if (isDevMode()) return; // l'instantané n'est généré que par `npm run build`
    try {
      const res = await fetch(new URL('portfolio-data.json', document.baseURI));
      if (!res.ok) return;
      const data = (await res.json()) as PortfolioData;
      // Firestore a déjà répondu : ses données sont plus récentes, on ne les écrase pas.
      if (!this.liveLoaded) this.apply(data);
    } catch {
      /* instantané absent (build hors-ligne) : Firestore seul */
    }
  }

  private apply(data: PortfolioData): void {
    this._skillGroups.set(data.skillGroups);
    this._experiences.set(data.experiences);
    this._education.set(data.education);
    this._agencies.set(data.agencies);
    this._hasData.set(true);
  }

  private async readAll<T extends { id: string }>(name: string): Promise<T[]> {
    const snapshot = await getDocs(collection(this.db, name));
    // L'id Firestore du document fait foi (il n'est pas stocké dans les champs).
    return snapshot.docs.map((d) => ({ ...d.data(), id: d.id }) as T);
  }
}
