import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Wrench,
  AlertTriangle,
  X,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Mail,
  Type,
  FileText,
} from 'lucide-react';
import { adminService, type MaintenanceConfig } from '../../services/adminService';
import { GlassDateTimePicker } from '../common/GlassDateTimePicker';

interface AdminMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (isEnabled: boolean) => void;
}

export const AdminMaintenanceModal: React.FC<AdminMaintenanceModalProps> = ({
  isOpen,
  onClose,
  onStatusChange,
}) => {
  const [config, setConfig] = useState<MaintenanceConfig>({
    isEnabled: false,
    title: 'System Under Scheduled Maintenance',
    message:
      'We are currently performing essential platform upgrades and optimizations. Normal client access will be restored shortly.',
    estimatedEndTime: '',
    supportEmail: 'jenishpatel.dev7@gmail.com',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setSuccessMsg(null);
      adminService.getMaintenanceConfig().then((data) => {
        if (data) {
          setConfig({
            ...data,
            supportEmail: data.supportEmail || 'jenishpatel.dev7@gmail.com',
          });
        }
        setIsLoading(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggle = async (targetState: boolean) => {
    try {
      setIsSubmitting(true);
      await adminService.toggleMaintenanceMode(
        targetState,
        config.message,
        config.estimatedEndTime
      );
      setConfig((prev) => ({ ...prev, isEnabled: targetState }));
      if (onStatusChange) onStatusChange(targetState);
      setSuccessMsg(
        targetState
          ? 'Maintenance Mode ACTIVATED! Regular users now see the Maintenance Screen.'
          : 'Maintenance Mode TURNED OFF! User portal access is restored.'
      );
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to toggle maintenance mode:', err);
      alert('Failed to update maintenance settings.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await adminService.setMaintenanceConfig(config);
      setSuccessMsg('Maintenance details updated successfully!');
      setTimeout(() => setSuccessMsg(null), 2000);
    } catch (err) {
      console.error('Failed to save maintenance details:', err);
      alert('Failed to save details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/45 dark:bg-black/55 backdrop-blur-[3px] overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-lg neu-raised bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 rounded-3xl p-6 sm:p-7 shadow-neu-raised-lg space-y-5 animate-in zoom-in-95 text-slate-900 dark:text-slate-100 my-auto"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center border shadow-neu-raised-sm ${
                config.isEnabled
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
              }`}
            >
              {config.isEnabled ? (
                <Wrench className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
              ) : (
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
              )}
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">
                System Maintenance Control
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                1-Click lockdown for user module during maintenance
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Status Box (Neumorphic Card) */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            config.isEnabled
              ? 'bg-amber-500/15 border-amber-500/30'
              : 'bg-emerald-500/10 border-emerald-500/20'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
            <div className="flex items-start gap-3">
              <div
                className={`w-3.5 h-3.5 rounded-full mt-1 shrink-0 ${
                  config.isEnabled ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'
                }`}
              />
              <div>
                <p className="text-xs font-black tracking-wide text-slate-900 dark:text-slate-100">
                  {config.isEnabled
                    ? 'MAINTENANCE MODE ACTIVE'
                    : 'ALL USER SERVICES NORMAL'}
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium mt-0.5 leading-relaxed">
                  {config.isEnabled
                    ? 'Regular users are locked out and currently viewing the Maintenance Screen.'
                    : 'Users can freely login, view and create Sauda trades.'}
                </p>
              </div>
            </div>

            {/* 1-Click Action Button */}
            {config.isEnabled ? (
              <button
                type="button"
                onClick={() => handleToggle(false)}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed transition-all disabled:opacity-50 cursor-pointer shrink-0 whitespace-nowrap text-center"
              >
                Turn OFF (Restore Users)
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleToggle(true)}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed transition-all disabled:opacity-50 cursor-pointer shrink-0 whitespace-nowrap text-center"
              >
                Turn ON Maintenance
              </button>
            )}
          </div>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Maintenance Configuration Form */}
        <form onSubmit={handleSaveDetails} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-blue-500" />
              <span>Screen Heading / Title</span>
            </label>
            <input
              type="text"
              value={config.title || ''}
              onChange={(e) => setConfig({ ...config, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. System Under Scheduled Maintenance"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-500" />
              <span>Custom Message for Users</span>
            </label>
            <textarea
              rows={3}
              value={config.message || ''}
              onChange={(e) => setConfig({ ...config, message: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Explain why the system is under maintenance..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Estimated Return Time</span>
              </label>
              <GlassDateTimePicker
                value={config.estimatedEndTime || ''}
                onChange={(val) => setConfig({ ...config, estimatedEndTime: val })}
                placeholder="Pick Return Date & Time..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-500" />
                <span>Urgent Support Email</span>
              </label>
              <input
                type="email"
                value={config.supportEmail || ''}
                onChange={(e) => setConfig({ ...config, supportEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="jenishpatel.dev7@gmail.com"
              />
            </div>
          </div>

          {/* Full-Width Save Button (Disclaimer line removed as requested) */}
          <div className="pt-3 border-t border-black/[0.06] dark:border-white/10">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-xs shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving Settings...' : 'Save Maintenance Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
