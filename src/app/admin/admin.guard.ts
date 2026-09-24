import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminAuthService } from './admin-auth.service';
import { ADMIN_PATH } from './admin-path';

/** Laisse passer un utilisateur connecté, sinon redirige vers l'écran de connexion du panel. */
export const adminGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const user = await inject(AdminAuthService).whenReady();
  return user ? true : router.createUrlTree(['/', ADMIN_PATH, 'login']);
};
