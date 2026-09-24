/**
 * Migration unique : remplace les libellés texte (experiences.period,
 * agencies.date — uniquement en français) par des dates neutres
 * `start` / `end` ('YYYY-MM', end = null si en cours).
 *
 *   npm run migrate:dates -- --dry-run   # lecture seule, sans identifiants
 *   npm run migrate:dates                # écrit (compte admin : ADMIN_EMAIL / ADMIN_PASSWORD dans .env)
 *
 * Pour chaque expérience, la durée recalculée est comparée à celle de
 * l'ancien libellé : en cas d'écart, le script s'arrête sans rien écrire.
 */
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, deleteField, doc, getDocs, getFirestore, writeBatch } from 'firebase/firestore/lite';
import { COLLECTIONS } from '../src/app/core/collections.ts';
import { formatDuration, monthsBetween } from '../src/app/core/period.ts';
import { environment } from '../src/environments/environment.ts';

const dryRun = process.argv.includes('--dry-run');
const app = initializeApp(environment.firebase);
const db = getFirestore(app);

interface Change { collection: string; id: string; legacyField: string; legacy: string; start: string; end: string | null }

function parse(text: string): { start: string; end: string | null } | null {
  const range = /(\d{2})\/(\d{4})\s*[–-]\s*(\d{2})\/(\d{4})/.exec(text);
  if (range) return { start: `${range[2]}-${range[1]}`, end: `${range[4]}-${range[3]}` };
  const since = /depuis\s+(\d{2})\/(\d{4})/i.exec(text);
  if (since) return { start: `${since[2]}-${since[1]}`, end: null };
  return null;
}

const changes: Change[] = [];
const problems: string[] = [];

for (const [name, legacyField] of [[COLLECTIONS.experiences, 'period'], [COLLECTIONS.agencies, 'date']] as const) {
  for (const d of (await getDocs(collection(db, name))).docs) {
    const data = d.data();
    if (data['start']) continue; // déjà migré
    const legacy = String(data[legacyField] ?? '');
    const parsed = parse(legacy);
    if (!parsed) {
      problems.push(`${name}/${d.id} : libellé non reconnu « ${legacy} »`);
      continue;
    }
    // Contrôle : la durée écrite dans l'ancien libellé doit correspondre au calcul.
    const legacyDuration = legacy.split('·')[1]?.trim();
    if (parsed.end && legacyDuration) {
      const computed = formatDuration(monthsBetween(parsed.start, parsed.end), 'fr');
      if (computed !== legacyDuration) problems.push(`${name}/${d.id} : durée « ${legacyDuration} » ≠ calcul « ${computed} »`);
    }
    changes.push({ collection: name, id: d.id, legacyField, legacy, ...parsed });
  }
}

for (const c of changes) {
  console.log(`${`${c.collection}/${c.id}`.padEnd(28)} « ${c.legacy} » → start=${c.start} end=${c.end ?? 'null (en cours)'}`);
}
if (problems.length) {
  console.error(`\n${problems.length} problème(s), aucune écriture :\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
if (!changes.length) {
  console.log('Rien à migrer.');
  process.exit(0);
}
if (dryRun) {
  console.log(`\n--dry-run : ${changes.length} document(s) à migrer, aucune écriture.`);
  process.exit(0);
}

const email = process.env['ADMIN_EMAIL'];
const password = process.env['ADMIN_PASSWORD'];
if (!email || !password) {
  console.error("ADMIN_EMAIL et ADMIN_PASSWORD doivent être définis (fichier .env à la racine).");
  process.exit(1);
}
const auth = getAuth(app);
await signInWithEmailAndPassword(auth, email, password);

const batch = writeBatch(db);
for (const c of changes) {
  batch.update(doc(db, c.collection, c.id), { start: c.start, end: c.end, [c.legacyField]: deleteField() });
}
await batch.commit();
console.log(`\nMigration terminée : ${changes.length} document(s).`);
await signOut(auth);
process.exit(0);
