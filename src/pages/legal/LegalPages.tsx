import React from 'react';
import { useLocation } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import {
  Shield,
  FileCheck,
  HelpCircle,
  Scale,
  Building2,
  Truck,
  FileText,
  AlertCircle,
  Lock,
  Database,
  Coins,
} from 'lucide-react';

export const LegalPages: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  let title = 'Terms & Conditions';
  let Icon = FileCheck;

  if (path.includes('privacy')) {
    title = 'Privacy Policy';
    Icon = Shield;
  } else if (path.includes('how-to-use')) {
    title = 'How to Use VyaparX';
    Icon = HelpCircle;
  }

  return (
    <div className="min-h-screen pb-24 md:pb-12 transition-colors">
      <PageHeader title={title} />

      <div className="p-4 md:p-6 max-w-3xl mx-auto">
        <div className="neu-raised rounded-3xl p-6 md:p-8 space-y-6 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {/* Header Tile */}
          <div className="flex items-center gap-3.5 pb-4 border-b border-black/5 dark:border-white/5">
            <div className="w-12 h-12 rounded-2xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#262B36] text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Effective as of October 2026 • VyaparX ERP
              </p>
            </div>
          </div>

          {path.includes('how-to-use') ? (
            <div className="space-y-4">
              <div className="neu-inset-sm p-4 rounded-2xl space-y-1">
                <h3 className="font-bold text-gray-900 dark:text-white">1. Setup Business & Commodity Items</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Start by configuring your business/firm in the <strong>Comp.</strong> tab and adding commodity items (e.g., Kapas, Cotton Bales, Khol, Grains) with standard packing, units, and default brokerage rates in the <strong>Items</strong> tab.
                </p>
              </div>

              <div className="neu-inset-sm p-4 rounded-2xl space-y-1">
                <h3 className="font-bold text-gray-900 dark:text-white">2. Register Parties (Sellers & Buyers)</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Add parties in the <strong>Parties</strong> tab to manage trade counter-parties with their address, contact numbers, Mandi licenses, and GSTINs.
                </p>
              </div>

              <div className="neu-inset-sm p-4 rounded-2xl space-y-1">
                <h3 className="font-bold text-gray-900 dark:text-white">3. Creating a Vyapar Order (Sauda)</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Navigate to <strong>Create Vyapar Order</strong>. Follow the 3-step wizard (Commodity & Quantity ➔ Seller Details ➔ Buyer Details). Net amount, tax estimations, and party brokerage will be calculated automatically.
                </p>
              </div>

              <div className="neu-inset-sm p-4 rounded-2xl space-y-1">
                <h3 className="font-bold text-gray-900 dark:text-white">4. Share, Download & Print Trade Slips</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  From the <strong>Vyapar</strong> list, tap <em>Share</em> or <em>Print</em> to generate clean digital Sauda slips for instant sharing via WhatsApp or download official brokerage bills.
                </p>
              </div>

              <div className="neu-inset-sm p-4 rounded-2xl space-y-1">
                <h3 className="font-bold text-gray-900 dark:text-white">5. Multi-Company & Financial Year Switching</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Switch seamlessly between multiple brokerage firms and financial years (e.g., 2025-2026, 2026-2027) directly from the top navigation bar.
                </p>
              </div>
            </div>
          ) : path.includes('privacy') ? (
            <div className="space-y-4">
              <div className="neu-inset-sm p-4 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                  <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Secure Cloud Data Management</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  VyaparX utilizes high-availability Google Cloud Firestore storage. All your firm profiles, party registers, item master lists, and sauda ledgers are tied securely to your verified user account.
                </p>
              </div>

              <div className="neu-inset-sm p-4 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                  <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Account Isolation & Session Protection</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Your transactions are strictly isolated. No other user can view or query your brokerage contracts. The platform maintains a 30-day session token secured by your private 6-digit Passcode PIN.
                </p>
              </div>

              <div className="neu-inset-sm p-4 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                  <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Confidentiality of Commercial Pricing</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  We treat trade pricing, buyer/seller contacts, commissions, and order volumes with the highest standard of commercial confidentiality. Data is never sold, shared with competitors, or used for automated algorithmic trading.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="neu-inset-sm p-4 rounded-2xl border-l-4 border-blue-600 space-y-1">
                <h3 className="font-bold text-gray-900 dark:text-white">Preamble & Acceptance</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  By accessing or using VyaparX (both via web browser or installed standalone application), you agree to be bound by the following trade terms, conditions, and disclaimers governing agricultural and commodity brokerage transactions.
                </p>
              </div>

              {/* Term 1 */}
              <div className="neu-inset-sm p-4 rounded-2xl space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                  <Scale className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>1. Intermediary / Broker Capacity & Limit of Liability</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  The broker and this application function purely as an intermediary facilitating communication, price negotiations, and trade documentation between the registered Seller and Buyer. The broker is not a buyer, seller, financier, or guarantor of the physical goods. All trades recorded represent independent bilateral agreements between the counterparties.
                </p>
              </div>

              {/* Term 2 */}
              <div className="neu-inset-sm p-4 rounded-2xl space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>2. Commodity Quality, Moisture, Lab Testing & Sampling</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Commodity attributes (such as moisture level, trash percentage, oil content, staple length, Micronaire, RD/plus, seeds cut, or grade specifications) are mutually agreed between the Buyer and Seller on sample basis or recognized laboratory test report. The broker bears no liability for variations, quality rejection, or factory lab results at the destination mill.
                </p>
              </div>

              {/* Term 3 */}
              <div className="neu-inset-sm p-4 rounded-2xl space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                  <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>3. Weighbridge Discrepancies, Shortage & Transit Risk</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Goods are dispatched at the buyer's/seller's risk according to trade terms (e.g., Ex-Gin, Ex-Factory, FOR, or Mill Delivery). Weight slip differences between loading weighbridge and unloading weighbridge, in-transit moisture loss, theft, damage, or driver demurrage must be settled directly between buyer and seller as per regional mandi trade practice.
                </p>
              </div>

              {/* Term 4 */}
              <div className="neu-inset-sm p-4 rounded-2xl space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                  <Coins className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>4. Payments, Default Risk & Brokerage Commission</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Buyer is obligated to remit timely payment to Seller as agreed (spot, advance, or against lorry receipt). Default, non-payment, insolvency, or delay is strictly the counterparty's risk. Brokerage commission is deemed fully earned upon trade confirmation (Sauda generation) and is payable to the broker regardless of any post-trade disputes or delivery default between parties.
                </p>
              </div>

              {/* Term 5 */}
              <div className="neu-inset-sm p-4 rounded-2xl space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                  <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>5. APMC Mandi Tax, Cess & GST Compliance</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Compliance with Agricultural Produce Market Committee (APMC) mandi cess, market development cess, GST e-invoices, and E-way bill generation is the sole responsibility of the dispatching seller and receiving buyer under applicable state and central legislation.
                </p>
              </div>

              {/* Term 6 */}
              <div className="neu-inset-sm p-4 rounded-2xl space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                  <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>6. Force Majeure & Mandi Customary Arbitration</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Neither the broker nor the platform is responsible for failure or delays resulting from acts of God, extreme weather, strikes, road blockages, APMC strikes, or government export/import bans. In the event of any commercial disagreement, disputes shall be resolved through customary trade association or regional Mandi arbitration.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
