import { db } from './database';

export async function seedInitialData(): Promise<void> {
  const companyCount = await db.companies.count();
  if (companyCount > 0) {
    // Database already initialized
    return;
  }

  // 1. Seed Financial Years
  await db.financialYears.bulkAdd([
    { id: '2026-2027', name: '2026-2027', isCurrent: true },
    { id: '2025-2026', name: '2025-2026', isCurrent: false },
    { id: '2024-2025', name: '2024-2025', isCurrent: false },
  ]);

  // 2. Seed Default Company (Krishna Fibers)
  const companyId = await db.companies.add({
    name: 'KRISHNA FIBERS',
    contactNumber: '9574823170',
    email: 'krishnafibers@gmail.com',
    address: 'PALIYAD ROAD BOTAD',
    city: 'BOTAD',
    state: 'GUJARAT',
    pinCode: '364710',
    gstNumber: '24AAECK9823P1Z3',
    panNumber: 'AAECK9823P',
    bankName: 'STATE BANK OF INDIA',
    accountNumber: '382948291039',
    accountHolderName: 'SHARMA MAHESH',
    ifscCode: 'SBIN0001234',
    upiId: 'krishnafibers@sbi',
    saudaNoteColor: 'RED',
    pdfTemplate: 1,
    showSignature: true,
    isDefault: true,
    userEmail: 'krishnafibers@gmail.com',
    username: 'JENISH',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // 3. Seed Items
  const itemId = await db.items.add({
    name: 'KAPAS',
    sellerCommissionRate: 2.8,
    buyerCommissionRate: 2.6,
    unit: '100',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  await db.items.bulkAdd([
    {
      name: 'COTTON BALES',
      sellerCommissionRate: 3.0,
      buyerCommissionRate: 2.5,
      unit: '100',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      name: 'KHOL',
      sellerCommissionRate: 2.5,
      buyerCommissionRate: 2.5,
      unit: '100',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  // 4. Seed Parties
  const party1Id = await db.parties.add({
    name: 'SKY',
    mobileNumber: '5484618494',
    email: 'test.07.email.07@gmail.com',
    address: 'BOTAD',
    city: 'BOTAD',
    state: 'GUJARAT',
    pinCode: '364710',
    gstNumber: '24AABCS1429B1Z1',
    panNumber: 'AABCS1429B',
    bankName: 'STATE BANK OF INDIA',
    accountNumber: '32948291039',
    accountHolderName: 'SKY TRADERS',
    ifscCode: 'SBIN0001234',
    upiId: 'sky@upi',
    partyType: 'both',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const party2Id = await db.parties.add({
    name: 'RAM',
    mobileNumber: '9879879877',
    email: 'ramtrading@gmail.com',
    address: 'BOTAD',
    city: 'BOTAD',
    state: 'GUJARAT',
    pinCode: '364710',
    gstNumber: '24ABCDE1234F1Z5',
    panNumber: 'ABCDE1234F',
    bankName: 'HDFC BANK',
    accountNumber: '50100234567890',
    accountHolderName: 'RAM ENTERPRISE',
    ifscCode: 'HDFC0000123',
    upiId: 'ram@hdfc',
    partyType: 'both',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // 5. Seed Initial Sauda Order (Matches Screenshot 23)
  await db.saudaOrders.add({
    companyId: Number(companyId),
    financialYear: '2026-2027',
    date: '2026-09-08',
    itemId: Number(itemId),
    itemName: 'KAPAS',
    itemQuality: '1 GADI',
    quantity: 200,
    unit: '100',
    billRate: 5353,
    withGST: false,
    gstPercent: 5,
    gstAmount: 0,
    totalBillAmount: 1070600,
    billNo: '0123',
    paymentTerms: 'VAR TO VAR',
    deliveryTerms: 'NEXT DAY',
    remark: '10% moisture',
    termsConditions: 'Our responsibility and duty are restricted to communication and coordination only.',
    sellerId: Number(party1Id),
    sellerName: 'SKY',
    sellerCommissionRate: 2.8,
    sellerCommissionAmount: 560,
    sellerContactPerson: 'Sharma',
    buyerId: Number(party2Id),
    buyerName: 'RAM',
    buyerCommissionRate: 2.6,
    buyerCommissionAmount: 520,
    buyerContactPerson: 'Mahesh',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // 6. Seed Quick Values
  await db.quickValues.bulkAdd([
    { category: 'paymentTerms', value: '15' },
    { category: 'paymentTerms', value: '7' },
    { category: 'paymentTerms', value: '30' },
    { category: 'paymentTerms', value: 'NEXT DAY' },
    { category: 'paymentTerms', value: 'ADVANCE' },
    { category: 'quality', value: 'A-1' },
    { category: 'quality', value: '1 GADI' },
    { category: 'quality', value: '50 BORI 40 Kg' },
    { category: 'quality', value: '30-40 M.TON' },
    { category: 'rdValue', value: 'A-1' },
    { category: 'rdValue', value: '75' },
    { category: 'rdValue', value: '76' },
    { category: 'rdValue', value: '78' },
  ]);

  // 7. Seed User Profile
  await db.userProfile.add({
    id: 1,
    name: 'JENISH',
    phone: '9574823170',
    plan: 'FREE',
    expiryDate: '2026-10-08',
    referralCode: 'LHPXC3',
    isPinEnabled: false,
  });
}

export async function resetDatabaseToDemo(): Promise<void> {
  await db.delete();
  await db.open();
  await seedInitialData();
}
