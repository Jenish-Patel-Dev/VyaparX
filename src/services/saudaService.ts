import { db } from '../db/database';
import type { SaudaOrder } from '../types';

export interface SaudaFilters {
  companyId?: number;
  financialYear?: string;
  query?: string;
  itemId?: number;
  sellerId?: number;
  buyerId?: number;
  startDate?: string;
  endDate?: string;
}

export const saudaService = {
  async getAll(filters?: SaudaFilters): Promise<SaudaOrder[]> {
    let collection = db.saudaOrders.toCollection();

    if (filters?.companyId) {
      collection = db.saudaOrders.where('companyId').equals(filters.companyId);
    }

    let orders = await collection.toArray();

    if (filters?.financialYear) {
      orders = orders.filter(o => o.financialYear === filters.financialYear);
    }

    if (filters?.itemId) {
      orders = orders.filter(o => o.itemId === filters.itemId);
    }

    if (filters?.sellerId) {
      orders = orders.filter(o => o.sellerId === filters.sellerId);
    }

    if (filters?.buyerId) {
      orders = orders.filter(o => o.buyerId === filters.buyerId);
    }

    if (filters?.startDate) {
      orders = orders.filter(o => o.date >= filters.startDate!);
    }

    if (filters?.endDate) {
      orders = orders.filter(o => o.date <= filters.endDate!);
    }

    if (filters?.query && filters.query.trim()) {
      const q = filters.query.toLowerCase().trim().replace('#', '');
      orders = orders.filter(o =>
        String(o.id).includes(q) ||
        (o.doNo && o.doNo.toLowerCase().includes(q)) ||
        o.itemName.toLowerCase().includes(q) ||
        o.sellerName.toLowerCase().includes(q) ||
        o.buyerName.toLowerCase().includes(q) ||
        (o.billNo && o.billNo.toLowerCase().includes(q))
      );
    }

    // Sort descending by ID / Date
    return orders.sort((a, b) => (b.id || 0) - (a.id || 0));
  },

  async getById(id: number): Promise<SaudaOrder | undefined> {
    const order = await db.saudaOrders.get(id);
    if (order && !order.doNo) {
      const dateClean = (order.date || '').replace(/-/g, '');
      order.doNo = `${dateClean}${String(order.id).padStart(3, '0')}`;
    }
    return order;
  },

  async create(order: Omit<SaudaOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    const now = new Date().toISOString();
    const id = await db.saudaOrders.add({
      ...order,
      createdAt: now,
      updatedAt: now,
    });

    const numId = Number(id);
    const dateClean = (order.date || now.split('T')[0]).replace(/-/g, '');
    const seqStr = String(numId).padStart(3, '0');
    const autoDoNo = order.doNo || `${dateClean}${seqStr}`;

    await db.saudaOrders.update(numId, { doNo: autoDoNo });
    return numId;
  },

  async update(id: number, updates: Partial<SaudaOrder>): Promise<void> {
    const now = new Date().toISOString();
    await db.saudaOrders.update(id, {
      ...updates,
      updatedAt: now,
    });
  },

  async delete(id: number): Promise<void> {
    await db.saudaOrders.delete(id);
  },

  async getDashboardStats(companyId?: number, financialYear?: string): Promise<{
    totalOrders: number;
    primaryItemName: string;
    primaryItemQuantity: number;
    totalAmount: number;
  }> {
    let orders = await db.saudaOrders.toArray();
    if (companyId) {
      orders = orders.filter(o => o.companyId === companyId);
    }
    if (financialYear) {
      orders = orders.filter(o => o.financialYear === financialYear);
    }

    const totalOrders = orders.length;
    let totalAmount = 0;
    const itemQuantities: Record<string, number> = {};

    for (const o of orders) {
      totalAmount += o.totalBillAmount || 0;
      const key = o.itemName || 'ITEMS';
      itemQuantities[key] = (itemQuantities[key] || 0) + (Number(o.quantity) || 0);
    }

    let primaryItemName = 'KAPAS';
    let primaryItemQuantity = 0;

    const itemEntries = Object.entries(itemQuantities);
    if (itemEntries.length > 0) {
      // Find item with highest quantity
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
