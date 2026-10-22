import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { firestore } from '../lib/firebase';
import { getNextSequenceId, docToData } from '../db/firestoreDb';
import { authService } from './authService';
import type { Party } from '../types';

const COLLECTION_NAME = 'parties';

export const partyService = {
  async getAll(specificUserEmail?: string): Promise<Party[]> {
    const colRef = collection(firestore, COLLECTION_NAME);
    const snap = await getDocs(colRef);
    const list: Party[] = [];
    snap.forEach((d) => {
      list.push(docToData<Party>(d));
    });

    const email = (specificUserEmail || authService.getUserEmail()).toLowerCase().trim();
    if (email) {
      return list
        .filter((p) => p.userEmail && p.userEmail.toLowerCase().trim() === email)
        .sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));
    }

    return list.sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));
  },

  async getById(id: number): Promise<Party | undefined> {
    const docRef = doc(firestore, COLLECTION_NAME, String(id));
    const snap = await getDoc(docRef);
    if (!snap.exists()) return undefined;
    return {
      ...snap.data(),
      id: Number(snap.id),
    } as Party;
  },

  async create(party: Omit<Party, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    const now = new Date().toISOString();
    const nextId = await getNextSequenceId(COLLECTION_NAME);
    const userEmail = (party.userEmail || authService.getUserEmail()).toLowerCase().trim();
    const docRef = doc(firestore, COLLECTION_NAME, String(nextId));

    const newParty: Party = {
      ...party,
      id: nextId,
      userEmail,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(docRef, newParty);
    return nextId;
  },

  async update(id: number, updates: Partial<Party>): Promise<void> {
    const now = new Date().toISOString();
    const docRef = doc(firestore, COLLECTION_NAME, String(id));
    await updateDoc(docRef, {
      ...updates,
      updatedAt: now,
    });
  },

  async delete(id: number): Promise<void> {
    const docRef = doc(firestore, COLLECTION_NAME, String(id));
    await deleteDoc(docRef);
  },

  async search(query: string, userEmail?: string): Promise<Party[]> {
    const all = await this.getAll(userEmail);
    if (!query.trim()) return all;
    const q = query.toLowerCase().trim();
    return all.filter((p) =>
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.mobileNumber && p.mobileNumber.toLowerCase().includes(q)) ||
      (p.city && p.city.toLowerCase().includes(q)) ||
      (p.state && p.state.toLowerCase().includes(q)) ||
      (p.address && p.address.toLowerCase().includes(q)) ||
      (p.email && p.email.toLowerCase().includes(q)) ||
      (p.gstNumber && p.gstNumber.toLowerCase().includes(q)) ||
      (p.panNumber && p.panNumber.toLowerCase().includes(q)) ||
      String(p.id).includes(q)
    );
  },
};
