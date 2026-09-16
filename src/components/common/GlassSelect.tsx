import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, AlertCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export interface GlassSelectOption {
  value: string;
  label: string;
  sublabel?: string;
  colorSwatch?: string;
  icon?: React.ReactNode;
}

interface GlassSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: GlassSelectOption[];
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: string;
  icon?: React.ReactNode;
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
  searchable?: boolean;
}

export const GlassSelect: React.FC<GlassSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  label,
  required = false,
  error,
  icon,
  className = '',
  triggerClassName = '',
  disabled = false,
  searchable,
}) => {
  const { palette } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(opt => String(opt.value) === String(value));
  const isSearchEnabled = searchable ?? options.length > 8;

  const filteredOptions = isSearchEnabled && searchTerm.trim()
    ? options.filter(opt =>
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

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      if (isSearchEnabled) {
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
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
        <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 mb-1.5 uppercase tracking-wide">
          {label} {required && <span className="text-red-500 font-bold">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(prev => !prev)}
        className={`input-sauda flex items-center justify-between gap-2 text-left cursor-pointer select-none font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${
          error
            ? '!border-red-500 !ring-2 !ring-red-200/50 !bg-red-50/20'
            : isOpen
              ? '!border-blue-600 !ring-2 !ring-blue-100 dark:!ring-blue-900/40 bg-white/95 dark:bg-[#111827]/90'
              : 'hover:border-blue-500'
        } ${triggerClassName}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-1">
          {icon && <span className="shrink-0 text-gray-400 dark:text-gray-500">{icon}</span>}
          {selectedOption?.colorSwatch && (
            <span
              className="w-3.5 h-3.5 rounded-full shadow-xs shrink-0 border border-white/60 dark:border-white/20"
              style={{ backgroundColor: selectedOption.colorSwatch }}
            />
          )}
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span className={`truncate ${selectedOption ? 'text-gray-900 dark:text-gray-100 font-bold' : 'text-slate-400 dark:text-slate-500 font-normal'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.sublabel && (
            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-normal truncate hidden sm:inline">
              ({selectedOption.sublabel})
            </span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-blue-600' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu Popup */}
      {isOpen && (
        <div
          className="absolute left-0 right-0 mt-2 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-2xl rounded-2xl shadow-glass-hover border border-[#DCE6F2] dark:border-white/15 p-2 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1"
          style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
        >
          {/* Quick Search for large lists (e.g. 36 states) */}
          {isSearchEnabled && (
            <div className="p-1 border-b border-[#DCE6F2]/70 dark:border-gray-800 mb-1">
              <div className="relative group">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full !pl-8 !pr-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800/80 border border-[#DCE6F2] dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-600"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.2] transition-colors" />
              </div>
            </div>
          )}

          {/* Options list */}
          <div className="max-h-56 overflow-y-auto space-y-1 pr-0.5">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(opt => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-2xs'
                        : 'hover:bg-blue-50/50 dark:hover:bg-gray-800/60 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                      {opt.colorSwatch && (
                        <span
                          className="w-3.5 h-3.5 rounded-full shadow-xs shrink-0 border border-white/60 dark:border-white/20"
                          style={{ backgroundColor: opt.colorSwatch }}
                        />
                      )}
                      {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                      <div className="flex flex-col min-w-0">
                        <span className="truncate">{opt.label}</span>
                        {opt.sublabel && (
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-normal truncate">
                            {opt.sublabel}
                          </span>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3] shrink-0 ml-1" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="text-center py-3 text-xs text-gray-400 dark:text-gray-500">
                No matching options
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs font-semibold text-red-500 mt-1 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-0.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};
