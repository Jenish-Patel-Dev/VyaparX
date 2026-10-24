import { createPortal } from 'react-dom';
import React, { useState, useEffect } from 'react';
import { Lock, Unlock, KeyRound, ShieldAlert, ArrowRight, RotateCw, CheckCircle2, Delete } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services/authService';
import { profileService } from '../../services/profileService';
import { userService } from '../../services/userService';
import { FieldError } from './FieldError';

export const PinLockModal: React.FC = () => {
  const { isPinLocked, unlockWithPin, userProfile, refreshAppContext } = useApp();
  const { currentUser, logout, verifyOtp } = useAuth();
  const toast = useToast();

  const [pin, setPin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Forgot PIN state
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [otpStep, setOtpStep] = useState<'otp' | 'new_pin'>('otp');
  const [otp, setOtp] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const email = currentUser?.email || authService.getUserEmail();

  // Handle number input
  const handleDigit = (digit: string) => {
    setErrorMessage('');
    if (isForgotMode) {
      if (otpStep === 'otp') {
        if (otp.length < 4) setOtp(prev => prev + digit);
      } else {
        if (newPin.length < 6) {
          setNewPin(prev => prev + digit);
        } else if (confirmNewPin.length < 6) {
          setConfirmNewPin(prev => prev + digit);
        }
      }
      return;
    }

    if (pin.length < 6) {
      const next = pin + digit;
      setPin(next);
      if (next.length === 6) {
        // Auto trigger unlock when 6 digits are reached
        setTimeout(() => {
          verifyAndUnlock(next);
        }, 150);
      }
    }
  };

  const handleBackspace = () => {
    setErrorMessage('');
    if (isForgotMode) {
      if (otpStep === 'otp') {
        setOtp(prev => prev.slice(0, -1));
      } else {
        if (confirmNewPin.length > 0) {
          setConfirmNewPin(prev => prev.slice(0, -1));
        } else {
          setNewPin(prev => prev.slice(0, -1));
        }
      }
      return;
    }
    setPin(prev => prev.slice(0, -1));
  };

  // Keyboard listener
  useEffect(() => {
    if (!isPinLocked) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Enter' && pin.length === 6 && !isForgotMode) {
        verifyAndUnlock(pin);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPinLocked, pin, isForgotMode, otpStep, otp, newPin, confirmNewPin]);

  if (!isPinLocked) return null;

  const verifyAndUnlock = (inputPin: string) => {
    setIsVerifying(true);
    setErrorMessage('');

    if (unlockWithPin(inputPin)) {
      toast.success('App unlocked successfully');
      setPin('');
      setErrorMessage('');
      setIsVerifying(false);
    } else {
      setErrorMessage('Incorrect PIN. Please try again.');
      setPin('');
      setIsVerifying(false);
    }
  };

  // Start Forgot PIN flow
  const handleStartForgot = async () => {
    if (!email) {
      toast.error('No email address found. Please login again.');
      logout();
      return;
    }
    try {
      setIsSendingOtp(true);
      setErrorMessage('');
      await authService.sendOtp(email, 'pin_reset');
      setIsForgotMode(true);
      setOtpStep('otp');
      setOtp('');
      setNewPin('');
      setConfirmNewPin('');
      toast.info(`Verification code sent to ${email}`);
    } catch (err: any) {
      toast.error(err.message || 'Unable to send OTP. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Verify Reset OTP
  const handleVerifyResetOtp = async () => {
    if (otp.length !== 4) {
      setErrorMessage('Please enter the 4-digit OTP');
      return;
    }
    try {
      setIsResetting(true);
      setErrorMessage('');
      await verifyOtp(email, otp);
      setOtpStep('new_pin');
      toast.success('OTP verified! Please enter your new 6-digit PIN.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid OTP code');
      toast.error(err.message || 'Invalid OTP code');
    } finally {
      setIsResetting(false);
    }
  };

  // Save New PIN after OTP
  const handleSaveNewPin = async () => {
    if (newPin.length !== 6) {
      setErrorMessage('New PIN must be exactly 6 digits');
      return;
    }
    if (newPin !== confirmNewPin) {
      setErrorMessage('PINs do not match');
      return;
    }

    try {
      setIsResetting(true);
      await profileService.updateProfile({
        pin: newPin,
        isPinEnabled: true,
      }, email);
      await userService.updateUserPin(email, newPin);
      await userService.updateLastLogin(email);

      sessionStorage.setItem('sauda_pin_unlocked', 'true');
      await refreshAppContext();

      toast.success('PIN reset successfully! App unlocked.');
      setIsForgotMode(false);
      setPin('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update PIN');
    } finally {
      setIsResetting(false);
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/45 dark:bg-black/55 backdrop-blur-[3px] select-none"
      
    >
      <div className="w-full max-w-sm bg-[#E8EDF3] dark:bg-[#20242D] rounded-3xl p-6 sm:p-8 neu-raised border border-[#D5DDE7] dark:border-white/5 flex flex-col items-center text-center animate-in zoom-in-95 space-y-5">
        
        {/* Lock Header Icon */}
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center neu-raised-sm bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          {isForgotMode ? <ShieldAlert className="w-8 h-8 stroke-[2.2]" /> : <Lock className="w-8 h-8 stroke-[2.2]" />}
        </div>

        {/* Normal PIN Mode */}
        {!isForgotMode ? (
          <>
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                App Passcode Lock
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Welcome back, enter your 6-digit PIN to continue.
              </p>
              {email && (
                <div className="inline-block mt-1 px-3 py-1 rounded-full neu-inset-sm text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  {email}
                </div>
              )}
            </div>

            {/* 6 Digit Circles */}
            <div className="flex items-center justify-center gap-2.5 sm:gap-3 py-2">
              {Array.from({ length: 6 }).map((_, idx) => {
                const isFilled = idx < pin.length;
                const isCurrent = idx === pin.length;

                return (
                  <div
                    key={idx}
                    className={`w-10 h-12 sm:w-11 sm:h-13 rounded-2xl flex items-center justify-center font-black text-xl transition-all duration-150 ${
                      isFilled
                        ? 'neu-raised-sm text-blue-600 dark:text-blue-400 bg-white dark:bg-[#282D37] border border-blue-500/30'
                        : isCurrent
                        ? 'neu-inset-sm border-2 border-blue-500/60'
                        : 'neu-inset-sm text-slate-400 dark:text-slate-600'
                    }`}
                  >
                    {isFilled ? '●' : ''}
                  </div>
                );
              })}
            </div>

            <FieldError error={errorMessage} className="justify-center text-xs" />

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full max-w-[280px]">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleDigit(num)}
                  className="h-12 rounded-2xl neu-raised font-black text-lg text-slate-800 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 active:scale-95 transition-all cursor-pointer border border-white/60 dark:border-white/5"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPin('')}
                className="h-12 rounded-2xl neu-raised text-xs font-bold text-slate-500 hover:text-red-500 active:scale-95 transition-all cursor-pointer border border-white/60 dark:border-white/5"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => handleDigit('0')}
                className="h-12 rounded-2xl neu-raised font-black text-lg text-slate-800 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 active:scale-95 transition-all cursor-pointer border border-white/60 dark:border-white/5"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                aria-label="Backspace"
                className="h-12 rounded-2xl neu-raised flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-amber-500 active:scale-95 transition-all cursor-pointer border border-white/60 dark:border-white/5"
              >
                <Delete className="w-5 h-5 stroke-[2.2]" />
              </button>
            </div>

            {/* Bottom Action: Forgot PIN */}
            <div className="w-full flex items-center justify-center pt-2 text-xs font-bold text-slate-500 dark:text-slate-400 border-t border-black/[0.04] dark:border-white/5">
              <button
                type="button"
                disabled={isSendingOtp}
                onClick={handleStartForgot}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer py-1 px-3 rounded-xl neu-raised-sm"
              >
                {isSendingOtp ? 'Sending OTP...' : 'Forgot PIN?'}
              </button>
            </div>
          </>
        ) : (
          /* Forgot PIN OTP & Reset View */
          <div className="w-full space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {otpStep === 'otp' ? 'Reset PIN via OTP' : 'Set New 6-Digit PIN'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {otpStep === 'otp' 
                  ? `Enter the 4-digit code sent to ${email}`
                  : 'Enter your new 6-digit passcode'}
              </p>
            </div>

            {otpStep === 'otp' ? (
              <div className="space-y-3">
                <input
                  type="text"
                  maxLength={4}
                  value={otp}
                  onChange={e => {
                    setOtp(e.target.value.replace(/\D/g, ''));
                    setErrorMessage('');
                  }}
                  placeholder="Enter 4-digit OTP"
                  autoFocus
                  className="w-full py-3 px-4 text-center tracking-[0.5em] text-2xl font-bold neu-input"
                />
                <FieldError error={errorMessage} className="justify-center text-xs" />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotMode(false);
                      setErrorMessage('');
                    }}
                    className="flex-1 py-3 px-3 rounded-2xl neu-raised text-xs font-bold text-slate-600 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={otp.length !== 4 || isResetting}
                    onClick={handleVerifyResetOtp}
                    className="flex-1 py-3 px-3 rounded-2xl neu-button-primary text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <span>{isResetting ? 'Verifying...' : 'Verify OTP'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="password"
                  maxLength={6}
                  value={newPin}
                  onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="New 6-Digit PIN"
                  className="w-full py-3 px-4 text-center tracking-[0.4em] text-xl font-bold neu-input"
                />
                <input
                  type="password"
                  maxLength={6}
                  value={confirmNewPin}
                  onChange={e => setConfirmNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="Confirm New PIN"
                  className="w-full py-3 px-4 text-center tracking-[0.4em] text-xl font-bold neu-input"
                />
                <FieldError error={errorMessage} className="justify-center text-xs" />

                <button
                  type="button"
                  disabled={newPin.length !== 6 || confirmNewPin.length !== 6 || isResetting}
                  onClick={handleSaveNewPin}
                  className="w-full py-3 px-4 rounded-2xl neu-button-primary font-bold text-sm flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isResetting ? 'Saving PIN...' : 'Save & Unlock'}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  , document.body);
};
