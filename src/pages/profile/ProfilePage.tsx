import { createPortal } from 'react-dom';
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
  KeyRound,
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
  Code2,
  Sparkles,
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
  const [showAboutModal, setShowAboutModal] = useState(false);
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
      <PageHeader title={t('profile.title', 'MY PROFILE')} />

      <div className="p-3 sm:p-4 md:p-6 max-w-xl mx-auto space-y-4 min-w-0 w-full">
        {/* Top Profile Card */}
        <div className="neu-raised rounded-3xl p-5 sm:p-6 flex flex-col items-center text-center transition-all min-w-0 overflow-hidden border border-white/60 dark:border-white/5">
          {/* Avatar with Edit Icon linking to Company Edit */}
          <div className="relative mb-3">
            <div
              className="w-20 h-20 rounded-full text-white flex items-center justify-center text-3xl font-black neu-button-primary uppercase"
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
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full neu-raised-sm flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 border border-white/60 dark:border-white/5 transition-colors cursor-pointer"
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
        <div className="neu-raised rounded-3xl p-4 sm:p-5 space-y-4 transition-all min-w-0 overflow-hidden border border-white/60 dark:border-white/5">
          <div className="flex items-center gap-2 font-bold text-sm text-blue-600 dark:text-blue-400">
            <User className="w-4 h-4" />
            <span>{t('profile.personalInfo', 'Personal Information')}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-black/[0.06] dark:border-white/10 text-sm">
            <span className="text-slate-600 dark:text-slate-400 font-medium">{t('profile.phone', 'Phone Number')}:</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {currentCompany?.contactNumber || userProfile?.phone || '9574823170'}
            </span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-black/[0.06] dark:border-white/10 text-sm min-w-0 gap-2">
            <span className="text-slate-600 dark:text-slate-400 font-medium shrink-0">Email:</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-xs lowercase truncate max-w-[190px] sm:max-w-xs text-right" title={currentCompany?.email || currentCompany?.userEmail || currentUser?.email || 'krishnafibers@gmail.com'}>
              {currentCompany?.email || currentCompany?.userEmail || currentUser?.email || 'krishnafibers@gmail.com'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowSwitchModal(true)}
            className="w-full flex items-center justify-between py-2 text-sm text-slate-900 dark:text-slate-100 font-bold hover:text-blue-600 dark:hover:text-blue-400 transition-colors min-w-0 gap-2 cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div 
                className="w-8 h-8 rounded-xl neu-raised-sm flex items-center justify-center shrink-0 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
              >
                <Repeat className="w-4 h-4" />
              </div>
              <span className="truncate">{t('profile.changeCompany', 'Change company / financial year')}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </button>
        </div>

        {/* Security & PIN Settings Card */}
        <div className="neu-raised rounded-3xl p-4 sm:p-5 space-y-3 transition-all min-w-0 overflow-hidden border border-white/60 dark:border-white/5">
          <div className="flex items-center gap-2 font-bold text-sm text-blue-600 dark:text-blue-400">
            <Lock className="w-4 h-4 shrink-0" />
            <span>Security & Passcode (PIN)</span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Manage your 6-digit security PIN for instant passcode unlock and trade records protection.
          </p>

          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={() => navigate('/profile/security')}
              className="w-full flex items-center justify-between py-2.5 text-sm text-slate-800 dark:text-slate-200 font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl neu-raised-sm bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="block font-bold">Change 6-Digit PIN</span>
                  <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                    {userProfile?.pin ? 'PIN is configured and active' : 'Set your 6-digit security PIN'}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => {
                lockApp();
                toast.info('Application screen locked.');
              }}
              className="w-full flex items-center justify-between py-2.5 text-sm text-slate-700 dark:text-slate-300 font-medium hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer border-t border-black/[0.04] dark:border-white/5 pt-2.5"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl neu-raised-sm bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="font-bold">Lock App Screen Now</span>
              </div>
              <Lock className="w-4 h-4 text-amber-500" />
            </button>
          </div>
        </div>

        {/* Appearance & Theme Card (Light / Dark Mode) */}
        <div className="neu-raised rounded-3xl p-4 sm:p-5 space-y-4 transition-all min-w-0 overflow-hidden border border-white/60 dark:border-white/5">
          <div className="flex items-center gap-2 font-bold text-sm text-blue-600 dark:text-blue-400">
            <Palette className="w-4 h-4 shrink-0" />
            <span>Appearance & Theme</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 py-1 text-sm">
            <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">Interface Mode:</span>
            <div className="grid grid-cols-2 p-1 rounded-2xl neu-inset-sm w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setDarkMode(false)}
                className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  !isDarkMode
                    ? 'neu-button-primary !text-white'
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
                    ? 'neu-button-primary !text-white'
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
        <div className="neu-raised rounded-3xl p-5 space-y-4 transition-all border border-white/60 dark:border-white/5">
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
                  className={`py-3 px-2 rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'neu-inset-sm border border-blue-400/40 text-blue-600 dark:text-blue-400'
                      : 'neu-raised-sm hover:shadow-neu-raised border border-white/60 dark:border-white/5 text-slate-700 dark:text-slate-300'
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
        <div className="neu-raised rounded-3xl p-5 space-y-3 transition-all border border-white/60 dark:border-white/5">
          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-sm">
            <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Reports</span>
          </div>

          <button
            type="button"
            onClick={() => navigate('/profile/reports')}
            className="w-full flex items-center justify-between py-2.5 border-b border-black/[0.06] dark:border-white/10 text-sm text-slate-800 dark:text-slate-200 font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors min-w-0 gap-2 cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-xl neu-raised-sm bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <BarChart3 className="w-4 h-4" />
              </div>
              <span className="truncate">Brok.Total Amt Party Wise Report</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/vyapar/bills')}
            className="w-full flex items-center justify-between py-2.5 text-sm text-slate-800 dark:text-slate-200 font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors min-w-0 gap-2 cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-xl neu-raised-sm bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <span className="truncate">Generated Brok. Bills</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </button>
        </div>

        {/* 3. Quick Values Card (Screenshot 17) */}
        <div className="neu-raised rounded-3xl p-5 space-y-3 transition-all border border-white/60 dark:border-white/5">
          <div className="flex items-center gap-2 font-bold text-sm text-blue-600 dark:text-blue-400">
            <Zap className="w-4 h-4" />
            <span>Quick Values</span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Save shortcuts for order fields used while creating vyapar.
          </p>

          <button
            type="button"
            onClick={() => navigate('/profile/quick-values')}
            className="w-full flex items-center justify-between py-2 text-sm text-slate-800 dark:text-slate-200 font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-xl neu-raised-sm bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center"
              >
                <Settings className="w-4 h-4" />
              </div>
              <span>Manage Quick Values</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* 4. Legal & Support */}
        <div className="neu-raised rounded-3xl p-5 space-y-3 transition-all border border-white/60 dark:border-white/5">
          <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-bold text-sm">
            <HelpCircle className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Legal & Support</span>
          </div>

          {/* Share App (Moved from Referrals) */}
          <button
            type="button"
            onClick={handleShareApp}
            className="w-full flex items-center justify-between py-2 text-sm text-slate-700 dark:text-slate-300 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Share2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Share App</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/legal/terms')}
            className="w-full flex items-center justify-between py-2 text-sm text-slate-700 dark:text-slate-300 font-medium hover:text-teal-700 dark:hover:text-teal-400 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <FileCheck className="w-4 h-4 text-teal-600" />
              <span>Terms & Conditions</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/legal/privacy')}
            className="w-full flex items-center justify-between py-2 text-sm text-slate-700 dark:text-slate-300 font-medium hover:text-teal-700 dark:hover:text-teal-400 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-teal-600" />
              <span>Privacy Policy</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/legal/how-to-use')}
            className="w-full flex items-center justify-between py-2 text-sm text-slate-700 dark:text-slate-300 font-medium hover:text-teal-700 dark:hover:text-teal-400 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="w-4 h-4 text-teal-600" />
              <span>How to Use App</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={() => toast.success('Thank you for rating VyaparX 5 stars! ⭐⭐⭐⭐⭐')}
            className="w-full flex items-center justify-between py-2 text-sm text-slate-700 dark:text-slate-300 font-medium hover:text-teal-700 dark:hover:text-teal-400 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Star className="w-4 h-4 text-amber-500" />
              <span>Rate Us</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={() => setShowAboutModal(true)}
            className="w-full flex items-center justify-between py-2 text-sm text-slate-700 dark:text-slate-300 font-medium hover:text-teal-700 dark:hover:text-teal-400 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Info className="w-4 h-4 text-teal-600" />
              <span>About Us</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={() => setShowContactModal(true)}
            className="w-full flex items-center justify-between py-2 text-sm text-slate-700 dark:text-slate-300 font-medium hover:text-teal-700 dark:hover:text-teal-400 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-teal-600" />
              <span>Contact Us</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Logout Red Button */}
        <button
          type="button"
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full py-4 px-4 neu-button-secondary text-red-600 dark:text-red-400 font-extrabold text-sm uppercase tracking-wider rounded-2xl border border-red-500/20 hover:text-red-700 dark:hover:text-red-300 transition-all flex items-center justify-center gap-2 active:shadow-neu-pressed cursor-pointer"
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

      {/* Contact Us Modal - Static Developer Support Email */}
      {showContactModal && createPortal(
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/45 dark:bg-black/55 backdrop-blur-[3px] animate-in fade-in"
          onClick={() => setShowContactModal(false)}
        >
          <div
            className="w-full max-w-sm neu-raised-lg rounded-3xl p-6 space-y-4 border border-[#D5DDE7] dark:border-white/10 animate-in zoom-in-95 bg-[#E8EDF3] dark:bg-[#262B36]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start border-b border-black/[0.06] dark:border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl neu-raised-sm bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 tracking-tight">
                    Contact Us
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Support & Help Desk</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowContactModal(false)}
                className="w-8 h-8 rounded-xl neu-raised-sm flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border border-[#D5DDE7] dark:border-white/5 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Only Static Email */}
              <div className="p-4 neu-inset-sm rounded-2xl flex items-center justify-between border border-black/[0.04] dark:border-white/5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl neu-raised-sm bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Email Support</div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                      jenishpatel.dev7@gmail.com
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('jenishpatel.dev7@gmail.com');
                      toast.success('Email copied to clipboard!');
                    }}
                    title="Copy Email"
                    className="neu-button-secondary p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-all cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href="mailto:jenishpatel.dev7@gmail.com"
                    className="neu-button-primary px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Send</span>
                  </a>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowContactModal(false)}
              className="neu-button-secondary w-full py-2.5 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* About Us Modal - Developer Credits */}
      {showAboutModal && createPortal(
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/45 dark:bg-black/55 backdrop-blur-[3px] animate-in fade-in"
          onClick={() => setShowAboutModal(false)}
        >
          <div
            className="w-full max-w-sm neu-raised-lg rounded-3xl p-6 space-y-4 border border-[#D5DDE7] dark:border-white/10 animate-in zoom-in-95 bg-[#E8EDF3] dark:bg-[#262B36]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start border-b border-black/[0.06] dark:border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl neu-raised-sm bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-neu-raised-sm shrink-0">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 tracking-tight">
                    About Us
                  </h3>
                  <p
                    onClick={() => {
                      const count = (Number(sessionStorage.getItem('about_clicks') || '0')) + 1;
                      sessionStorage.setItem('about_clicks', String(count));
                      if (count >= 5) {
                        sessionStorage.removeItem('about_clicks');
                        navigate('/admin/login');
                      }
                    }}
                    className="text-xs text-slate-500 dark:text-slate-400 cursor-default select-none"
                  >
                    VyaparX • v1.0
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAboutModal(false)}
                className="w-8 h-8 rounded-xl neu-raised-sm flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border border-[#D5DDE7] dark:border-white/5 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              {/* Developer Credit Box */}
              <div className="p-4 neu-inset-sm rounded-2xl space-y-2 border border-black/[0.04] dark:border-white/5 text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  <Sparkles className="w-3 h-3" />
                  <span>Design & Developed By</span>
                </div>
                <div className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  Jenish Khambhaliya
                </div>
                <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                  Software Developer
                </div>
              </div>

              {/* Email Contact Inset */}
              <div className="p-3 neu-inset-sm rounded-2xl flex items-center justify-between border border-black/[0.04] dark:border-white/5">
                <div className="flex items-center gap-2 min-w-0">
                  <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                    jenishpatel.dev7@gmail.com
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('jenishpatel.dev7@gmail.com');
                      toast.success('Email copied to clipboard!');
                    }}
                    title="Copy Email"
                    className="neu-button-secondary p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-all cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href="mailto:jenishpatel.dev7@gmail.com"
                    className="neu-button-primary px-2.5 py-1 text-[11px] font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    <span>Email</span>
                  </a>
                </div>
              </div>

              {/* App Summary */}
              <div className="p-3 neu-inset-sm rounded-2xl text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed border border-black/[0.04] dark:border-white/5 text-center">
                Commodity ERP, Sauda Book & Billing Management platform built with speed, precision, and ease-of-use for brokers and commission agents.
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAboutModal(false)}
              className="neu-button-secondary w-full py-2.5 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>
          </div>
        </div>,
        document.body
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
