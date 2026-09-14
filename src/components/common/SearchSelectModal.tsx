import React, { useState, useMemo } from 'react';
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

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-xl animate-in fade-in"
      style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
    >
      <div 
        className="w-full max-w-md bg-white/95 dark:bg-[#111827]/95 backdrop-blur-3xl rounded-3xl shadow-glass-hover overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150 border border-[#DCE6F2] dark:border-white/15"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Box */}
        <div className="p-4 border-b border-[#DCE6F2] dark:border-white/10 flex items-center gap-2 bg-white/60 dark:bg-white/5 backdrop-blur-xs">
          <div className="relative flex-1 flex items-center group">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={placeholder}
              autoFocus
              className="w-full !pl-11 !pr-10 py-3 bg-white/90 dark:bg-[#111827]/90 backdrop-blur-xl border border-[#DCE6F2] dark:border-slate-700/60 rounded-2xl text-[#0F172A] dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-[#111827] focus:border-[#2563EB] dark:focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-500/15 transition-all text-sm sm:text-base font-medium shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.9),0_1px_3px_rgba(37,99,235,0.04)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
            />
            <Search className="w-5 h-5 text-slate-400 dark:text-slate-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.2] transition-colors" />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 shrink-0 rounded-xl hover:bg-blue-50 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#DCE6F2]/70 dark:divide-white/10">
          {filteredOptions.length > 0 ? (
            filteredOptions.map(option => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onSelect(option);
                  onClose();
                }}
                className="w-full text-left px-5 py-4 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 active:bg-blue-100/50 dark:active:bg-blue-900/20 transition-colors flex flex-col gap-1"
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
          <div className="p-3.5 border-t border-[#DCE6F2] dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xs">
            <button
              type="button"
              onClick={onAddNew}
              className="btn-glass-primary w-full py-3.5 px-4 font-bold rounded-2xl flex items-center justify-center gap-2 text-sm tracking-wider uppercase"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>{cleanButtonText}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
