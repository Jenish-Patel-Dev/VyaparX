import { db } from '../db/database';
import type { Company } from '../types';

export const companyService = {
  async getAll(): Promise<Company[]> {
    return await db.companies.toArray();
  },

  async getByUser(userEmail?: string): Promise<Company[]> {
    if (!userEmail) return await this.getAll();
    const emailLower = userEmail.toLowerCase().trim();
    const all = await db.companies.toArray();
    // Return companies specifically associated with this userEmail
    // For backward compatibility, if company has email matching or userEmail matching
    return all.filter(c => 
      (c.userEmail && c.userEmail.toLowerCase() === emailLower) ||
      (!c.userEmail && c.email && c.email.toLowerCase() === emailLower)
    );
  },

  async getById(id: number): Promise<Company | undefined> {
    return await db.companies.get(id);
  },

  async getDefault(): Promise<Company | undefined> {
    const defaultCompany = await db.companies.where('isDefault').equals(1).first();
    if (!defaultCompany) {
      return await db.companies.toCollection().first();
    }
    return defaultCompany;
  },

  async create(company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    const now = new Date().toISOString();
    
    // If this is set as default, unset existing default
    if (company.isDefault) {
      await db.companies.toCollection().modify({ isDefault: false });
    }
    
    // If this is the first company, ensure it's default
    const count = await db.companies.count();
    const isDefault = count === 0 ? true : !!company.isDefault;

    const id = await db.companies.add({
      ...company,
      isDefault,
      createdAt: now,
      updatedAt: now,
    });
    return Number(id);
  },

  async update(id: number, updates: Partial<Company>): Promise<void> {
    const now = new Date().toISOString();
    
    if (updates.isDefault) {
      await db.companies.toCollection().modify({ isDefault: false });
    }
    
    await db.companies.update(id, {
      ...updates,
      updatedAt: now,
    });
  },

  async setDefault(id: number): Promise<void> {
    await db.companies.toCollection().modify({ isDefault: false });
    await db.companies.update(id, { isDefault: true, updatedAt: new Date().toISOString() });
  },

  async delete(id: number): Promise<void> {
    await db.companies.delete(id);
    // If deleted was default, make another one default if exists
    const remaining = await db.companies.toArray();
    if (remaining.length > 0 && !remaining.some(c => c.isDefault)) {
      await db.companies.update(remaining[0].id!, { isDefault: true });
    }
  },

  async search(query: string, userEmail?: string): Promise<Company[]> {
    const base = userEmail ? await this.getByUser(userEmail) : await this.getAll();
    if (!query.trim()) return base;
    const q = query.trim().toLowerCase().replace('#', '');
    return base.filter(c => 
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
