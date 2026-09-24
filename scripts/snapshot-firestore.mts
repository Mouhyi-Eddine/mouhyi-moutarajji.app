/**
 * Exécuté après `npm run build` (hook npm "postbuild").
 *
 * Écrit un instantané public des 4 collections dans le dossier de build
 * (portfolio-data.json). Le site l'affiche immédiatement, puis le remplace
 * par les données Firestore en direct. Lecture seule, sans authentification
 * (les collections sont en lecture publique).
 *
 * Ne fait jamais échouer le build : sans réseau, le site fonctionne sans
 * instantané (Firestore seul).
 */
import { writeFileSync } from 'node:fs';
import { initializeApp } from 'firebase/app';
import { collection, doc, getDoc, getDocs, getFirestore, setLogLevel } from 'firebase/firestore/lite';
import { COLLECTIONS, PROFILE_DOC_ID } from '../src/app/core/collections.ts';
import { environment } from '../src/environments/environment.ts';

const out = 'dist/mouhyi-portfolio/browser/portfolio-data.json';

try {
  setLogLevel('silent'); // les erreurs utiles sont gérées ci-dessous
  const db = getFirestore(initializeApp(environment.firebase));
  const readAll = async (name: string) =>
    (await getDocs(collection(db, name))).docs.map((d) => ({ ...d.data(), id: d.id }));

  // Profil : document optionnel, et règles Firestore éventuellement pas encore publiées.
  const readProfile = async () => {
    try {
      const snap = await getDoc(doc(db, COLLECTIONS.profile, PROFILE_DOC_ID));
      return snap.exists() ? snap.data() : null;
    } catch {
      return null;
    }
  };

  const [skillGroups, experiences, education, agencies, profile] = await Promise.all([
    readAll(COLLECTIONS.skills),
    readAll(COLLECTIONS.experiences),
    readAll(COLLECTIONS.education),
    readAll(COLLECTIONS.agencies),
    readProfile(),
  ]);
  writeFileSync(out, JSON.stringify({ skillGroups, experiences, education, agencies, profile }));
  console.log(`snapshot : ${out} (${experiences.length} expériences, ${skillGroups.length} catégories de compétences).`);
} catch (err) {
  console.warn(`snapshot : Firestore injoignable, build sans instantané (${(err as Error).message}).`);
}
process.exit(0);
