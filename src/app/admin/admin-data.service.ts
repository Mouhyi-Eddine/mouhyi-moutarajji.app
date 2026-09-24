import { Injectable, inject } from '@angular/core';
import { collection, deleteDoc, doc, setDoc } from 'firebase/firestore/lite';
import { COLLECTIONS, PROFILE_DOC_ID } from '../core/collections';
import { FIRESTORE } from '../core/firebase';
import { PortfolioDataService } from '../core/portfolio-data.service';
import { Agency, Experience, Profile, SkillGroup } from '../models/portfolio.models';

type Collection = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

/**
 * Écritures Firestore du panel admin. L'autorisation est vérifiée côté
 * Firestore (règles) : si l'utilisateur n'est pas l'UID admin, la promesse
 * est rejetée avec "permission-denied".
 * Après chaque écriture, les signals du site public sont rechargés.
 */
@Injectable({ providedIn: 'root' })
export class AdminDataService {
  private readonly db = inject(FIRESTORE);
  private readonly data = inject(PortfolioDataService);

  saveExperience(experience: Experience): Promise<void> {
    return this.save(COLLECTIONS.experiences, experience);
  }

  deleteExperience(id: string): Promise<void> {
    return this.remove(COLLECTIONS.experiences, id);
  }

  saveSkillGroup(group: SkillGroup): Promise<void> {
    return this.save(COLLECTIONS.skills, group);
  }

  deleteSkillGroup(id: string): Promise<void> {
    return this.remove(COLLECTIONS.skills, id);
  }

  saveAgency(agency: Agency): Promise<void> {
    return this.save(COLLECTIONS.agencies, agency);
  }

  deleteAgency(id: string): Promise<void> {
    return this.remove(COLLECTIONS.agencies, id);
  }

  /** Le profil est un document unique (profile/main), créé à la première sauvegarde. */
  saveProfile(profile: Profile): Promise<void> {
    return this.save(COLLECTIONS.profile, { id: PROFILE_DOC_ID, ...profile });
  }

  /** id vide = création avec un id généré par Firestore. L'id n'est pas stocké dans les champs. */
  private async save(name: Collection, { id, ...fields }: { id: string }): Promise<void> {
    const ref = id ? doc(this.db, name, id) : doc(collection(this.db, name));
    await setDoc(ref, fields);
    await this.data.reload();
  }

  private async remove(name: Collection, id: string): Promise<void> {
    await deleteDoc(doc(this.db, name, id));
    await this.data.reload();
  }
}
