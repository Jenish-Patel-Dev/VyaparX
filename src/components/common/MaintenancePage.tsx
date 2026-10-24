import React, { useState } from 'react';
import {
  Wrench,
  ShieldCheck,
  RefreshCw,
  Mail,
  Clock,
  Sparkles,
} from 'lucide-react';
import type { MaintenanceConfig } from '../../services/adminService';

interface MaintenancePageProps {
  config?: MaintenanceConfig | null;
  onRefreshCheck?: () => void;
}

export const MaintenancePage: React.FC<MaintenancePageProps> = ({ config, onRefreshCheck }) => {
  const [isChecking, setIsChecking] = useState(false);
  const [checkedMessage, setCheckedMessage] = useState<string | null>(null);

  const handleManualCheck = () => {
    setIsChecking(true);
    setCheckedMessage(null);
    if (onRefreshCheck) onRefreshCheck();

    setTimeout(() => {
      setIsChecking(false);
      setCheckedMessage('System upgrade is in progress. Normal access will be restored shortly.');
      setTimeout(() => setCheckedMessage(null), 4500);
    }, 1200);
  };

  const title = config?.title || 'System Under Scheduled Maintenance';
  const message =
    config?.message ||
    'We are currently performing essential platform upgrades and optimizations to deliver a faster, safer, and more reliable Mandi trading experience.';
  const estimatedEndTime = config?.estimatedEndTime || '';
  const supportEmail = config?.supportEmail || 'jenishpatel.dev7@gmail.com';

  return (
    <div className="min-h-screen bg-[#E8EDF3] dark:bg-[#161922] text-slate-800 dark:text-slate-100 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none transition-colors duration-300">
      {/* Ambient Lighting Spheres */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-amber-500/10 via-blue-500/10 to-indigo-500/10 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 dark:bg-amber-400/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Main Centered Floating Card */}
      <main className="max-w-lg sm:max-w-xl w-full mx-auto relative z-10 py-4">
        <div className="neu-raised bg-[#F2F5F9] dark:bg-[#222733] border border-white/80 dark:border-white/10 rounded-3xl sm:rounded-[32px] p-6 sm:p-8 shadow-2xl dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] relative overflow-hidden animate-fade-in space-y-6">
          {/* Subtle Top Accent Glow Line */}
          <div className="absolute inset-x-0 top-0 h-[2.5px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

          {/* Top Header: Brand Logo & Live Status */}
          <div className="flex items-center justify-between pb-4 border-b border-black/[0.06] dark:border-white/[0.08]">
            <div className="flex items-center gap-2">
              <img
                src="/logo-name.png"
                alt="VyaparX"
                className="h-8 sm:h-9 w-auto object-contain dark:hidden drop-shadow-sm"
              />
              <img
                src="/logo-name-dark.png"
                alt="VyaparX"
                className="h-8 sm:h-9 w-auto object-contain hidden dark:block drop-shadow-sm"
              />
            </div>

            {/* Live Pulsing Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full neu-inset bg-[#E8EDF3] dark:bg-[#1A1E27] border border-black/5 dark:border-white/10 text-xs font-bold text-amber-600 dark:text-amber-400 shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider">
                Maintenance Mode
              </span>
            </div>
          </div>

          {/* Center Hero Icon */}
          <div className="pt-1 flex flex-col items-center">
            <div className="relative w-22 h-22 flex items-center justify-center">
              {/* Outer rotating dashed ring */}
              <div
                className="absolute -inset-2.5 rounded-full border-2 border-dashed border-amber-500/35 dark:border-amber-400/30 animate-spin"
                style={{ animationDuration: '24s' }}
              />
              {/* Pulsing ambient glow */}
              <div className="absolute inset-0 rounded-full bg-amber-500/15 dark:bg-amber-400/15 blur-lg animate-pulse" />

              {/* Central Neumorphic Sphere */}
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl neu-raised bg-[#E8EDF3] dark:bg-[#1D212B] border border-white/90 dark:border-white/15 flex items-center justify-center shadow-neu-raised-sm relative z-10 group">
                <Wrench className="w-8 h-8 text-amber-500 dark:text-amber-400 transition-transform duration-300 group-hover:rotate-45 drop-shadow-[0_2px_10px_rgba(245,158,11,0.35)]" />
              </div>
            </div>
          </div>

          {/* Title & Description */}
          <div className="text-center space-y-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-md mx-auto">
              {message}
            </p>
          </div>

          {/* Safe Data Guarantee Card (Hindi + English) */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-emerald-500/[0.08] dark:bg-emerald-500/[0.07] border border-emerald-500/20 text-left flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 dark:bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                सौदे एवं डेटा पूरी तरह सुरक्षित हैं
              </p>
              <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 font-medium leading-tight pt-0.5">
                All trade entries, ledgers & account records remain 100% encrypted & backed up.
              </p>
            </div>
          </div>

          {/* Status & ETA Block */}
          <div className="space-y-2.5">
            {estimatedEndTime && (
              <div className="p-3 sm:p-3.5 rounded-2xl neu-inset bg-[#E8EDF3] dark:bg-[#1A1E27] border border-black/5 dark:border-white/[0.07] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/15 dark:bg-blue-400/20 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-[9px] uppercase font-black tracking-wider text-slate-400 dark:text-slate-500">
                      Estimated Return Time
                    </p>
                    <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                      {estimatedEndTime}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
                  Target
                </span>
              </div>
            )}

            {/* Real-time Reconnect Box */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-[#E8EDF3] dark:bg-[#1A1E27] border border-white/60 dark:border-white/[0.07] flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5 text-left min-w-0">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    Real-Time Auto Reconnect
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    App will automatically unlock when maintenance concludes
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleManualCheck}
                disabled={isChecking}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl neu-raised-sm bg-[#F0F3F8] dark:bg-[#272D3A] text-blue-600 dark:text-blue-400 border border-white/80 dark:border-white/10 text-xs font-extrabold hover:shadow-neu-raised active:shadow-neu-pressed transition-all disabled:opacity-50 cursor-pointer shrink-0"
                title="Check if maintenance has ended"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                <span>{isChecking ? 'Checking...' : 'Check Status'}</span>
              </button>
            </div>
          </div>

          {/* Feedback message on manual check */}
          {checkedMessage && (
            <div className="text-xs font-bold text-amber-600 dark:text-amber-400 text-center animate-fade-in">
              {checkedMessage}
            </div>
          )}

          {/* Urgent Support / Email Contact */}
          <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="text-center sm:text-left">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Urgent Support
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Technical queries or assistance
              </p>
            </div>

            <a
              href={`mailto:${supportEmail}`}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#1D212B] border border-white/80 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-all font-mono font-bold text-xs shadow-2xs hover:shadow-neu-raised active:shadow-neu-pressed group"
            >
              <Mail className="w-3.5 h-3.5 text-blue-500 group-hover:scale-110 transition-transform shrink-0" />
              <span className="truncate max-w-[200px]">{supportEmail}</span>
            </a>
          </div>

          {/* Developed & Designed Credit Inside Card */}
          <div className="pt-1 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wide">
            <Sparkles className="w-3 h-3 text-amber-500/70 shrink-0" />
            <span>Develop and Design by</span>
            <span className="font-bold text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md bg-black/[0.03] dark:bg-white/[0.05] border border-black/5 dark:border-white/10">
              Jenish Khambhaliya
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};
