import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminService } from '../services/adminService';

interface AdminAuthContextType {
  isAdminAuthenticated: boolean;
  isLoading: boolean;
  loginAdmin: (passcode: string) => Promise<{ success: boolean; message?: string }>;
  logoutAdmin: () => void;
  adminUsername: string;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const ADMIN_TOKEN_KEY = 'vyaparx_admin_session_token';
const ADMIN_TIME_KEY = 'vyaparx_admin_session_time';
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [adminUsername, setAdminUsername] = useState<string>('Super Admin');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('vyaparx_admin_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('vyaparx_admin_sidebar_collapsed', String(next));
      } catch (err) {
        console.warn('Could not save admin sidebar state:', err);
      }
      return next;
    });
  };

  useEffect(() => {
    try {
      const token = localStorage.getItem(ADMIN_TOKEN_KEY) || sessionStorage.getItem(ADMIN_TOKEN_KEY);
      const timeStr = localStorage.getItem(ADMIN_TIME_KEY) || sessionStorage.getItem(ADMIN_TIME_KEY);

      if (token && timeStr) {
        const time = Number(timeStr);
        if (Date.now() - time < SESSION_TTL_MS) {
          setIsAdminAuthenticated(true);
        } else {
          // Session expired
          logoutAdmin();
        }
      }
    } catch (e) {
      console.warn('Error reading admin session:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginAdmin = async (passcode: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      const isValid = await adminService.verifyAdminCredentials(passcode);
      if (isValid) {
        const token = 'vx_adm_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
        const nowStr = String(Date.now());

        localStorage.setItem(ADMIN_TOKEN_KEY, token);
        sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
        localStorage.setItem(ADMIN_TIME_KEY, nowStr);
        sessionStorage.setItem(ADMIN_TIME_KEY, nowStr);

        setIsAdminAuthenticated(true);
        setAdminUsername('Super Admin');
        return { success: true };
      } else {
        return { success: false, message: 'Invalid Admin Passcode or Master PIN.' };
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Authentication failed';
      return { success: false, message: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const logoutAdmin = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_TIME_KEY);
    sessionStorage.removeItem(ADMIN_TIME_KEY);
    setIsAdminAuthenticated(false);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAdminAuthenticated,
        isLoading,
        loginAdmin,
        logoutAdmin,
        adminUsername,
        isSidebarCollapsed,
        toggleSidebar,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
