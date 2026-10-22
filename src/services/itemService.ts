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
import type { Item } from '../types';

const COLLECTION_NAME = 'items';

export const itemService = {
  async getAll(specificUserEmail?: string): Promise<Item[]> {
    const colRef = collection(firestore, COLLECTION_NAME);
    const snap = await getDocs(colRef);
    const list: Item[] = [];
    snap.forEach((d) => {
      list.push(docToData<Item>(d));
    });

    const email = (specificUserEmail || authService.getUserEmail()).toLowerCase().trim();
    if (email) {
      return list
        .filter((item) => item.userEmail && item.userEmail.toLowerCase().trim() === email)
        .sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));
    }

    return list.sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));
  },

  async getById(id: number): Promise<Item | undefined> {
    const docRef = doc(firestore, COLLECTION_NAME, String(id));
    const snap = await getDoc(docRef);
    if (!snap.exists()) return undefined;
    return {
      ...snap.data(),
      id: Number(snap.id),
    } as Item;
  },

  async create(item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    const now = new Date().toISOString();
    const nextId = await getNextSequenceId(COLLECTION_NAME);
    const userEmail = (item.userEmail || authService.getUserEmail()).toLowerCase().trim();
    const docRef = doc(firestore, COLLECTION_NAME, String(nextId));

    const newItem: Item = {
      ...item,
      id: nextId,
      userEmail,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(docRef, newItem);
    return nextId;
  },

  async update(id: number, updates: Partial<Item>): Promise<void> {
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

  async search(query: string, userEmail?: string): Promise<Item[]> {
    const all = await this.getAll(userEmail);
    if (!query.trim()) return all;
    const q = query.trim().toLowerCase().replace('#', '');
    return all.filter((item) =>
      item.name.toLowerCase().includes(q) ||
      String(item.id).includes(q) ||
      Boolean(item.unit && item.unit.toLowerCase().includes(q))
    );
  },
};
