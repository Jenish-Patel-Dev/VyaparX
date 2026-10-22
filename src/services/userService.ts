import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { firestore } from '../lib/firebase';
import type { AppUser } from '../types';

const COLLECTION_NAME = 'users';

function getDocId(email: string): string {
  return email.toLowerCase().trim().replace(/[.#$[\]]/g, '_');
}

export const userService = {
  async getOrCreateUser(email: string, name?: string): Promise<AppUser> {
    const cleanEmail = email.toLowerCase().trim();
    const docId = getDocId(cleanEmail);
    const docRef = doc(firestore, COLLECTION_NAME, docId);
    const now = new Date().toISOString();

    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      const newUser: AppUser = {
        id: docId,
        email: cleanEmail,
        name: name || cleanEmail.split('@')[0].toUpperCase(),
        createdAt: now,
        lastLoginAt: now,
      };
      await setDoc(docRef, newUser);
      return newUser;
    }

    // Return existing user without overwriting lastLoginAt
    return {
      id: docId,
      ...snap.data(),
    } as AppUser;
  },

  /**
   * Only update lastLoginAt when user enters their 6-digit PIN / unlocks session
   */
  async updateLastLogin(email: string): Promise<void> {
    try {
      const cleanEmail = email.toLowerCase().trim();
      const docId = getDocId(cleanEmail);
      const docRef = doc(firestore, COLLECTION_NAME, docId);
      await updateDoc(docRef, {
        lastLoginAt: new Date().toISOString(),
      });
    } catch (e) {
      console.error('Failed to update user lastLoginAt:', e);
    }
  },

  async getUser(email: string): Promise<AppUser | undefined> {
    const cleanEmail = email.toLowerCase().trim();
    const docId = getDocId(cleanEmail);
    const docRef = doc(firestore, COLLECTION_NAME, docId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return undefined;
    return {
      id: docId,
      ...snap.data(),
    } as AppUser;
  },

  async updateUserPin(email: string, pin: string): Promise<void> {
    const cleanEmail = email.toLowerCase().trim();
    const docId = getDocId(cleanEmail);
    const docRef = doc(firestore, COLLECTION_NAME, docId);
    await setDoc(docRef, {
      pin,
      isPinEnabled: true,
      pinUpdatedAt: new Date().toISOString(),
    }, { merge: true });
  },

  async getAllUsers(): Promise<AppUser[]> {
    const colRef = collection(firestore, COLLECTION_NAME);
    const snap = await getDocs(colRef);
    const list: AppUser[] = [];
    snap.forEach((d) => {
      list.push({
        id: d.id,
        ...d.data(),
      } as AppUser);
    });
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
};
