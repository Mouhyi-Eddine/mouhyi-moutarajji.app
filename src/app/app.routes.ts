import { Routes } from '@angular/router';
import { adminPathGuard, adminSegmentMatcher } from './admin/admin-path';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/public-site/public-site.component').then((m) => m.PublicSiteComponent),
  },
  // Panel admin : aucun chemin en clair, voir admin-path.ts.
  {
    matcher: adminSegmentMatcher,
    canMatch: [adminPathGuard],
    loadChildren: () => import('./admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  { path: '**', redirectTo: '' },
];
