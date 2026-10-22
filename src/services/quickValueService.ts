import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { firestore } from '../lib/firebase';
import { getNextSequenceId, docToData } from '../db/firestoreDb';
import type { QuickValue } from '../types';

const COLLECTION_NAME = 'quickValues';

export const quickValueService = {
  async getByCategory(category: QuickValue['category']): Promise<string[]> {
    const colRef = collection(firestore, COLLECTION_NAME);
    const q = query(colRef, where('category', '==', category));
    const snap = await getDocs(q);
    const results: string[] = [];
    snap.forEach((d) => {
      const data = d.data() as QuickValue;
      if (data.value) results.push(data.value);
    });
    return results;
  },

  async getAll(): Promise<QuickValue[]> {
    const colRef = collection(firestore, COLLECTION_NAME);
    const snap = await getDocs(colRef);
    const list: QuickValue[] = [];
    snap.forEach((d) => {
      list.push(docToData<QuickValue>(d));
    });
    return list.sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));
  },

  async add(category: QuickValue['category'], value: string): Promise<number> {
    const trimmed = value.trim();
    const all = await this.getAll();
    const existing = all.find(
      (q) => q.category === category && q.value.toLowerCase() === trimmed.toLowerCase()
    );
    if (existing && existing.id) return existing.id;

    const nextId = await getNextSequenceId(COLLECTION_NAME);
    const docRef = doc(firestore, COLLECTION_NAME, String(nextId));
    await setDoc(docRef, {
      id: nextId,
      category,
      value: trimmed,
    });
    return nextId;
  },

  async delete(id: number): Promise<void> {
    const docRef = doc(firestore, COLLECTION_NAME, String(id));
    await deleteDoc(docRef);
  },
};
