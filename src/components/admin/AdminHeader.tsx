import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  ExternalLink,
  LogOut,
  Sun,
  Moon,
  ShieldCheck,
  RefreshCw,
  PanelLeftClose,
  PanelLeftOpen,
  Wrench,
  AlertTriangle,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AdminMaintenanceModal } from './AdminMaintenanceModal';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useTheme } from '../../context/ThemeContext';

interface AdminHeaderProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
  pageTitle?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onRefresh,
  isRefreshing = false,
  pageTitle,
}) => {
  const { logoutAdmin, adminUsername, isSidebarCollapsed, toggleSidebar } = useAdminAuth();
  const { isDarkMode, setDarkMode } = useTheme();
  const [isMaintenanceActive, setIsMaintenanceActive] = useState<boolean>(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const unsub = adminService.subscribeMaintenanceConfig((cfg) => {
      setIsMaintenanceActive(cfg.isEnabled);
    });
    return () => unsub();
  }, []);


  return (
    <header className="h-16 px-4 lg:px-6 bg-[#E8EDF3] dark:bg-[#20242D] border-b border-black/5 dark:border-white/5 flex items-center justify-between shrink-0 sticky top-0 z-40 transition-colors shadow-neu-raised-sm">
      {/* Left: Sidebar Toggle Button + Breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Sidebar Toggle Button (Collapse / Expand Left Navigation) */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="w-10 h-10 rounded-2xl border border-white/80 dark:border-white/10 bg-[#F0F3F8] dark:bg-[#2B3140] text-gray-700 dark:text-gray-200 hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-all shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed shrink-0 flex items-center justify-center cursor-pointer"
          title={isSidebarCollapsed ? 'Expand Sidebar Menu' : 'Collapse Sidebar Menu'}
          aria-label="Toggle Sidebar Menu"
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 stroke-[2.2]" />
          ) : (
            <PanelLeftClose className="w-4 h-4 stroke-[2.2]" />
          )}
        </button>

        {/* Breadcrumb Pill */}
        <div className="flex items-center gap-2 bg-[#F0F3F8] dark:bg-[#2B3140] border border-white/80 dark:border-white/10 rounded-full px-3.5 py-1.5 shadow-neu-raised-sm text-gray-800 dark:text-gray-100 font-bold text-xs min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-gray-500 dark:text-gray-400 font-semibold uppercase text-[10px] tracking-wider hidden xs:inline shrink-0">
            Control Center
          </span>
          {pageTitle && (
            <>
              <span className="text-gray-300 dark:text-gray-600 hidden xs:inline">/</span>
              <span className="text-gray-900 dark:text-white font-extrabold truncate">
                {pageTitle}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right: Refresh, Client App link, Theme Toggle, Admin User & Logout */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Refresh Button */}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh Data"
            className="w-10 h-10 rounded-2xl border border-white/80 dark:border-white/10 bg-[#F0F3F8] dark:bg-[#2B3140] text-gray-700 dark:text-gray-200 hover:text-[#2563EB] dark:hover:text-[#60A5FA] shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed flex items-center justify-center transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-500' : ''}`} />
          </button>
        )}

        {/* Global Maintenance Mode Button */}
        <button
          type="button"
          onClick={() => setIsMaintenanceModalOpen(true)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            isMaintenanceActive
              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-neu-raised-sm animate-pulse'
              : 'border border-white/80 dark:border-white/10 bg-[#F0F3F8] dark:bg-[#2B3140] text-gray-700 dark:text-gray-200 hover:text-amber-600 dark:hover:text-amber-400 shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed'
          }`}
          title={isMaintenanceActive ? 'Maintenance Mode is ACTIVE for users! Click to manage' : 'System Maintenance Mode (Lock/Unlock users)'}
        >
          {isMaintenanceActive ? (
            <>
              <AlertTriangle className="w-3.5 h-3.5 animate-bounce shrink-0" />
              <span>Maintenance Active</span>
            </>
          ) : (
            <>
              <Wrench className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="hidden sm:inline">Maintenance</span>
            </>
          )}
        </button>

        {/* Return to Client App Link */}
        <NavLink
          to="/home"
          target="_blank"
          rel="noopener noreferrer"
          title="Open regular client application in new tab"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/80 dark:border-white/10 bg-[#F0F3F8] dark:bg-[#2B3140] text-gray-700 dark:text-gray-200 hover:text-[#2563EB] dark:hover:text-[#60A5FA] shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed text-xs font-bold transition-all cursor-pointer"
        >
          <span>Client App</span>
          <ExternalLink className="w-3.5 h-3.5 stroke-[2.2]" />
        </NavLink>

        {/* Theme Toggle (Dark & Light Mode) */}
        <button
          type="button"
          onClick={() => setDarkMode(!isDarkMode)}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="w-10 h-10 rounded-2xl border border-white/80 dark:border-white/10 bg-[#F0F3F8] dark:bg-[#2B3140] text-gray-700 dark:text-gray-200 hover:text-[#2563EB] dark:hover:text-[#60A5FA] shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed flex items-center justify-center transition-all cursor-pointer"
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 text-amber-400 stroke-[2.3]" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600 stroke-[2.3]" />
          )}
        </button>

        {/* Admin User Badge & Logout */}
        <div className="flex items-center gap-1.5 sm:gap-2 pl-1 sm:pl-2 border-l border-black/5 dark:border-white/5">
          <div className="w-8 h-8 rounded-xl neu-raised-sm bg-[#F0F3F8] dark:bg-[#2B3140] border border-white/80 dark:border-white/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
            <ShieldCheck className="w-4 h-4 stroke-[2.4]" />
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight">
              {adminUsername}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              Administrator
            </span>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={logoutAdmin}
            title="Logout Admin Session"
            className="w-9 h-9 rounded-xl border border-white/80 dark:border-white/10 bg-[#F0F3F8] dark:bg-[#2B3140] text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed flex items-center justify-center transition-all cursor-pointer ml-0.5"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Global Maintenance Modal */}
      <AdminMaintenanceModal
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
        onStatusChange={setIsMaintenanceActive}
      />
    </header>
  );
};
