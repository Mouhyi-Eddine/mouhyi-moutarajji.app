/** Message lisible pour une erreur d'écriture Firestore. */
export function describeWriteError(err: unknown): string {
  const code = (err as { code?: string } | null)?.code;
  if (code === 'permission-denied') {
    return "Écriture refusée par les règles Firestore : ce compte n'est pas l'UID admin déclaré dans firestore.rules.";
  }
  if (code === 'unavailable') {
    return 'Firestore est injoignable (connexion réseau ?). Réessayez.';
  }
  return `Échec de l'enregistrement${code ? ` (${code})` : ''}.`;
}
