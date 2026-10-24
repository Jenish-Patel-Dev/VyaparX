import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { adminService, type MaintenanceConfig } from '../../services/adminService';
import { MaintenancePage } from './MaintenancePage';

export const MaintenanceGuard: React.FC = () => {
  const [maintenance, setMaintenance] = useState<MaintenanceConfig | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  useEffect(() => {
    // Real-time listener for instant maintenance mode changes across all connected clients
    const unsubscribe = adminService.subscribeMaintenanceConfig((config) => {
      setMaintenance(config);
      setIsInitializing(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleManualCheck = async () => {
    try {
      const latest = await adminService.getMaintenanceConfig();
      setMaintenance(latest);
    } catch (err) {
      console.warn('Failed manual check of maintenance config:', err);
    }
  };

  // While checking initial config, render a smooth minimal loader
  if (isInitializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#E8EDF3] dark:bg-[#1E222B] gap-3">
        <div className="w-10 h-10 border-3 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
          Connecting to VyaparX...
        </span>
      </div>
    );
  }

  // If maintenance is activated by Admin, block user module and show Maintenance screen
  if (maintenance && maintenance.isEnabled) {
    return <MaintenancePage config={maintenance} onRefreshCheck={handleManualCheck} />;
  }

  // Normal operational mode: proceed to requested user routes
  return <Outlet />;
};
