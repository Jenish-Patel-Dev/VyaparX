import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { DesktopSidebar } from './DesktopSidebar';
import { TopHeader } from './TopHeader';
import { MobileBottomNav } from './MobileBottomNav';
import { PinLockModal } from '../common/PinLockModal';
import { useTheme } from '../../context/ThemeContext';

export const AppShell: React.FC = () => {
  const location = useLocation();
  const { palette } = useTheme();
  const isSplash =
    location.pathname === '/' ||
    location.pathname === '/splash' ||
    location.pathname === '/login' ||
    location.pathname === '/verify-otp';

  if (isSplash) {
    return (
      <main className="min-h-screen bg-[#1E40AF] dark:bg-[#0B1220] transition-colors duration-200">
        <PinLockModal />
        <Outlet />
      </main>
    );
  }

  // Standalone Company Setup Screen for New Users (No sidebar, top header, or bottom nav)
  if (location.pathname === '/create-first-company') {
    return (
      <main className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] text-[#0F172A] dark:text-[#F8FAFC]">
        <Outlet />
      </main>
    );
  }

  return (
    <div className="relative flex h-screen max-h-screen overflow-hidden bg-[#F8FAFC] dark:bg-[#0B1220] text-[#0F172A] dark:text-[#F8FAFC] transition-colors duration-200">
      {/* Dynamic Animated Main App Background (Clean White + Subtle Blue Ambient Depth) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none" aria-hidden="true">
        {/* Base Wallpaper Layer */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700 opacity-20 dark:opacity-10"
          style={{
            backgroundImage: "url('/main-bg.png')",
          }}
        />

        {/* Soft Blue & White Depth Veil */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 via-white/60 to-sky-50/40 dark:from-[#0B1220]/90 dark:via-[#0B1220]/80 dark:to-[#111827]/90 pointer-events-none" />

        {/* Dynamic Subtle Theme Tint Wash */}
        <div
          className="absolute inset-0 transition-colors duration-700 pointer-events-none mix-blend-color opacity-5 dark:opacity-10"
          style={{ backgroundColor: palette.primary }}
        />

        {/* Subtle Ambient Sky & Blue Depth Spheres */}
        <div
          className="absolute -top-32 -left-32 w-[32rem] h-[32rem] rounded-full bg-blue-200/35 dark:bg-blue-600/10 blur-3xl pointer-events-none"
        />
        <div
          className="absolute top-1/2 -right-32 w-[28rem] h-[28rem] rounded-full bg-sky-200/25 dark:bg-sky-600/10 blur-3xl pointer-events-none"
        />
        <div
          className="absolute -bottom-32 left-1/3 w-[30rem] h-[30rem] rounded-full bg-blue-100/30 dark:bg-blue-800/10 blur-3xl pointer-events-none"
        />
      </div>

      <PinLockModal />
      
      {/* Desktop Sidebar (Fixed Left Column) */}
      <DesktopSidebar />

      {/* Main Right Column (Fixed Header + Scrollable Middle Viewport) */}
      <div className="relative flex-1 flex flex-col h-screen max-h-screen min-w-0 overflow-hidden">
        <TopHeader />
        
        {/* Isolated Scrollable Viewport - Only this container scrolls */}
        <main className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden min-w-0 w-full scroll-smooth pb-24 md:pb-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Dock */}
      <MobileBottomNav />
    </div>
  );
};
