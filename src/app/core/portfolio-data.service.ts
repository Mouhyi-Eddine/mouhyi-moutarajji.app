import { Injectable, computed, inject, isDevMode, signal } from '@angular/core';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore/lite';
import { Agency, Education, Experience, Profile, SkillGroup } from '../models/portfolio.models';
import { COLLECTIONS, PROFILE_DOC_ID } from './collections';
import { upcomingAvailability } from './availability';
import { FIRESTORE } from './firebase';
import { yearsSince } from './period';

export type LoadStatus = 'loading' | 'ready' | 'error';

interface PortfolioData {
  skillGroups: SkillGroup[];
  experiences: Experience[];
  education: Education[];
  agencies: Agency[];
  profile?: Profile | null;
}

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
  private readonly _profile = signal<Profile | null>(null);
  private readonly _status = signal<LoadStatus>('loading');
  private readonly _hasData = signal(false);
  private liveLoaded = false;

  readonly skillGroups = this._skillGroups.asReadonly();
  readonly experiences = this._experiences.asReadonly();
  readonly education = this._education.asReadonly();
  readonly agencies = this._agencies.asReadonly();
  /** Textes de la section Profil ; null = textes par défaut de l'application. */
  readonly profile = this._profile.asReadonly();
  /** État de la dernière lecture Firestore. */
  readonly status = this._status.asReadonly();
  /** Vrai dès qu'une source (instantané ou Firestore) a fourni les données. */
  readonly hasData = this._hasData.asReadonly();

  /**
   * Années d'expérience depuis la plus ancienne expérience enregistrée.
   * Source unique pour tout l'affichage (hero, profil) ; null tant que rien n'est chargé.
   */
  readonly yearsOfExperience = computed(() => {
    const oldest = this._experiences().map((e) => e.start).filter(Boolean).sort()[0];
    return oldest ? yearsSince(oldest) : null;
  });

  /** Date de disponibilité à venir ('YYYY-MM-DD'), ou null : rien à afficher. */
  readonly availableFrom = computed(() => upcomingAvailability(this._profile()?.availableFrom));

  constructor() {
    void this.loadSnapshot();
    void this.reload();
  }

  /** Relit toutes les collections Firestore. Appelé au démarrage, puis par le panel admin après chaque écriture. */
  async reload(): Promise<void> {
    this._status.set('loading');
    try {
      const [skillGroups, experiences, education, agencies, profile] = await Promise.all([
        this.readAll<SkillGroup>(COLLECTIONS.skills),
        this.readAll<Experience>(COLLECTIONS.experiences),
        this.readAll<Education>(COLLECTIONS.education),
        this.readAll<Agency>(COLLECTIONS.agencies),
        this.readProfile(),
      ]);
      this.liveLoaded = true;
      this.apply({ skillGroups, experiences, education, agencies, profile });
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
    this._profile.set(data.profile ?? null);
    this._hasData.set(true);
  }

  /**
   * Lecture isolée : si le document n'existe pas encore, ou si les règles
   * Firestore ne couvrent pas encore profile, on garde les textes par défaut
   * sans faire échouer le reste du chargement.
   */
  private async readProfile(): Promise<Profile | null> {
    try {
      const snap = await getDoc(doc(this.db, COLLECTIONS.profile, PROFILE_DOC_ID));
      return snap.exists() ? (snap.data() as Profile) : null;
    } catch {
      return null;
    }
  }

  private async readAll<T extends { id: string }>(name: string): Promise<T[]> {
    const snapshot = await getDocs(collection(this.db, name));
    // L'id Firestore du document fait foi (il n'est pas stocké dans les champs).
    return snapshot.docs.map((d) => ({ ...d.data(), id: d.id }) as T);
  }
}
