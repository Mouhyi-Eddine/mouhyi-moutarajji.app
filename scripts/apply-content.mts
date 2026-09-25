/**
 * Pousse dans Firestore les textes relus : anglais (scripts/content-en.ts) et
 * français harmonisé (scripts/content-fr.ts). Seuls les champs listés dans ces
 * fichiers sont modifiés (intitulés, contextes EN, réalisations, diplômes EN…).
 *
 *   npm run apply:content -- --dry-run   # affiche les différences, sans identifiants
 *   npm run apply:content                # écrit (ADMIN_EMAIL / ADMIN_PASSWORD dans .env)
 *
 * Garde-fou : si une expérience a changé depuis la relecture (nombre de
 * réalisations FR ou EN différent de la version relue), elle est ignorée et signalée.
 */
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, doc, getDocs, getFirestore, writeBatch } from 'firebase/firestore/lite';
import { COLLECTIONS } from '../src/app/core/collections.ts';
import { environment } from '../src/environments/environment.ts';
import { AGENCIES_EN, EDUCATION_EN, EXPERIENCES_EN, SKILL_GROUPS_EN } from './content-en.ts';
import { AGENCIES_FR, EXPERIENCES_FR } from './content-fr.ts';

const dryRun = process.argv.includes('--dry-run');
const app = initializeApp(environment.firebase);
const db = getFirestore(app);

type Update = { collection: string; id: string; fields: Record<string, unknown> };
const updates: Update[] = [];
const skipped: string[] = [];
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

function diff(collectionName: string, id: string, current: Record<string, unknown>, next: Record<string, unknown>): void {
  const fields: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(next)) {
    if (same(current[k], v)) continue;
    fields[k] = v;
    const item = (i: unknown) => (typeof i === 'object' ? JSON.stringify(i) : String(i));
    const show = (x: unknown) => (Array.isArray(x) ? `\n      ${x.map(item).join('\n      ')}` : ` ${item(x)}`);
    console.log(`\n${collectionName}/${id}.${k}\n  - avant :${show(current[k])}\n  + après :${show(v)}`);
  }
  if (Object.keys(fields).length) updates.push({ collection: collectionName, id, fields });
}

for (const d of (await getDocs(collection(db, COLLECTIONS.experiences))).docs) {
  const en = EXPERIENCES_EN[d.id];
  const fr = EXPERIENCES_FR[d.id];
  if (!en && !fr) continue;
  const next = { ...en, ...fr };
  const data = d.data();
  const count = (k: string) => (data[k] as string[] | undefined)?.length ?? 0;
  if ((en && count('bulletsEn') !== en.bulletsEn.length) || (fr && count('bulletsFr') !== fr.bulletsFr.length)) {
    skipped.push(`experiences/${d.id} : ${count('bulletsFr')} réalisations FR / ${count('bulletsEn')} EN en base, version relue différente`);
    continue;
  }
  diff(COLLECTIONS.experiences, d.id, data, next);
}
for (const d of (await getDocs(collection(db, COLLECTIONS.agencies))).docs) {
  if (AGENCIES_EN[d.id] || AGENCIES_FR[d.id]) diff(COLLECTIONS.agencies, d.id, d.data(), { ...AGENCIES_EN[d.id], ...AGENCIES_FR[d.id] });
}
for (const d of (await getDocs(collection(db, COLLECTIONS.education))).docs) {
  if (EDUCATION_EN[d.id]) diff(COLLECTIONS.education, d.id, d.data(), EDUCATION_EN[d.id]);
}
for (const d of (await getDocs(collection(db, COLLECTIONS.skills))).docs) {
  const en = SKILL_GROUPS_EN[d.id];
  if (!en) continue;
  const data = d.data();
  const skills = (data['skills'] as { fr: string; en: string }[]).map((s) => ({ ...s, en: en.skills?.[s.fr] ?? s.en }));
  diff(COLLECTIONS.skills, d.id, data, { nameEn: en.nameEn, skills });
}

if (skipped.length) console.warn(`\nIgnoré(s), à vérifier dans le panel :\n- ${skipped.join('\n- ')}`);
console.log(`\n${updates.length} document(s) à mettre à jour.`);
if (dryRun || !updates.length) {
  if (dryRun) console.log('--dry-run : aucune écriture.');
  process.exit(0);
}

const email = process.env['ADMIN_EMAIL'];
const password = process.env['ADMIN_PASSWORD'];
if (!email || !password) {
  console.error('ADMIN_EMAIL et ADMIN_PASSWORD doivent être définis (fichier .env à la racine).');
  process.exit(1);
}
const auth = getAuth(app);
await signInWithEmailAndPassword(auth, email, password);
const batch = writeBatch(db);
for (const u of updates) batch.update(doc(db, u.collection, u.id), u.fields);
await batch.commit();
console.log('Textes mis à jour.');
await signOut(auth);
process.exit(0);
