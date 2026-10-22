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
import type { SaudaOrder } from '../types';

const COLLECTION_NAME = 'saudaOrders';

export interface SaudaFilters {
  companyId?: number;
  financialYear?: string;
  userEmail?: string;
  query?: string;
  itemId?: number;
  sellerId?: number;
  buyerId?: number;
  partyId?: number;
  date?: string;
  startDate?: string;
  endDate?: string;
}

export const saudaService = {
  async getAll(filters?: SaudaFilters): Promise<SaudaOrder[]> {
    const colRef = collection(firestore, COLLECTION_NAME);
    const snap = await getDocs(colRef);
    let orders: SaudaOrder[] = [];

    snap.forEach((d) => {
      orders.push(docToData<SaudaOrder>(d));
    });

    // 1. Filter by User Email
    const email = (filters?.userEmail || authService.getUserEmail()).toLowerCase().trim();
    if (email) {
      orders = orders.filter((o) => o.userEmail && o.userEmail.toLowerCase().trim() === email);
    }

    // 2. Filter by Financial Year
    if (filters?.financialYear) {
      orders = orders.filter((o) => o.financialYear === filters.financialYear);
    }

    // 3. Filter by Company
    if (filters?.companyId) {
      orders = orders.filter((o) => o.companyId === filters.companyId);
    }

    // 4. Other filters
    if (filters?.itemId) {
      orders = orders.filter((o) => o.itemId === filters.itemId);
    }

    if (filters?.sellerId) {
      orders = orders.filter((o) => o.sellerId === filters.sellerId);
    }

    if (filters?.buyerId) {
      orders = orders.filter((o) => o.buyerId === filters.buyerId);
    }

    if (filters?.partyId) {
      orders = orders.filter((o) => o.sellerId === filters.partyId || o.buyerId === filters.partyId);
    }

    if (filters?.date) {
      orders = orders.filter((o) => o.date === filters.date);
    }

    if (filters?.startDate) {
      orders = orders.filter((o) => o.date >= filters.startDate!);
    }

    if (filters?.endDate) {
      orders = orders.filter((o) => o.date <= filters.endDate!);
    }

    if (filters?.query && filters.query.trim()) {
      const q = filters.query.toLowerCase().trim().replace('#', '');
      orders = orders.filter((o) =>
        String(o.id).includes(q) ||
        (o.doNo && o.doNo.toLowerCase().includes(q)) ||
        (o.itemName && o.itemName.toLowerCase().includes(q)) ||
        (o.sellerName && o.sellerName.toLowerCase().includes(q)) ||
        (o.sellerLocation && o.sellerLocation.toLowerCase().includes(q)) ||
        (o.sellerCity && o.sellerCity.toLowerCase().includes(q)) ||
        (o.buyerName && o.buyerName.toLowerCase().includes(q)) ||
        (o.buyerLocation && o.buyerLocation.toLowerCase().includes(q)) ||
        (o.buyerCity && o.buyerCity.toLowerCase().includes(q)) ||
        (o.billNo && o.billNo.toLowerCase().includes(q)) ||
        (o.deliveryTerms && o.deliveryTerms.toLowerCase().includes(q))
      );
    }

    // Ensure all orders have a valid doNo
    orders.forEach((o) => {
      if (!o.doNo && o.id) {
        const dateClean = (o.date || '').replace(/-/g, '');
        o.doNo = `${dateClean}${String(o.id).padStart(3, '0')}`;
      }
    });

    // Sort descending by ID / Date
    return orders.sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));
  },

  async getById(id: number): Promise<SaudaOrder | undefined> {
    const docRef = doc(firestore, COLLECTION_NAME, String(id));
    const snap = await getDoc(docRef);
    if (!snap.exists()) return undefined;

    const order = {
      ...snap.data(),
      id: Number(snap.id),
    } as SaudaOrder;

    if (!order.doNo && order.id) {
      const dateClean = (order.date || '').replace(/-/g, '');
      order.doNo = `${dateClean}${String(order.id).padStart(3, '0')}`;
    }
    return order;
  },

  async create(order: Omit<SaudaOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    const now = new Date().toISOString();
    const nextId = await getNextSequenceId(COLLECTION_NAME);
    const userEmail = (order.userEmail || authService.getUserEmail()).toLowerCase().trim();
    const dateClean = (order.date || now.split('T')[0]).replace(/-/g, '');
    const seqStr = String(nextId).padStart(3, '0');
    const autoDoNo = order.doNo || `${dateClean}${seqStr}`;

    const docRef = doc(firestore, COLLECTION_NAME, String(nextId));
    const newOrder: SaudaOrder = {
      ...order,
      id: nextId,
      userEmail,
      doNo: autoDoNo,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(docRef, newOrder);
    return nextId;
  },

  async update(id: number, updates: Partial<SaudaOrder>): Promise<void> {
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

  async getDashboardStats(companyId?: number, financialYear?: string, userEmail?: string): Promise<{
    totalOrders: number;
    primaryItemName: string;
    primaryItemQuantity: number;
    totalAmount: number;
  }> {
    const orders = await this.getAll({ companyId, financialYear, userEmail });
    const totalOrders = orders.length;
    let totalAmount = 0;
    const itemQuantities: Record<string, number> = {};

    for (const o of orders) {
      totalAmount += o.totalBillAmount || 0;
      const key = o.itemName || 'ITEMS';
      itemQuantities[key] = (itemQuantities[key] || 0) + (Number(o.quantity) || 0);
    }

    let primaryItemName = 'ITEMS';
    let primaryItemQuantity = 0;

    const itemEntries = Object.entries(itemQuantities);
    if (itemEntries.length > 0) {
      itemEntries.sort((a, b) => b[1] - a[1]);
      primaryItemName = itemEntries[0][0];
      primaryItemQuantity = itemEntries[0][1];
    }

    return {
      totalOrders,
      primaryItemName,
      primaryItemQuantity,
      totalAmount,
    };
  },
};
