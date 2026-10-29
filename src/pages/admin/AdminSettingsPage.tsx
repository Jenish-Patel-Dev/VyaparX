import React, { useEffect, useState, useMemo } from 'react';
import {
  Settings,
  Zap,
  Plus,
  X,
  CheckCircle2,
  BellRing,
  KeyRound,
  Wrench,
  Download,
  RotateCcw,
  CreditCard,
  Star,
  Sparkles,
  Truck,
  Package,
  FileText,
} from 'lucide-react';
import {
  adminService,
  type SystemNotice,
} from '../../services/adminService';
import { quickValueService } from '../../services/quickValueService';
import type { QuickValue } from '../../types';
import { AdminCustomSelect } from '../../components/admin/AdminCustomSelect';
import { AdminMaintenanceModal } from '../../components/admin/AdminMaintenanceModal';

interface CategoryConfig {
  key: QuickValue['category'];
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  placeholder: string;
}

const CATEGORIES: CategoryConfig[] = [
  {
    key: 'paymentTerms',
    label: 'Payment Terms / Days',
    shortLabel: 'Payment Days',
    icon: <CreditCard className="w-3.5 h-3.5" />,
    placeholder: 'e.g. 15 DAYS, CASH, IMMEDIATE, 30 DAYS, AGAINST DELIVERY',
  },
  {
    key: 'quality',
    label: 'Quality Specifications',
    shortLabel: 'Quality Grades',
    icon: <Star className="w-3.5 h-3.5" />,
    placeholder: 'e.g. SUPER, FIRST GRADE, CHCI, GOOD QUALITY, FAQ, 29MM',
  },
  {
    key: 'rdValue',
    label: 'RD Technical Values',
    shortLabel: 'RD Values',
    icon: <Sparkles className="w-3.5 h-3.5" />,
    placeholder: 'e.g. 20, 22, 25, 28, 30, 32, 35',
  },
  {
    key: 'deliveryTerms',
    label: 'Delivery & Dispatch Terms',
    shortLabel: 'Delivery Terms',
    icon: <Truck className="w-3.5 h-3.5" />,
    placeholder: 'e.g. EX-MILL, FOR DESTINATION, READY, SPOT DELIVERY, LOADED',
  },
  {
    key: 'unit',
    label: 'Standard Units of Measure',
    shortLabel: 'Units',
    icon: <Package className="w-3.5 h-3.5" />,
    placeholder: 'e.g. BALES, QUINTAL, KGS, BAGS, TONS, MOUNDS',
  },
  {
    key: 'remark',
    label: 'Standard Trade Remarks',
    shortLabel: 'Remarks',
    icon: <FileText className="w-3.5 h-3.5" />,
    placeholder: 'e.g. SUBJECT TO APMC CONFIRMATION, PAYMENT BEFORE UNLOADING',
  },
];

const DEFAULT_PRESETS: Record<QuickValue['category'], string[]> = {
  paymentTerms: ['CASH', 'IMMEDIATE', '7 DAYS', '10 DAYS', '15 DAYS', '21 DAYS', '30 DAYS', 'AGAINST DELIVERY'],
  quality: ['SUPER', 'FIRST GRADE', 'CHCI', 'GOOD QUALITY', 'STANDARD', 'FAQ', 'RD-35', 'COTTON BALES 29MM'],
  rdValue: ['20', '22', '24', '26', '28', '30', '32', '35'],
  deliveryTerms: ['EX-MILL', 'FOR DESTINATION', 'READY', 'SPOT DELIVERY', 'LOADED', 'GODOWN DELIVERY'],
  unit: ['BALES', 'QUINTAL', 'KGS', 'BAGS', 'TONS', 'MOUNDS'],
  remark: [
    'SUBJECT TO APMC CONFIRMATION',
    'WEIGHT & QUALITY AT DESTINATION',
    'PAYMENT BEFORE UNLOADING',
    'MILL ARBITRATION FINAL',
  ],
};

export const AdminSettingsPage: React.FC = () => {
  // Database Backup State
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Maintenance Lockdown State
  const [isMaintenanceActive, setIsMaintenanceActive] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);

  // Quick Values State
  const [quickValues, setQuickValues] = useState<QuickValue[]>([]);
  const [activeCategory, setActiveCategory] = useState<QuickValue['category']>('paymentTerms');
  const [quickValueInput, setQuickValueInput] = useState('');
  const [quickValueError, setQuickValueError] = useState<string | null>(null);
  const [quickValueSuccessMsg, setQuickValueSuccessMsg] = useState<string | null>(null);
  const [isAddingQuickValue, setIsAddingQuickValue] = useState(false);
  const [isSeedingPresets, setIsSeedingPresets] = useState(false);

  // System Broadcast Notice State
  const [notice, setNotice] = useState<SystemNotice>({
    enabled: false,
    message: '',
    type: 'info',
  });
  const [isSavingNotice, setIsSavingNotice] = useState(false);
  const [noticeSuccess, setNoticeSuccess] = useState(false);

  // Admin Security Passcode State
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState<string | null>(null);
  const [passcodeSuccess, setPasscodeSuccess] = useState(false);
  const [isSavingPasscode, setIsSavingPasscode] = useState(false);

  const loadQuickValues = async () => {
    try {
      const all = await quickValueService.getAll();
      setQuickValues(all);
    } catch (err) {
      console.error('Failed to load quick values:', err);
    }
  };

  useEffect(() => {
    loadQuickValues();

    adminService.getSystemNotice().then((res) => {
      if (res) setNotice(res);
    });

    adminService.getMaintenanceConfig().then((m) => {
      if (m) setIsMaintenanceActive(m.isEnabled);
    });
  }, []);

  // Quick Values Operations
  const activeCategoryConfig = useMemo(() => {
    return CATEGORIES.find((c) => c.key === activeCategory) || CATEGORIES[0];
  }, [activeCategory]);

  const categoryItems = useMemo(() => {
    return quickValues.filter((q) => q.category === activeCategory);
  }, [quickValues, activeCategory]);

  const handleAddQuickValue = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = quickValueInput.trim().toUpperCase();
    if (!trimmed) {
      setQuickValueError('Please enter a value');
      return;
    }

    const exists = quickValues.some(
      (q) => q.category === activeCategory && q.value.toUpperCase().trim() === trimmed
    );
    if (exists) {
      setQuickValueError('This value already exists in this category');
      return;
    }

    try {
      setIsAddingQuickValue(true);
      await quickValueService.add(activeCategory, trimmed);
      setQuickValueInput('');
      setQuickValueError(null);
      await loadQuickValues();
      setQuickValueSuccessMsg(`Added "${trimmed}" to ${activeCategoryConfig.shortLabel}`);
      setTimeout(() => setQuickValueSuccessMsg(null), 2500);
    } catch (err) {
      console.error('Failed to add quick value:', err);
      setQuickValueError('Failed to save to Firestore');
    } finally {
      setIsAddingQuickValue(false);
    }
  };

  const handleDeleteQuickValue = async (id: number) => {
    try {
      await quickValueService.delete(id);
      await loadQuickValues();
    } catch (err) {
      console.error('Failed to delete quick value:', err);
    }
  };

  const handleSeedPresets = async () => {
    try {
      setIsSeedingPresets(true);
      const presets = DEFAULT_PRESETS[activeCategory];
      const existingValues = new Set(
        quickValues
          .filter((q) => q.category === activeCategory)
          .map((q) => q.value.toLowerCase().trim())
      );

      for (const preset of presets) {
        if (!existingValues.has(preset.toLowerCase().trim())) {
          await quickValueService.add(activeCategory, preset);
        }
      }

      await loadQuickValues();
      setQuickValueSuccessMsg(`Loaded recommended presets for ${activeCategoryConfig.shortLabel}!`);
      setTimeout(() => setQuickValueSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Failed to seed presets:', err);
    } finally {
      setIsSeedingPresets(false);
    }
  };

  // Excel Backup Export
  const handleExportExcelBackup = async () => {
    try {
      setIsExporting(true);
      await adminService.exportDatabaseAsExcel();
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3500);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Notice Save
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

  // Passcode Update
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
    <div className="space-y-6 animate-fade-in w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Settings & Global Controls</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Global quick values shortcuts, live broadcast announcements, and platform security.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportExcelBackup}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-neu-raised-sm active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            title="Download multi-sheet Excel backup"
          >
            <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
            <span>{isExporting ? 'Exporting...' : 'Backup (Excel)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsMaintenanceModalOpen(true)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer shadow-neu-raised-sm active:scale-95 ${
              isMaintenanceActive
                ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-400 animate-pulse'
                : 'bg-[#F0F3F8] dark:bg-[#262B36] border-white/80 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400'
            }`}
            title="Configure maintenance lockdown"
          >
            <Wrench className="w-4 h-4" />
            <span>{isMaintenanceActive ? 'Lockdown Active' : 'Maintenance'}</span>
          </button>
        </div>
      </div>

      {exportSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Multi-sheet Excel backup downloaded successfully (8 complete sheets)!</span>
        </div>
      )}

      {/* SECTION 1: GLOBAL QUICK VALUES & TRADING SHORTCUTS */}
      <div className="p-6 rounded-3xl neu-raised bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 shadow-neu-raised-sm space-y-5 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl neu-raised-sm bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
              <Zap className="w-5 h-5 fill-amber-500/20" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Global Quick Values (User Portal Shortcuts)
                </h2>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-mono">
                  {quickValues.length} Active
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                These trading shortcuts automatically appear as 1-tap quick buttons when users create or edit Sauda contracts.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSeedPresets}
            disabled={isSeedingPresets}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 shadow-neu-raised-sm hover:text-blue-600 dark:hover:text-blue-400 active:scale-95 transition-all cursor-pointer shrink-0"
            title="Populate standard industry trade presets"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isSeedingPresets ? 'animate-spin' : ''}`} />
            <span>Load Standard Presets</span>
          </button>
        </div>

        {/* Category Navigation Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const count = quickValues.filter((q) => q.category === cat.key).length;
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.key);
                  setQuickValueInput('');
                  setQuickValueError(null);
                }}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-neu-raised-sm'
                    : 'bg-[#E8EDF3] dark:bg-[#20242D] text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-white/80 dark:border-white/10'
                }`}
              >
                {cat.icon}
                <span>{cat.shortLabel}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-black ${
                    isActive ? 'bg-white/20 text-white' : 'bg-black/5 dark:bg-white/10 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Fast Add Input */}
        <form onSubmit={handleAddQuickValue} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <input
              type="text"
              value={quickValueInput}
              onChange={(e) => {
                setQuickValueInput(e.target.value);
                if (quickValueError) setQuickValueError(null);
              }}
              placeholder={activeCategoryConfig.placeholder}
              className="w-full px-4 py-2.5 text-xs uppercase font-medium rounded-2xl bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-neu-inset-sm font-semibold"
            />
          </div>
          <button
            type="submit"
            disabled={isAddingQuickValue || !quickValueInput.trim()}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-2xl text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-neu-raised-sm active:scale-95 transition-all disabled:opacity-50 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Value</span>
          </button>
        </form>

        {quickValueError && (
          <p className="text-xs text-red-500 font-semibold">{quickValueError}</p>
        )}

        {quickValueSuccessMsg && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{quickValueSuccessMsg}</span>
          </p>
        )}

        {/* Active Category Chips */}
        <div className="p-4 rounded-2xl bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 shadow-neu-inset-sm min-h-[90px]">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
            <span>
              Active {activeCategoryConfig.label} ({categoryItems.length})
            </span>
            <span className="text-[10px] font-normal lowercase">click ✕ on any tag to remove</span>
          </div>

          {categoryItems.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {categoryItems.map((qv) => (
                <span
                  key={qv.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 text-slate-800 dark:text-slate-200 text-xs font-extrabold shadow-neu-raised-sm group transition-all"
                >
                  <span>{qv.value}</span>
                  <button
                    type="button"
                    onClick={() => qv.id && handleDeleteQuickValue(qv.id)}
                    className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-0.5 rounded cursor-pointer"
                    title={`Delete ${qv.value}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center text-xs text-slate-400">
              No quick values configured for {activeCategoryConfig.shortLabel}. Click &quot;Load Standard Presets&quot; or type above to add.
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: LIVE BROADCAST NOTICE & ADMIN SECURITY PASSCODE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* Card: Live Broadcast Notice */}
        <div className="p-6 rounded-3xl neu-raised bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 shadow-neu-raised-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl neu-raised-sm bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0">
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
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
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
                className="w-full px-3 py-2.5 rounded-xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
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
              className="w-full py-2.5 px-4 rounded-xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 hover:text-blue-600 dark:hover:text-blue-400 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <BellRing className="w-4 h-4" />
              <span>{isSavingNotice ? 'Publishing...' : 'Save & Publish Notice'}</span>
            </button>
            {noticeSuccess && (
              <p className="text-center text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Announcement banner updated successfully!</span>
              </p>
            )}
          </form>
        </div>

        {/* Card: Admin Security Passcode */}
        <div className="p-6 rounded-3xl neu-raised bg-[#F0F3F8] dark:bg-[#262B36] border border-white/80 dark:border-white/10 shadow-neu-raised-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl neu-raised-sm bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Change Admin Master Passcode
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Update the master security credentials used to unlock the Admin Portal.
              </p>
            </div>
          </div>

          {passcodeError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300 text-xs font-semibold">
              {passcodeError}
            </div>
          )}

          {passcodeSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
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
                className="w-full px-3 py-2.5 rounded-xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
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
                className="w-full px-3 py-2.5 rounded-xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isSavingPasscode}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-neu-raised-sm active:scale-95 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isSavingPasscode ? 'Updating...' : 'Update Master Passcode'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Maintenance Modal */}
      {isMaintenanceModalOpen && (
        <AdminMaintenanceModal
          isOpen={isMaintenanceModalOpen}
          onClose={() => setIsMaintenanceModalOpen(false)}
          onStatusChange={(status) => setIsMaintenanceActive(status)}
        />
      )}
    </div>
  );
};
