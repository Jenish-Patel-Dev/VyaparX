import Dexie, { type Table } from 'dexie';
import type {
  Company,
  FinancialYear,
  Item,
  Party,
  SaudaOrder,
  QuickValue,
  UserProfile,
} from '../types';

export class SaudaBookDB extends Dexie {
  companies!: Table<Company, number>;
  financialYears!: Table<FinancialYear, string>;
  items!: Table<Item, number>;
  parties!: Table<Party, number>;
  saudaOrders!: Table<SaudaOrder, number>;
  quickValues!: Table<QuickValue, number>;
  userProfile!: Table<UserProfile & { id: number }, number>;

  constructor() {
    super('SaudaBookDatabase');
    this.version(1).stores({
      companies: '++id, name, isDefault, state, city',
      financialYears: 'id, isCurrent',
      items: '++id, name',
      parties: '++id, name, mobileNumber, city, state',
      saudaOrders: '++id, companyId, financialYear, date, itemId, sellerId, buyerId, billNo, dispatchStatus, paymentStatus',
      dispatches: '++id, saudaId, status, dispatchDate',
      payments: '++id, saudaId, partyType, paymentDate',
      quickValues: '++id, category, value',
      userProfile: 'id',
    });

    this.version(2).stores({
      companies: '++id, name, isDefault, state, city, userEmail, username',
    }).upgrade(tx => {
      return tx.table('companies').toCollection().modify((comp: any) => {
        if (!comp.userEmail) {
          comp.userEmail = comp.email || 'krishnafibers@gmail.com';
        }
        if (!comp.username) {
          comp.username = 'JENISH';
        }
      });
    });

    this.version(3).stores({
      dispatches: null,
      payments: null,
      saudaOrders: '++id, companyId, financialYear, date, itemId, sellerId, buyerId, billNo',
    });
  }
}

export const db = new SaudaBookDB();
