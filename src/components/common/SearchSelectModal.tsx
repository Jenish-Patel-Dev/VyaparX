import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, Plus, Info } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export interface SelectOption {
  id: string | number;
  title: string;
  subtitle?: string;
  raw?: any;
}

interface SearchSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (option: SelectOption) => void;
  title?: string;
  placeholder?: string;
  options: SelectOption[];
  selectedValue?: string | number;
  onAddNew?: () => void;
  addNewButtonText?: string;
}

export const SearchSelectModal: React.FC<SearchSelectModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  placeholder = 'Search...',
  options,
  onAddNew,
  addNewButtonText = 'Add New',
}) => {
  const { palette } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const q = searchTerm.toLowerCase();
    return options.filter(
      opt =>
        opt.title.toLowerCase().includes(q) ||
        (opt.subtitle && opt.subtitle.toLowerCase().includes(q))
    );
  }, [options, searchTerm]);

  const cleanButtonText = (addNewButtonText || 'Add New').replace(/^\+\s*/, '').trim().toUpperCase();

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/45 dark:bg-black/55 backdrop-blur-[3px] animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-[#E8EDF3] dark:bg-[#262B36] rounded-3xl shadow-neu-raised-lg overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150 border border-[#D5DDE7] dark:border-white/5"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Box */}
        <div className="p-4 border-b border-black/[0.06] dark:border-white/10 flex items-center gap-2">
          <div className="relative flex-1 flex items-center group">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={placeholder}
              autoFocus
              className="input-sauda !pl-11 !pr-10 text-sm sm:text-base"
            />
            <Search className="w-5 h-5 text-slate-400 dark:text-slate-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.2] transition-colors" />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg hover:shadow-neu-inset-sm"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 shrink-0 rounded-xl hover:shadow-neu-inset-sm transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options List */}
        <div className="flex-1 overflow-y-auto divide-y divide-black/[0.05] dark:divide-white/5 p-2 space-y-1">
          {filteredOptions.length > 0 ? (
            filteredOptions.map(option => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onSelect(option);
                  onClose();
                }}
                className="w-full text-left px-4 py-3 rounded-2xl hover:shadow-neu-raised-sm active:shadow-neu-inset-sm transition-all flex flex-col gap-1 cursor-pointer"
              >
                <span className="font-bold text-gray-900 dark:text-gray-100 text-sm sm:text-base uppercase tracking-wide break-words">
                  {option.title}
                </span>
                {option.subtitle && (
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wider break-words">
                    {option.subtitle}
                  </span>
                )}
              </button>
            ))
          ) : (
            <div className="p-8 text-center text-gray-400 text-sm space-y-3">
              <div>No matching records found</div>
            </div>
          )}

          {/* End of list text matching screenshot */}
          {filteredOptions.length > 0 && (
            <div className="py-4 text-center text-xs text-gray-400 dark:text-gray-500 font-medium flex items-center justify-center gap-1.5">
              <Info className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
              <span>No more records</span>
            </div>
          )}
        </div>

        {/* Bottom Bar "+ Add" Button with single big plus icon */}
        {onAddNew && (
          <div className="p-3.5 border-t border-black/[0.06] dark:border-white/10">
            <button
              type="button"
              onClick={onAddNew}
              className="neu-button-primary w-full py-3.5 px-4 font-bold rounded-2xl flex items-center justify-center gap-2 text-sm tracking-wider uppercase cursor-pointer"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>{cleanButtonText}</span>
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
