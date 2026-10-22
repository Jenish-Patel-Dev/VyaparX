import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, type AuthUser, type OtpPurpose } from '../services/authService';

interface AuthContextType {
  currentUser: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  pendingEmail: string;
  setPendingEmail: (email: string) => void;
  sendOtp: (email: string, purpose?: OtpPurpose) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<AuthUser>;
  resendOtp: (email: string, purpose?: OtpPurpose) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(authService.getToken());
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [pendingEmail, setPendingEmail] = useState<string>(() => {
    return sessionStorage.getItem('sauda_pending_email') || '';
  });

  const checkSession = useCallback(async () => {
    try {
      const existingToken = authService.getToken();
      if (existingToken) {
        const user = await authService.getCurrentUser();
        if (user) {
          setCurrentUser(user);
          setToken(existingToken);
        } else {
          setCurrentUser(null);
          setToken(null);
        }
      } else {
        setCurrentUser(null);
        setToken(null);
      }
    } catch (err) {
      console.error('Session validation error:', err);
      setCurrentUser(null);
      setToken(null);
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const updatePendingEmail = (email: string) => {
    setPendingEmail(email);
    sessionStorage.setItem('sauda_pending_email', email);
  };

  const sendOtp = async (email: string, purpose: OtpPurpose = 'login'): Promise<void> => {
    await authService.sendOtp(email, purpose);
    updatePendingEmail(email);
  };

  const verifyOtp = async (email: string, otp: string): Promise<AuthUser> => {
    const res = await authService.verifyOtp(email, otp);
    if (!res.user || !res.token) {
      throw new Error('Verification failed. Please try again.');
    }
    setCurrentUser(res.user);
    setToken(res.token);
    sessionStorage.removeItem('sauda_pending_email');
    return res.user;
  };

  const resendOtp = async (email: string, purpose: OtpPurpose = 'login'): Promise<void> => {
    await authService.resendOtp(email, purpose);
  };

  const logout = () => {
    authService.clearToken();
    sessionStorage.removeItem('sauda_pending_email');
    sessionStorage.removeItem('sauda_pin_unlocked');
    setCurrentUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        isAuthenticated: Boolean(currentUser && token),
        isLoadingAuth,
        pendingEmail,
        setPendingEmail: updatePendingEmail,
        sendOtp,
        verifyOtp,
        resendOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
