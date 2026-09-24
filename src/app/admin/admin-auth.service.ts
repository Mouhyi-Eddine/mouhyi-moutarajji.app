import { Injectable, InjectionToken, inject, signal } from '@angular/core';
import {
  Auth,
  User,
  browserLocalPersistence,
  indexedDBLocalPersistence,
  initializeAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { FIREBASE_APP } from '../core/firebase';

/**
 * Firebase Auth n'est importé que par le code admin (chargé en lazy) :
 * les visiteurs du site public ne téléchargent pas le SDK Auth.
 * initializeAuth + persistance explicite plutôt que getAuth() pour ne pas
 * embarquer le code popup/redirect inutile ici (connexion email/mot de passe).
 */
export const AUTH = new InjectionToken<Auth>('AUTH', {
  providedIn: 'root',
  factory: () =>
    initializeAuth(inject(FIREBASE_APP), {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence],
    }),
});

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private readonly auth = inject(AUTH);
  private readonly _user = signal<User | null>(null);

  readonly user = this._user.asReadonly();

  constructor() {
    onAuthStateChanged(this.auth, (user) => this._user.set(user));
  }

  /** Résolu une fois la session éventuellement persistée restaurée (utile pour le guard). */
  async whenReady(): Promise<User | null> {
    await this.auth.authStateReady();
    return this.auth.currentUser;
  }

  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }
}
