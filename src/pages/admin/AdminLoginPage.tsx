import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import {
  KeyRound,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  Sun,
  Moon,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useTheme } from '../../context/ThemeContext';

export const AdminLoginPage: React.FC = () => {
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { loginAdmin } = useAdminAuth();
  const { isDarkMode, setDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setError('Please enter the Admin Master Passcode or Security PIN.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const res = await loginAdmin(passcode);
    setIsSubmitting(false);

    if (res.success) {
      navigate('/admin/dashboard', { replace: true });
    } else {
      setError(res.message || 'Access Denied: Invalid Master Credentials.');
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-between p-4 sm:p-6 bg-[#E8EDF3] dark:bg-[#20242D] text-[#263244] dark:text-[#F0F3F8] relative overflow-hidden font-sans select-none transition-colors">
      {/* Ambient background lighting */}
      <div className="absolute -top-28 -left-28 w-80 h-80 rounded-full bg-blue-500/5 dark:bg-blue-400/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-28 w-96 h-96 rounded-full bg-indigo-500/5 dark:bg-indigo-400/5 blur-3xl pointer-events-none" />

      {/* Top Header / Mode Switcher */}
      <div className="w-full flex items-center justify-end gap-2 relative z-10 shrink-0 max-w-md">
        <button
          type="button"
          onClick={() => setDarkMode(!isDarkMode)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full neu-raised-sm bg-[#E8EDF3] dark:bg-[#262B36] text-slate-700 dark:text-slate-200 text-xs font-bold transition-all active:scale-95 cursor-pointer border border-white/60 dark:border-white/5"
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
      </div>

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-md my-auto">
        <div className="neu-raised bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-neu-raised">
          {/* Header Brand Logo */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-2xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#262B36] border border-white/80 dark:border-white/10 shadow-neu-raised-sm mb-3 flex items-center justify-center p-2.5">
              <img
                src="/logo.png"
                alt="VyaparX Logo"
                className="w-12 h-12 object-contain"
              />
            </div>

            {/* Brand Name Logo matching theme */}
            <img
              src={isDarkMode ? '/logo-name-dark.png' : '/logo-name.png'}
              alt="VyaparX"
              className="h-9 w-auto object-contain mb-2"
            />

            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/25">
                Administration Portal
              </span>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-start gap-2 animate-shake">
              <Lock className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Admin Master Passcode / PIN
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter admin passcode or 6-digit PIN"
                  autoFocus
                  className="w-full pl-10 pr-12 py-3 rounded-2xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-sm font-mono tracking-wide focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm shadow-neu-raised-sm active:scale-95 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Unlock Admin Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Access Info */}
          <div className="mt-5 pt-4 border-t border-black/5 dark:border-white/10">
            <div className="p-3 rounded-2xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-slate-500 dark:text-slate-400 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Default Master Passcode:</span>
              </div>
              <p className="font-mono text-blue-600 dark:text-blue-400 font-bold text-xs select-all neu-raised-sm bg-[#F0F3F8] dark:bg-[#262B36] px-2 py-1 rounded-xl border border-white/80 dark:border-white/10">
                Admin@VyaparX2026
              </p>
              <p className="text-[10px] text-slate-400 pt-0.5">
                Or Master PIN: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">987654</span>
              </p>
            </div>
          </div>

          {/* Back link */}
          <div className="mt-5 text-center">
            <NavLink
              to="/home"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Client Website</span>
            </NavLink>
          </div>
        </div>
      </div>

      <div className="shrink-0 text-center text-[10px] text-slate-400 py-1">
        VyaparX Secure Administrative Gateway
      </div>
    </div>
  );
};