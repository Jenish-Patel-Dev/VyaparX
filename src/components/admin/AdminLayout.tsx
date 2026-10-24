import React, { useRef, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { adminService } from '../../services/adminService';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const mainRef = useRef<HTMLElement | null>(null);
  const [isMaintenanceActive, setIsMaintenanceActive] = useState<boolean>(false);

  // Subscribe to real-time maintenance mode status
  useEffect(() => {
    const unsub = adminService.subscribeMaintenanceConfig((cfg) => {
      setIsMaintenanceActive(cfg.isEnabled);
    });
    return () => unsub();
  }, []);

  const handleTurnOffMaintenance = async () => {
    try {
      await adminService.toggleMaintenanceMode(false);
    } catch (err) {
      console.error('Failed to turn off maintenance mode:', err);
      alert('Could not turn off maintenance mode.');
    }
  };

  // Reset scroll of the active viewport whenever admin navigates to any new page
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
      mainRef.current.scrollLeft = 0;
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname]);

  const getPageTitle = (path: string) => {
    if (path.includes('/admin/users')) return 'Users & Accounts';
    if (path.includes('/admin/companies')) return 'Companies';
    if (path.includes('/admin/sauda')) return 'All Sauda Trades Ledger';
    if (path.includes('/admin/parties')) return 'Parties Directory';
    if (path.includes('/admin/items')) return 'Commodities Master';
    if (path.includes('/admin/analytics')) return 'Turnover & Analytics';
    if (path.includes('/admin/settings')) return 'Settings & Security';
    return 'Executive Overview';
  };

  return (
    <div className="relative flex h-screen max-h-screen overflow-hidden bg-[#E8EDF3] dark:bg-[#20242D] text-[#263244] dark:text-[#F0F3F8] transition-colors duration-200 font-sans">
      {/* Neumorphic Ambient Lighting Canvas (Consistent Soft Light Source from Top-Left matching AppShell) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none" aria-hidden="true">
        {/* Soft Top-Left Directional Specular Illumination */}
        <div className="absolute -top-40 -left-40 w-[45rem] h-[45rem] rounded-full bg-white/40 dark:bg-slate-700/10 blur-3xl pointer-events-none" />

        {/* Soft Bottom-Right Ambient Ground Shadow */}
        <div className="absolute -bottom-40 -right-40 w-[45rem] h-[45rem] rounded-full bg-slate-400/15 dark:bg-black/35 blur-3xl pointer-events-none" />
      </div>

      {/* Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen max-h-screen min-w-0 overflow-hidden relative z-10">
        <AdminHeader pageTitle={getPageTitle(location.pathname)} />

        {/* Top Warning Banner if Maintenance Mode is Active */}
        {isMaintenanceActive && (
          <div className="bg-amber-500 text-white px-4 py-2.5 text-xs font-bold flex flex-wrap items-center justify-between gap-3 shadow-md shrink-0 animate-fade-in z-20">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 animate-bounce shrink-0" />
              <span>
                <strong>MAINTENANCE MODE IS ACTIVE:</strong> The client application is currently locked for regular users.
              </span>
            </div>
            <button
              type="button"
              onClick={handleTurnOffMaintenance}
              className="px-3.5 py-1 bg-white text-amber-900 rounded-xl font-extrabold hover:bg-amber-100 transition-all text-xs cursor-pointer shadow-xs shrink-0"
            >
              Turn OFF (Restore Users)
            </button>
          </div>
        )}

        {/* Scrollable Viewport */}
        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 p-4 sm:p-6 lg:p-8 bg-[#E8EDF3] dark:bg-[#20242D] focus:outline-none focus:ring-0 select-text"
          tabIndex={-1}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};
