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
      {/* Outer Floating Stadium Pill Container - Subtle Frosted Glass */}
      <div
        className="w-full h-full rounded-full p-1.5 flex items-center justify-between bg-white/80 dark:bg-[#111827]/85 backdrop-blur-2xl border border-[#DCE6F2]/90 dark:border-slate-800 shadow-[0_8px_30px_rgba(37,99,235,0.08),0_2px_8px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all duration-300 relative overflow-hidden"
      >
        {/* Top Rim Specular Glint */}
        <div className="absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent pointer-events-none opacity-80" />
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
                  className="w-full h-full rounded-full flex flex-col items-center justify-center bg-blue-50/95 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/60 shadow-[0_2px_8px_-2px_rgba(37,99,235,0.12)] transition-all duration-300 px-1"
                >
                  <Icon className="w-5 h-5 text-[#2563EB] dark:text-[#38BDF8] stroke-[2.3]" />
                  <span className="text-[10px] sm:text-[11px] font-bold text-[#1E3A8A] dark:text-[#F8FAFC] tracking-tight leading-none mt-0.5 truncate max-w-full">
                    {item.label}
                  </span>
                </div>
              ) : (
                <div className="w-full h-full rounded-full flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors px-1">
                  {item.isCreate ? (
                    <div className="w-6 h-6 rounded-full bg-[#2563EB] text-white flex items-center justify-center shadow-xs">
                      <Icon className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  ) : (
                    <Icon className="w-5 h-5 text-slate-400 dark:text-slate-400 stroke-[2]" />
                  )}
                  <span
                    className={`text-[10px] sm:text-[11px] font-medium tracking-tight leading-none truncate max-w-full ${
                      item.isCreate
                        ? 'text-[#2563EB] dark:text-[#38BDF8] font-bold mt-0.5'
                        : 'text-slate-500 dark:text-slate-400 mt-1'
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
