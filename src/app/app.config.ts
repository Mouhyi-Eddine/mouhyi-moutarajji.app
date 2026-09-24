import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withNavigationErrorHandler } from '@angular/router';
import { routes } from './app.routes';

const CHUNK_RELOAD_FLAG = 'mm_chunk_reload';

/**
 * Après un nouveau déploiement, un index.html encore en cache (GitHub Pages :
 * 10 min) peut référencer des chunks lazy qui n'existent plus. Dans ce cas on
 * recharge la page une seule fois pour récupérer la nouvelle version.
 */
function reloadOnStaleChunk(error: unknown): void {
  const message = String((error as { message?: string } | null)?.message ?? error);
  const isChunkError = /dynamically imported module|Importing a module script failed|Failed to fetch/i.test(message);
  if (!isChunkError) return;
  try {
    // Garde-fou anti-boucle : au plus un rechargement par minute.
    const last = Number(sessionStorage.getItem(CHUNK_RELOAD_FLAG) ?? 0);
    if (Date.now() - last < 60_000) return;
    sessionStorage.setItem(CHUNK_RELOAD_FLAG, String(Date.now()));
  } catch {
    return; // sans sessionStorage, pas de garde-fou contre une boucle : on ne recharge pas
  }
  location.reload();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withNavigationErrorHandler((e) => reloadOnStaleChunk(e.error))),
  ],
};
