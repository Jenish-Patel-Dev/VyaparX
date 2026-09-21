export interface Company {
  id?: number;
  name: string;
  contactNumber: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  gstNumber?: string;
  panNumber?: string;
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  ifscCode?: string;
  upiId?: string;
  logo?: string;
  saudaNoteColor: 'RED' | 'ORANGE' | 'BLUE' | 'GREEN' | 'BLACK';
  pdfTemplate: 1 | 2;
  showSignature: boolean;
  isDefault: boolean;
  userEmail?: string;
  username?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialYear {
  id: string;
  name: string;
  isCurrent: boolean;
}

export interface Item {
  id?: number;
  name: string;
  sellerCommissionRate: number;
  buyerCommissionRate: number;
  unit: string;
  createdAt: string;
  updatedAt: string;
}

export interface Party {
  id?: number;
  name: string;
  mobileNumber: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pinCode?: string;
  licenseNumber?: string;
  gstNumber?: string;
  panNumber?: string;
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  ifscCode?: string;
  upiId?: string;
  partyType?: 'both' | 'seller' | 'buyer';
  createdAt: string;
  updatedAt: string;
}

export interface SaudaOrder {
  id?: number;
  doNo?: string;
  companyId: number;
  financialYear: string;
  date: string;
  itemId: number;
  itemName: string;
  itemQuality: string;
  quantity: number;
  unit: string;
  billRate: number;
  withGST?: boolean;
  gstPercent?: number;
  gstAmount?: number;
  totalBillAmount: number;
  billNo?: string;
  paymentTerms?: string;
  deliveryTerms?: string;
  remark?: string;
  termsConditions?: string;

  // Technical parameters
  rdValue?: string;
  stapleLength?: string;
  mic?: string;
  trashPercent?: string;
  moisturePercent?: string;

  // Seller details
  sellerId: number;
  sellerName: string;
  sellerLocation?: string;
  sellerCity?: string;
  sellerCommissionRate: number;
  sellerCommissionAmount: number;
  sellerContactPerson?: string;

  // Buyer details
  buyerId: number;
  buyerName: string;
  buyerLocation?: string;
  buyerCity?: string;
  buyerCommissionRate: number;
  buyerCommissionAmount: number;
  buyerContactPerson?: string;

  createdAt: string;
  updatedAt: string;
}

export interface QuickValue {
  id?: number;
  category: 'paymentTerms' | 'quality' | 'rdValue' | 'deliveryTerms' | 'remark' | 'unit';
  value: string;
}

export interface UserProfile {
  name: string;
  phone: string;
  plan: string;
  expiryDate: string;
  referralCode: string;
  pin?: string;
  isPinEnabled: boolean;
}
