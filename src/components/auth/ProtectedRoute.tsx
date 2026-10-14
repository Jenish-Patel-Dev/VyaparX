import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const { companies, isLoading } = useApp();
  const { palette } = useTheme();
  const location = useLocation();

  if (isLoadingAuth || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E8EDF3] dark:bg-[#20242D] text-gray-900 dark:text-gray-100 transition-colors">
        <div className="neu-raised p-8 rounded-3xl flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin" />
          <span className="text-xs font-bold tracking-wider uppercase text-gray-600 dark:text-gray-400">Loading VyaparX...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user has NO companies, enforce that they stay on the company creation page
  if (companies.length === 0) {
    if (location.pathname !== '/create-first-company') {
      return <Navigate to="/create-first-company" replace />;
    }
  } else {
    // If user already HAS companies and tries to go to /create-first-company, redirect to /home or /splash
    if (location.pathname === '/create-first-company') {
      return <Navigate to="/home" replace />;
    }
  }

  return <Outlet />;
};
