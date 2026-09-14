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
      await sendOtp(email.trim().toLowerCase());
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
      className="h-screen h-[100dvh] max-h-screen flex flex-col items-center justify-between p-3 sm:p-4 md:p-6 text-white transition-colors relative overflow-hidden select-none bg-gradient-to-br from-[#1E40AF] via-[#1D4ED8] to-[#2563EB] dark:from-[#0B1220] dark:via-[#111827] dark:to-[#172033]"
    >
      {/* Ambient background refraction blobs */}
      <div className="absolute -top-28 -left-28 w-80 h-80 rounded-full bg-[#00ADEF]/25 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-32 -right-28 w-96 h-96 rounded-full bg-[#272264]/40 blur-3xl pointer-events-none" />

      {/* Top Header / Action Buttons */}
      <div className="w-full flex items-center justify-end gap-2 relative z-10 shrink-0">
        {/* Dark / Light Mode Toggle */}
        <button
          type="button"
          onClick={() => setDarkMode(!isDarkMode)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 backdrop-blur-md border border-white/30 text-white text-xs font-bold shadow-glass transition-all cursor-pointer"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
        >
          {isDarkMode ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-300 stroke-[2.5]" />
              <span>Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-white stroke-[2.5]" />
              <span>Dark</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={promptInstall}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 backdrop-blur-md border border-white/30 text-white text-xs font-bold shadow-glass transition-all cursor-pointer"
          title={isInstalled ? t('nav.appInstalled', 'App Installed') : t('nav.downloadApp', 'Download App')}
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{isInstalled ? t('nav.appInstalled', 'App Installed') : t('nav.downloadApp', 'Download App')}</span>
        </button>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-sm flex flex-col items-center text-center p-5 sm:p-6 rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/30 shadow-glass-hover space-y-3.5 sm:space-y-4 relative z-10 my-auto shrink-0">
        {/* App Logo Emblem */}
        <img
          src="/logo.png"
          alt="VyaparX Logo"
          className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-lg shrink-0"
        />

        {/* Title & Subtitle */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-sm">
            Welcome Back!
          </h1>
          <p className="text-xs font-medium text-white/90">
            Enter your email address to continue
          </p>
        </div>

        <form onSubmit={handleSendOtp} noValidate className="w-full space-y-3 pt-0.5">
          {/* Email Input */}
          <div className="space-y-1 text-left">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/80">
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
                className={`w-full py-2.5 sm:py-3 pl-10 pr-3 bg-white/10 backdrop-blur-md border rounded-xl sm:rounded-2xl text-white placeholder-white/70 font-semibold text-xs sm:text-sm focus:outline-none focus:border-white focus:bg-white/20 transition-all tracking-wide shadow-inner ${
                  error ? 'border-red-400 ring-2 ring-red-400/50 bg-red-500/20' : 'border-white/30'
                }`}
              />
            </div>
            <FieldError error={error} className="text-red-100 bg-red-900/60 px-2.5 py-1 rounded-xl border border-red-400/40" />
          </div>

          {/* Send OTP Button */}
          <button
            type="submit"
            disabled={!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || isSubmitting}
            className="btn-glass-primary w-full py-2.5 sm:py-3 px-5 font-bold text-xs sm:text-sm rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none hover:disabled:shadow-none transition-all"
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
        <div className="w-full pt-2 border-t border-white/20 space-y-1.5">
          <p className="text-[11px] text-white/80 font-medium">
            Install on your phone or PC for 1-tap access
          </p>
          <button
            type="button"
            onClick={promptInstall}
            className="btn-glass-secondary w-full py-2.5 px-4 font-bold text-xs sm:text-sm rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>{isInstalled ? t('nav.appInstalled', 'App Installed') : t('nav.downloadApp', 'Download App')}</span>
          </button>
        </div>
      </div>

      <div className="text-[10px] sm:text-[11px] text-white/75 font-medium tracking-wide uppercase relative z-10 shrink-0 py-1">
        Commodity Brokerage Management System
      </div>
    </div>
  );
};
