import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, Download, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { usePwa } from '../../context/PwaContext';
import { useLanguage } from '../../context/LanguageContext';
import { validateEmail } from '../../utils/validators';
import { FieldError } from '../../components/common/FieldError';

export const EmailLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { palette, isDarkMode, setDarkMode } = useTheme();
  const { sendOtp, pendingEmail, setPendingEmail } = useAuth();
  const { promptInstall, isInstalled } = usePwa();
  const { t } = useLanguage();

  const [email, setEmail] = useState<string>(pendingEmail || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailErr = validateEmail(email, true);
    if (emailErr) {
      setError(emailErr);
      return;
    }

    try {
      setIsSubmitting(true);
      await sendOtp(email.trim().toLowerCase(), 'login');
      setPendingEmail(email.trim().toLowerCase());
      toast.success('Verification code sent to your email.');
      navigate('/verify-otp');
    } catch (err: any) {
      toast.error(err.message || 'Unable to send OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-between p-3 sm:p-4 md:p-6 text-gray-900 dark:text-gray-100 transition-colors relative overflow-hidden select-none bg-[#E8EDF3] dark:bg-[#20242D]"
    >
      {/* Ambient background lighting */}
      <div className="absolute -top-28 -left-28 w-80 h-80 rounded-full bg-blue-500/5 dark:bg-blue-400/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-28 w-96 h-96 rounded-full bg-indigo-500/5 dark:bg-indigo-400/5 blur-3xl pointer-events-none" />

      {/* Top Header / Action Buttons */}
      <div className="w-full flex items-center justify-end gap-2 relative z-10 shrink-0">
        {/* Dark / Light Mode Toggle */}
        <button
          type="button"
          onClick={() => setDarkMode(!isDarkMode)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full neu-raised-sm bg-[#E8EDF3] dark:bg-[#262B36] text-gray-700 dark:text-gray-200 text-xs font-bold transition-all active:scale-95 cursor-pointer border border-white/60 dark:border-white/5"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
        >
          {isDarkMode ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-500 stroke-[2.5]" />
              <span>Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-slate-700 stroke-[2.5]" />
              <span>Dark</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={promptInstall}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full neu-raised-sm bg-[#E8EDF3] dark:bg-[#262B36] text-gray-700 dark:text-gray-200 text-xs font-bold transition-all active:scale-95 cursor-pointer border border-white/60 dark:border-white/5"
          title={isInstalled ? t('nav.appInstalled', 'App Installed') : t('nav.downloadApp', 'Download App')}
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{isInstalled ? t('nav.appInstalled', 'App Installed') : t('nav.downloadApp', 'Download App')}</span>
        </button>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-sm flex flex-col items-center text-center p-6 sm:p-8 rounded-3xl neu-raised bg-[#E8EDF3] dark:bg-[#262B36] border border-white/60 dark:border-white/5 space-y-4 relative z-10 my-auto shrink-0">
        {/* App Logo Emblem */}
        <div className="w-20 h-20 rounded-2xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#262B36] flex items-center justify-center p-3 shrink-0 border border-white/60 dark:border-white/5">
          <img
            src="/logo.png"
            alt="VyaparX Logo"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
            Welcome Back!
          </h1>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Enter your email address to continue
          </p>
        </div>

        <form onSubmit={handleSendOtp} noValidate className="w-full space-y-3 pt-0.5">
          {/* Email Input */}
          <div className="space-y-1 text-left">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 dark:text-gray-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                autoFocus
                placeholder="Email Address"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                className={`w-full py-2.5 sm:py-3 pl-10 pr-3 neu-inset bg-[#E8EDF3] dark:bg-[#20242D] rounded-xl sm:rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-semibold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all tracking-wide ${
                  error ? 'border-2 border-red-500/50 bg-red-500/10' : ''
                }`}
              />
            </div>
            <FieldError error={error} className="text-red-600 dark:text-red-400 px-2 py-0.5 text-xs font-semibold" />
          </div>

          {/* Send OTP Button */}
          <button
            type="submit"
            disabled={!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || isSubmitting}
            className="neu-button-primary w-full py-2.5 sm:py-3 px-5 font-bold text-xs sm:text-sm rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Sending OTP...</span>
              </div>
            ) : (
              <>
                <ArrowRight className="w-4 h-4" />
                <span>Send OTP</span>
              </>
            )}
          </button>
        </form>

        {/* Direct Application Download Option */}
        <div className="w-full pt-3 border-t border-black/5 dark:border-white/5 space-y-2">
          <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
            Install on your phone or PC for 1-tap access
          </p>
          <button
            type="button"
            onClick={promptInstall}
            className="neu-button-secondary w-full py-2.5 px-4 font-bold text-xs sm:text-sm rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>{isInstalled ? t('nav.appInstalled', 'App Installed') : t('nav.downloadApp', 'Download App')}</span>
          </button>
        </div>
      </div>

      <div className="text-[10px] sm:text-[11px] text-gray-400 dark:text-gray-500 font-bold tracking-wider uppercase relative z-10 shrink-0 py-1">
        Commodity Brokerage Management System
      </div>
    </div>
  );
};
