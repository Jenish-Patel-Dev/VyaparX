import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Edit2,
  Repeat,
  BarChart3,
  FileText,
  Zap,
  Settings,
  Shield,
  Lock,
  Users2,
  Copy,
  Share2,
  LogOut,
  HelpCircle,
  FileCheck,
  Star,
  Info,
  Smartphone,
  ChevronRight,
  Check,
  Globe,
  X,
  Mail,
  Phone,
  Sun,
  Moon,
  Palette,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { ChangeCompanyFYModal } from './ChangeCompanyFYModal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { userProfile, lockApp, currentCompany } = useApp();
  const { currentUser, logout } = useAuth();
  const { palette, isDarkMode, setDarkMode } = useTheme();
  const { language, setLanguage, languages, t } = useLanguage();

  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [copied, setCopied] = useState(false);

  const referralCode = userProfile?.referralCode || 'LHPXC3';

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast.success('Referral code copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareApp = () => {
    if (navigator.share) {
      navigator.share({
        title: 'VyaparX',
        text: `Manage your commodity brokerage effortlessly on VyaparX! Use my code ${referralCode}`,
        url: window.location.origin,
      }).catch(() => {});
    } else {
      handleCopyReferral();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.info('Logged out successfully');
  };

  return (
    <div className="min-h-screen pb-24 md:pb-12 transition-colors overflow-x-hidden">
      {/* Header Replicating Screenshot 15 */}
      <PageHeader title={t('profile.title', 'My Profile')} />

      <div className="p-3 sm:p-4 md:p-6 max-w-xl mx-auto space-y-4 min-w-0 w-full">
        {/* Top Profile Card */}
        <div className="glass-card rounded-3xl p-5 sm:p-6 flex flex-col items-center text-center transition-all shadow-glass-card min-w-0 overflow-hidden">
          {/* Avatar with Edit Icon linking to Company Edit */}
          <div className="relative mb-3">
            <div
              className="w-20 h-20 rounded-full text-white flex items-center justify-center text-3xl font-black btn-glass-primary shadow-glass uppercase"
            >
              {currentCompany?.name?.charAt(0) || userProfile?.name?.charAt(0) || 'C'}
            </div>
            <button
              type="button"
              onClick={() => {
                if (currentCompany?.id) {
                  navigate(`/companies/edit/${currentCompany.id}`);
                } else {
                  navigate('/companies');
                }
              }}
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 flex items-center justify-center shadow-glass hover:text-blue-600 dark:hover:text-blue-400 backdrop-blur-xs transition-colors"
              title="Edit Company Details"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight uppercase">
            {currentCompany?.name || userProfile?.name || 'COMPANY NAME'}
          </h2>
          <p className="text-xs font-bold mt-0.5 uppercase tracking-wide text-blue-600 dark:text-blue-400">
            {currentCompany?.username ? `Username: ${currentCompany.username}` : (userProfile?.name ? `Username: ${userProfile.name}` : '')}
          </p>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            {currentCompany?.city ? `${currentCompany.city}, ${currentCompany.state}` : 'BOTAD, GUJARAT'} • {currentCompany?.contactNumber || userProfile?.phone || ''}
          </p>
        </div>

        {/* 1. Personal Information Card */}
        <div className="glass-card rounded-3xl p-4 sm:p-5 space-y-4 transition-all shadow-glass-card min-w-0 overflow-hidden">
          <div className="flex items-center gap-2 font-bold text-sm text-blue-600 dark:text-blue-400">
            <User className="w-4 h-4" />
            <span>{t('profile.personalInfo', 'Personal Information')}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-200/60 dark:border-slate-800 text-sm">
            <span className="text-slate-600 dark:text-slate-400 font-medium">{t('profile.phone', 'Phone Number')}:</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {currentCompany?.contactNumber || userProfile?.phone || '9574823170'}
            </span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-200/60 dark:border-slate-800 text-sm min-w-0 gap-2">
            <span className="text-slate-600 dark:text-slate-400 font-medium shrink-0">Email:</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-xs lowercase truncate max-w-[190px] sm:max-w-xs text-right" title={currentCompany?.email || currentCompany?.userEmail || currentUser?.email || 'krishnafibers@gmail.com'}>
              {currentCompany?.email || currentCompany?.userEmail || currentUser?.email || 'krishnafibers@gmail.com'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowSwitchModal(true)}
            className="w-full flex items-center justify-between py-2 text-sm text-slate-900 dark:text-slate-100 font-bold hover:text-blue-600 dark:hover:text-blue-400 transition-colors min-w-0 gap-2"
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div 
                className="w-8 h-8 rounded-xl flex items-center justify-center backdrop-blur-xs shrink-0 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/60"
              >
                <Repeat className="w-4 h-4" />
              </div>
              <span className="truncate">{t('profile.changeCompany', 'Change company / financial year')}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </button>
        </div>

        {/* Appearance & Theme Card (Light / Dark Mode) */}
        <div className="glass-card rounded-3xl p-4 sm:p-5 space-y-4 transition-all shadow-glass-card min-w-0 overflow-hidden">
          <div className="flex items-center gap-2 font-bold text-sm text-blue-600 dark:text-blue-400">
            <Palette className="w-4 h-4 shrink-0" />
            <span>Appearance & Theme</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 py-1 text-sm">
            <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">Interface Mode:</span>
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setDarkMode(false)}
                className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  !isDarkMode
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Sun className="w-3.5 h-3.5 shrink-0" />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => setDarkMode(true)}
                className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isDarkMode
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Moon className="w-3.5 h-3.5 shrink-0" />
                <span>Dark</span>
              </button>
            </div>
          </div>
        </div>

        {/* App Language Card */}
        <div className="glass-card rounded-3xl p-5 space-y-4 transition-all shadow-glass-card">
          <div className="flex items-center gap-2 font-bold text-sm text-blue-600 dark:text-blue-400">
            <Globe className="w-4 h-4" />
            <span>{t('profile.appLanguage', 'App Language')}</span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {t('profile.selectLanguageDesc', 'Choose your preferred language for VyaparX')}
          </p>

          <div className="grid grid-cols-3 gap-2.5">
            {languages.map(item => {
              const isSelected = language === item.code;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    setLanguage(item.code);
                    toast.success(`Language set to ${item.nativeLabel}`);
                  }}
                  className={`py-3 px-2 rounded-2xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-800 bg-blue-50 dark:bg-blue-950/50 shadow-glass backdrop-blur-md'
                      : 'border-[#DCE6F2] dark:border-slate-800 bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-black text-slate-900 dark:text-slate-100">
                      {item.nativeLabel}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 stroke-[3]" />}
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Reports Card (Screenshots 15 & 17) */}
        <div className="glass-card rounded-3xl p-5 space-y-3 transition-all shadow-glass-card">
          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-sm">
            <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Reports</span>
          </div>

          <button
            type="button"
            onClick={() => navigate('/profile/reports')}
            className="w-full flex items-center justify-between py-2.5 border-b border-gray-200/50 dark:border-white/10 text-sm text-gray-800 dark:text-gray-200 font-semibold hover:text-[var(--primary)] dark:hover:text-[var(--primary)] transition-colors min-w-0 gap-2"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center backdrop-blur-xs shrink-0">
                <BarChart3 className="w-4 h-4" />
              </div>
              <span className="truncate">Brok.Total Amt Party Wise Report</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/vyapar/bills')}
            className="w-full flex items-center justify-between py-2.5 text-sm text-gray-800 dark:text-gray-200 font-semibold hover:text-[var(--primary)] dark:hover:text-[var(--primary)] transition-colors min-w-0 gap-2"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center backdrop-blur-xs shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <span className="truncate">Generated Brok. Bills</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
          </button>
        </div>

        {/* 3. Quick Values Card (Screenshot 17) */}
        <div className="glass-card rounded-3xl p-5 space-y-3 transition-all shadow-glass-card">
          <div className="flex items-center gap-2 font-bold text-sm" style={{ color: palette.primary }}>
            <Zap className="w-4 h-4" style={{ color: palette.primary }} />
            <span>Quick Values</span>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Save shortcuts for order fields used while creating vyapar.
          </p>

          <button
            type="button"
            onClick={() => navigate('/profile/quick-values')}
            className="w-full flex items-center justify-between py-2 text-sm text-gray-800 dark:text-gray-200 font-semibold hover:text-[var(--primary)] dark:hover:text-[var(--primary)] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-xl flex items-center justify-center backdrop-blur-xs"
                style={{ backgroundColor: palette.light, color: palette.primary }}
              >
                <Settings className="w-4 h-4" />
              </div>
              <span>Manage Quick Values</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* 4. Legal & Support */}
        <div className="glass-card rounded-3xl p-5 space-y-3 transition-all shadow-glass-card">
          <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-bold text-sm">
            <HelpCircle className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Legal & Support</span>
          </div>

          {/* Share App (Moved from Referrals) */}
          <button
            type="button"
            onClick={handleShareApp}
            className="w-full flex items-center justify-between py-2 text-sm text-gray-700 dark:text-gray-300 font-medium hover:text-[var(--primary)] dark:hover:text-[var(--primary)] transition-colors"
          >
            <div className="flex items-center gap-3">
              <Share2 className="w-4 h-4" style={{ color: palette.primary }} />
              <span>Share App</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/legal/terms')}
            className="w-full flex items-center justify-between py-2 text-sm text-gray-700 dark:text-gray-300 font-medium hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileCheck className="w-4 h-4 text-teal-600" />
              <span>Terms & Conditions</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/legal/privacy')}
            className="w-full flex items-center justify-between py-2 text-sm text-gray-700 dark:text-gray-300 font-medium hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-teal-600" />
              <span>Privacy Policy</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/legal/how-to-use')}
            className="w-full flex items-center justify-between py-2 text-sm text-gray-700 dark:text-gray-300 font-medium hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="w-4 h-4 text-teal-600" />
              <span>How to Use App</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          <button
            type="button"
            onClick={() => toast.success('Thank you for rating VyaparX 5 stars! ⭐⭐⭐⭐⭐')}
            className="w-full flex items-center justify-between py-2 text-sm text-gray-700 dark:text-gray-300 font-medium hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Star className="w-4 h-4 text-amber-500" />
              <span>Rate Us</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          <button
            type="button"
            onClick={() => toast.info('VyaparX v1.0. Developed for Commodity & Agro Brokers.')}
            className="w-full flex items-center justify-between py-2 text-sm text-gray-700 dark:text-gray-300 font-medium hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Info className="w-4 h-4 text-teal-600" />
              <span>About Us</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          <button
            type="button"
            onClick={() => setShowContactModal(true)}
            className="w-full flex items-center justify-between py-2 text-sm text-gray-700 dark:text-gray-300 font-medium hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Smartphone className="w-4 h-4 text-teal-600" />
              <span>Contact Us</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Logout Red Button */}
        <button
          type="button"
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full py-4 px-4 bg-red-600/90 hover:bg-red-600 text-white font-extrabold text-sm uppercase tracking-wider rounded-2xl shadow-glass-card hover:shadow-glass-hover backdrop-blur-md transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <LogOut className="w-5 h-5" />
          <span>{t('profile.logout', 'Logout')}</span>
        </button>
      </div>

      {/* Switch Company / FY Modal */}
      {showSwitchModal && (
        <ChangeCompanyFYModal
          isOpen={showSwitchModal}
          onClose={() => setShowSwitchModal(false)}
        />
      )}

      {/* Selected Company Contact Us Popup Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in">
          <div
            className="w-full max-w-sm bg-white/85 dark:bg-gray-900/85 backdrop-blur-2xl rounded-3xl shadow-glass-hover p-6 space-y-4 border border-white/60 dark:border-white/10 animate-in zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start border-b border-gray-200/50 dark:border-white/10 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-gray-900 dark:text-white uppercase tracking-tight">
                  {currentCompany?.name || 'Company Contact'}
                </h3>
                {currentCompany?.username && (
                  <p className="text-xs font-bold uppercase mt-0.5" style={{ color: palette.primary }}>
                    @{currentCompany.username}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowContactModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-white/60 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {/* Phone / Mobile */}
              <div className="p-3.5 glass-card-subtle rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-gray-400">Mobile Number</div>
                    <div className="text-xs font-bold text-gray-900 dark:text-white">
                      {currentCompany?.contactNumber || userProfile?.phone || '9574823170'}
                    </div>
                  </div>
                </div>
                {(currentCompany?.contactNumber || userProfile?.phone) && (
                  <a
                    href={`tel:${currentCompany?.contactNumber || userProfile?.phone}`}
                    className="btn-glass-primary px-3.5 py-1.5 text-white text-xs font-bold rounded-xl shadow-glass transition-all flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                )}
              </div>

              {/* Email */}
              <div className="p-3.5 glass-card-subtle rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase text-gray-400">Email Address</div>
                    <div className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[160px]">
                      {currentCompany?.email || currentCompany?.userEmail || currentUser?.email || 'krishnafibers@gmail.com'}
                    </div>
                  </div>
                </div>
                {(currentCompany?.email || currentCompany?.userEmail || currentUser?.email) && (
                  <a
                    href={`mailto:${currentCompany?.email || currentCompany?.userEmail || currentUser?.email}`}
                    className="btn-glass-primary px-3.5 py-1.5 text-white text-xs font-bold rounded-xl shadow-glass transition-all shrink-0 flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email</span>
                  </a>
                )}
              </div>

              {/* Address */}
              <div className="p-3.5 glass-card-subtle rounded-2xl text-xs space-y-1">
                <div className="text-[10px] font-bold uppercase text-gray-400">Business Address</div>
                <div className="font-semibold text-gray-800 dark:text-gray-200 uppercase leading-relaxed">
                  {currentCompany?.address || 'PALIYAD ROAD BOTAD'}
                  {currentCompany?.city ? `, ${currentCompany.city}` : ', BOTAD'}
                  {currentCompany?.state ? `, ${currentCompany.state}` : ', GUJARAT'}
                  {currentCompany?.pinCode ? ` - ${currentCompany.pinCode}` : ' - 364710'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowContactModal(false)}
              className="btn-glass-secondary w-full py-2.5 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>
          </div>
        </div>
      )}

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
