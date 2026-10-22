import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { Company, FinancialYear, UserProfile } from '../types';
import { companyService } from '../services/companyService';
import { profileService } from '../services/profileService';
import { seedInitialData } from '../db/seedData';

import { authService } from '../services/authService';
import { userService } from '../services/userService';

interface AppContextType {
  currentCompany: Company | null;
  setCurrentCompany: (company: Company) => void;
  companies: Company[];
  currentFinancialYear: string;
  setCurrentFinancialYear: (fy: string) => void;
  financialYears: FinancialYear[];
  userProfile: UserProfile | null;
  refreshAppContext: () => Promise<void>;
  isLoading: boolean;
  isPinLocked: boolean;
  unlockWithPin: (pin: string) => boolean;
  lockApp: () => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentCompany, setCurrentCompanyState] = useState<Company | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [currentFinancialYear, setCurrentFinancialYearState] = useState<string>('2026-2027');
  const [financialYears, setFinancialYears] = useState<FinancialYear[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPinLocked, setIsPinLocked] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('vyapar_sidebar_collapsed') === 'true';
  });

  const currentCompanyRef = useRef<Company | null>(null);
  currentCompanyRef.current = currentCompany;

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('vyapar_sidebar_collapsed', String(next));
      return next;
    });
  };

  const refreshAppContext = useCallback(async () => {
    try {
      await seedInitialData();

      const user = await authService.getCurrentUser();
      const userEmail = (user?.email || authService.getUserEmail()).toLowerCase().trim();

      if (userEmail) {
        await userService.getOrCreateUser(userEmail);
      }

      const [comps, fYears, prof] = await Promise.all([
        companyService.getAll(userEmail),
        profileService.getFinancialYears(),
        profileService.getProfile(userEmail),
      ]);

      setCompanies(comps);
      setFinancialYears(fYears);

      // Set default company without creating state identity churn
      const defaultComp = comps.find(c => c.isDefault) || comps[0] || null;
      setCurrentCompanyState(prev => {
        if (!prev) return defaultComp;
        const matching = comps.find(c => c.id === prev.id);
        if (!matching) return defaultComp;
        if (JSON.stringify(prev) === JSON.stringify(matching)) {
          return prev;
        }
        return matching;
      });

      // Synchronize active username with active company
      const currentRefId = currentCompanyRef.current?.id;
      const activeComp = (currentRefId && comps.find(c => c.id === currentRefId))
        ? comps.find(c => c.id === currentRefId)!
        : defaultComp;

      if (activeComp?.username) {
        prof.name = activeComp.username;
      }
      setUserProfile(prof);

      // Set financial year
      const defaultFY = fYears.find(f => f.isCurrent)?.id || '2026-2027';
      setCurrentFinancialYearState(prev => prev || defaultFY);

      // Check PIN lock
      if (prof.isPinEnabled && prof.pin && prof.pin.length === 6) {
        const sessionUnlocked = sessionStorage.getItem('sauda_pin_unlocked');
        if (!sessionUnlocked) {
          setIsPinLocked(true);
        }
      }
    } catch (err) {
      console.error('Failed to load application context:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAppContext();
  }, [refreshAppContext]);

  const setCurrentCompany = (comp: Company) => {
    setCurrentCompanyState(comp);
    if (comp.username) {
      setUserProfile(prev => prev ? { ...prev, name: comp.username! } : null);
      const userEmail = authService.getUserEmail();
      profileService.updateProfile({ name: comp.username }, userEmail);
    }
  };

  const setCurrentFinancialYear = (fy: string) => {
    setCurrentFinancialYearState(fy);
  };

  const unlockWithPin = (pin: string): boolean => {
    if (userProfile && userProfile.pin === pin) {
      setIsPinLocked(false);
      sessionStorage.setItem('sauda_pin_unlocked', 'true');
      const userEmail = (userProfile.email || authService.getUserEmail()).toLowerCase().trim();
      if (userEmail) {
        userService.updateLastLogin(userEmail);
      }
      return true;
    }
    return false;
  };

  const lockApp = () => {
    sessionStorage.removeItem('sauda_pin_unlocked');
    setIsPinLocked(true);
  };

  return (
    <AppContext.Provider
      value={{
        currentCompany,
        setCurrentCompany,
        companies,
        currentFinancialYear,
        setCurrentFinancialYear,
        financialYears,
        userProfile,
        refreshAppContext,
        isLoading,
        isPinLocked,
        unlockWithPin,
        lockApp,
        isSidebarCollapsed,
        toggleSidebar,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
