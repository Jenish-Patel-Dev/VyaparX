import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Users,
  ClipboardList,
  PlusCircle,
  Package,
  Building2,
  Receipt,
  Sparkles,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { saudaService } from '../services/saudaService';
import { ChangeCompanyFYModal } from './profile/ChangeCompanyFYModal';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentCompany, currentFinancialYear } = useApp();
  const { palette } = useTheme();
  const { t } = useLanguage();

  const [stats, setStats] = useState({
    totalOrders: 0,
    totalAmount: 0,
  });
  const [showSwitchModal, setShowSwitchModal] = useState(false);

  const loadStats = async () => {
    try {
      const data = await saudaService.getDashboardStats(
        currentCompany?.id,
        currentFinancialYear
      );
      setStats({
        totalOrders: data.totalOrders,
        totalAmount: data.totalAmount,
      });
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    }
  };

  useEffect(() => {
    loadStats();
  }, [currentCompany?.id, currentFinancialYear]);

  const cardStyle = {
    backgroundColor: palette.primary,
  };

  return (
    <div className="p-4 md:p-6 pb-24 md:pb-8 space-y-3.5 sm:space-y-4 max-w-4xl mx-auto">
      {/* 1. Top Active Company & FY Neumorphic Card */}
      <div
        onClick={() => setShowSwitchModal(true)}
        className="group relative overflow-hidden rounded-3xl p-3.5 sm:p-4 neu-card-interactive neu-raised border border-white/60 dark:border-white/5 flex items-center justify-between gap-3 min-w-0 cursor-pointer"
        title="Tap to switch Company or Financial Year"
      >
        {/* Left: Company Icon + Details */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 neu-inset-sm text-blue-600 dark:text-blue-400 border border-black/[0.04] dark:border-white/5"
          >
            <Building2 className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-blue-600 dark:bg-blue-400" />
              <span>{t('home.activeCompany', 'Active Company')}</span>
            </div>
            <div className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 truncate tracking-tight">
              {currentCompany?.name || 'VyaparX'}
            </div>
          </div>
        </div>

        {/* Right: Financial Year Capsule + Switch Chevron */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full neu-inset-sm border border-white/40 dark:border-white/5 text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-200">
            <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="text-slate-500 dark:text-slate-400 hidden xs:inline">{t('common.financialYear', 'FY')}:</span>
            <strong className="text-slate-900 dark:text-slate-100 font-black">{currentFinancialYear}</strong>
          </div>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full neu-raised-sm border border-white/60 dark:border-white/5 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all">
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* Top Banner: Total Vyapar Orders (Neumorphic Hero Widget) */}
      <div 
        onClick={() => navigate('/vyapar')}
        className="relative overflow-hidden rounded-3xl p-4 sm:p-5 md:p-6 text-white cursor-pointer group shadow-neu-raised hover:shadow-neu-raised-lg active:shadow-neu-pressed transition-all duration-300 border border-blue-400/30 dark:border-blue-500/20 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-600"
      >
        <div className="relative z-10 flex items-center justify-between gap-3 min-w-0">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-300">
              <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-white stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] sm:text-xs md:text-sm font-bold text-white/90 tracking-wide uppercase truncate">
                {t('home.totalOrders', 'Total Vyapar Orders')}
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight drop-shadow-xs truncate">
                {stats.totalOrders}
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 border border-white/30 text-xs font-bold shadow-xs shrink-0">
            <span>{t('common.all', 'All')}</span>
            <span className="text-white/80">&rarr;</span>
          </div>
        </div>
      </div>

      {/* 6 Grid Action Cards (Neumorphic Soft Cards) */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 pt-1">
        {/* 1. Party List */}
        <button
          type="button"
          onClick={() => navigate('/parties')}
          className="relative group overflow-hidden rounded-3xl p-3.5 sm:p-5 neu-card-interactive neu-raised border border-white/60 dark:border-white/5 flex flex-col items-center justify-center text-center gap-2 sm:gap-3 min-h-[115px] sm:min-h-[135px] cursor-pointer"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl neu-inset-sm border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shrink-0">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
          </div>
          <span className="font-black text-[11px] sm:text-xs md:text-sm uppercase tracking-wide text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
            {t('home.partyList', 'PARTY LIST')}
          </span>
        </button>

        {/* 2. Vyapar Order List */}
        <button
          type="button"
          onClick={() => navigate('/vyapar')}
          className="relative group overflow-hidden rounded-3xl p-3.5 sm:p-5 neu-card-interactive neu-raised border border-white/60 dark:border-white/5 flex flex-col items-center justify-center text-center gap-2 sm:gap-3 min-h-[115px] sm:min-h-[135px] cursor-pointer"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl neu-inset-sm border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shrink-0">
            <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
          </div>
          <span className="font-black text-[11px] sm:text-xs md:text-sm uppercase tracking-wide text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
            {t('home.saudaList', 'VYAPAR ORDER LIST')}
          </span>
        </button>

        {/* 3. Create New Vyapar Order (Hero Action) */}
        <button
          type="button"
          onClick={() => navigate('/vyapar/create')}
          className="relative group overflow-hidden rounded-3xl p-3.5 sm:p-5 neu-card-interactive neu-raised border-2 border-blue-500/40 dark:border-blue-500/30 flex flex-col items-center justify-center text-center gap-2 sm:gap-3 min-h-[115px] sm:min-h-[135px] cursor-pointer"
        >
          <div
            className="neu-button-primary w-10 h-10 sm:w-12 sm:h-12 rounded-2xl text-white flex items-center justify-center shadow-md shadow-blue-500/30 group-hover:scale-105 transition-transform duration-300 shrink-0"
          >
            <PlusCircle className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.3]" />
          </div>
          <span
            className="font-black text-[11px] sm:text-xs md:text-sm uppercase tracking-wide leading-snug transition-colors line-clamp-2 text-blue-600 dark:text-blue-400"
          >
            {t('home.createSauda', 'CREATE NEW VYAPAR ORDER')}
          </span>
        </button>

        {/* 4. Item List */}
        <button
          type="button"
          onClick={() => navigate('/items')}
          className="relative group overflow-hidden rounded-3xl p-3.5 sm:p-5 neu-card-interactive neu-raised border border-white/60 dark:border-white/5 flex flex-col items-center justify-center text-center gap-2 sm:gap-3 min-h-[115px] sm:min-h-[135px] cursor-pointer"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl neu-inset-sm border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shrink-0">
            <Package className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
          </div>
          <span className="font-black text-[11px] sm:text-xs md:text-sm uppercase tracking-wide text-slate-800 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2 leading-snug">
            {t('home.itemList', 'ITEM LIST')}
          </span>
        </button>

        {/* 5. Companies */}
        <button
          type="button"
          onClick={() => navigate('/companies')}
          className="relative group overflow-hidden rounded-3xl p-3.5 sm:p-5 neu-card-interactive neu-raised border border-white/60 dark:border-white/5 flex flex-col items-center justify-center text-center gap-2 sm:gap-3 min-h-[115px] sm:min-h-[135px] cursor-pointer"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl neu-inset-sm border border-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shrink-0">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
          </div>
          <span className="font-black text-[11px] sm:text-xs md:text-sm uppercase tracking-wide text-slate-800 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-2 leading-snug">
            {t('home.companies', 'COMPANIES')}
          </span>
        </button>

        {/* 6. Vyapar Bill */}
        <button
          type="button"
          onClick={() => navigate('/vyapar/bills')}
          className="relative group overflow-hidden rounded-3xl p-3.5 sm:p-5 neu-card-interactive neu-raised border border-white/60 dark:border-white/5 flex flex-col items-center justify-center text-center gap-2 sm:gap-3 min-h-[115px] sm:min-h-[135px] cursor-pointer"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl neu-inset-sm border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shrink-0">
            <Receipt className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
          </div>
          <span className="font-black text-[11px] sm:text-xs md:text-sm uppercase tracking-wide text-slate-800 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
            {t('home.saudaBill', 'VYAPAR BILL')}
          </span>
        </button>
      </div>

      {/* Switch Company & Financial Year Modal */}
      <ChangeCompanyFYModal
        isOpen={showSwitchModal}
        onClose={() => setShowSwitchModal(false)}
      />
    </div>
  );
};
