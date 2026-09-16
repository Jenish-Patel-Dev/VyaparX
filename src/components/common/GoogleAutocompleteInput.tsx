import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, Check, ChevronDown } from 'lucide-react';

export interface AutocompleteOption {
  id: number | string;
  title: string;
  subtitle?: string;
  badge?: string;
}

interface GoogleAutocompleteInputProps {
  label: string;
  icon?: React.ReactNode;
  placeholder?: string;
  allOptionLabel?: string;
  options: AutocompleteOption[];
  selectedId: number | string | null;
  onSelect: (id: number | null, option?: AutocompleteOption) => void;
  className?: string;
}

export const GoogleAutocompleteInput: React.FC<GoogleAutocompleteInputProps> = ({
  label,
  icon,
  placeholder = 'Search...',
  allOptionLabel = 'All',
  options,
  selectedId,
  onSelect,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Find currently selected option
  const selectedOption = useMemo(
    () => options.find(o => String(o.id) === String(selectedId)),
    [options, selectedId]
  );

  const [query, setQuery] = useState(selectedOption ? selectedOption.title : '');
  const [isOpen, setIsOpen] = useState(false);

  // Sync query when selectedId changes externally (e.g. Clear Filters, Reset)
  useEffect(() => {
    if (selectedOption) {
      setQuery(selectedOption.title);
    } else {
      setQuery('');
    }
  }, [selectedOption, selectedId]);

  // Handle outside click to close suggestions
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        if (selectedOption) {
          setQuery(selectedOption.title);
        } else {
          setQuery('');
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen, selectedOption]);

  // Filter options in real-time based on typed query (Google-style substring match)
  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      opt =>
        opt.title.toLowerCase().includes(q) ||
        (opt.subtitle && opt.subtitle.toLowerCase().includes(q)) ||
        (opt.badge && opt.badge.toLowerCase().includes(q))
    );
  }, [options, query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setQuery(text);
    setIsOpen(true);
    if (!text.trim()) {
      onSelect(null);
    }
  };

  const handleSelectOption = (opt: AutocompleteOption | null) => {
    if (!opt) {
      onSelect(null);
      setQuery('');
    } else {
      onSelect(Number(opt.id), opt);
      setQuery(opt.title);
    }
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(null);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Field Label */}
      {label && (
        <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
          {icon && <span className="text-blue-600 dark:text-blue-400">{icon}</span>}
          <span>{label}</span>
        </label>
      )}

      {/* Input Box with Left Search Icon and Right Clear / Dropdown icon */}
      <div className="relative group">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`input-sauda !pl-10 !pr-10 text-xs sm:text-sm font-semibold uppercase transition-all ${
            selectedId !== null
              ? '!border-blue-600 dark:!border-blue-500 !ring-2 !ring-blue-100 dark:!ring-blue-900/40 bg-blue-50/20 dark:bg-blue-950/20 text-blue-950 dark:text-blue-100 font-bold'
              : ''
          }`}
        />
        <Search className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.2] transition-colors" />

        {/* Clear (X) Button or Chevron */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 rounded-full transition-colors cursor-pointer"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5 stroke-[2.2]" />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 cursor-pointer hover:text-blue-600 ${
              isOpen ? 'rotate-180 text-blue-600' : ''
            }`}
            onClick={() => {
              setIsOpen(prev => !prev);
              inputRef.current?.focus();
            }}
          />
        </div>
      </div>

      {/* Google-like Matching Suggestions List Dropdown */}
      {isOpen && (
        <div 
          className="absolute left-0 right-0 top-full mt-1.5 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-2xl rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.18)] border border-[#DCE6F2] dark:border-white/15 overflow-hidden z-[70] animate-in fade-in zoom-in-95 duration-150 max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60"
          style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
        >
          {/* 'All' Option */}
          <button
            type="button"
            onClick={() => handleSelectOption(null)}
            className={`w-full text-left px-3.5 py-2.5 text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
              selectedId === null
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                : 'hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-300'
            }`}
          >
            <span className="uppercase tracking-wider">{allOptionLabel}</span>
            {selectedId === null && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 stroke-[2.5]" />}
          </button>

          {/* Filtered Options List matching typed characters */}
          {filteredOptions.length > 0 ? (
            filteredOptions.map(opt => {
              const isSelected = String(opt.id) === String(selectedId);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption(opt)}
                  className={`w-full text-left px-3.5 py-2.5 text-xs transition-all flex items-center justify-between gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-extrabold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 font-semibold'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="uppercase tracking-wide truncate">{opt.title}</div>
                    {opt.subtitle && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal truncate mt-0.5">
                        {opt.subtitle}
                      </div>
                    )}
                  </div>
                  {opt.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium shrink-0">
                      {opt.badge}
                    </span>
                  )}
                  {isSelected && (
                    <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 stroke-[2.5] shrink-0" />
                  )}
                </button>
              );
            })
          ) : (
            <div className="px-4 py-4 text-center text-xs text-slate-400 dark:text-slate-500">
              No results found for &ldquo;<span className="font-semibold text-slate-600 dark:text-slate-300">{query}</span>&rdquo;
            </div>
          )}
        </div>
      )}
    </div>
  );
};
