import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, LogOut, Building2, Calendar, ChevronDown, Check, User, Download, Sun, Moon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';
import { useTheme } from '../context/ThemeContext';
import { usePwa } from '../context/PwaContext';
import { useLanguage } from '../context/LanguageContext';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export const SplashPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { palette, isDarkMode, setDarkMode } = useTheme();
  const { currentUser, logout } = useAuth();
  const { promptInstall, isInstalled } = usePwa();
  const { t } = useLanguage();
  const {
    companies,
    currentCompany,
    setCurrentCompany,
    financialYears,
    currentFinancialYear,
    setCurrentFinancialYear,
    isLoading,
  } = useApp();

  const [selectedCompanyId, setSelectedCompanyId] = useState<number | string>('');
  const [selectedFY, setSelectedFY] = useState<string>('2026-2027');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCompanyOpen, setIsCompanyOpen] = useState<boolean>(false);
  const [isFYOpen, setIsFYOpen] = useState<boolean>(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);

  const companyDropdownRef = useRef<HTMLDivElement>(null);
  const fyDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(event.target as Node)) {
        setIsCompanyOpen(false);
      }
      if (fyDropdownRef.current && !fyDropdownRef.current.contains(event.target as Node)) {
        setIsFYOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // If no companies found after loading, automatically redirect to create company (CASE 2)
  useEffect(() => {
    if (!isLoading) {
      if (companies.length === 0) {
        toast.info("Please create your first company to continue.");
        navigate('/create-first-company', { replace: true });
      } else {
        if (!selectedCompanyId) {
          const initialId = currentCompany?.id || companies[0]?.id || '';
          setSelectedCompanyId(initialId);
        }
      }
    }
  }, [isLoading, companies, currentCompany, navigate, selectedCompanyId, toast]);

  useEffect(() => {
    if (currentFinancialYear) {
      setSelectedFY(currentFinancialYear);
    } else if (financialYears.length > 0) {
      const defaultFY = financialYears.find(f => f.isCurrent)?.id || financialYears[0]?.id || '2026-2027';
      setSelectedFY(defaultFY);
    }
  }, [currentFinancialYear, financialYears]);

  const selectedCompany = companies.find(c => String(c.id) === String(selectedCompanyId)) || companies[0];

  const handleContinue = async () => {
    if (!selectedCompanyId) {
      toast.error('Please select a company to continue.');
      return;
    }

    const compId = Number(selectedCompanyId);
    const comp = companies.find(c => c.id === compId);

    if (!comp) {
      toast.error("You don't have access to this company.");
      return;
    }

    try {
      setIsSubmitting(true);
      // Backend validation of company ownership/access
      const isAuthorized = await authService.validateCompanyAccess(compId);
      if (!isAuthorized) {
        toast.error("You don't have access to this company.");
        return;
      }

      setCurrentCompany(comp);

      if (selectedFY) {
        setCurrentFinancialYear(selectedFY);
      }

      navigate('/home');
    } catch {
      toast.error('Failed to select company. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.info('Logged out successfully');
  };

  return (
    <div 
      className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-between p-3 sm:p-4 md:p-6 text-gray-900 dark:text-gray-100 transition-colors relative overflow-hidden select-none bg-[#E8EDF3] dark:bg-[#20242D]"
    >
      {/* Ambient background lighting */}
      <div className="absolute -top-28 -left-28 w-80 h-80 rounded-full bg-blue-500/5 dark:bg-blue-400/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-28 w-96 h-96 rounded-full bg-indigo-500/5 dark:bg-indigo-400/5 blur-3xl pointer-events-none" />

      {/* Top Bar with Logged In User, Download App and Logout */}
      <div className="w-full flex justify-between items-center text-xs font-semibold relative z-10 shrink-0 gap-2">
        <div className="inline-flex items-center gap-1.5 neu-raised-sm bg-[#E8EDF3] dark:bg-[#262B36] px-3 py-1 rounded-full text-xs font-bold text-gray-700 dark:text-gray-200 border border-white/60 dark:border-white/5 max-w-[160px] sm:max-w-[240px]">
          <User className="w-3 h-3 shrink-0 text-gray-500 dark:text-gray-400" />
          <span className="truncate" title={currentUser?.email || ''}>{currentUser?.email || ''}</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Dark / Light Mode Toggle */}
          <button
            type="button"
            onClick={() => setDarkMode(!isDarkMode)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full neu-raised-sm bg-[#E8EDF3] dark:bg-[#262B36] border border-white/60 dark:border-white/5 text-gray-700 dark:text-gray-200 text-xs font-bold transition-all active:scale-95 cursor-pointer"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {isDarkMode ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500 stroke-[2.5]" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-700 stroke-[2.5]" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={promptInstall}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full neu-raised-sm bg-[#E8EDF3] dark:bg-[#262B36] border border-white/60 dark:border-white/5 text-gray-700 dark:text-gray-200 text-xs font-bold transition-all active:scale-95 cursor-pointer"
            title={isInstalled ? t('nav.appInstalled', 'App Installed') : t('nav.downloadApp', 'Download App')}
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">{isInstalled ? t('nav.appInstalled', 'App Installed') : t('nav.downloadApp', 'Download App')}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full neu-raised-sm bg-[#E8EDF3] dark:bg-[#262B36] hover:text-rose-600 active:scale-95 border border-white/60 dark:border-white/5 text-gray-700 dark:text-gray-200 text-xs font-bold transition-all cursor-pointer"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Card with Neumorphic LOVs */}
      <div className="w-full max-w-sm flex flex-col items-center text-center p-6 sm:p-8 rounded-3xl neu-raised bg-[#E8EDF3] dark:bg-[#262B36] border border-white/60 dark:border-white/5 space-y-4 relative z-20 my-auto shrink-0">
        {/* App Logo Emblem */}
        <div className="w-20 h-20 rounded-2xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#262B36] flex items-center justify-center p-3 shrink-0 border border-white/60 dark:border-white/5">
          <img
            src="/logo.png"
            alt="VyaparX Logo"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Subtitle */}
        <div className="space-y-0.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Select Company & Financial Year
          </p>
        </div>

        <div className="w-full space-y-3 pt-1">
          {/* Custom Neumorphic Company LOV Dropdown */}
          <div className="relative w-full text-left" ref={companyDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsCompanyOpen(prev => !prev);
                setIsFYOpen(false);
              }}
              className={`w-full py-3 px-4 neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/5 ${
                isCompanyOpen ? 'ring-2 ring-blue-500/40' : ''
              } rounded-2xl text-gray-800 dark:text-gray-100 font-bold text-xs sm:text-sm flex items-center justify-between transition-all cursor-pointer`}
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <Building2 className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
                <span className="truncate">{selectedCompany?.name || 'Select Company'}</span>
                {selectedCompany?.isDefault && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md neu-inset-sm bg-blue-500/10 text-blue-700 dark:text-blue-300 shrink-0 font-extrabold border border-blue-500/20">
                    Default
                  </span>
                )}
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 shrink-0 transition-transform duration-200 ${isCompanyOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu Popup */}
            {isCompanyOpen && (
              <div 
                className="absolute left-0 right-0 mt-2 neu-raised-lg bg-[#E8EDF3] dark:bg-[#262B36] border border-white/60 dark:border-white/5 rounded-2xl p-2 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150 max-h-56 overflow-y-auto"
              >
                <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2.5 py-1 flex items-center justify-between border-b border-black/5 dark:border-white/5 mb-1">
                  <span>Available Companies</span>
                  <span className="text-[9px] font-semibold text-gray-400">({companies.length})</span>
                </div>
                {companies.map(c => {
                  const isSelected = String(selectedCompanyId) === String(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        if (c.id !== undefined) {
                          setSelectedCompanyId(c.id);
                        }
                        setIsCompanyOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                        isSelected
                          ? 'neu-inset-sm bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          : 'hover:bg-black/5 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Building2 className="w-3.5 h-3.5 shrink-0 text-blue-500/80" />
                        <div className="flex flex-col min-w-0">
                          <div className="truncate flex items-center gap-1.5">
                            <span>{c.name}</span>
                            {c.username && <span className="text-gray-400 text-[10px] font-normal">({c.username})</span>}
                          </div>
                          {c.city && <span className="text-[10px] text-gray-400 font-normal">{c.city} • {c.state}</span>}
                        </div>
                      </div>
                      {c.isDefault && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-md neu-inset-sm bg-amber-500/10 text-amber-700 dark:text-amber-300 font-extrabold border border-amber-500/20 mr-1 shrink-0">
                          Default
                        </span>
                      )}
                      {isSelected && <Check className="w-4 h-4 text-emerald-500 stroke-[3] shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Custom Neumorphic Financial Year LOV Dropdown */}
          <div className="relative w-full text-left" ref={fyDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsFYOpen(prev => !prev);
                setIsCompanyOpen(false);
              }}
              className={`w-full py-3 px-4 neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/5 ${
                isFYOpen ? 'ring-2 ring-blue-500/40' : ''
              } rounded-2xl text-gray-800 dark:text-gray-100 font-bold text-xs sm:text-sm flex items-center justify-between transition-all cursor-pointer`}
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <Calendar className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
                <span className="truncate">{selectedFY || 'Select Financial Year'}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 shrink-0 transition-transform duration-200 ${isFYOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu Popup */}
            {isFYOpen && (
              <div 
                className="absolute left-0 right-0 mt-2 neu-raised-lg bg-[#E8EDF3] dark:bg-[#262B36] border border-white/60 dark:border-white/5 rounded-2xl p-2 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150 max-h-56 overflow-y-auto"
              >
                <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2.5 py-1 flex items-center justify-between border-b border-black/5 dark:border-white/5 mb-1">
                  <span>Financial Year</span>
                  <span className="text-[9px] font-semibold text-gray-400">({financialYears.length})</span>
                </div>
                {financialYears.map(fy => {
                  const isSelected = selectedFY === fy.id;
                  return (
                    <button
                      key={fy.id}
                      type="button"
                      onClick={() => {
                        setSelectedFY(fy.id);
                        setIsFYOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                        isSelected
                          ? 'neu-inset-sm bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          : 'hover:bg-black/5 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 shrink-0 text-blue-500/80" />
                        <span>{fy.name}</span>
                        {fy.isCurrent && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md neu-inset-sm bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-extrabold border border-emerald-500/20">
                            Current
                          </span>
                        )}
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-emerald-500 stroke-[3] shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Continue Button */}
          <button
            type="button"
            disabled={!selectedCompanyId || isSubmitting}
            onClick={handleContinue}
            className="neu-button-primary w-full py-3.5 px-6 font-bold text-xs sm:text-sm rounded-xl sm:rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Opening Application...</span>
              </div>
            ) : (
              <>
                <ArrowRight className="w-4 h-4" />
                <span>Continue</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-[10px] sm:text-[11px] text-gray-400 dark:text-gray-500 font-bold tracking-wider uppercase relative z-10 shrink-0 py-1">
        Commodity Brokerage Management System
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title={t('profile.logoutConfirmTitle', 'Confirm Logout')}
        message={t('profile.logoutConfirmMsg', 'Are you sure you want to log out of your account?')}
        confirmText={t('profile.logout', 'Logout')}
        cancelText={t('common.cancel', 'Cancel')}
        isDestructive={true}
        onConfirm={() => {
          setShowLogoutConfirm(false);
          handleLogout();
        }}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
};
