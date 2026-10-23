import React, { useRef, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { DesktopSidebar } from './DesktopSidebar';
import { TopHeader } from './TopHeader';
import { MobileBottomNav } from './MobileBottomNav';
import { PinLockModal } from '../common/PinLockModal';
import { SystemNoticeBanner } from '../common/SystemNoticeBanner';
import { useTheme } from '../../context/ThemeContext';

export const AppShell: React.FC = () => {
  const location = useLocation();
  const { palette } = useTheme();
  const mainRef = useRef<HTMLElement | null>(null);

  // Reset scroll of the active viewport whenever user navigates to any new page
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
      mainRef.current.scrollLeft = 0;
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname]);
  const isSplash =
    location.pathname === '/' ||
    location.pathname === '/splash' ||
    location.pathname === '/login' ||
    location.pathname === '/verify-otp';

  if (isSplash) {
    return (
      <main className="min-h-screen bg-[#E8EDF3] dark:bg-[#20242D] text-[#263244] dark:text-[#F0F3F8] transition-colors duration-200">
        <PinLockModal />
        <Outlet />
      </main>
    );
  }

  // Standalone Company & PIN Setup Screens (No sidebar, top header, or bottom nav)
  if (location.pathname === '/create-first-company' || location.pathname === '/setup-pin') {
    return (
      <main className="min-h-screen bg-[#E8EDF3] dark:bg-[#20242D] text-[#263244] dark:text-[#F0F3F8]">
        <Outlet />
      </main>
    );
  }

  return (
    <div className="relative flex h-screen max-h-screen overflow-hidden bg-[#E8EDF3] dark:bg-[#20242D] text-[#263244] dark:text-[#F0F3F8] transition-colors duration-200">
      {/* Neumorphic Ambient Lighting Canvas (Consistent Soft Light Source from Top-Left) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none" aria-hidden="true">
        {/* Soft Top-Left Directional Specular Illumination */}
        <div className="absolute -top-40 -left-40 w-[45rem] h-[45rem] rounded-full bg-white/40 dark:bg-slate-700/10 blur-3xl pointer-events-none" />

        {/* Soft Bottom-Right Ambient Ground Shadow */}
        <div className="absolute -bottom-40 -right-40 w-[45rem] h-[45rem] rounded-full bg-slate-400/15 dark:bg-black/35 blur-3xl pointer-events-none" />
      </div>

      <PinLockModal />
      
      {/* Desktop Sidebar (Fixed Left Column) */}
      <DesktopSidebar />

      {/* Main Right Column (Fixed Header + Scrollable Middle Viewport) */}
      <div className="relative flex-1 flex flex-col h-screen max-h-screen min-w-0 overflow-hidden">
        <SystemNoticeBanner />
        <TopHeader />
        
        {/* Isolated Scrollable Viewport - Only this container scrolls */}
        <main ref={mainRef} className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden min-w-0 w-full pb-24 md:pb-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Dock */}
      <MobileBottomNav />
    </div>
  );
};
