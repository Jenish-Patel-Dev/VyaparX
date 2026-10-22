import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, ArrowRight, CheckCircle2, Download, Sun, Moon, Delete } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { usePwa } from '../../context/PwaContext';
import { useLanguage } from '../../context/LanguageContext';
import { profileService } from '../../services/profileService';
import { userService } from '../../services/userService';
import { companyService } from '../../services/companyService';
import { FieldError } from '../../components/common/FieldError';

export const SetupPinPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { currentUser } = useAuth();
  const { refreshAppContext } = useApp();
  const { isDarkMode, setDarkMode } = useTheme();
  const { promptInstall, isInstalled } = usePwa();
  const { t } = useLanguage();

  const [pin, setPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const email = currentUser?.email || '';

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

  const handleDigit = (digit: string) => {
    setErrorMessage('');
    if (step === 'enter') {
      if (pin.length < 6) {
        const next = pin + digit;
        setPin(next);
        if (next.length === 6) {
          setTimeout(() => {
            setStep('confirm');
          }, 180);
        }
      }
    } else {
      if (confirmPin.length < 6) {
        const next = confirmPin + digit;
        setConfirmPin(next);
      }
    }
  };

  const handleBackspace = () => {
    setErrorMessage('');
    if (step === 'confirm') {
      if (confirmPin.length > 0) {
        setConfirmPin(prev => prev.slice(0, -1));
      } else {
        setStep('enter');
      }
    } else {
      setPin(prev => prev.slice(0, -1));
    }
  };

  // Physical keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Enter' && step === 'confirm' && confirmPin.length === 6) {
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, pin, confirmPin]);

  const handleSubmit = async () => {
    if (pin.length !== 6) {
      setErrorMessage('Please enter a complete 6-digit PIN');
      setStep('enter');
      return;
    }
    if (confirmPin.length !== 6) {
      setErrorMessage('Please enter the 6-digit PIN confirmation');
      return;
    }
    if (pin !== confirmPin) {
      setErrorMessage('PINs do not match. Please try again.');
      setConfirmPin('');
      setStep('confirm');
      return;
    }

    try {
      setIsSubmitting(true);
      await profileService.updateProfile({
        pin,
        isPinEnabled: true,
      }, email);
      await userService.updateUserPin(email, pin);
      await userService.updateLastLogin(email);

      sessionStorage.setItem('sauda_pin_unlocked', 'true');
      await refreshAppContext();

      toast.success('6-Digit Security PIN configured successfully!');

      // Check user's companies to determine next route
      const userCompanies = await companyService.getByUser(email);
      if (userCompanies.length > 0) {
        navigate('/splash', { replace: true });
      } else {
        toast.info('Please create your first company to continue.');
        navigate('/create-first-company', { replace: true });
      }
    } catch (err: any) {
      const msg = err.message || 'Failed to save security PIN';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-between p-3 sm:p-4 md:p-6 text-gray-900 dark:text-gray-100 transition-colors relative overflow-hidden select-none bg-[#E8EDF3] dark:bg-[#20242D]"
    >
      {/* Ambient background lighting matching EmailLoginPage */}
      <div className="absolute -top-28 -left-28 w-80 h-80 rounded-full bg-blue-500/5 dark:bg-blue-400/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-28 w-96 h-96 rounded-full bg-indigo-500/5 dark:bg-indigo-400/5 blur-3xl pointer-events-none" />

      {/* Top Header with Theme Switcher & Download App matching Email & OTP pages */}
      <div className="w-full flex items-center justify-end gap-2 relative z-10 shrink-0">
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

      {/* Main PIN Setup Card */}
      <div className="w-full max-w-sm flex flex-col items-center text-center p-6 sm:p-8 rounded-3xl neu-raised bg-[#E8EDF3] dark:bg-[#262B36] border border-white/60 dark:border-white/5 space-y-4 relative z-10 my-auto shrink-0">
        
        {/* App Logo Emblem with Key Badge matching OTP verification */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-2xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#262B36] flex items-center justify-center p-3 border border-white/60 dark:border-white/5">
            <img
              src="/logo.png"
              alt="VyaparX Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
            <KeyRound className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Title & Email Badge */}
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            {step === 'enter' ? 'Set 6-Digit PIN' : 'Confirm Your PIN'}
          </h1>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {step === 'enter' 
              ? 'Create a 6-digit passcode for quick 1-tap unlock without OTP'
              : 'Re-enter your 6-digit passcode to verify'}
          </p>
          {email && (
            <div className="inline-block mt-1 px-3 py-0.5 rounded-full neu-inset text-[11px] font-bold text-gray-600 dark:text-gray-300">
              {maskEmail(email)}
            </div>
          )}
        </div>

        {/* 6 Digit Indicator Slots */}
        <div className="flex items-center justify-center gap-2 sm:gap-2.5 py-1">
          {Array.from({ length: 6 }).map((_, idx) => {
            const currentVal = step === 'enter' ? pin : confirmPin;
            const isFilled = idx < currentVal.length;
            const isCurrent = idx === currentVal.length;

            return (
              <div
                key={idx}
                className={`w-9 h-11 sm:w-10 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-lg transition-all duration-150 ${
                  isFilled
                    ? 'neu-raised-sm text-blue-600 dark:text-blue-400 bg-white dark:bg-[#20242D] border border-blue-500/30'
                    : isCurrent
                    ? 'neu-inset border-2 border-blue-500/60 bg-[#E8EDF3] dark:bg-[#20242D]'
                    : 'neu-inset text-slate-400 dark:text-slate-600 bg-[#E8EDF3] dark:bg-[#20242D]'
                }`}
              >
                {isFilled ? '●' : ''}
              </div>
            );
          })}
        </div>

        <FieldError error={errorMessage} className="justify-center text-xs text-red-600 dark:text-red-400 font-semibold" />

        {/* Step Indicator Buttons */}
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400">
          <button
            type="button"
            onClick={() => {
              setStep('enter');
              setErrorMessage('');
            }}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
              step === 'enter' ? 'bg-blue-600 text-white' : 'hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            1. Enter PIN
          </button>
          <span>→</span>
          <button
            type="button"
            disabled={pin.length !== 6}
            onClick={() => {
              if (pin.length === 6) {
                setStep('confirm');
                setErrorMessage('');
              }
            }}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
              step === 'confirm'
                ? 'bg-blue-600 text-white'
                : pin.length === 6
                ? 'hover:text-gray-900 dark:hover:text-white'
                : 'opacity-40 cursor-not-allowed'
            }`}
          >
            2. Confirm PIN
          </button>
        </div>

        {/* Numeric Keypad (0-9, Clear, Backspace) */}
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5 w-full max-w-[270px]">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigit(num)}
              className="h-11 sm:h-12 rounded-xl sm:rounded-2xl neu-raised font-black text-base sm:text-lg text-gray-800 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 active:scale-95 transition-all cursor-pointer border border-white/60 dark:border-white/5 bg-[#E8EDF3] dark:bg-[#262B36]"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              if (step === 'confirm') setConfirmPin('');
              else setPin('');
            }}
            className="h-11 sm:h-12 rounded-xl sm:rounded-2xl neu-raised text-xs font-bold text-gray-500 hover:text-red-500 active:scale-95 transition-all cursor-pointer border border-white/60 dark:border-white/5 bg-[#E8EDF3] dark:bg-[#262B36]"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-11 sm:h-12 rounded-xl sm:rounded-2xl neu-raised font-black text-base sm:text-lg text-gray-800 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 active:scale-95 transition-all cursor-pointer border border-white/60 dark:border-white/5 bg-[#E8EDF3] dark:bg-[#262B36]"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            aria-label="Backspace"
            className="h-11 sm:h-12 rounded-xl sm:rounded-2xl neu-raised flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-amber-500 active:scale-95 transition-all cursor-pointer border border-white/60 dark:border-white/5 bg-[#E8EDF3] dark:bg-[#262B36]"
          >
            <Delete className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>

        {/* Submit Button on Step 2 */}
        {step === 'confirm' && confirmPin.length === 6 && (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="neu-button-primary w-full py-3 px-4 font-black rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all animate-in fade-in text-sm"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving PIN...</span>
              </div>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Save 6-Digit PIN</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Bottom Footer matching EmailLoginPage */}
      <div className="text-[10px] sm:text-[11px] text-gray-400 dark:text-gray-500 font-bold tracking-wider uppercase relative z-10 shrink-0 py-1">
        Commodity Brokerage Management System
      </div>
    </div>
  );
};
