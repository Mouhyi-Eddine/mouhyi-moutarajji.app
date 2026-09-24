/**
 * Import initial des données du portfolio dans Firestore.
 *
 *   npm run seed                 # import (refuse si les collections contiennent déjà des données)
 *   npm run seed -- --dry-run    # affiche ce qui serait écrit, sans rien écrire
 *   npm run seed -- --force      # écrase les documents existants ayant le même id
 *
 * Le script s'authentifie avec le compte admin (SDK client + Firebase Auth) :
 * les écritures passent donc par les mêmes règles Firestore que le panel admin,
 * et aucune clé de compte de service n'est nécessaire.
 * Identifiants lus dans les variables d'environnement ADMIN_EMAIL / ADMIN_PASSWORD
 * (ou dans un fichier .env à la racine, ignoré par git).
 */
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, doc, getDocs, getFirestore, limit, query, writeBatch } from 'firebase/firestore/lite';
import { environment } from '../src/environments/environment.ts';
import { COLLECTIONS } from '../src/app/core/collections.ts';
import { AGENCIES, EDUCATION, EXPERIENCES, SKILL_GROUPS } from './seed-data.ts';

const dryRun = process.argv.includes('--dry-run');
const force = process.argv.includes('--force');

const datasets: Record<string, { id: string }[]> = {
  [COLLECTIONS.skills]: SKILL_GROUPS,
  [COLLECTIONS.experiences]: EXPERIENCES,
  [COLLECTIONS.education]: EDUCATION,
  [COLLECTIONS.agencies]: AGENCIES,
};

for (const [name, items] of Object.entries(datasets)) {
  console.log(`${name.padEnd(12)} ${items.length} document(s) : ${items.map((i) => i.id).join(', ')}`);
}
if (dryRun) {
  console.log('\n--dry-run : aucune écriture.');
  process.exit(0);
}

if (environment.firebase.projectId === 'REPLACE_ME') {
  console.error('src/environments/environment.ts contient encore les valeurs REPLACE_ME : renseignez la config Firebase.');
  process.exit(1);
}
const email = process.env['ADMIN_EMAIL'];
const password = process.env['ADMIN_PASSWORD'];
if (!email || !password) {
  console.error('ADMIN_EMAIL et ADMIN_PASSWORD doivent être définis (variables d\'environnement ou fichier .env).');
  process.exit(1);
}

const app = initializeApp(environment.firebase);
const auth = getAuth(app);
const db = getFirestore(app);

const { user } = await signInWithEmailAndPassword(auth, email, password);
console.log(`\nConnecté en tant que ${user.email} (uid ${user.uid})`);

if (!force) {
  for (const name of Object.keys(datasets)) {
    const existing = await getDocs(query(collection(db, name), limit(1)));
    if (!existing.empty) {
      console.error(`La collection "${name}" contient déjà des données. Relancez avec --force pour écraser les documents de même id.`);
      await signOut(auth);
      process.exit(1);
    }
  }
}

// Un seul batch (max 500 opérations) : tout est écrit, ou rien.
const batch = writeBatch(db);
for (const [name, items] of Object.entries(datasets)) {
  for (const { id, ...fields } of items) {
    batch.set(doc(db, name, id), fields);
  }
}
await batch.commit();
console.log('Import terminé.');

await signOut(auth);
process.exit(0);
