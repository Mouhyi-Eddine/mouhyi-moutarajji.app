import { Routes } from '@angular/router';
import { ADMIN_PATH } from './admin/admin-path';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/public-site/public-site.component').then((m) => m.PublicSiteComponent),
  },
  // Panel admin caché : absent de la navigation, protégé par adminGuard + Firebase Auth.
  {
    path: ADMIN_PATH,
    loadChildren: () => import('./admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  { path: '**', redirectTo: '' },
];
