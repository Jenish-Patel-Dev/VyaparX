import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

export interface AdminSelectOption {
  value: string;
  label: string;
  sublabel?: string;
  badge?: string;
  icon?: React.ReactNode;
}

interface AdminCustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: AdminSelectOption[];
  icon?: React.ReactNode;
  placeholder?: string;
  label?: string;
  required?: boolean;
  className?: string;
  variant?: 'pill' | 'form';
  searchable?: boolean;
  disabled?: boolean;
  align?: 'left' | 'right';
}

export const AdminCustomSelect: React.FC<AdminCustomSelectProps> = ({
  value,
  onChange,
  options,
  icon,
  placeholder = 'Select option',
  label,
  required = false,
  className = '',
  variant = 'pill',
  searchable,
  disabled = false,
  align = 'left',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));
  const isSearchEnabled = searchable ?? options.length > 7;

  const filteredOptions = isSearchEnabled && searchTerm.trim()
    ? options.filter(
        (opt) =>
          opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (opt.sublabel && opt.sublabel.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : options;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      if (isSearchEnabled) {
        setTimeout(() => searchInputRef.current?.focus(), 60);
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isSearchEnabled]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          {label} {required && <span className="text-red-500 font-bold">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      {variant === 'pill' ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          className={`w-full flex items-center justify-between gap-2.5 px-3.5 py-2 rounded-2xl bg-[#F0F3F8] dark:bg-[#2B3140] border border-white/80 dark:border-white/10 shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed transition-all text-xs font-bold text-slate-800 dark:text-slate-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
            isOpen ? 'shadow-neu-inset-sm border-blue-500/30 dark:border-blue-400/30' : ''
          }`}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1 text-left">
            {icon && <span className="shrink-0">{icon}</span>}
            <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
            {selectedOption?.badge && (
              <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-extrabold border border-emerald-200 dark:border-emerald-800/60 shrink-0">
                {selectedOption.badge}
              </span>
            )}
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''
            }`}
          />
        </button>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-xs font-semibold text-slate-900 dark:text-white cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            isOpen ? 'ring-2 ring-blue-500/30' : ''
          }`}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1 text-left">
            {icon && <span className="shrink-0 text-slate-400">{icon}</span>}
            <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''
            }`}
          />
        </button>
      )}

      {/* Dropdown Popup Menu */}
      {isOpen && (
        <div
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } mt-2 w-full min-w-[220px] max-w-xs sm:max-w-sm bg-[#E8EDF3] dark:bg-[#262B36] rounded-2xl p-2 z-50 shadow-neu-raised-lg border border-white/80 dark:border-white/10 animate-in fade-in zoom-in-95 duration-150 space-y-1`}
        >
          {/* Quick Search */}
          {isSearchEnabled && (
            <div className="p-1 mb-1 border-b border-black/[0.06] dark:border-white/10">
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl neu-inset bg-[#DEE4ED] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Options list */}
          <div className="max-h-56 overflow-y-auto space-y-1 pr-0.5 custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-[#DEE4ED] dark:bg-[#181C24] text-[#2563EB] dark:text-[#60A5FA] border border-blue-500/25 dark:border-blue-400/25 shadow-neu-inset-sm font-extrabold'
                        : 'hover:bg-black/5 dark:hover:bg-white/5 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                      {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                      <div className="flex flex-col min-w-0">
                        <span className="truncate">{opt.label}</span>
                        {opt.sublabel && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono font-normal truncate">
                            {opt.sublabel}
                          </span>
                        )}
                      </div>
                      {opt.badge && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-extrabold border border-emerald-200 dark:border-emerald-800/60 ml-auto shrink-0">
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3] shrink-0 ml-1.5" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="text-center py-3 text-xs text-slate-400 dark:text-slate-500">
                No matching options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};