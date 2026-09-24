import { inject, InjectionToken } from '@angular/core';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore/lite';
import { environment } from '../../environments/environment';

/**
 * @angular/fire n'est pas encore compatible Angular 22 (dernière version :
 * peerDependency @angular/core ^20). On utilise donc directement le SDK
 * Firebase modulaire, exposé via des InjectionTokens pour rester injectable
 * et remplaçable dans les tests.
 *
 * Firestore Lite (firebase/firestore/lite) : lectures ponctuelles + écritures,
 * sans temps réel ni cache hors-ligne. Largement suffisant pour un portfolio,
 * et environ 3x plus léger que le SDK Firestore complet.
 */
export const FIREBASE_APP = new InjectionToken<FirebaseApp>('FIREBASE_APP', {
  providedIn: 'root',
  factory: () => initializeApp(environment.firebase),
});

export const FIRESTORE = new InjectionToken<Firestore>('FIRESTORE', {
  providedIn: 'root',
  factory: () => getFirestore(inject(FIREBASE_APP)),
});
