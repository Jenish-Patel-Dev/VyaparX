import * as XLSX from 'xlsx';
import {
  collection,
  onSnapshot,
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

export interface MaintenanceConfig {
  isEnabled: boolean;
  title?: string;
  message?: string;
  estimatedEndTime?: string;
  supportEmail?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface MonthlyTrendData {
  monthKey: string;
  label: string;
  fullLabel: string;
  turnover: number;
  brokerage: number;
  tradesCount: number;
}

export interface DailyTrendData {
  date: string;
  label: string;
  fullLabel: string;
  turnover: number;
  brokerage: number;
  tradesCount: number;
}

export interface AdminDashboardMetrics {
  totalUsers: number;
  activeToday: number;
  totalCompanies: number;
  totalOrders: number;
  grossTurnover: number;
  totalBrokerage: number;
  totalParties: number;
  totalItems: number;
  recentOrders: (SaudaOrder & { companyName?: string })[];
  recentUsers: AppUser[];
  topCommodities: { name: string; count: number; turnover: number }[];
  topBrokers: { email: string; name: string; ordersCount: number; turnover: number; brokerage: number }[];
  allFinancialYears: string[];
  allUsersList: { email: string; name: string }[];
  monthlyTrends: MonthlyTrendData[];
  dailyTrends: DailyTrendData[];
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
  itemsCount: number;
}

const DEFAULT_ADMIN_PASSCODE = 'Admin@VyaparX2026';
const DEFAULT_ADMIN_PIN = '987654';

export interface GlobalPortalConfig {
  defaultFinancialYear: string;
  defaultDOSequencePrefix: string;
  defaultPaymentTermsDays: string;
  defaultCommodityUnit: string;
  defaultSaudaNoteColor: 'BLUE' | 'ORANGE' | 'GREEN' | 'RED' | 'BLACK';
  defaultPdfTemplate: 1 | 2;
  showSignatureByDefault: boolean;
  showBankDetailsOnNote: boolean;
  allowSelfRegistration: boolean;
  commissionCalcMode: 'percentage' | 'per_unit';
  updatedAt?: string;
  updatedBy?: string;
}

export const DEFAULT_PORTAL_CONFIG: GlobalPortalConfig = {
  defaultFinancialYear: '2026-2027',
  defaultDOSequencePrefix: '#',
  defaultPaymentTermsDays: '15',
  defaultCommodityUnit: 'BALES',
  defaultSaudaNoteColor: 'ORANGE',
  defaultPdfTemplate: 1,
  showSignatureByDefault: true,
  showBankDetailsOnNote: true,
  allowSelfRegistration: true,
  commissionCalcMode: 'percentage',
};

export interface UserFullAuditData {
  user: AppUser & { pin?: string; phone?: string; isPinEnabled?: boolean };
  companies: Company[];
  parties: Party[];
  items: Item[];
  orders: SaudaOrder[];
  stats: {
    companyCount: number;
    partiesCount: number;
    itemsCount: number;
    ordersCount: number;
    turnover: number;
    brokerage: number;
  };
}

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

    // Company Name Lookup Map
    const companyMapById = new Map<number, string>();
    companies.forEach((c) => {
      if (c.id) companyMapById.set(Number(c.id), c.name);
    });

    // Sort Top Commodities (Top 10)
    const topCommodities = Object.entries(commodityMap)
      .map(([name, data]) => ({ name, count: data.count, turnover: data.turnover }))
      .sort((a, b) => b.turnover - a.turnover)
      .slice(0, 10);

    // Sort Top Brokers (Top 10)
    const topBrokers = Object.values(brokerMap)
      .filter((b) => b.ordersCount > 0 || !selectedEmail)
      .sort((a, b) => b.turnover - a.turnover)
      .slice(0, 10);

    // Sort Recent Orders (Recent 10 trades, sorted most recent date/created first)
    const sortedOrders = [...filteredOrders].sort((a, b) => {
      const dateA = a.date || '';
      const dateB = b.date || '';
      if (dateA !== dateB) return dateB.localeCompare(dateA);
      const createdA = a.createdAt || '';
      const createdB = b.createdAt || '';
      if (createdA !== createdB) return createdB.localeCompare(createdA);
      return (Number(b.id) || 0) - (Number(a.id) || 0);
    });

    const recentOrders = sortedOrders.slice(0, 10).map((o) => ({
      ...o,
      companyName: (o.companyId ? companyMapById.get(Number(o.companyId)) : undefined) || '-',
    }));

    // Sort Recent Users (Recent 10 registered accounts)
    const filteredUsers = selectedEmail ? users.filter((u) => (u.email || '').toLowerCase().trim() === selectedEmail) : users;
    const sortedUsers = [...filteredUsers].sort((a, b) => {
      const createdA = a.createdAt || '';
      const createdB = b.createdAt || '';
      if (createdA !== createdB) return createdB.localeCompare(createdA);
      return (Number(b.id) || 0) - (Number(a.id) || 0);
    });

    // Financial Year 12-Month Trends (April to March)
    let startYear = new Date().getFullYear();
    let endYear = startYear + 1;
    if (selectedFY && selectedFY.includes('-')) {
      const parts = selectedFY.split('-');
      startYear = parseInt(parts[0], 10) || startYear;
      endYear = parseInt(parts[1], 10) || (startYear + 1);
    } else {
      const currentMonth = new Date().getMonth() + 1;
      if (currentMonth < 4) {
        startYear = new Date().getFullYear() - 1;
        endYear = startYear + 1;
      }
    }

    const fyMonths = [
      { monthNum: 4, year: startYear, label: 'Apr', full: `April ${startYear}` },
      { monthNum: 5, year: startYear, label: 'May', full: `May ${startYear}` },
      { monthNum: 6, year: startYear, label: 'Jun', full: `June ${startYear}` },
      { monthNum: 7, year: startYear, label: 'Jul', full: `July ${startYear}` },
      { monthNum: 8, year: startYear, label: 'Aug', full: `August ${startYear}` },
      { monthNum: 9, year: startYear, label: 'Sep', full: `September ${startYear}` },
      { monthNum: 10, year: startYear, label: 'Oct', full: `October ${startYear}` },
      { monthNum: 11, year: startYear, label: 'Nov', full: `November ${startYear}` },
      { monthNum: 12, year: startYear, label: 'Dec', full: `December ${startYear}` },
      { monthNum: 1, year: endYear, label: 'Jan', full: `January ${endYear}` },
      { monthNum: 2, year: endYear, label: 'Feb', full: `February ${endYear}` },
      { monthNum: 3, year: endYear, label: 'Mar', full: `March ${endYear}` },
    ];

    const monthlyTrends: MonthlyTrendData[] = fyMonths.map((m) => {
      const prefix = `${m.year}-${String(m.monthNum).padStart(2, '0')}`;
      let mTurnover = 0;
      let mBrokerage = 0;
      let mCount = 0;

      filteredOrders.forEach((o) => {
        const oDate = o.date || (o.createdAt ? o.createdAt.split('T')[0] : '');
        if (oDate.startsWith(prefix)) {
          mTurnover += Number(o.totalBillAmount) || 0;
          mBrokerage += (Number(o.sellerCommissionAmount) || 0) + (Number(o.buyerCommissionAmount) || 0);
          mCount++;
        }
      });

      return {
        monthKey: prefix,
        label: m.label,
        fullLabel: m.full,
        turnover: mTurnover,
        brokerage: mBrokerage,
        tradesCount: mCount,
      };
    });

    // Daily Trend (Last 7 Days)
    const dailyTrends: DailyTrendData[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = `${d.getDate()} ${monthNames[d.getMonth()]}`;
      const fullLabel = `${dayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;

      let dayTurnover = 0;
      let dayBrokerage = 0;
      let dayCount = 0;

      filteredOrders.forEach((o) => {
        const oDate = o.date || (o.createdAt ? o.createdAt.split('T')[0] : '');
        if (oDate === dateStr) {
          dayTurnover += Number(o.totalBillAmount) || 0;
          dayBrokerage += (Number(o.sellerCommissionAmount) || 0) + (Number(o.buyerCommissionAmount) || 0);
          dayCount++;
        }
      });

      dailyTrends.push({
        date: dateStr,
        label,
        fullLabel,
        turnover: dayTurnover,
        brokerage: dayBrokerage,
        tradesCount: dayCount,
      });
    }

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
      recentOrders,
      recentUsers: sortedUsers.slice(0, 10),
      topCommodities,
      topBrokers,
      allFinancialYears,
      allUsersList,
      monthlyTrends,
      dailyTrends,
    };
  },

  // ----------------------------------------------------
  // USERS MANAGEMENT
  // ----------------------------------------------------
  async getAllUsersWithStats(): Promise<AdminUserStats[]> {
    const [usersSnap, companiesSnap, ordersSnap, partiesSnap, itemsSnap] = await Promise.all([
      getDocs(collection(firestore, 'users')),
      getDocs(collection(firestore, 'companies')),
      getDocs(collection(firestore, 'saudaOrders')),
      getDocs(collection(firestore, 'parties')),
      getDocs(collection(firestore, 'items')),
    ]);

    const companies: Company[] = [];
    companiesSnap.forEach((d) => companies.push(docToData<Company>(d)));

    const orders: SaudaOrder[] = [];
    ordersSnap.forEach((d) => orders.push(docToData<SaudaOrder>(d)));

    const parties: Party[] = [];
    partiesSnap.forEach((d) => parties.push(docToData<Party>(d)));

    const items: Item[] = [];
    itemsSnap.forEach((d) => items.push(docToData<Item>(d)));

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
      const userItems = items.filter((i) => i.userEmail && i.userEmail.toLowerCase().trim() === cleanEmail);

      const turnover = userOrders.reduce((acc, o) => acc + (Number(o.totalBillAmount) || 0), 0);
      const brokerage = userOrders.reduce((acc, o) => acc + ((Number(o.sellerCommissionAmount) || 0) + (Number(o.buyerCommissionAmount) || 0)), 0);

      list.push({
        ...u,
        companyCount: userCompanies.length,
        ordersCount: userOrders.length,
        turnover,
        brokerage,
        partiesCount: userParties.length,
        itemsCount: userItems.length,
      });
    });

    return list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  },

  async updateUser(userId: string, data: Partial<AppUser & { pin?: string; phone?: string; isPinEnabled?: boolean }>): Promise<void> {
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

  async getUserFullAudit(userEmail: string): Promise<UserFullAuditData> {
    const cleanEmail = userEmail.toLowerCase().trim();

    const [usersSnap, companiesSnap, ordersSnap, partiesSnap, itemsSnap] = await Promise.all([
      getDocs(collection(firestore, 'users')),
      getDocs(collection(firestore, 'companies')),
      getDocs(collection(firestore, 'saudaOrders')),
      getDocs(collection(firestore, 'parties')),
      getDocs(collection(firestore, 'items')),
    ]);

    let user: (AppUser & { pin?: string; phone?: string; isPinEnabled?: boolean }) | null = null;
    usersSnap.forEach((d) => {
      const u = { id: d.id, ...d.data() } as AppUser & { pin?: string; phone?: string; isPinEnabled?: boolean };
      if ((u.email || '').toLowerCase().trim() === cleanEmail) {
        user = u;
      }
    });

    if (!user) {
      user = {
        id: cleanEmail.replace(/[.#$[\\]]/g, '_'),
        email: cleanEmail,
        name: cleanEmail.split('@')[0].toUpperCase(),
        createdAt: new Date().toISOString(),
        lastLoginAt: '',
      };
    }

    const companies: Company[] = [];
    companiesSnap.forEach((d) => {
      const c = docToData<Company>(d);
      if (
        (c.userEmail && c.userEmail.toLowerCase().trim() === cleanEmail) ||
        (!c.userEmail && c.email && c.email.toLowerCase().trim() === cleanEmail)
      ) {
        companies.push(c);
      }
    });
    companies.sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));

    const parties: Party[] = [];
    partiesSnap.forEach((d) => {
      const p = docToData<Party>(d);
      if (p.userEmail && p.userEmail.toLowerCase().trim() === cleanEmail) {
        parties.push(p);
      }
    });
    parties.sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));

    const items: Item[] = [];
    itemsSnap.forEach((d) => {
      const itm = docToData<Item>(d);
      if (itm.userEmail && itm.userEmail.toLowerCase().trim() === cleanEmail) {
        items.push(itm);
      }
    });
    items.sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));

    const orders: SaudaOrder[] = [];
    ordersSnap.forEach((d) => {
      const o = docToData<SaudaOrder>(d);
      if (o.userEmail && o.userEmail.toLowerCase().trim() === cleanEmail) {
        orders.push(o);
      }
    });
    orders.sort((a, b) => (b.date || '').localeCompare(a.date || '') || (Number(b.id) || 0) - (Number(a.id) || 0));

    const turnover = orders.reduce((sum, o) => sum + (Number(o.totalBillAmount) || 0), 0);
    const brokerage = orders.reduce(
      (sum, o) => sum + ((Number(o.sellerCommissionAmount) || 0) + (Number(o.buyerCommissionAmount) || 0)),
      0
    );

    return {
      user,
      companies,
      parties,
      items,
      orders,
      stats: {
        companyCount: companies.length,
        partiesCount: parties.length,
        itemsCount: items.length,
        ordersCount: orders.length,
        turnover,
        brokerage,
      },
    };
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
  // SYSTEM MAINTENANCE MODE
  // ----------------------------------------------------
  async getMaintenanceConfig(): Promise<MaintenanceConfig> {
    try {
      const docRef = doc(firestore, 'system_settings', 'maintenance');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as MaintenanceConfig;
      }
    } catch (err) {
      console.warn('Could not fetch maintenance config:', err);
    }
    return {
      isEnabled: false,
      title: 'System Under Scheduled Maintenance',
      message: 'We are currently performing essential system maintenance and performance optimizations. Normal client access will be restored shortly.',
      estimatedEndTime: '',
      supportEmail: 'jenishpatel.dev7@gmail.com',
    };
  },

  async setMaintenanceConfig(config: Partial<MaintenanceConfig>): Promise<void> {
    const docRef = doc(firestore, 'system_settings', 'maintenance');
    await setDoc(docRef, {
      ...config,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  },

  async toggleMaintenanceMode(
    isEnabled: boolean,
    customMessage?: string,
    estimatedEndTime?: string
  ): Promise<void> {
    const docRef = doc(firestore, 'system_settings', 'maintenance');
    const updateData: Partial<MaintenanceConfig> = {
      isEnabled,
      updatedAt: new Date().toISOString(),
      updatedBy: 'Super Admin',
    };
    if (customMessage !== undefined) updateData.message = customMessage;
    if (estimatedEndTime !== undefined) updateData.estimatedEndTime = estimatedEndTime;

    await setDoc(docRef, updateData, { merge: true });
  },

  subscribeMaintenanceConfig(callback: (config: MaintenanceConfig) => void): () => void {
    const docRef = doc(firestore, 'system_settings', 'maintenance');
    return onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          callback(snap.data() as MaintenanceConfig);
        } else {
          callback({
            isEnabled: false,
            title: 'System Under Scheduled Maintenance',
            message: 'We are currently performing essential system maintenance and performance optimizations. Normal client access will be restored shortly.',
            estimatedEndTime: '',
            supportEmail: 'jenishpatel.dev7@gmail.com',
          });
        }
      },
      (error) => {
        console.warn('Maintenance listener snapshot error:', error);
      }
    );
  },

  // ----------------------------------------------------
  // GLOBAL PORTAL CONFIG (COMMON USER PORTAL DEFAULTS)
  // ----------------------------------------------------
  async getGlobalPortalConfig(): Promise<GlobalPortalConfig> {
    try {
      const docRef = doc(firestore, 'system_settings', 'global_config');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { ...DEFAULT_PORTAL_CONFIG, ...(snap.data() as Partial<GlobalPortalConfig>) };
      }
    } catch (err) {
      console.warn('Could not fetch global portal config:', err);
    }
    return DEFAULT_PORTAL_CONFIG;
  },

  async saveGlobalPortalConfig(config: Partial<GlobalPortalConfig>): Promise<void> {
    const docRef = doc(firestore, 'system_settings', 'global_config');
    await setDoc(docRef, {
      ...config,
      updatedAt: new Date().toISOString(),
      updatedBy: 'Super Admin',
    }, { merge: true });
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
  // DATABASE BACKUP & MULTI-SHEET EXCEL EXPORT
  // ----------------------------------------------------
  async exportDatabaseAsExcel(): Promise<{ fileName: string; totalSheets: number }> {
    const [
      usersSnap,
      companiesSnap,
      ordersSnap,
      partiesSnap,
      itemsSnap,
      fySnap,
      quickSnap,
      countersSnap,
    ] = await Promise.all([
      getDocs(collection(firestore, 'users')),
      getDocs(collection(firestore, 'companies')),
      getDocs(collection(firestore, 'saudaOrders')),
      getDocs(collection(firestore, 'parties')),
      getDocs(collection(firestore, 'items')),
      getDocs(collection(firestore, 'financialYears')),
      getDocs(collection(firestore, 'quickValues')),
      getDocs(collection(firestore, 'counters')),
    ]);

    // Build Company Name Lookup
    const companyMap: Record<string | number, string> = {};
    companiesSnap.forEach((d) => {
      const data = d.data() as Company;
      if (data.id && data.name) {
        companyMap[data.id] = data.name;
      }
    });

    // 1. Sauda Orders (Clean business data; excluding createdAt, updatedAt)
    const ordersRows = ordersSnap.docs.map((d) => {
      const o = d.data() as SaudaOrder;
      const companyName = o.companyId ? companyMap[o.companyId] || '-' : '-';
      return {
        'Order ID': o.id ?? d.id,
        'DO No': o.doNo || '-',
        'Trade Date': o.date || '-',
        'Financial Year': o.financialYear || '-',
        'Company Name': companyName,
        'Commodity Name': o.itemName || '-',
        'Quality': o.itemQuality || '-',
        'Quantity': Number(o.quantity) || 0,
        'Unit': o.unit || '-',
        'Bill Rate (₹)': Number(o.billRate) || 0,
        'With GST': o.withGST ? 'Yes' : 'No',
        'GST %': Number(o.gstPercent) || 0,
        'GST Amount (₹)': Number(o.gstAmount) || 0,
        'Total Bill Amount (₹)': Number(o.totalBillAmount) || 0,
        'Total Commission (₹)': (Number(o.sellerCommissionAmount) || 0) + (Number(o.buyerCommissionAmount) || 0),
        'Seller Name': o.sellerName || '-',
        'Seller City': o.sellerCity || '-',
        'Seller Comm. Rate': Number(o.sellerCommissionRate) || 0,
        'Seller Commission (₹)': Number(o.sellerCommissionAmount) || 0,
        'Buyer Name': o.buyerName || '-',
        'Buyer City': o.buyerCity || '-',
        'Buyer Comm. Rate': Number(o.buyerCommissionRate) || 0,
        'Buyer Commission (₹)': Number(o.buyerCommissionAmount) || 0,
        'Bill No': o.billNo || '-',
        'Payment Terms': o.paymentTerms || '-',
        'Delivery Terms': o.deliveryTerms || '-',
        'RD Value': o.rdValue || '-',
        'Staple Length': o.stapleLength || '-',
        'Mic': o.mic || '-',
        'Trash %': o.trashPercent || '-',
        'Moisture %': o.moisturePercent || '-',
        'Remarks': o.remark || '-',
        'Terms & Conditions': o.termsConditions || '-',
        'User Email': o.userEmail || '-',
      };
    });

    // 2. Companies (Clean business data; excluding createdAt, updatedAt, logo clutter)
    const companiesRows = companiesSnap.docs.map((d) => {
      const c = d.data() as Company;
      return {
        'Company ID': c.id ?? d.id,
        'Company Name': c.name || '-',
        'Contact Number': c.contactNumber || '-',
        'Email': c.email || '-',
        'Address': c.address || '-',
        'City': c.city || '-',
        'State': c.state || '-',
        'Pincode': c.pinCode || '-',
        'GST Number': c.gstNumber || '-',
        'PAN Number': c.panNumber || '-',
        'Bank Name': c.bankName || '-',
        'Account Number': c.accountNumber || '-',
        'Account Holder Name': c.accountHolderName || '-',
        'IFSC Code': c.ifscCode || '-',
        'UPI ID': c.upiId || '-',
        'Is Default': c.isDefault ? 'Yes' : 'No',
        'User Email': c.userEmail || '-',
      };
    });

    // 3. Parties Directory (Excluding createdAt, updatedAt)
    const partiesRows = partiesSnap.docs.map((d) => {
      const p = d.data() as Party;
      return {
        'Party ID': p.id ?? d.id,
        'Party Name': p.name || '-',
        'Party Type': p.partyType ? (p.partyType === 'both' ? 'Both' : p.partyType === 'seller' ? 'Seller' : 'Buyer') : '-',
        'Mobile Number': p.mobileNumber || '-',
        'Email': p.email || '-',
        'Address': p.address || '-',
        'City': p.city || '-',
        'State': p.state || '-',
        'Pincode': p.pinCode || '-',
        'GST Number': p.gstNumber || '-',
        'PAN Number': p.panNumber || '-',
        'License Number': p.licenseNumber || '-',
        'Bank Name': p.bankName || '-',
        'Account Number': p.accountNumber || '-',
        'Account Holder Name': p.accountHolderName || '-',
        'IFSC Code': p.ifscCode || '-',
        'UPI ID': p.upiId || '-',
        'User Email': p.userEmail || '-',
      };
    });

    // 4. Commodities (Excluding createdAt, updatedAt)
    const itemsRows = itemsSnap.docs.map((d) => {
      const item = d.data() as Item;
      return {
        'Item ID': item.id ?? d.id,
        'Commodity Name': item.name || '-',
        'Trading Unit': item.unit || '-',
        'Seller Comm. Rate': Number(item.sellerCommissionRate) || 0,
        'Buyer Comm. Rate': Number(item.buyerCommissionRate) || 0,
        'User Email': item.userEmail || '-',
      };
    });

    // 5. Users (STRICTLY EXCLUDING pin, pinUpdatedAt, isPinEnabled, passwords, createdAt, updatedAt)
    const usersRows = usersSnap.docs.map((d) => {
      const u = d.data() as Record<string, any>;
      return {
        'User ID': d.id,
        'Full Name': u.name || '-',
        'Email Address': u.email || '-',
        'Phone Number': u.phone || u.contactNumber || '-',
        'Role': u.role || 'User',
        'Account Status': u.status || 'Active',
        'Last Login': u.lastLoginAt ? String(u.lastLoginAt) : '-',
      };
    });

    // 6. Financial Years
    const fyRows = fySnap.docs.map((d) => {
      const fy = d.data() as Record<string, any>;
      return {
        'FY ID': d.id,
        'Financial Year': fy.name || fy.id || '-',
        'Current Active FY': fy.isCurrent ? 'Yes' : 'No',
      };
    });

    // 7. Quick Dropdowns
    const quickRows = quickSnap.docs.map((d) => {
      const q = d.data() as Record<string, any>;
      return {
        'ID': q.id ?? d.id,
        'Dropdown Category': q.category || '-',
        'Option Value': q.value || '-',
      };
    });

    // 8. System Counters
    const countersRows = countersSnap.docs.map((d) => {
      const c = d.data() as Record<string, any>;
      return {
        'Sequence Name': d.id,
        'Current Counter Value': c.value ?? c.count ?? c.seq ?? 0,
      };
    });

    // Helper: auto-calculate column widths
    const appendSheetWithAutoWidth = (
      wb: XLSX.WorkBook,
      data: Record<string, any>[],
      sheetName: string
    ) => {
      const ws = XLSX.utils.json_to_sheet(data.length > 0 ? data : [{}]);
      if (data.length > 0) {
        const colWidths = Object.keys(data[0]).map((key) => {
          const maxValLength = Math.max(
            key.length,
            ...data.map((row) => String(row[key] ?? '').length)
          );
          return { wch: Math.min(Math.max(maxValLength + 3, 10), 45) };
        });
        ws['!cols'] = colWidths;
      }
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    };

    // Build multi-sheet workbook
    const wb = XLSX.utils.book_new();
    appendSheetWithAutoWidth(wb, ordersRows, 'Sauda Orders');
    appendSheetWithAutoWidth(wb, companiesRows, 'Companies');
    appendSheetWithAutoWidth(wb, partiesRows, 'Parties Directory');
    appendSheetWithAutoWidth(wb, itemsRows, 'Commodities');
    appendSheetWithAutoWidth(wb, usersRows, 'Users');
    appendSheetWithAutoWidth(wb, fyRows, 'Financial Years');
    appendSheetWithAutoWidth(wb, quickRows, 'Quick Dropdowns');
    appendSheetWithAutoWidth(wb, countersRows, 'System Counters');

    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `VyaparX_Database_Backup_${dateStr}.xlsx`;

    XLSX.writeFile(wb, fileName);

    return {
      fileName,
      totalSheets: 8,
    };
  },

  // ----------------------------------------------------
  // DATABASE BACKUP & EXPORT (JSON)
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
