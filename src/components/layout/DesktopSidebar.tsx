import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Package,
  Users,
  ReceiptText,
  Building2,
  User,
  Briefcase,
  PlusCircle,
  FileSpreadsheet,
  BarChart3,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { usePwa } from '../../context/PwaContext';

export const DesktopSidebar: React.FC = () => {
  const { isSidebarCollapsed } = useApp();
  const { palette } = useTheme();
  const { t } = useLanguage();
  const { isInstalled, promptInstall } = usePwa();
  const location = useLocation();

  const mainNav = [
    { to: '/home', label: t('nav.dashboard', 'Dashboard'), icon: Home },
    { to: '/vyapar', label: t('nav.saudaOrders', 'Vyapar Orders'), icon: ReceiptText },
    { to: '/vyapar/create', label: t('nav.createSauda', 'Create Vyapar Order'), icon: PlusCircle },
    { to: '/items', label: t('nav.items', 'Commodity Items'), icon: Package },
    { to: '/parties', label: t('nav.parties', 'Parties (Buyers/Sellers)'), icon: Users },
    { to: '/companies', label: t('nav.companies', 'Companies'), icon: Building2 },
  ];

  const quickLinks = [
    { to: '/vyapar/bills', label: t('nav.bills', 'Vyapar Bills & PDF'), icon: FileSpreadsheet },
    { to: '/profile/reports', label: t('nav.reports', 'Brokerage Reports'), icon: BarChart3 },
    { to: '/profile', label: t('nav.settings', 'Settings & Profile'), icon: User },
  ];

  const isItemActive = (path: string) => {
    if (path === '/home') return location.pathname === '/home';
    if (path === '/vyapar' || path === '/sauda') return location.pathname === '/vyapar' || location.pathname === '/sauda';
    if (path === '/vyapar/create' || path === '/sauda/create') return location.pathname === '/vyapar/create' || location.pathname === '/sauda/create';
    if (path === '/vyapar/bills' || path === '/sauda/bills') return location.pathname === '/vyapar/bills' || location.pathname === '/sauda/bills';
    if (path === '/items') return location.pathname.startsWith('/items');
    if (path === '/parties') return location.pathname.startsWith('/parties');
    if (path === '/companies') return location.pathname.startsWith('/companies');
    if (path === '/profile/reports') return location.pathname === '/profile/reports';
    if (path === '/profile') return location.pathname.startsWith('/profile') && location.pathname !== '/profile/reports';
    return location.pathname === path;
  };

  return (
    <aside
      className={`hidden md:flex flex-col ${
        isSidebarCollapsed ? 'w-[72px]' : 'w-64'
      } bg-[#E8EDF3] dark:bg-[#20242D] border-r border-black/5 dark:border-white/5 h-screen shrink-0 z-30 shadow-neu-raised-sm select-none transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden will-change-[width]`}
    >
      {/* Brand Header - Exactly h-16 to perfectly align horizontally with TopHeader */}
      <NavLink
        to="/home"
        className="h-16 border-b border-black/5 dark:border-white/5 flex items-center shrink-0 px-2.5 bg-[#E8EDF3] dark:bg-[#20242D] overflow-hidden group cursor-pointer relative"
      >
        {/* 1. Collapsed Emblem Logo - Centered when collapsed */}
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 ease-out mx-auto ${
            isSidebarCollapsed
              ? 'opacity-100 scale-100 pointer-events-auto neu-raised-sm bg-[#F0F3F8] dark:bg-[#2B3140] border border-white/80 dark:border-white/10'
              : 'opacity-0 scale-75 -translate-x-6 pointer-events-none absolute left-2.5'
          }`}
          title="VyaparX Commodity ERP"
        >
          <img
            src="/logo.png"
            alt="VyaparX Logo"
            className="w-9 h-9 object-contain drop-shadow-sm transition-transform active:scale-95 group-hover:scale-105"
          />
        </div>

        {/* 2. Expanded Name Logo */}
        <div
          className={`flex items-center w-full h-full py-1.5 pl-1 transition-all duration-300 ease-out overflow-hidden whitespace-nowrap ${
            isSidebarCollapsed
              ? 'opacity-0 -translate-x-8 max-w-0 pointer-events-none'
              : 'opacity-100 translate-x-0 max-w-[215px] pointer-events-auto'
          }`}
        >
          <img
            src="/logo-name.png"
            alt="VyaparX - Business Made Simple"
            className="h-11 sm:h-12 w-auto max-w-[215px] object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-all dark:hidden"
          />
          <img
            src="/logo-name-dark.png"
            alt="VyaparX - Business Made Simple"
            className="h-11 sm:h-12 w-auto max-w-[215px] object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-all hidden dark:block"
          />
        </div>
      </NavLink>

      {/* Main Navigation Links */}
      <div className="flex-1 overflow-y-auto space-y-1.5 scrollbar-thin pt-3.5 px-2.5 pb-2">
        {/* Main Menu Label */}
        <div
          className={`text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-3 transition-all duration-300 ease-out overflow-hidden whitespace-nowrap ${
            isSidebarCollapsed ? 'opacity-0 max-h-0 -translate-x-3 mb-0' : 'opacity-100 max-h-6 translate-x-0 mb-1.5'
          }`}
        >
          {t('nav.mainMenu', 'Main Menu')}
        </div>

        {mainNav.map(item => {
          const Icon = item.icon;
          const active = isItemActive(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={isSidebarCollapsed ? item.label : undefined}
              className={`w-full h-11 flex items-center px-2.5 rounded-2xl transition-all duration-200 active:scale-95 overflow-hidden whitespace-nowrap group ${
                active
                  ? 'bg-[#DEE4ED] dark:bg-[#181C24] text-[#2563EB] dark:text-[#60A5FA] border border-blue-500/25 dark:border-blue-400/25 shadow-neu-inset-sm font-extrabold'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-[#F0F3F8] dark:hover:bg-[#2B3140] hover:text-gray-900 dark:hover:text-white hover:shadow-neu-raised-sm border border-transparent font-semibold'
              }`}
            >
              <div className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-xl transition-all ${
                active 
                  ? 'neu-raised-sm bg-[#F0F3F8] dark:bg-[#262B36] text-[#2563EB] dark:text-[#60A5FA] border border-white/80 dark:border-white/10' 
                  : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white'
              }`}>
                <Icon className="w-4.5 h-4.5 stroke-[2.2]" />
              </div>
              <span
                className={`ml-2.5 text-xs sm:text-[13px] transition-all duration-300 ease-out overflow-hidden whitespace-nowrap truncate ${
                  isSidebarCollapsed
                    ? 'opacity-0 -translate-x-4 max-w-0 pointer-events-none'
                    : 'opacity-100 translate-x-0 max-w-[175px]'
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}

        {/* Section Divider */}
        <div className="my-2 border-t border-black/5 dark:border-white/5 mx-1 transition-all duration-300" />

        {/* Operations & Reports Label */}
        <div
          className={`text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-3 transition-all duration-300 ease-out overflow-hidden whitespace-nowrap ${
            isSidebarCollapsed ? 'opacity-0 max-h-0 -translate-x-3 mb-0' : 'opacity-100 max-h-6 translate-x-0 mb-1.5'
          }`}
        >
          {t('nav.operations', 'Operations & Reports')}
        </div>

        {quickLinks.map(item => {
          const Icon = item.icon;
          const active = isItemActive(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={isSidebarCollapsed ? item.label : undefined}
              className={`w-full h-11 flex items-center px-2.5 rounded-2xl transition-all duration-200 active:scale-95 overflow-hidden whitespace-nowrap group ${
                active
                  ? 'bg-[#DEE4ED] dark:bg-[#181C24] text-[#2563EB] dark:text-[#60A5FA] border border-blue-500/25 dark:border-blue-400/25 shadow-neu-inset-sm font-extrabold'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-[#F0F3F8] dark:hover:bg-[#2B3140] hover:text-gray-900 dark:hover:text-white hover:shadow-neu-raised-sm border border-transparent font-semibold'
              }`}
            >
              <div className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-xl transition-all ${
                active 
                  ? 'neu-raised-sm bg-[#F0F3F8] dark:bg-[#262B36] text-[#2563EB] dark:text-[#60A5FA] border border-white/80 dark:border-white/10' 
                  : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white'
              }`}>
                <Icon className="w-4.5 h-4.5 stroke-[2.2]" />
              </div>
              <span
                className={`ml-2.5 text-xs sm:text-[13px] transition-all duration-300 ease-out overflow-hidden whitespace-nowrap truncate ${
                  isSidebarCollapsed
                    ? 'opacity-0 -translate-x-4 max-w-0 pointer-events-none'
                    : 'opacity-100 translate-x-0 max-w-[175px]'
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>

      {/* Download Web App Button in Sidebar */}
      <div className="px-2.5 pb-2">
        <button
          type="button"
          onClick={promptInstall}
          title={isSidebarCollapsed ? (isInstalled ? t('nav.appInstalled', 'App Installed') : t('nav.downloadApp', 'Download App')) : undefined}
          className="w-full h-11 flex items-center px-2.5 rounded-2xl bg-[#F0F3F8] dark:bg-[#2B3140] border border-white/80 dark:border-white/10 text-[#2563EB] dark:text-[#38BDF8] font-bold transition-all duration-200 shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed cursor-pointer overflow-hidden whitespace-nowrap group"
        >
          <div className="w-8 h-8 shrink-0 flex items-center justify-center rounded-xl transition-transform group-hover:scale-105 text-[#2563EB] dark:text-[#38BDF8]">
            <Download className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span
            className={`ml-2 text-xs transition-all duration-300 ease-out overflow-hidden whitespace-nowrap truncate ${
              isSidebarCollapsed
                ? 'opacity-0 -translate-x-4 max-w-0 pointer-events-none'
                : 'opacity-100 translate-x-0 max-w-[170px]'
            }`}
          >
            {isInstalled ? t('nav.appInstalled', 'App Installed') : t('nav.downloadApp', 'Download App')}
          </span>
        </button>
      </div>

      {/* Footer Info */}
      <div className="h-12 border-t border-black/5 dark:border-white/5 flex items-center px-3 justify-between text-xs text-gray-500 dark:text-gray-400 bg-[#E8EDF3] dark:bg-[#20242D] shrink-0 overflow-hidden whitespace-nowrap select-none">
        <div
          title={isSidebarCollapsed ? 'Security • v1.0' : undefined}
          className="flex items-center font-medium text-gray-500 dark:text-gray-400 overflow-hidden"
        >
          <div className="w-7 h-7 shrink-0 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span
            className={`text-xs font-semibold tracking-wide transition-all duration-300 ease-out overflow-hidden whitespace-nowrap truncate ml-1 text-gray-700 dark:text-gray-300 ${
              isSidebarCollapsed
                ? 'opacity-0 -translate-x-4 max-w-0 pointer-events-none'
                : 'opacity-100 translate-x-0 max-w-[120px]'
            }`}
          >
            {t('nav.security', 'Security')}
          </span>
        </div>
        <span
          className={`font-mono text-[10px] px-2 py-0.5 rounded-md neu-inset-sm bg-black/5 dark:bg-black/20 border border-black/5 dark:border-white/5 text-gray-700 dark:text-gray-300 font-bold shrink-0 transition-all duration-300 ease-out ${
            isSidebarCollapsed ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100 scale-100'
          }`}
        >
          v1.0
        </span>
      </div>
    </aside>
  );
};
