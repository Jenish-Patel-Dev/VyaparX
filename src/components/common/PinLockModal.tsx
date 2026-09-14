import React, { useState } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { FieldError } from './FieldError';

export const PinLockModal: React.FC = () => {
  const { isPinLocked, unlockWithPin, userProfile } = useApp();
  const { palette } = useTheme();
  const [pin, setPin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const toast = useToast();

  if (!isPinLocked) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      setErrorMessage('Please enter your PIN');
      return;
    }
    if (pin.length < 4) {
      setErrorMessage('PIN must be at least 4 digits');
      return;
    }

    if (unlockWithPin(pin)) {
      toast.success('App unlocked successfully');
      setPin('');
      setErrorMessage('');
    } else {
      setErrorMessage('Incorrect PIN. Please try again.');
      toast.error('Incorrect PIN. Please try again.');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xl"
      style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
    >
      <div className="w-full max-w-sm bg-white/95 dark:bg-[#111827]/95 backdrop-blur-3xl rounded-3xl p-8 shadow-glass-hover flex flex-col items-center text-center animate-in zoom-in-95 border border-[#DCE6F2] dark:border-white/15">
        <div 
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-md border border-blue-200/60 dark:border-blue-500/20 bg-[#EFF6FF] dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
        >
          <Lock className="w-8 h-8 stroke-[2.2]" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight mb-1">
          VyaparX Locked
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 font-medium">
          Welcome back {userProfile?.name || 'JENISH'}, enter your security PIN to continue.
        </p>

        <form onSubmit={handleUnlock} noValidate className="w-full space-y-4">
          <div>
            <input
              type="password"
              maxLength={6}
              value={pin}
              onChange={e => {
                setPin(e.target.value);
                setErrorMessage('');
              }}
              placeholder="Enter 4 or 6 digit PIN"
              autoFocus
              className={`w-full py-3 px-4 text-center tracking-[0.5em] text-2xl font-bold bg-gray-50 dark:bg-gray-900 border-2 rounded-2xl focus:outline-none transition-all ${
                errorMessage
                  ? 'border-red-500 bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-300'
                  : 'border-[#DCE6F2] dark:border-gray-700 focus:border-blue-600 text-gray-900 dark:text-gray-100'
              }`}
            />
            <FieldError error={errorMessage} className="justify-center mt-2 text-xs" />
          </div>

          <button
            type="submit"
            className="btn-glass-primary w-full py-3.5 px-4 font-bold rounded-2xl flex items-center justify-center gap-2"
          >
            <Unlock className="w-5 h-5" />
            <span>Unlock Application</span>
          </button>
        </form>
      </div>
    </div>
  );
};
