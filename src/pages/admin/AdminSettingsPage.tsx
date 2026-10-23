import React, { useEffect, useState } from 'react';
import {
  Settings,
  Database,
  Download,
  KeyRound,
  BellRing,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { adminService, type SystemNotice } from '../../services/adminService';
import { AdminCustomSelect } from '../../components/admin/AdminCustomSelect';

export const AdminSettingsPage: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // System Notice State
  const [notice, setNotice] = useState<SystemNotice>({
    enabled: false,
    message: '',
    type: 'info',
  });
  const [isSavingNotice, setIsSavingNotice] = useState(false);
  const [noticeSuccess, setNoticeSuccess] = useState(false);

  // Admin Passcode State
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState<string | null>(null);
  const [passcodeSuccess, setPasscodeSuccess] = useState(false);
  const [isSavingPasscode, setIsSavingPasscode] = useState(false);

  useEffect(() => {
    adminService.getSystemNotice().then((res) => {
      if (res) setNotice(res);
    });
  }, []);

  const handleExportBackup = async () => {
    try {
      setIsExporting(true);
      const data = await adminService.exportFullDatabase();
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vyaparx_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingNotice(true);
      await adminService.saveSystemNotice(notice);
      setNoticeSuccess(true);
      setTimeout(() => setNoticeSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save notice:', err);
    } finally {
      setIsSavingNotice(false);
    }
  };

  const handleUpdatePasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError(null);

    if (newPasscode.length < 6) {
      setPasscodeError('Passcode must be at least 6 characters.');
      return;
    }

    if (newPasscode !== confirmPasscode) {
      setPasscodeError('Passcodes do not match.');
      return;
    }

    try {
      setIsSavingPasscode(true);
      await adminService.updateAdminPasscode(newPasscode);
      setPasscodeSuccess(true);
      setNewPasscode('');
      setConfirmPasscode('');
      setTimeout(() => setPasscodeSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update passcode:', err);
      setPasscodeError('Failed to save new passcode to Firestore.');
    } finally {
      setIsSavingPasscode(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span>Settings & System Controls</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          System backups, real-time user announcement banners, and admin security credentials.
        </p>
      </div>

      {/* Grid: System Tools & Broadcast Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Cloud Backup & Status */}
        <div className="p-6 rounded-3xl neu-raised bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 shadow-neu-raised-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                System Infrastructure Status
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Core Cloud Engine: <span className="font-semibold text-emerald-600 dark:text-emerald-400">Active & Operational</span>
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-xs space-y-1.5 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Environment:</span>
              <span className="text-slate-700 dark:text-slate-300 font-semibold">Production Enterprise</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Cloud Services:</span>
              <span className="text-slate-700 dark:text-slate-300 font-semibold">VyaparX Realtime Sync</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">System State:</span>
              <span className="text-emerald-500 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Operational
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleExportBackup}
              disabled={isExporting}
              className="w-full py-3 px-4 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-neu-raised-sm active:scale-95 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Creating Snapshot...' : 'Export System Backup (JSON)'}</span>
            </button>
            {exportSuccess && (
              <p className="text-center text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-2 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>System data backup downloaded successfully!</span>
              </p>
            )}
          </div>
        </div>

        {/* Card 2: Platform Broadcast Banner */}
        <div className="p-6 rounded-3xl neu-raised bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 shadow-neu-raised-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Live Broadcast Notice to Users
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Display a global announcement strip across all regular user screens.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveNotice} className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Enable Announcement Banner
              </span>
              <input
                type="checkbox"
                checked={notice.enabled}
                onChange={(e) => setNotice({ ...notice, enabled: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Announcement Message
              </label>
              <input
                type="text"
                value={notice.message}
                onChange={(e) => setNotice({ ...notice, message: e.target.value })}
                placeholder="e.g. Scheduled server maintenance tonight from 11:00 PM to 11:30 PM."
                className="w-full px-3 py-2.5 rounded-xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <div>
              <AdminCustomSelect
                label="Notice Style"
                variant="form"
                value={notice.type}
                onChange={(val) => setNotice({ ...notice, type: val as 'info' | 'warning' | 'alert' })}
                options={[
                  { value: 'info', label: 'Information (Blue)' },
                  { value: 'warning', label: 'Warning / Advisory (Amber)' },
                  { value: 'alert', label: 'Critical Alert (Red)' },
                ]}
              />
            </div>

            <button
              type="submit"
              disabled={isSavingNotice}
              className="w-full py-2.5 px-4 rounded-xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 hover:text-blue-600 dark:hover:text-blue-400 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSavingNotice ? 'Publishing...' : 'Save & Publish Notice'}
            </button>
            {noticeSuccess && (
              <p className="text-center text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                Announcement banner updated successfully!
              </p>
            )}
          </form>
        </div>
      </div>

      {/* Grid: Admin Security & Secret Hotkeys */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 3: Admin Security Passcode */}
        <div className="p-6 rounded-3xl neu-raised bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 shadow-neu-raised-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Change Admin Master Passcode
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Update the master credentials used to unlock the Admin Portal.
              </p>
            </div>
          </div>

          {passcodeError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300 text-xs">
              {passcodeError}
            </div>
          )}

          {passcodeSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Admin passcode updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleUpdatePasscode} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                New Master Passcode / PIN
              </label>
              <input
                type="password"
                required
                value={newPasscode}
                onChange={(e) => setNewPasscode(e.target.value)}
                placeholder="Enter new master passcode or PIN"
                className="w-full px-3 py-2.5 rounded-xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Confirm Passcode
              </label>
              <input
                type="password"
                required
                value={confirmPasscode}
                onChange={(e) => setConfirmPasscode(e.target.value)}
                placeholder="Re-enter passcode"
                className="w-full px-3 py-2.5 rounded-xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isSavingPasscode}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-neu-raised-sm active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSavingPasscode ? 'Updating...' : 'Update Master Passcode'}
            </button>
          </form>
        </div>

        {/* Card 4: How Admin Panel Opens (Access Guide) */}
        <div className="p-6 rounded-3xl neu-raised bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 shadow-neu-raised-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                How to Open Admin Panel (Secret Access)
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Keeps regular users completely unaware of administrative access.
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 space-y-1">
              <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>Method 1: Direct URL</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400">
                Navigate directly in your browser to:
              </p>
              <p className="font-mono text-blue-600 dark:text-blue-400 font-bold neu-raised-sm bg-[#F0F3F8] dark:bg-[#262B36] p-2 rounded-xl border border-white/80 dark:border-white/10 select-all">
                https://yourdomain.com/admin
              </p>
            </div>

            <div className="p-3.5 rounded-2xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 space-y-1">
              <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Method 2: Secret Keyboard Hotkey</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400">
                Press this key combination anywhere on your keyboard:
              </p>
              <div className="flex items-center gap-1.5 pt-1">
                <kbd className="px-2.5 py-1 rounded-lg neu-raised-sm bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 font-mono font-bold text-slate-800 dark:text-slate-200 text-xs">
                  Ctrl
                </kbd>
                <span>+</span>
                <kbd className="px-2.5 py-1 rounded-lg neu-raised-sm bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 font-mono font-bold text-slate-800 dark:text-slate-200 text-xs">
                  Alt
                </kbd>
                <span>+</span>
                <kbd className="px-2.5 py-1 rounded-lg neu-raised-sm bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 font-mono font-bold text-slate-800 dark:text-slate-200 text-xs">
                  A
                </kbd>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 space-y-1">
              <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Method 3: Secret 5-Click Trigger</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400">
                Clicking the version badge <span className="font-mono font-bold text-slate-700 dark:text-slate-300">"v1.0.0"</span> in Settings 5 times will immediately open the Admin Gateway.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
