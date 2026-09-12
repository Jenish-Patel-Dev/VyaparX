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
        className="w-full max-w-sm bg-gradient-to-b from-white/95 to-blue-50/85 backdrop-blur-3xl rounded-3xl shadow-[0_20px_50px_rgba(37,99,235,0.2),inset_0_1px_1.5px_rgba(255,255,255,0.98)] p-6 space-y-5 animate-in zoom-in-95 border border-blue-200/90"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-blue-200/70 pb-3">
          <h3 className="font-extrabold text-base text-gray-900 tracking-tight">
            Change Company & FY
          </h3>
          <button onClick={onClose} className="p-1 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-white/60 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Company Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-800 uppercase tracking-wide flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" style={{ color: palette.primary }} />
            <span>Select Active Company</span>
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {companies.map(c => {
              const isSelected = selectedCompanyId === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCompanyId(c.id!)}
                  style={isSelected ? { borderColor: palette.primary, backgroundColor: palette.light, color: palette.text } : undefined}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'border-2 shadow-xs'
                      : 'border-blue-200/80 bg-white/70 text-gray-700 hover:bg-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_6px_rgba(37,99,235,0.06)]'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="font-extrabold text-xs truncate text-gray-900" title={c.name}>{c.name}</div>
                    <div className="text-[10px] text-gray-500 font-semibold truncate">{c.city} • {c.state}</div>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 stroke-[3] shrink-0" style={{ color: palette.primary }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Financial Year Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-800 uppercase tracking-wide flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" style={{ color: palette.primary }} />
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
                      : 'border-blue-200/80 bg-white/70 text-gray-700 hover:bg-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_6px_rgba(37,99,235,0.06)]'
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
