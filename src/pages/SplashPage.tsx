import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, LogOut, Building2, Calendar, ChevronDown, Check, User, Download } from 'lucide-react';
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
  const { palette } = useTheme();
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
      className="h-screen h-[100dvh] max-h-screen flex flex-col items-center justify-between p-3 sm:p-4 md:p-6 text-white transition-colors relative overflow-hidden select-none"
      style={{ backgroundColor: palette.primary }}
    >
      {/* Ambient background refraction blobs */}
      <div className="absolute -top-28 -left-28 w-80 h-80 rounded-full bg-[#00ADEF]/25 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-32 -right-28 w-96 h-96 rounded-full bg-[#272264]/40 blur-3xl pointer-events-none" />

      {/* Top Bar with Logged In User, Download App and Logout */}
      <div className="w-full flex justify-between items-center text-xs font-semibold text-white/90 relative z-10 shrink-0 gap-2">
        <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/30 shadow-2xs max-w-[160px] sm:max-w-[240px]">
          <User className="w-3 h-3 shrink-0" />
          <span className="truncate" title={currentUser?.email || ''}>{currentUser?.email || ''}</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={promptInstall}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 backdrop-blur-md border border-white/30 text-white text-xs font-bold shadow-glass transition-all cursor-pointer"
            title={isInstalled ? t('nav.appInstalled', 'App Installed') : t('nav.downloadApp', 'Download App')}
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">{isInstalled ? t('nav.appInstalled', 'App Installed') : t('nav.downloadApp', 'Download App')}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 hover:bg-rose-600/40 active:scale-95 backdrop-blur-md border border-white/30 text-white text-xs font-bold shadow-glass transition-all cursor-pointer"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Card with Glassmorphic LOVs */}
      <div className="w-full max-w-sm flex flex-col items-center text-center p-5 sm:p-6 rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/30 shadow-glass-hover space-y-3.5 sm:space-y-4 relative z-20 my-auto shrink-0">
        {/* App Logo Emblem */}
        <img
          src="/logo.png"
          alt="VyaparX Logo"
          className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-lg shrink-0"
        />

        {/* Subtitle */}
        <div className="space-y-0.5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-white/90">
            Select Company & Financial Year
          </p>
        </div>

        <div className="w-full space-y-3 pt-1">
          {/* Custom Frosted Glass Company LOV Dropdown */}
          <div className="relative w-full text-left" ref={companyDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsCompanyOpen(prev => !prev);
                setIsFYOpen(false);
              }}
              className={`w-full py-3 px-4 bg-white/15 hover:bg-white/20 active:scale-[0.99] border-2 ${
                isCompanyOpen ? 'border-white bg-white/25 shadow-glass-hover' : 'border-white/40'
              } rounded-2xl text-white font-bold text-xs sm:text-sm flex items-center justify-between shadow-glass transition-all cursor-pointer`}
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <Building2 className="w-4 h-4 shrink-0 text-white/90" />
                <span className="truncate">{selectedCompany?.name || 'Select Company'}</span>
                {selectedCompany?.isDefault && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/20 text-white shrink-0 font-extrabold border border-white/30">
                    Default
                  </span>
                )}
              </div>
              <ChevronDown className={`w-4 h-4 text-white/80 shrink-0 transition-transform duration-200 ${isCompanyOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu Popup */}
            {isCompanyOpen && (
              <div 
                className="absolute left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-2xl rounded-2xl p-2 z-50 border border-white/25 shadow-2xl space-y-1 animate-in fade-in zoom-in-95 duration-150 max-h-56 overflow-y-auto"
                style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
              >
                <div className="text-[10px] font-bold text-white/60 uppercase tracking-wider px-2.5 py-1 flex items-center justify-between border-b border-white/10 mb-1">
                  <span>Available Companies</span>
                  <span className="text-[9px] font-semibold text-white/40">({companies.length})</span>
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
                          ? 'bg-white/25 text-white shadow-xs'
                          : 'hover:bg-white/10 text-white/80 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Building2 className="w-3.5 h-3.5 shrink-0 text-white/80" />
                        <div className="flex flex-col min-w-0">
                          <div className="truncate flex items-center gap-1.5">
                            <span>{c.name}</span>
                            {c.username && <span className="text-white/60 text-[10px] font-normal">({c.username})</span>}
                          </div>
                          {c.city && <span className="text-[10px] text-white/50 font-normal">{c.city} • {c.state}</span>}
                        </div>
                      </div>
                      {c.isDefault && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-200 font-extrabold border border-amber-400/30 mr-1 shrink-0">
                          Default
                        </span>
                      )}
                      {isSelected && <Check className="w-4 h-4 text-emerald-400 stroke-[3] shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Custom Frosted Glass Financial Year LOV Dropdown */}
          <div className="relative w-full text-left" ref={fyDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsFYOpen(prev => !prev);
                setIsCompanyOpen(false);
              }}
              className={`w-full py-3 px-4 bg-white/15 hover:bg-white/20 active:scale-[0.99] border-2 ${
                isFYOpen ? 'border-white bg-white/25 shadow-glass-hover' : 'border-white/40'
              } rounded-2xl text-white font-bold text-xs sm:text-sm flex items-center justify-between shadow-glass transition-all cursor-pointer`}
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <Calendar className="w-4 h-4 shrink-0 text-white/90" />
                <span className="truncate">{selectedFY || 'Select Financial Year'}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-white/80 shrink-0 transition-transform duration-200 ${isFYOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu Popup */}
            {isFYOpen && (
              <div 
                className="absolute left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-2xl rounded-2xl p-2 z-50 border border-white/25 shadow-2xl space-y-1 animate-in fade-in zoom-in-95 duration-150 max-h-56 overflow-y-auto"
                style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
              >
                <div className="text-[10px] font-bold text-white/60 uppercase tracking-wider px-2.5 py-1 flex items-center justify-between border-b border-white/10 mb-1">
                  <span>Financial Year</span>
                  <span className="text-[9px] font-semibold text-white/40">({financialYears.length})</span>
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
                          ? 'bg-white/25 text-white shadow-xs'
                          : 'hover:bg-white/10 text-white/80 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 shrink-0 text-white/80" />
                        <span>{fy.name}</span>
                        {fy.isCurrent && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-200 font-extrabold border border-emerald-400/30">
                            Current
                          </span>
                        )}
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-emerald-400 stroke-[3] shrink-0 ml-2" />}
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
            className="btn-glass-primary w-full py-3.5 px-6 font-bold text-xs sm:text-sm rounded-xl sm:rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
      <div className="text-[10px] sm:text-[11px] text-white/75 font-medium tracking-wide uppercase relative z-10 shrink-0 py-1">
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
