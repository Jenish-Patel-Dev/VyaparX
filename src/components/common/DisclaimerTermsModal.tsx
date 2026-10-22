import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  FileText,
  CheckCircle2,
  Scale,
  Building2,
  Truck,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import {
  isStandaloneApp,
  APP_PWA_ACCEPTED_KEY,
  APP_WEB_SESSION_ACCEPTED_KEY,
} from '../../utils/platform';

export const DisclaimerTermsModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hasAgreedCheck, setHasAgreedCheck] = useState<boolean>(true);
  const [isAppMode, setIsAppMode] = useState<boolean>(false);

  useEffect(() => {
    // 1. Determine platform mode
    const isApp = isStandaloneApp();
    setIsAppMode(isApp);

    // 2. Strict Environment-Isolated Status Check:
    // Web Mode: checks ONLY sessionStorage (must prompt every session)
    // App Mode: checks ONLY localStorage (persists across app closes)
    try {
      if (isApp) {
        const accepted = localStorage.getItem(APP_PWA_ACCEPTED_KEY);
        setIsOpen(accepted !== 'true');
      } else {
        const accepted = sessionStorage.getItem(APP_WEB_SESSION_ACCEPTED_KEY);
        setIsOpen(accepted !== 'true');
      }
    } catch {
      setIsOpen(true);
    }

    // 3. Re-install Detection: Clear PWA key upon fresh installation event
    const handleAppInstalled = () => {
      try {
        localStorage.removeItem(APP_PWA_ACCEPTED_KEY);
      } catch (e) {
        console.error('Failed to clear PWA key on appinstalled:', e);
      }
    };

    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleAccept = () => {
    const isApp = isStandaloneApp();
    try {
      if (isApp) {
        // App mode: Save strictly into localStorage
        localStorage.setItem(APP_PWA_ACCEPTED_KEY, 'true');
      } else {
        // Web mode: Save strictly into sessionStorage (never leaks to localStorage)
        sessionStorage.setItem(APP_WEB_SESSION_ACCEPTED_KEY, 'true');
      }
    } catch (e) {
      console.error('Failed to persist disclaimer acceptance:', e);
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-xl animate-in fade-in duration-200"
      style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
    >
      <div
        className="bg-[#E8EDF3] dark:bg-[#262B36] border border-white/60 dark:border-white/10 rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-neu-raised-lg animate-in zoom-in-95 duration-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="disclaimer-title"
      >
        {/* Header */}
        <div className="p-5 pb-4 border-b border-black/[0.06] dark:border-white/10 flex items-center gap-3.5 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-neu-raised-sm shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                {isAppMode ? 'App Legal Notice' : 'Session Disclaimer'}
              </span>
            </div>
            <h2
              id="disclaimer-title"
              className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate"
            >
              Trade Terms & Disclaimer
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              VyaparX Commodity Brokerage Platform
            </p>
          </div>
        </div>

        {/* Scrollable Terms Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed custom-scrollbar">
          {/* Important Notice Banner */}
          <div className="neu-inset-sm p-3.5 rounded-2xl border-l-4 border-amber-500 bg-amber-500/5 flex gap-3 items-start">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900 dark:text-amber-200 font-medium">
              Please review these trade conditions before proceeding. VyaparX provides calculation, documentation, and ledger tracking tools for commodity & agro brokerage trades.
            </p>
          </div>

          {/* Section 1: Intermediary & Brokerage Role */}
          <div className="neu-inset-sm p-4 rounded-2xl space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white text-xs sm:text-sm">
              <Scale className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>1. Broker Role & Independent Counterparties</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              The broker and this platform act solely as an intermediary to facilitate communication and record trade confirmations between independent registered Buyers and Sellers. Neither the broker nor the platform is a principal party to the transaction.
            </p>
          </div>

          {/* Section 2: Quality, Moisture & Lab Testing */}
          <div className="neu-inset-sm p-4 rounded-2xl space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white text-xs sm:text-sm">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>2. Quality, Moisture & Weight Verification</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              All commodity specifications (including grade, moisture percentage, ginning cut, staple, Micronaire, trash content, and weighbridge slips) are subject to direct bilateral verification or approved laboratory test results between Buyer and Seller.
            </p>
          </div>

          {/* Section 3: Delivery, Transit & Settlements */}
          <div className="neu-inset-sm p-4 rounded-2xl space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white text-xs sm:text-sm">
              <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>3. Delivery, Transit Risk & Payments</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Delivery schedules, vehicle demurrage, transit risk, payment timelines, and interest on delayed settlement remain direct bilateral responsibilities between the contracting parties. Brokerage charges are earned upon trade confirmation.
            </p>
          </div>

          {/* Section 4: APMC & Statutory Taxes */}
          <div className="neu-inset-sm p-4 rounded-2xl space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white text-xs sm:text-sm">
              <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>4. Mandi (APMC) & GST Compliance</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              All market committee cess, Mandi fees, E-way bill generation, and GST invoicing compliance must be fulfilled strictly by the respective counter-parties in accordance with applicable state and central laws.
            </p>
          </div>

          {/* More details link */}
          <div className="text-center pt-1">
            <a
              href="/legal/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              <span>View Complete Terms & Conditions Policy</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 pt-3 border-t border-black/[0.06] dark:border-white/10 space-y-3.5 shrink-0 bg-black/[0.02] dark:bg-white/[0.02]">
          {/* Agreement Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hasAgreedCheck}
              onChange={(e) => setHasAgreedCheck(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-blue-600 border-gray-300 dark:border-gray-600 focus:ring-blue-500 shrink-0 cursor-pointer"
            />
            <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
              I have read, understood, and accept the trade disclaimer, broker terms, and platform usage policies.
            </span>
          </label>

          {/* Accept Button */}
          <button
            type="button"
            onClick={handleAccept}
            disabled={!hasAgreedCheck}
            className="w-full neu-raised-button py-3 px-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-neu-raised-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Accept & Continue to VyaparX</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
