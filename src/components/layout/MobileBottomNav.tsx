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
      {/* Outer Floating Stadium Pill Container - Pure Refractive Liquid Glass */}
      <div
        className="w-full h-full rounded-full p-1.5 flex items-center justify-between backdrop-blur-3xl transition-all duration-300 relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, rgba(255, 255, 255, 0.55) 0%, rgba(220, 238, 255, 0.30) 100%)',
          backdropFilter: 'blur(30px) saturate(210%)',
          WebkitBackdropFilter: 'blur(30px) saturate(210%)',
          border: '1px solid rgba(255, 255, 255, 0.90)',
          boxShadow:
            'inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.98), inset 0 -1px 1.5px 0 rgba(191, 219, 254, 0.45), 0 14px 36px -4px rgba(37, 99, 235, 0.18), 0 4px 14px -2px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Top Rim Specular Glint */}
        <div className="absolute inset-x-6 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none opacity-95" />
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
                  className="w-full h-full rounded-full flex flex-col items-center justify-center transition-all duration-300 px-1"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(239, 246, 255, 0.98) 0%, rgba(219, 234, 254, 0.85) 100%)',
                    border: '1px solid rgba(191, 219, 254, 0.95)',
                    boxShadow:
                      'inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.98), 0 3px 10px rgba(37, 99, 235, 0.14)',
                  }}
                >
                  <Icon className="w-5 h-5 text-blue-600 stroke-[2.3]" />
                  <span className="text-[10px] sm:text-[11px] font-bold text-blue-950 tracking-tight leading-none mt-0.5 truncate max-w-full">
                    {item.label}
                  </span>
                </div>
              ) : (
                <div className="w-full h-full rounded-full flex flex-col items-center justify-center text-gray-500 hover:text-gray-900 transition-colors px-1">
                  {item.isCreate ? (
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                      <Icon className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  ) : (
                    <Icon className="w-5 h-5 text-gray-500 stroke-[2]" />
                  )}
                  <span
                    className={`text-[10px] sm:text-[11px] font-medium tracking-tight leading-none truncate max-w-full ${
                      item.isCreate
                        ? 'text-blue-700 font-bold mt-0.5'
                        : 'text-gray-600 mt-1'
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
