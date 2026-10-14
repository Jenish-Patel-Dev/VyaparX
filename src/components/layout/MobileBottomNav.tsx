import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Package, Plus, Users, User } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const MobileBottomNav: React.FC = () => {
  const { t } = useLanguage();
  const location = useLocation();

  const isTabActive = (path: string) => {
    if (path === '/home') return location.pathname === '/home';
    if (path === '/vyapar') {
      return (
        (location.pathname === '/vyapar' || location.pathname === '/sauda') &&
        !location.pathname.includes('/create')
      );
    }
    if (path === '/vyapar/create') {
      return (
        location.pathname === '/vyapar/create' ||
        location.pathname === '/sauda/create'
      );
    }
    if (path === '/parties') return location.pathname.startsWith('/parties');
    if (path === '/profile') return location.pathname.startsWith('/profile');
    return location.pathname === path;
  };

  const navItems = [
    {
      to: '/home',
      label: t('nav.home', 'Home'),
      icon: Home,
      isActive: isTabActive('/home'),
    },
    {
      to: '/vyapar',
      label: t('nav.saudaShort', 'Vyapar'),
      icon: Package,
      isActive: isTabActive('/vyapar'),
    },
    {
      to: '/vyapar/create',
      label: t('nav.create', 'Create'),
      icon: Plus,
      isActive: isTabActive('/vyapar/create'),
      isCreate: true,
    },
    {
      to: '/parties',
      label: t('nav.partiesShort', 'Parties'),
      icon: Users,
      isActive: isTabActive('/parties'),
    },
    {
      to: '/profile',
      label: t('nav.profile', 'Profile'),
      icon: User,
      isActive: isTabActive('/profile'),
    },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-3 left-3 right-3 max-w-md mx-auto z-40 h-[64px] select-none"
      aria-label="Mobile Navigation Dock"
    >
      {/* Outer Floating Stadium Pill Container - Neumorphic Raised Dock */}
      <div
        className="w-full h-full rounded-full p-1.5 flex items-center justify-between bg-[#E8EDF3] dark:bg-[#262B36] border border-[#D5DDE7] dark:border-[#303746] shadow-neu-raised-lg transition-all duration-300 relative overflow-hidden"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex-1 h-full flex flex-col items-center justify-center relative cursor-pointer active:scale-95 transition-transform duration-150"
            >
              {active ? (
                <div
                  className="w-full h-full rounded-full flex flex-col items-center justify-center bg-[#DEE4ED] dark:bg-[#1B1F27] border border-blue-200/50 dark:border-blue-900/40 shadow-neu-inset-sm transition-all duration-300 px-1"
                >
                  <Icon className="w-5 h-5 text-[#2563EB] dark:text-[#38BDF8] stroke-[2.3]" />
                  <span className="text-[10px] sm:text-[11px] font-black text-[#1E3A8A] dark:text-[#F0F3F8] tracking-tight leading-none mt-0.5 truncate max-w-full">
                    {item.label}
                  </span>
                </div>
              ) : (
                <div className="w-full h-full rounded-full flex flex-col items-center justify-center text-[#68758A] dark:text-[#B3BDCD] hover:text-[#263244] dark:hover:text-[#F0F3F8] transition-colors px-1">
                  {item.isCreate ? (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] text-white flex items-center justify-center shadow-neu-raised-sm">
                      <Icon className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  ) : (
                    <Icon className="w-5 h-5 text-[#8994A5] dark:text-[#8994A7] stroke-[2]" />
                  )}
                  <span
                    className={`text-[10px] sm:text-[11px] font-semibold tracking-tight leading-none truncate max-w-full ${
                      item.isCreate
                        ? 'text-[#2563EB] dark:text-[#38BDF8] font-bold mt-0.5'
                        : 'text-[#68758A] dark:text-[#B3BDCD] mt-1'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
