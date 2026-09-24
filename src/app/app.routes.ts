import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/public-site/public-site.component').then((m) => m.PublicSiteComponent),
  },
  // La route admin cachée (ex: /panel-xxxxxx) sera ajoutée à l'étape 3,
  // protégée par un AuthGuard + Firebase Authentication.
  { path: '**', redirectTo: '' },
];
