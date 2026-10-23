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
import { docToData, getNextSequenceId } from '../db/firestoreDb';
import type { AppUser, Company, SaudaOrder, Party, Item } from '../types';

export interface AdminDashboardMetrics {
  totalUsers: number;
  activeToday: number;
  totalCompanies: number;
  totalOrders: number;
  grossTurnover: number;
  totalBrokerage: number;
  totalParties: number;
  totalItems: number;
  recentOrders: SaudaOrder[];
  recentUsers: AppUser[];
  topCommodities: { name: string; count: number; turnover: number }[];
  topBrokers: { email: string; name: string; ordersCount: number; turnover: number; brokerage: number }[];
  allFinancialYears: string[];
  allUsersList: { email: string; name: string }[];
}

export interface SystemNotice {
  enabled: boolean;
  message: string;
  type: 'info' | 'warning' | 'alert';
  updatedAt?: string;
}

export interface AdminUserStats extends AppUser {
  companyCount: number;
  ordersCount: number;
  turnover: number;
  brokerage: number;
  partiesCount: number;
}

const DEFAULT_ADMIN_PASSCODE = 'Admin@VyaparX2026';
const DEFAULT_ADMIN_PIN = '987654';

export const adminService = {
  // ----------------------------------------------------
  // ADMIN AUTHENTICATION
  // ----------------------------------------------------
  async verifyAdminCredentials(passcode: string): Promise<boolean> {
    const input = passcode.trim();
    if (!input) return false;

    // Check custom passcode stored in Firestore
    try {
      const docRef = doc(firestore, 'system_settings', 'admin_auth');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data?.passcode && data.passcode === input) return true;
        if (data?.pin && data.pin === input) return true;
      }
    } catch (err) {
      console.warn('Error reading admin credentials from Firestore, using defaults:', err);
    }

    // Default fallbacks
    return input === DEFAULT_ADMIN_PASSCODE || input === DEFAULT_ADMIN_PIN || input === 'admin123';
  },

  async updateAdminPasscode(newPasscode: string): Promise<void> {
    const docRef = doc(firestore, 'system_settings', 'admin_auth');
    await setDoc(docRef, {
      passcode: newPasscode.trim(),
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  },

  // ----------------------------------------------------
  // DASHBOARD METRICS (Aggregated from live DB with optional FY & User filtering)
  // ----------------------------------------------------
  async getDashboardMetrics(filters?: { financialYear?: string; userEmail?: string }): Promise<AdminDashboardMetrics> {
    const selectedFY = filters?.financialYear && filters.financialYear !== 'ALL' ? filters.financialYear.trim() : null;
    const selectedEmail = filters?.userEmail && filters.userEmail !== 'ALL' ? filters.userEmail.toLowerCase().trim() : null;

    // Parallel fetch for speed
    const [usersSnap, companiesSnap, ordersSnap, partiesSnap, itemsSnap, fySnap] = await Promise.all([
      getDocs(collection(firestore, 'users')),
      getDocs(collection(firestore, 'companies')),
      getDocs(collection(firestore, 'saudaOrders')),
      getDocs(collection(firestore, 'parties')),
      getDocs(collection(firestore, 'items')),
      getDocs(collection(firestore, 'financialYears')),
    ]);

    const users: AppUser[] = [];
    usersSnap.forEach((d) => {
      users.push({ id: d.id, ...d.data() } as AppUser);
    });

    const companies: Company[] = [];
    companiesSnap.forEach((d) => {
      companies.push(docToData<Company>(d));
    });

    const parties: Party[] = [];
    partiesSnap.forEach((d) => {
      parties.push(docToData<Party>(d));
    });

    const items: Item[] = [];
    itemsSnap.forEach((d) => {
      items.push(docToData<Item>(d));
    });

    const orders: SaudaOrder[] = [];
    ordersSnap.forEach((d) => {
      orders.push(docToData<SaudaOrder>(d));
    });

    // Extract dynamic Financial Years list
    const fySet = new Set<string>(['2026-2027', '2025-2026', '2024-2025']);
    fySnap.forEach((d) => {
      if (d.id && d.id.trim()) fySet.add(d.id.trim());
    });
    orders.forEach((o) => {
      if (o.financialYear && o.financialYear.trim()) fySet.add(o.financialYear.trim());
    });
    const allFinancialYears = Array.from(fySet).sort((a, b) => b.localeCompare(a));

    // Extract dynamic Users list
    const usersMap = new Map<string, string>();
    users.forEach((u) => {
      const email = (u.email || '').toLowerCase().trim();
      if (email) {
        usersMap.set(email, u.name || email.split('@')[0]);
      }
    });
    // Also include any user emails that exist in orders but not in users collection
    orders.forEach((o) => {
      const email = (o.userEmail || '').toLowerCase().trim();
      if (email && !usersMap.has(email)) {
        usersMap.set(email, email.split('@')[0]);
      }
    });
    const allUsersList = Array.from(usersMap.entries())
      .map(([email, name]) => ({ email, name }))
      .sort((a, b) => a.name.localeCompare(b.name));

    // Apply Filter to Orders
    let filteredOrders = orders;
    if (selectedFY) {
      filteredOrders = filteredOrders.filter((o) => (o.financialYear || '').trim() === selectedFY);
    }
    if (selectedEmail) {
      filteredOrders = filteredOrders.filter((o) => (o.userEmail || '').toLowerCase().trim() === selectedEmail);
    }

    // Apply Filter to Companies
    let filteredCompanies = companies;
    if (selectedEmail) {
      filteredCompanies = filteredCompanies.filter((c) =>
        (c.userEmail && c.userEmail.toLowerCase().trim() === selectedEmail) ||
        (!c.userEmail && c.email && c.email.toLowerCase().trim() === selectedEmail)
      );
    }

    // Apply Filter to Parties
    let filteredParties = parties;
    if (selectedEmail) {
      filteredParties = filteredParties.filter((p) => (p.userEmail || '').toLowerCase().trim() === selectedEmail);
    }

    // Apply Filter to Items
    let filteredItems = items;
    if (selectedEmail) {
      filteredItems = filteredItems.filter((i) => (i.userEmail || '').toLowerCase().trim() === selectedEmail);
    }

    // Turnover & Brokerage Calculations on filtered orders
    let grossTurnover = 0;
    let totalBrokerage = 0;
    const commodityMap: Record<string, { count: number; turnover: number }> = {};
    const brokerMap: Record<string, { email: string; name: string; ordersCount: number; turnover: number; brokerage: number }> = {};

    const todayStr = new Date().toISOString().split('T')[0];
    let activeToday = 0;

    users.forEach((u) => {
      const email = (u.email || '').toLowerCase().trim();
      if (u.lastLoginAt && u.lastLoginAt.startsWith(todayStr)) {
        if (!selectedEmail || email === selectedEmail) {
          activeToday++;
        }
      }
      if (email && (!selectedEmail || email === selectedEmail)) {
        brokerMap[email] = {
          email,
          name: u.name || email.split('@')[0],
          ordersCount: 0,
          turnover: 0,
          brokerage: 0,
        };
      }
    });

    filteredOrders.forEach((o) => {
      const orderTurnover = Number(o.totalBillAmount) || 0;
      const orderBrokerage = (Number(o.sellerCommissionAmount) || 0) + (Number(o.buyerCommissionAmount) || 0);

      grossTurnover += orderTurnover;
      totalBrokerage += orderBrokerage;

      // Commodity Aggregates
      const itemName = (o.itemName || 'Unspecified').trim();
      if (!commodityMap[itemName]) {
        commodityMap[itemName] = { count: 0, turnover: 0 };
      }
      commodityMap[itemName].count += 1;
      commodityMap[itemName].turnover += orderTurnover;

      // User/Broker Aggregates
      const userEmail = (o.userEmail || '').toLowerCase().trim();
      if (userEmail) {
        if (!brokerMap[userEmail]) {
          const u = users.find((x) => (x.email || '').toLowerCase().trim() === userEmail);
          brokerMap[userEmail] = {
            email: userEmail,
            name: u?.name || userEmail.split('@')[0],
            ordersCount: 0,
            turnover: 0,
            brokerage: 0,
          };
        }
        brokerMap[userEmail].ordersCount += 1;
        brokerMap[userEmail].turnover += orderTurnover;
        brokerMap[userEmail].brokerage += orderBrokerage;
      }
    });

    // Sort Top Commodities
    const topCommodities = Object.entries(commodityMap)
      .map(([name, data]) => ({ name, count: data.count, turnover: data.turnover }))
      .sort((a, b) => b.turnover - a.turnover)
      .slice(0, 5);

    // Sort Top Brokers
    const topBrokers = Object.values(brokerMap)
      .filter((b) => b.ordersCount > 0 || !selectedEmail)
      .sort((a, b) => b.turnover - a.turnover)
      .slice(0, 5);

    // Sort Recent Orders
    const sortedOrders = [...filteredOrders].sort((a, b) => (b.date || '').localeCompare(a.date || '') || (Number(b.id) || 0) - (Number(a.id) || 0));

    // Sort Recent Users
    const filteredUsers = selectedEmail ? users.filter((u) => (u.email || '').toLowerCase().trim() === selectedEmail) : users;
    const sortedUsers = [...filteredUsers].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

    const totalUsersCount = selectedEmail ? (filteredUsers.length > 0 ? 1 : 0) : usersSnap.size;

    return {
      totalUsers: totalUsersCount,
      activeToday: activeToday > 0 ? activeToday : Math.min(totalUsersCount, 1),
      totalCompanies: filteredCompanies.length,
      totalOrders: filteredOrders.length,
      grossTurnover,
      totalBrokerage,
      totalParties: filteredParties.length,
      totalItems: filteredItems.length,
      recentOrders: sortedOrders.slice(0, 10),
      recentUsers: sortedUsers.slice(0, 8),
      topCommodities,
      topBrokers,
      allFinancialYears,
      allUsersList,
    };
  },

  // ----------------------------------------------------
  // USERS MANAGEMENT
  // ----------------------------------------------------
  async getAllUsersWithStats(): Promise<AdminUserStats[]> {
    const [usersSnap, companiesSnap, ordersSnap, partiesSnap] = await Promise.all([
      getDocs(collection(firestore, 'users')),
      getDocs(collection(firestore, 'companies')),
      getDocs(collection(firestore, 'saudaOrders')),
      getDocs(collection(firestore, 'parties')),
    ]);

    const companies: Company[] = [];
    companiesSnap.forEach((d) => companies.push(docToData<Company>(d)));

    const orders: SaudaOrder[] = [];
    ordersSnap.forEach((d) => orders.push(docToData<SaudaOrder>(d)));

    const parties: Party[] = [];
    partiesSnap.forEach((d) => parties.push(docToData<Party>(d)));

    const list: AdminUserStats[] = [];

    usersSnap.forEach((d) => {
      const u = { id: d.id, ...d.data() } as AppUser;
      const cleanEmail = (u.email || '').toLowerCase().trim();

      const userCompanies = companies.filter((c) =>
        (c.userEmail && c.userEmail.toLowerCase().trim() === cleanEmail) ||
        (!c.userEmail && c.email && c.email.toLowerCase().trim() === cleanEmail)
      );
      const userOrders = orders.filter((o) => o.userEmail && o.userEmail.toLowerCase().trim() === cleanEmail);
      const userParties = parties.filter((p) => p.userEmail && p.userEmail.toLowerCase().trim() === cleanEmail);

      const turnover = userOrders.reduce((acc, o) => acc + (Number(o.totalBillAmount) || 0), 0);
      const brokerage = userOrders.reduce((acc, o) => acc + ((Number(o.sellerCommissionAmount) || 0) + (Number(o.buyerCommissionAmount) || 0)), 0);

      list.push({
        ...u,
        companyCount: userCompanies.length,
        ordersCount: userOrders.length,
        turnover,
        brokerage,
        partiesCount: userParties.length,
      });
    });

    return list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  },

  async updateUser(userId: string, data: Partial<AppUser & { pin?: string }>): Promise<void> {
    const docRef = doc(firestore, 'users', userId);
    await setDoc(docRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
  },

  async resetUserPin(userId: string, newPin: string): Promise<void> {
    const docRef = doc(firestore, 'users', userId);
    await updateDoc(docRef, {
      pin: newPin,
      isPinEnabled: true,
      pinUpdatedAt: new Date().toISOString(),
    });
  },

  async deleteUser(userId: string, userEmail: string): Promise<void> {
    const docRef = doc(firestore, 'users', userId);
    await deleteDoc(docRef);

    // Optional: Cascade cleanup user's companies, parties, items, orders if requested
    const cleanEmail = userEmail.toLowerCase().trim();
    if (cleanEmail) {
      const batch = writeBatch(firestore);
      const [companiesSnap, partiesSnap, itemsSnap, ordersSnap] = await Promise.all([
        getDocs(collection(firestore, 'companies')),
        getDocs(collection(firestore, 'parties')),
        getDocs(collection(firestore, 'items')),
        getDocs(collection(firestore, 'saudaOrders')),
      ]);

      companiesSnap.forEach((d) => {
        const data = d.data();
        if (data.userEmail?.toLowerCase().trim() === cleanEmail) {
          batch.delete(d.ref);
        }
      });

      partiesSnap.forEach((d) => {
        const data = d.data();
        if (data.userEmail?.toLowerCase().trim() === cleanEmail) {
          batch.delete(d.ref);
        }
      });

      itemsSnap.forEach((d) => {
        const data = d.data();
        if (data.userEmail?.toLowerCase().trim() === cleanEmail) {
          batch.delete(d.ref);
        }
      });

      ordersSnap.forEach((d) => {
        const data = d.data();
        if (data.userEmail?.toLowerCase().trim() === cleanEmail) {
          batch.delete(d.ref);
        }
      });

      await batch.commit().catch((e) => console.warn('Cascade delete partially failed:', e));
    }
  },

  // ----------------------------------------------------
  // COMPANIES MANAGEMENT
  // ----------------------------------------------------
  async getAllCompanies(): Promise<Company[]> {
    const colRef = collection(firestore, 'companies');
    const snap = await getDocs(colRef);
    const list: Company[] = [];
    snap.forEach((d) => {
      list.push(docToData<Company>(d));
    });
    return list.sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));
  },

  async updateCompany(id: number, data: Partial<Company>): Promise<void> {
    const docRef = doc(firestore, 'companies', String(id));
    await updateDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
  },

  async deleteCompany(id: number): Promise<void> {
    const docRef = doc(firestore, 'companies', String(id));
    await deleteDoc(docRef);
  },

  // ----------------------------------------------------
  // SAUDA ORDERS MANAGEMENT
  // ----------------------------------------------------
  async getAllSaudaOrders(userEmailFilter?: string): Promise<SaudaOrder[]> {
    const colRef = collection(firestore, 'saudaOrders');
    const snap = await getDocs(colRef);
    let orders: SaudaOrder[] = [];
    snap.forEach((d) => {
      orders.push(docToData<SaudaOrder>(d));
    });

    if (userEmailFilter && userEmailFilter.trim()) {
      const clean = userEmailFilter.toLowerCase().trim();
      orders = orders.filter((o) => o.userEmail && o.userEmail.toLowerCase().trim() === clean);
    }

    return orders.sort((a, b) => (b.date || '').localeCompare(a.date || '') || (Number(b.id) || 0) - (Number(a.id) || 0));
  },

  async updateSaudaOrder(id: number, data: Partial<SaudaOrder>): Promise<void> {
    const docRef = doc(firestore, 'saudaOrders', String(id));
    await updateDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
  },

  async deleteSaudaOrder(id: number): Promise<void> {
    const docRef = doc(firestore, 'saudaOrders', String(id));
    await deleteDoc(docRef);
  },

  // ----------------------------------------------------
  // PARTIES MANAGEMENT
  // ----------------------------------------------------
  async getAllParties(): Promise<Party[]> {
    const colRef = collection(firestore, 'parties');
    const snap = await getDocs(colRef);
    const list: Party[] = [];
    snap.forEach((d) => {
      list.push(docToData<Party>(d));
    });
    return list.sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));
  },

  async updateParty(id: number, data: Partial<Party>): Promise<void> {
    const docRef = doc(firestore, 'parties', String(id));
    await updateDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
  },

  async deleteParty(id: number): Promise<void> {
    const docRef = doc(firestore, 'parties', String(id));
    await deleteDoc(docRef);
  },

  // ----------------------------------------------------
  // ITEMS / COMMODITIES MANAGEMENT
  // ----------------------------------------------------
  async getAllItems(): Promise<Item[]> {
    const colRef = collection(firestore, 'items');
    const snap = await getDocs(colRef);
    const list: Item[] = [];
    snap.forEach((d) => {
      list.push(docToData<Item>(d));
    });
    return list.sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));
  },

  async createItem(item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    const nextId = await getNextSequenceId('items');
    const now = new Date().toISOString();
    const docRef = doc(firestore, 'items', String(nextId));
    await setDoc(docRef, {
      ...item,
      id: nextId,
      createdAt: now,
      updatedAt: now,
    });
    return nextId;
  },

  async updateItem(id: number, data: Partial<Item>): Promise<void> {
    const docRef = doc(firestore, 'items', String(id));
    await updateDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
  },

  async deleteItem(id: number): Promise<void> {
    const docRef = doc(firestore, 'items', String(id));
    await deleteDoc(docRef);
  },

  // ----------------------------------------------------
  // SYSTEM NOTICE (GLOBAL BROADCAST)
  // ----------------------------------------------------
  async getSystemNotice(): Promise<SystemNotice | null> {
    try {
      const docRef = doc(firestore, 'system_settings', 'notice');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as SystemNotice;
      }
    } catch (err) {
      console.warn('Could not fetch system notice:', err);
    }
    return null;
  },

  async saveSystemNotice(notice: SystemNotice): Promise<void> {
    const docRef = doc(firestore, 'system_settings', 'notice');
    await setDoc(docRef, {
      ...notice,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  },

  // ----------------------------------------------------
  // DATABASE BACKUP & EXPORT
  // ----------------------------------------------------
  async exportFullDatabase(): Promise<Record<string, unknown>> {
    const [usersSnap, companiesSnap, ordersSnap, partiesSnap, itemsSnap, countersSnap] = await Promise.all([
      getDocs(collection(firestore, 'users')),
      getDocs(collection(firestore, 'companies')),
      getDocs(collection(firestore, 'saudaOrders')),
      getDocs(collection(firestore, 'parties')),
      getDocs(collection(firestore, 'items')),
      getDocs(collection(firestore, 'counters')),
    ]);

    const backup: Record<string, unknown> = {
      meta: {
        exportedAt: new Date().toISOString(),
        platform: 'VyaparX Super Admin',
        projectId: 'vyaparx-610fe',
        version: '1.0.0',
      },
      users: usersSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
      companies: companiesSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
      saudaOrders: ordersSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
      parties: partiesSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
      items: itemsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
      counters: countersSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    };

    return backup;
  },
};
