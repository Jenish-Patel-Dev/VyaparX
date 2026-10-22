import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { firestore } from '../lib/firebase';
import { authService } from './authService';
import type { UserProfile, FinancialYear } from '../types';

const PROFILE_COLLECTION = 'userProfile';
const FY_COLLECTION = 'financialYears';

function getDocKey(userEmail?: string): string {
  const email = (userEmail || authService.getUserEmail()).toLowerCase().trim();
  return email ? email.replace(/[.#$[\]]/g, '_') : 'default';
}

export const profileService = {
  async getProfile(userEmail?: string): Promise<UserProfile> {
    const key = getDocKey(userEmail);
    const email = (userEmail || authService.getUserEmail()).toLowerCase().trim();
    const docRef = doc(firestore, PROFILE_COLLECTION, key);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      const defaultProfile: UserProfile = {
        name: email ? email.split('@')[0].toUpperCase() : 'USER',
        phone: '',
        plan: 'FREE',
        expiryDate: '2026-10-08',
        referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        isPinEnabled: false,
        email,
      };
      await setDoc(docRef, defaultProfile);
      return defaultProfile;
    }
    return snap.data() as UserProfile;
  },

  async updateProfile(updates: Partial<UserProfile>, userEmail?: string): Promise<void> {
    const key = getDocKey(userEmail);
    const docRef = doc(firestore, PROFILE_COLLECTION, key);
    await setDoc(docRef, updates, { merge: true });
  },

  async getFinancialYears(): Promise<FinancialYear[]> {
    const colRef = collection(firestore, FY_COLLECTION);
    const snap = await getDocs(colRef);
    const list: FinancialYear[] = [];
    snap.forEach((d) => {
      list.push({
        id: d.id,
        ...(d.data() as Omit<FinancialYear, 'id'>),
      });
    });

    if (list.length === 0) {
      const defaults: FinancialYear[] = [
        { id: '2026-2027', name: '2026-2027', isCurrent: true },
        { id: '2025-2026', name: '2025-2026', isCurrent: false },
        { id: '2024-2025', name: '2024-2025', isCurrent: false },
      ];
      for (const fy of defaults) {
        await setDoc(doc(firestore, FY_COLLECTION, fy.id), fy);
      }
      return defaults;
    }

    return list.sort((a, b) => b.name.localeCompare(a.name));
  },

  async addFinancialYear(year: string): Promise<void> {
    const docRef = doc(firestore, FY_COLLECTION, year);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      await setDoc(docRef, {
        id: year,
        name: year,
        isCurrent: false,
      });
    }
  },

  async setCurrentFinancialYear(yearId: string): Promise<void> {
    const all = await this.getFinancialYears();
    const batch = writeBatch(firestore);
    all.forEach((fy) => {
      const ref = doc(firestore, FY_COLLECTION, fy.id);
      batch.update(ref, { isCurrent: fy.id === yearId });
    });
    await batch.commit();
  },
};
