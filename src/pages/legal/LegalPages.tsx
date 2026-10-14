import React from 'react';
import { useLocation } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Shield, FileCheck, HelpCircle } from 'lucide-react';

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

      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        <div className="neu-raised rounded-3xl p-6 md:p-8 space-y-5 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          <div className="flex items-center gap-3.5 pb-4 border-b border-black/5 dark:border-white/5">
            <div className="w-12 h-12 rounded-2xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#262B36] text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500">Effective as of September 2026</p>
            </div>
          </div>

          {path.includes('how-to-use') ? (
            <div className="space-y-4">
              <div className="neu-inset-sm p-4 rounded-2xl space-y-1">
                <h3 className="font-bold text-gray-900 dark:text-white">1. Setup Business & Commodity Items</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Start by setting your default company profile in the <strong>Comp.</strong> tab and adding commodity items like Kapas, Cotton Bales, or Khol in the <strong>Items</strong> tab.
                </p>
              </div>

              <div className="neu-inset-sm p-4 rounded-2xl space-y-1">
                <h3 className="font-bold text-gray-900 dark:text-white">2. Register Parties (Sellers & Buyers)</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Add parties in the <strong>Parties</strong> tab to manage trade buyers and sellers.
                </p>
              </div>

              <div className="neu-inset-sm p-4 rounded-2xl space-y-1">
                <h3 className="font-bold text-gray-900 dark:text-white">3. Creating a Vyapar Order</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Navigate to <strong>Create Vyapar Order</strong>. Complete the 3-step wizard (Item ➔ Seller ➔ Buyer). Amounts and brokerage commissions will be calculated automatically.
                </p>
              </div>

              <div className="neu-inset-sm p-4 rounded-2xl space-y-1">
                <h3 className="font-bold text-gray-900 dark:text-white">4. Share and Print Notes</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  From the <strong>Vyapar</strong> list, tap <em>Share</em> to preview, print or download trade confirmation notes.
                </p>
              </div>
            </div>
          ) : path.includes('privacy') ? (
            <div className="space-y-4">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                VyaparX is committed to safeguarding your trade data. In this offline-first version, all trade, company, party, and order details are stored locally inside your browser's secure IndexedDB storage.
              </p>
              <div className="neu-inset-sm p-4 rounded-2xl space-y-1">
                <h3 className="font-bold text-gray-900 dark:text-white">Local Data Sovereignty</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  No sensitive commodity pricing, brokerage rates, or customer data is transmitted to third parties without your explicit authorization.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                By using VyaparX, you agree that this platform facilitates documentation and trade calculation for brokerage services.
              </p>
              <div className="neu-inset-sm p-4 rounded-2xl space-y-1">
                <h3 className="font-bold text-gray-900 dark:text-white">Broker Duty & Responsibility</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Our responsibility and duty are restricted to communication and coordination between the Seller and Buyer. Commodity delivery, quality inspection, and actual settlement remain between the counter-parties.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
