import { db } from '../db/database';
import type { Item } from '../types';

export const itemService = {
  async getAll(): Promise<Item[]> {
    return await db.items.toArray();
  },

  async getById(id: number): Promise<Item | undefined> {
    return await db.items.get(id);
  },

  async create(item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    const now = new Date().toISOString();
    const id = await db.items.add({
      ...item,
      createdAt: now,
      updatedAt: now,
    });
    return Number(id);
  },

  async update(id: number, updates: Partial<Item>): Promise<void> {
    const now = new Date().toISOString();
    await db.items.update(id, {
      ...updates,
      updatedAt: now,
    });
  },

  async delete(id: number): Promise<void> {
    await db.items.delete(id);
  },

  async search(query: string): Promise<Item[]> {
    if (!query.trim()) return await this.getAll();
    const q = query.trim().toLowerCase().replace('#', '');
    return await db.items
      .filter(item => 
        item.name.toLowerCase().includes(q) ||
        String(item.id).includes(q) ||
        Boolean(item.unit && item.unit.toLowerCase().includes(q))
      )
      .toArray();
  },
};
