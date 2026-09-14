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

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-xl animate-in fade-in"
      style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
    >
      <div 
        className="w-full max-w-sm bg-gradient-to-b from-white/95 to-blue-50/85 dark:from-[#111827]/95 dark:to-[#172033]/95 backdrop-blur-3xl rounded-3xl shadow-[0_20px_50px_rgba(37,99,235,0.2),inset_0_1px_1.5px_rgba(255,255,255,0.98)] p-6 space-y-5 animate-in zoom-in-95 border border-[#DCE6F2] dark:border-white/15"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-[#DCE6F2] dark:border-white/10 pb-3">
          <h3 className="font-extrabold text-base text-gray-900 dark:text-white tracking-tight">
            Change Company & FY
          </h3>
          <button onClick={onClose} className="p-1 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/60 dark:hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Company Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide flex items-center gap-1.5">
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
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'border-2 border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-xs'
                      : 'border-[#DCE6F2] dark:border-white/10 bg-white/70 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_6px_rgba(37,99,235,0.06)]'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="font-extrabold text-xs truncate text-gray-900 dark:text-white" title={c.name}>{c.name}</div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold truncate">{c.city} • {c.state}</div>
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
          <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide flex items-center gap-1.5">
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
                  className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'btn-glass-primary text-white shadow-glass'
                      : 'border-[#DCE6F2] dark:border-white/10 bg-white/70 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_6px_rgba(37,99,235,0.06)]'
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
          className="btn-glass-primary w-full py-3 px-4 font-bold rounded-2xl text-xs flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4 stroke-[2.5]" />
          <span>Switch Context</span>
        </button>
      </div>
    </div>
  );
};
