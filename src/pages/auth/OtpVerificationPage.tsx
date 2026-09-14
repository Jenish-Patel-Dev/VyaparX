import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, RotateCw, Edit3, Download, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { companyService } from '../../services/companyService';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { usePwa } from '../../context/PwaContext';
import { useLanguage } from '../../context/LanguageContext';

export const OtpVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { palette, isDarkMode, setDarkMode } = useTheme();
  const { verifyOtp, resendOtp, pendingEmail } = useAuth();
  const { refreshAppContext } = useApp();
  const { promptInstall, isInstalled } = usePwa();
  const { t } = useLanguage();

  const [digits, setDigits] = useState<string[]>(['', '', '', '']);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(60);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const email = pendingEmail || '';

  // Redirect back to login if email is missing
  useEffect(() => {
    if (!email) {
      navigate('/login', { replace: true });
    }
  }, [email, navigate]);

  // Countdown timer for Resend OTP
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Auto focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const maskEmail = (rawEmail: string): string => {
    if (!rawEmail || !rawEmail.includes('@')) return rawEmail;
    const [user, domain] = rawEmail.split('@');
    if (user.length <= 2) {
      return `${user.charAt(0)}***@${domain}`;
    }
    const visibleLength = Math.min(3, user.length - 1);
    const visiblePart = user.slice(0, visibleLength);
    return `${visiblePart}***@${domain}`;
  };

  const handleChange = (index: number, value: string) => {
    setErrorMessage('');
    // Allow only single numeric digit
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      const newDigits = [...digits];
      newDigits[index] = '';
      setDigits(newDigits);
      return;
    }

    const lastChar = cleaned.charAt(cleaned.length - 1);
    const newDigits = [...digits];
    newDigits[index] = lastChar;
    setDigits(newDigits);

    // Auto move to next input
    if (index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (!pasted) return;

    const newDigits = ['', '', '', ''];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setDigits(newDigits);

    const nextFocusIndex = Math.min(pasted.length, 3);
    inputRefs.current[nextFocusIndex]?.focus();
  };

  const otpCode = digits.join('');
  const isComplete = otpCode.length === 4;

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isVerifying) return;
    if (!isComplete) {
      setErrorMessage('Please enter the complete 4-digit OTP');
      return;
    }

    try {
      setIsVerifying(true);
      setErrorMessage('');
      await verifyOtp(email, otpCode);
      toast.success('Email verified successfully!');

      // Check companies associated with this email
      await refreshAppContext();
      const userCompanies = await companyService.getByUser(email);

      if (userCompanies.length > 0) {
        // CASE 1: Existing companies found -> Go to Company Selection
        navigate('/splash', { replace: true });
      } else {
        // CASE 2: No company found -> Redirect to Create First Company Form
        toast.info("Please create your first company to continue.");
        navigate('/create-first-company', { replace: true });
      }
    } catch (err: any) {
      const msg = err.message || 'Invalid verification code. Please try again.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;
    try {
      setIsResending(true);
      setErrorMessage('');
      await resendOtp(email);
      setDigits(['', '', '', '']);
      setCountdown(60);
      inputRefs.current[0]?.focus();
      toast.success('New verification code sent to your email.');
    } catch (err: any) {
      const msg = err.message || 'Unable to resend OTP. Please try again.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsResending(false);
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

      {/* Main Card */}
      <div className="w-full max-w-sm flex flex-col items-center text-center p-5 sm:p-6 rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/30 shadow-glass-hover space-y-3.5 sm:space-y-4 relative z-10 my-auto shrink-0">
        {/* App Logo Emblem with Shield badge */}
        <div className="relative shrink-0">
          <img
            src="/logo.png"
            alt="VyaparX Logo"
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-lg"
          />
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white shadow-md">
            <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>

        {/* Title & Masked Email */}
        <div className="space-y-1 w-full">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-sm">
            Verify OTP
          </h1>
          <p className="text-xs font-semibold text-white/90">
            Enter Verification Code
          </p>
          <p className="text-[11px] text-white/80 pt-0.5">
            We sent a 4-digit code to
          </p>
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-0.5 rounded-full text-xs font-bold text-white tracking-wide border border-white/30 shadow-2xs max-w-full">
            <span className="truncate">{maskEmail(email)}</span>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="p-0.5 hover:text-black transition-colors shrink-0"
              title="Change email address"
            >
              <Edit3 className="w-3 h-3" />
            </button>
          </div>
        </div>

        <form onSubmit={handleVerify} noValidate className="w-full space-y-3.5 pt-0.5">
          {/* 4 OTP Input Boxes */}
          <div className="flex items-center justify-center gap-2.5 sm:gap-3 w-full">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={el => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                autoComplete="one-time-code"
                value={digit}
                onChange={e => handleChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                onPaste={handlePaste}
                onFocus={e => e.target.select()}
                className={`w-11 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black rounded-xl sm:rounded-2xl text-white focus:bg-white focus:text-[#111827] focus:border-white focus:outline-none shadow-glass transition-all shrink-0 select-all ${
                  errorMessage
                    ? 'border-2 border-rose-400 bg-rose-500/20 ring-2 ring-rose-400/40'
                    : 'border-2 border-white/40 bg-white/15'
                }`}
              />
            ))}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-2.5 bg-rose-600/90 backdrop-blur-sm text-white rounded-xl text-xs font-bold tracking-wide shadow-glass border border-white/20 animate-in fade-in">
              {errorMessage}
            </div>
          )}

          {/* Verify OTP Button */}
          <button
            type="submit"
            disabled={digits.join('').length !== 4 || isVerifying}
            className="btn-glass-primary w-full py-2.5 sm:py-3 px-5 font-bold text-xs sm:text-sm rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none hover:disabled:shadow-none transition-all"
          >
            {isVerifying ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Verifying...</span>
              </div>
            ) : (
              <>
                <ArrowRight className="w-4 h-4" />
                <span>Verify OTP</span>
              </>
            )}
          </button>

          {/* Resend OTP & Countdown */}
          <div className="pt-0.5 flex flex-col items-center gap-1.5">
            {countdown > 0 ? (
              <div className="text-xs font-semibold text-white/80">
                Resend OTP in <span className="font-mono font-bold text-white">00:{countdown.toString().padStart(2, '0')}</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="text-xs font-bold text-white hover:text-black transition-colors flex items-center gap-1.5 underline underline-offset-4"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                <span>{isResending ? 'Resending code...' : 'Resend OTP'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-xs font-medium text-white/75 hover:text-white transition-colors"
            >
              Entered wrong email? <span className="underline font-bold">Change Email</span>
            </button>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="text-[10px] sm:text-[11px] text-white/75 font-medium tracking-wide uppercase relative z-10 shrink-0 py-1">
        Commodity Brokerage Management System
      </div>
    </div>
  );
};
