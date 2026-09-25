import { Injectable, signal } from '@angular/core';
import { Experience } from '../../models/portfolio.models';

/** « angular » et « Angular » désignent la même techno. */
const sameTag = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: 'accent' }) === 0;

/**
 * Filtre des expériences par technologie (tag). Partagé entre la section
 * Expériences et la frise du hero, qui doit pouvoir retirer le filtre avant
 * de faire défiler vers une mission masquée. Non persisté : un rechargement
 * de page affiche toutes les missions.
 */
@Injectable({ providedIn: 'root' })
export class ExperienceFilterService {
  readonly tag = signal<string | null>(null);

  /** Active le filtre sur ce tag, ou le retire s'il est déjà actif. */
  toggle(tag: string): void {
    this.tag.update((current) => (current && sameTag(current, tag) ? null : tag));
  }

  clear(): void {
    this.tag.set(null);
  }

  isActive(tag: string): boolean {
    const current = this.tag();
    return !!current && sameTag(current, tag);
  }

  /** Vrai si l'expérience doit être affichée avec le filtre courant. */
  matches(exp: Experience): boolean {
    const current = this.tag();
    return !current || exp.tags.some((t) => sameTag(t, current));
  }
}
