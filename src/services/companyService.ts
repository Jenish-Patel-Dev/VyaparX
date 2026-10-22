import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { firestore } from '../lib/firebase';
import { getNextSequenceId, docToData } from '../db/firestoreDb';
import { authService } from './authService';
import type { Company } from '../types';

const COLLECTION_NAME = 'companies';

export const companyService = {
  async getAll(specificUserEmail?: string): Promise<Company[]> {
    const colRef = collection(firestore, COLLECTION_NAME);
    const snap = await getDocs(colRef);
    const list: Company[] = [];
    snap.forEach((d) => {
      list.push(docToData<Company>(d));
    });

    const email = (specificUserEmail || authService.getUserEmail()).toLowerCase().trim();
    if (email) {
      return list
        .filter((c) =>
          (c.userEmail && c.userEmail.toLowerCase().trim() === email) ||
          (!c.userEmail && c.email && c.email.toLowerCase().trim() === email)
        )
        .sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));
    }

    return list.sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));
  },

  async getByUser(userEmail?: string): Promise<Company[]> {
    return await this.getAll(userEmail);
  },

  async getById(id: number): Promise<Company | undefined> {
    const docRef = doc(firestore, COLLECTION_NAME, String(id));
    const snap = await getDoc(docRef);
    if (!snap.exists()) return undefined;
    return {
      ...snap.data(),
      id: Number(snap.id),
    } as Company;
  },

  async getDefault(userEmail?: string): Promise<Company | undefined> {
    const userCompanies = await this.getAll(userEmail);
    const defaultCompany = userCompanies.find((c) => c.isDefault);
    return defaultCompany || userCompanies[0] || undefined;
  },

  async create(company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    const now = new Date().toISOString();
    const nextId = await getNextSequenceId(COLLECTION_NAME);
    const userEmail = (company.userEmail || authService.getUserEmail()).toLowerCase().trim();
    const userCompanies = await this.getAll(userEmail);

    const isFirst = userCompanies.length === 0;
    const isDefault = isFirst ? true : Boolean(company.isDefault);

    // If setting this one as default, unset other defaults for this user
    if (isDefault && userCompanies.length > 0) {
      const batch = writeBatch(firestore);
      userCompanies.forEach((c) => {
        if (c.isDefault && c.id) {
          const ref = doc(firestore, COLLECTION_NAME, String(c.id));
          batch.update(ref, { isDefault: false });
        }
      });
      await batch.commit();
    }

    const docRef = doc(firestore, COLLECTION_NAME, String(nextId));
    const newCompany: Company = {
      ...company,
      id: nextId,
      userEmail,
      isDefault,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(docRef, newCompany);
    return nextId;
  },

  async update(id: number, updates: Partial<Company>): Promise<void> {
    const now = new Date().toISOString();
    const docRef = doc(firestore, COLLECTION_NAME, String(id));

    if (updates.isDefault) {
      const target = await this.getById(id);
      const userEmail = target?.userEmail || authService.getUserEmail();
      const userCompanies = await this.getAll(userEmail);
      const batch = writeBatch(firestore);
      userCompanies.forEach((c) => {
        if (c.id !== id && c.isDefault && c.id) {
          batch.update(doc(firestore, COLLECTION_NAME, String(c.id)), { isDefault: false });
        }
      });
      await batch.commit();
    }

    await updateDoc(docRef, {
      ...updates,
      updatedAt: now,
    });
  },

  async setDefault(id: number): Promise<void> {
    const target = await this.getById(id);
    const userEmail = target?.userEmail || authService.getUserEmail();
    const userCompanies = await this.getAll(userEmail);
    const batch = writeBatch(firestore);
    userCompanies.forEach((c) => {
      if (c.id) {
        batch.update(doc(firestore, COLLECTION_NAME, String(c.id)), {
          isDefault: c.id === id,
          updatedAt: new Date().toISOString(),
        });
      }
    });
    await batch.commit();
  },

  async delete(id: number): Promise<void> {
    const target = await this.getById(id);
    const userEmail = target?.userEmail || authService.getUserEmail();
    const docRef = doc(firestore, COLLECTION_NAME, String(id));
    await deleteDoc(docRef);

    // If deleted was default, make another one default if exists
    const remaining = await this.getAll(userEmail);
    if (remaining.length > 0 && !remaining.some((c) => c.isDefault)) {
      await this.update(remaining[0].id!, { isDefault: true });
    }
  },

  async search(query: string, userEmail?: string): Promise<Company[]> {
    const base = await this.getAll(userEmail);
    if (!query.trim()) return base;
    const q = query.trim().toLowerCase().replace('#', '');
    return base.filter((c) =>
      Boolean(
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.username && c.username.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.userEmail && c.userEmail.toLowerCase().includes(q)) ||
        (c.address && c.address.toLowerCase().includes(q)) ||
        (c.city && c.city.toLowerCase().includes(q)) ||
        (c.contactNumber && c.contactNumber.includes(q)) ||
        (c.state && c.state.toLowerCase().includes(q)) ||
        (c.gstNumber && c.gstNumber.toLowerCase().includes(q))
      )
    );
  },
};
