import { createPortal } from 'react-dom';
import React, { useState } from 'react';
import { X, Building2, Calendar, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangeCompanyFYModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    companies,
    currentCompany,
    setCurrentCompany,
    financialYears,
    currentFinancialYear,
    setCurrentFinancialYear,
  } = useApp();
  const { palette } = useTheme();
  const toast = useToast();

  const [selectedCompanyId, setSelectedCompanyId] = useState<number>(
    currentCompany?.id || (companies[0]?.id ?? 1)
  );
  const [selectedFY, setSelectedFY] = useState<string>(
    currentFinancialYear || '2026-2027'
  );

  if (!isOpen) return null;

  const handleApply = () => {
    const comp = companies.find(c => c.id === Number(selectedCompanyId));
    if (comp) {
      setCurrentCompany(comp);
    }
    if (selectedFY) {
      setCurrentFinancialYear(selectedFY);
    }
    toast.success('Active Company and Financial Year switched!');
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/45 dark:bg-black/55 backdrop-blur-[3px] animate-in fade-in"
    >
      <div 
        className="w-full max-w-sm neu-raised-lg rounded-3xl p-6 space-y-5 animate-in zoom-in-95 border border-[#D5DDE7] dark:border-white/10"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-black/[0.06] dark:border-white/10 pb-3">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight uppercase">
            CHANGE COMPANY & FY
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl neu-raised-sm flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border border-white/60 dark:border-white/5 transition-all cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Company Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Select Active Company</span>
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {companies.map(c => {
              const isSelected = selectedCompanyId === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCompanyId(c.id!)}
                  className={`p-3 rounded-2xl text-xs font-bold flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'neu-inset-sm border border-blue-400/40 text-blue-700 dark:text-blue-300'
                      : 'neu-raised-sm hover:shadow-neu-raised border border-white/60 dark:border-white/5 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="font-extrabold text-xs truncate text-slate-900 dark:text-white" title={c.name}>{c.name}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold truncate">{c.city} • {c.state}</div>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 stroke-[3] shrink-0 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Financial Year Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Select Financial Year</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {financialYears.map(fy => {
              const isSelected = selectedFY === fy.id;
              return (
                <button
                  key={fy.id}
                  type="button"
                  onClick={() => setSelectedFY(fy.id)}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'neu-button-primary text-white'
                      : 'neu-button-secondary text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {fy.name}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={handleApply}
          className="neu-button-primary w-full py-3 px-4 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <Check className="w-4 h-4 stroke-[2.5]" />
          <span>Switch Context</span>
        </button>
      </div>
    </div>
  , document.body);
};
