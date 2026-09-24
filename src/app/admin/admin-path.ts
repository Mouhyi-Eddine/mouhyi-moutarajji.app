import { Injectable, inject, signal } from '@angular/core';
import { CanMatchFn, UrlMatcher } from '@angular/router';

/**
 * Le chemin du panel n'est écrit nulle part en clair (ni dans le dépôt, ni
 * dans le bundle) : seule son empreinte SHA-256 est connue. N'importe quel
 * premier segment d'URL est candidat (adminSegmentMatcher), et adminPathGuard
 * ne laisse passer que celui dont l'empreinte correspond.
 *
 * Pour changer de chemin : calculer le SHA-256 (hex) du nouveau segment, ex.
 *   node -e "console.log(require('crypto').createHash('sha256').update('mon-segment').digest('hex'))"
 * et remplacer la constante ci-dessous.
 *
 * C'est de la discrétion, pas la sécurité : celle-ci repose sur Firebase Auth
 * et les règles Firestore.
 */
const ADMIN_SEGMENT_SHA256 = '7b989cf3a076659d1e6b57acf447c8751626d5a6f071dbec2681da7767dcfa2b';

/** Mémorise le segment validé pour construire les liens internes du panel. */
@Injectable({ providedIn: 'root' })
export class AdminPath {
  private readonly _segment = signal<string | null>(null);
  readonly segment = this._segment.asReadonly();

  set(segment: string): void {
    this._segment.set(segment);
  }

  /** Commandes de navigation absolues vers une page du panel, ex. url('login'). */
  url(...children: string[]): string[] {
    return ['/', this._segment() ?? '', ...children];
  }
}

export const adminSegmentMatcher: UrlMatcher = (segments) =>
  segments.length > 0 ? { consumed: [segments[0]] } : null;

export const adminPathGuard: CanMatchFn = async (_route, segments) => {
  const adminPath = inject(AdminPath); // avant tout await : inject() exige le contexte d'injection synchrone
  const segment = segments[0]?.path;
  if (!segment || !crypto.subtle) return false;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(segment));
  const hex = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
  if (hex !== ADMIN_SEGMENT_SHA256) return false;
  adminPath.set(segment);
  return true;
};
