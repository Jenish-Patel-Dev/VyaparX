import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck, KeyRound, Save, RotateCcw, CheckCircle2, ArrowRight, X } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { profileService } from '../../services/profileService';
import { userService } from '../../services/userService';
import { authService } from '../../services/authService';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { FieldError } from '../../components/common/FieldError';
import { validatePin } from '../../utils/validators';

export const PinSecurityPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { currentUser, verifyOtp } = useAuth();
  const { userProfile, refreshAppContext, lockApp } = useApp();

  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Forgot PIN Flow states (matches lock screen modal)
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [otpStep, setOtpStep] = useState<'otp' | 'new_pin'>('otp');
  const [otp, setOtp] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [forgotError, setForgotError] = useState('');

  const email = currentUser?.email || authService.getUserEmail();
  const hasExistingPin = Boolean(userProfile?.pin && userProfile.pin.length === 6);

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Normal Save PIN handler (when user knows current PIN)
  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (hasExistingPin) {
      if (!currentPin) {
        newErrors.currentPin = 'Please enter your current 6-digit PIN';
      } else if (currentPin !== userProfile?.pin) {
        newErrors.currentPin = 'Current PIN is incorrect';
      }
    }

    const pinErr = validatePin(newPin);
    if (pinErr) newErrors.newPin = pinErr;

    if (!confirmPin) {
      newErrors.confirmPin = 'Please confirm your 6-digit PIN';
    } else if (newPin !== confirmPin) {
      newErrors.confirmPin = 'PIN and Confirm PIN do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      await profileService.updateProfile({
        isPinEnabled: true,
        pin: newPin,
      }, email);
      await userService.updateUserPin(email, newPin);
      await userService.updateLastLogin(email);

      sessionStorage.setItem('sauda_pin_unlocked', 'true');
      await refreshAppContext();
      setErrors({});
      toast.success('6-Digit Security PIN updated successfully!');
      navigate('/profile');
    } catch (err: any) {
      toast.error('Failed to update PIN settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Start Forgot PIN flow -> sends OTP
  const handleStartForgot = async () => {
    if (!email) {
      toast.error('No email address found.');
      return;
    }
    try {
      setIsSendingOtp(true);
      setForgotError('');
      await authService.sendOtp(email, 'pin_reset');
      setIsForgotMode(true);
      setOtpStep('otp');
      setOtp('');
      setNewPin('');
      setConfirmPin('');
      toast.info(`Verification code sent to ${email}`);
    } catch (err: any) {
      toast.error(err.message || 'Unable to send OTP. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Verify OTP in Forgot PIN flow
  const handleVerifyForgotOtp = async () => {
    if (otp.length !== 4) {
      setForgotError('Please enter the 4-digit OTP code');
      return;
    }
    try {
      setIsResetting(true);
      setForgotError('');
      await verifyOtp(email, otp);
      setOtpStep('new_pin');
      toast.success('OTP verified! Please set your new 6-digit PIN.');
    } catch (err: any) {
      setForgotError(err.message || 'Invalid OTP code');
      toast.error(err.message || 'Invalid OTP code');
    } finally {
      setIsResetting(false);
    }
  };

  // Save new PIN after OTP verification
  const handleSaveForgotNewPin = async () => {
    if (newPin.length !== 6) {
      setForgotError('New PIN must be exactly 6 digits');
      return;
    }
    if (newPin !== confirmPin) {
      setForgotError('PINs do not match');
      return;
    }

    try {
      setIsResetting(true);
      setForgotError('');
      await profileService.updateProfile({
        pin: newPin,
        isPinEnabled: true,
      }, email);
      await userService.updateUserPin(email, newPin);
      await userService.updateLastLogin(email);

      sessionStorage.setItem('sauda_pin_unlocked', 'true');
      await refreshAppContext();

      toast.success('6-Digit Security PIN reset successfully!');
      setIsForgotMode(false);
      setNewPin('');
      setConfirmPin('');
      setCurrentPin('');
      navigate('/profile');
    } catch (err: any) {
      setForgotError(err.message || 'Failed to update PIN');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-12 transition-colors">
      <PageHeader title="SECURITY & PIN" />

      <div className="p-4 md:p-6 max-w-md mx-auto space-y-5">
        <div className="neu-raised rounded-3xl p-6 space-y-5 border border-white/60 dark:border-white/5">
          {/* Main Card Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl neu-raised-sm bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base">
                {isForgotMode 
                  ? (otpStep === 'otp' ? 'Reset PIN via OTP' : 'Set New 6-Digit PIN')
                  : 'App Passcode Lock'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isForgotMode
                  ? (otpStep === 'otp' ? `Enter the 4-digit code sent to ${email}` : 'Enter and confirm your new 6-digit passcode')
                  : '6-Digit security PIN protects your trading data'}
              </p>
            </div>
          </div>

          {!isForgotMode ? (
            /* Normal Mode: Enter current PIN and new PIN */
            <form onSubmit={handleSavePin} noValidate className="space-y-4 pt-1">
              {hasExistingPin && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                      CURRENT 6-DIGIT PIN <span className="text-red-500 font-bold">*</span>
                    </label>
                    <button
                      type="button"
                      disabled={isSendingOtp}
                      onClick={handleStartForgot}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer disabled:opacity-50"
                    >
                      {isSendingOtp ? 'Sending OTP...' : 'Forgot PIN?'}
                    </button>
                  </div>
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="••••••"
                    value={currentPin}
                    onChange={e => {
                      setCurrentPin(e.target.value.replace(/\D/g, ''));
                      clearError('currentPin');
                    }}
                    className={`input-sauda text-center tracking-[0.4em] text-lg font-black ${
                      errors.currentPin ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''
                    }`}
                  />
                  <FieldError error={errors.currentPin} />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
                  NEW 6-DIGIT PIN <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="password"
                  maxLength={6}
                  placeholder="••••••"
                  value={newPin}
                  onChange={e => {
                    setNewPin(e.target.value.replace(/\D/g, ''));
                    clearError('newPin');
                  }}
                  className={`input-sauda text-center tracking-[0.4em] text-lg font-black ${
                    errors.newPin ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''
                  }`}
                />
                <FieldError error={errors.newPin} />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
                  CONFIRM 6-DIGIT PIN <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="password"
                  maxLength={6}
                  placeholder="••••••"
                  value={confirmPin}
                  onChange={e => {
                    setConfirmPin(e.target.value.replace(/\D/g, ''));
                    clearError('confirmPin');
                  }}
                  className={`input-sauda text-center tracking-[0.4em] text-lg font-black ${
                    errors.confirmPin ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''
                  }`}
                />
                <FieldError error={errors.confirmPin} />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="neu-button-primary w-full py-3.5 px-4 font-bold rounded-2xl text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className={`w-4 h-4 stroke-[2.5] ${isSubmitting ? 'animate-spin' : ''}`} />
                <span>{isSubmitting ? 'Saving...' : 'Save 6-Digit PIN'}</span>
              </button>

              {hasExistingPin && (
                <button
                  type="button"
                  onClick={lockApp}
                  className="neu-button-secondary w-full py-2.5 px-4 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4 stroke-[2.5]" />
                  <span>Lock App Screen Now</span>
                </button>
              )}
            </form>
          ) : (
            /* Forgot PIN View: Step 1 (OTP) or Step 2 (New PIN) matching Lock Screen Modal */
            <div className="space-y-4 pt-1">
              {otpStep === 'otp' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-2 text-center">
                      ENTER 4-DIGIT OTP
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={otp}
                      onChange={e => {
                        setOtp(e.target.value.replace(/\D/g, ''));
                        setForgotError('');
                      }}
                      placeholder="••••"
                      autoFocus
                      className="w-full py-3 px-4 text-center tracking-[0.6em] text-2xl font-black input-sauda"
                    />
                    <FieldError error={forgotError} className="justify-center text-xs mt-1.5" />
                  </div>

                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotMode(false);
                        setForgotError('');
                      }}
                      className="flex-1 py-3 px-3 rounded-2xl neu-button-secondary text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={otp.length !== 4 || isResetting}
                      onClick={handleVerifyForgotOtp}
                      className="flex-1 py-3 px-3 rounded-2xl neu-button-primary text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <span>{isResetting ? 'Verifying...' : 'Verify OTP'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
                      NEW 6-DIGIT PIN <span className="text-red-500 font-bold">*</span>
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      value={newPin}
                      onChange={e => {
                        setNewPin(e.target.value.replace(/\D/g, ''));
                        setForgotError('');
                      }}
                      placeholder="••••••"
                      autoFocus
                      className="input-sauda text-center tracking-[0.4em] text-lg font-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
                      CONFIRM NEW 6-DIGIT PIN <span className="text-red-500 font-bold">*</span>
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      value={confirmPin}
                      onChange={e => {
                        setConfirmPin(e.target.value.replace(/\D/g, ''));
                        setForgotError('');
                      }}
                      placeholder="••••••"
                      className="input-sauda text-center tracking-[0.4em] text-lg font-black"
                    />
                  </div>

                  <FieldError error={forgotError} className="justify-center text-xs" />

                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotMode(false);
                        setForgotError('');
                      }}
                      className="flex-1 py-3 px-3 rounded-2xl neu-button-secondary text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={newPin.length !== 6 || confirmPin.length !== 6 || isResetting}
                      onClick={handleSaveForgotNewPin}
                      className="flex-1 py-3 px-3 rounded-2xl neu-button-primary font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isResetting ? 'Saving PIN...' : 'Save & Update'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
