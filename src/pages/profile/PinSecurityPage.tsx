import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck, KeyRound, Save } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { profileService } from '../../services/profileService';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { FieldError } from '../../components/common/FieldError';
import { validatePin } from '../../utils/validators';

export const PinSecurityPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { userProfile, refreshAppContext, lockApp } = useApp();

  const [pinEnabled, setPinEnabled] = useState(userProfile?.isPinEnabled || false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (pinEnabled) {
      const newErrors: Record<string, string> = {};
      const pinErr = validatePin(newPin, 'New PIN');
      if (pinErr) newErrors.newPin = pinErr;

      if (!confirmPin) {
        newErrors.confirmPin = 'Please confirm your PIN';
      } else if (newPin !== confirmPin) {
        newErrors.confirmPin = 'PIN and Confirm PIN do not match';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
    }

    try {
      setIsSubmitting(true);
      await profileService.updateProfile({
        isPinEnabled: pinEnabled,
        pin: pinEnabled ? newPin : '',
      });
      await refreshAppContext();
      setErrors({});
      toast.success('Security PIN settings updated successfully');
      navigate('/profile');
    } catch (err) {
      toast.error('Failed to update PIN settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-12 transition-colors">
      <PageHeader title="SECURITY & PIN" />

      <div className="p-4 md:p-6 max-w-md mx-auto space-y-5">
        <div className="neu-raised rounded-3xl p-6 space-y-5 border border-white/60 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl neu-raised-sm bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-base">App Passcode Lock</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Protect access to your trade records</p>
            </div>
          </div>

          <form onSubmit={handleSavePin} noValidate className="space-y-4 pt-2">
            <div className="flex items-center justify-between p-3.5 neu-inset-sm rounded-2xl border border-black/[0.04] dark:border-white/5">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Enable PIN Lock</span>
              <input
                type="checkbox"
                checked={pinEnabled}
                onChange={e => {
                  setPinEnabled(e.target.checked);
                  setErrors({});
                }}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
              />
            </div>

            {pinEnabled && (
              <div className="space-y-3 animate-in fade-in">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
                    NEW PIN (4 DIGITS) <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="••••"
                    value={newPin}
                    onChange={e => {
                      setNewPin(e.target.value);
                      clearError('newPin');
                    }}
                    className={`input-sauda text-center tracking-[0.5em] text-xl font-black ${
                      errors.newPin ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''
                    }`}
                  />
                  <FieldError error={errors.newPin} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-1.5">
                    CONFIRM PIN <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="••••"
                    value={confirmPin}
                    onChange={e => {
                      setConfirmPin(e.target.value);
                      clearError('confirmPin');
                    }}
                    className={`input-sauda text-center tracking-[0.5em] text-xl font-black ${
                      errors.confirmPin ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''
                    }`}
                  />
                  <FieldError error={errors.confirmPin} />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="neu-button-primary w-full py-3.5 px-4 font-bold rounded-2xl text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className={`w-4 h-4 stroke-[2.5] ${isSubmitting ? 'animate-spin' : ''}`} />
              <span>{isSubmitting ? 'Saving...' : 'Save PIN Settings'}</span>
            </button>
          </form>

          {userProfile?.isPinEnabled && (
            <button
              type="button"
              onClick={lockApp}
              className="neu-button-secondary w-full py-2.5 px-4 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4 stroke-[2.5]" />
              <span>Lock App Now</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
