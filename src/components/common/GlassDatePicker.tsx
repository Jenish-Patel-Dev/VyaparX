import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown, Check, X } from 'lucide-react';
import { FieldError } from './FieldError';

interface GlassDatePickerProps {
  value: string; // ISO date 'YYYY-MM-DD'
  onChange: (dateStr: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
  className?: string;
  triggerClassName?: string;
  id?: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const SHORT_MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const WEEKDAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// Date parsing: 'YYYY-MM-DD' -> Date object
function parseDateString(str?: string): Date | null {
  if (!str) return null;
  const parts = str.split('T')[0].split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      return new Date(y, m, d);
    }
  }
  const fallback = new Date(str);
  return isNaN(fallback.getTime()) ? null : fallback;
}

// Date formatting: Date object -> 'YYYY-MM-DD'
function toISODateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Format for display: 'YYYY-MM-DD' -> 'DD-MM-YYYY'
function formatDisplayDate(str?: string): string {
  if (!str) return '';
  const parts = str.split('T')[0].split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return str;
}

export const GlassDatePicker: React.FC<GlassDatePickerProps> = ({
  value,
  onChange,
  label,
  required = false,
  error,
  placeholder = 'DD-MM-YYYY',
  disabled = false,
  minDate,
  maxDate,
  className = '',
  triggerClassName = '',
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'days' | 'months' | 'years'>('days');
  const [yearPageStart, setYearPageStart] = useState<number>(2020);

  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // If required and no value provided, default to today
  const effectiveValue = value || (required ? toISODateString(new Date()) : '');

  // Auto-propagate today's date if required and value is missing
  useEffect(() => {
    if (required && (!value || !value.trim())) {
      onChange(toISODateString(new Date()));
    }
  }, [required, value, onChange]);

  // Parse current date
  const parsedValue = useMemo(() => parseDateString(effectiveValue), [effectiveValue]);

  // View state (Year & Month being browsed)
  const [viewYear, setViewYear] = useState<number>(() => {
    return parsedValue ? parsedValue.getFullYear() : new Date().getFullYear();
  });
  const [viewMonth, setViewMonth] = useState<number>(() => {
    return parsedValue ? parsedValue.getMonth() : new Date().getMonth();
  });

  // Sync view date whenever modal opens or value changes
  useEffect(() => {
    if (isOpen) {
      const active = parseDateString(effectiveValue) || new Date();
      setViewYear(active.getFullYear());
      setViewMonth(active.getMonth());
      setViewMode('days');
      setYearPageStart(Math.floor(active.getFullYear() / 12) * 12);
    }
  }, [isOpen, effectiveValue]);

  // Responsive state & positioning
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 640 : false;
  });
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const updatePosition = () => {
    if (!triggerRef.current || typeof window === 'undefined') return;
    const mobile = window.innerWidth < 640;
    setIsMobile(mobile);
    if (mobile) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const width = 330;
    const height = 390;

    let left = rect.left;
    if (left + width > window.innerWidth - 16) {
      left = Math.max(16, window.innerWidth - width - 16);
    }
    if (left < 16) left = 16;

    const spaceBelow = window.innerHeight - rect.bottom;
    const placeAbove = spaceBelow < height && rect.top > height;
    const top = placeAbove
      ? Math.max(16, rect.top - height - 8)
      : rect.bottom + 8;

    setPopoverPos({ top, left });
  };

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();

    const handleScroll = () => updatePosition();
    const handleResize = () => updatePosition();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Navigation handlers
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const handleSelectDay = (year: number, month: number, day: number) => {
    const selected = new Date(year, month, day);
    onChange(toISODateString(selected));
    setIsOpen(false);
  };

  const handleSelectToday = () => {
    const today = new Date();
    onChange(toISODateString(today));
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  // Build days grid
  const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const startDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sunday
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const calendarDays = useMemo(() => {
    const days: Array<{
      day: number;
      year: number;
      month: number;
      isCurrentMonth: boolean;
    }> = [];

    // Previous month leading days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
      days.push({
        day: daysInPrevMonth - i,
        year: prevYear,
        month: prevMonth,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      days.push({
        day: d,
        year: viewYear,
        month: viewMonth,
        isCurrentMonth: true,
      });
    }

    // Next month trailing days to complete a 35 or 42 grid
    const totalSlots = days.length > 35 ? 42 : 35;
    const remaining = totalSlots - days.length;
    for (let d = 1; d <= remaining; d++) {
      const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
      days.push({
        day: d,
        year: nextYear,
        month: nextMonth,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [viewYear, viewMonth, startDayOfWeek, daysInCurrentMonth, daysInPrevMonth]);

  const today = new Date();
  const isToday = (y: number, m: number, d: number) => {
    return today.getFullYear() === y && today.getMonth() === m && today.getDate() === d;
  };

  const isSelected = (y: number, m: number, d: number) => {
    if (!parsedValue) return false;
    return (
      parsedValue.getFullYear() === y &&
      parsedValue.getMonth() === m &&
      parsedValue.getDate() === d
    );
  };

  // Calendar Content Layout
  const calendarContent = (
    <div
      ref={popoverRef}
      className="w-full select-none flex flex-col font-sans"
      onClick={e => e.stopPropagation()}
    >
      {/* 1. DAYS VIEW */}
      {viewMode === 'days' && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#DCE6F2]/80 dark:border-white/10">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode('months')}
                className="px-2.5 py-1.5 rounded-xl font-black text-sm text-slate-900 dark:text-slate-100 hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Select Month"
              >
                <span>{MONTH_NAMES[viewMonth]}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setYearPageStart(Math.floor(viewYear / 12) * 12);
                  setViewMode('years');
                }}
                className="px-2 py-1.5 rounded-xl font-bold text-sm text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 cursor-pointer"
                title="Select Year"
              >
                <span>{viewYear}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.2]" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4 stroke-[2.2]" />
              </button>
            </div>
          </div>

          {/* Weekday Names */}
          <div className="grid grid-cols-7 gap-1 mb-1.5 text-center justify-items-center">
            {WEEKDAY_NAMES.map((w, idx) => (
              <div
                key={w}
                style={{ width: '36px' }}
                className={`text-[11px] font-extrabold uppercase py-0.5 tracking-wider flex items-center justify-center ${
                  idx === 0 ? 'text-rose-500/80 dark:text-rose-400/80' : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {w}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 justify-items-center">
            {calendarDays.map((item, idx) => {
              const selected = isSelected(item.year, item.month, item.day);
              const currentDay = isToday(item.year, item.month, item.day);

              let dateClasses = '';
              if (selected) {
                dateClasses = currentDay
                  ? 'bg-blue-600 text-white font-black shadow-md shadow-blue-500/30 ring-2 ring-blue-300 dark:ring-blue-400 ring-offset-1 dark:ring-offset-slate-900'
                  : 'bg-blue-600 text-white font-black shadow-md shadow-blue-500/30';
              } else if (currentDay) {
                // Today's date (when not selected): same rounded square, lighter blue tint relative to selected date
                dateClasses = 'bg-blue-100/90 text-blue-700 dark:bg-blue-600/25 dark:text-blue-300 border-2 border-blue-400/70 dark:border-blue-400/50 font-black';
              } else if (item.isCurrentMonth) {
                dateClasses = 'text-slate-800 dark:text-slate-200 font-semibold hover:bg-blue-50 dark:hover:bg-white/10 hover:text-blue-600 dark:hover:text-blue-400';
              } else {
                dateClasses = 'text-slate-300 dark:text-slate-600 font-normal hover:bg-slate-100/50 dark:hover:bg-slate-800/50';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDay(item.year, item.month, item.day)}
                  style={{ width: '36px', height: '36px', borderRadius: '9px' }}
                  className={`flex items-center justify-center text-xs transition-all cursor-pointer ${dateClasses}`}
                >
                  {item.day}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* 2. MONTHS PICKER VIEW */}
      {viewMode === 'months' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#DCE6F2]/80 dark:border-white/10">
            <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
              Select Month ({viewYear})
            </span>
            <button
              type="button"
              onClick={() => setViewMode('days')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Back
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1">
            {SHORT_MONTH_NAMES.map((mName, mIdx) => {
              const isCurrMonth = viewMonth === mIdx;
              return (
                <button
                  key={mName}
                  type="button"
                  onClick={() => {
                    setViewMonth(mIdx);
                    setViewMode('days');
                  }}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-extrabold transition-all cursor-pointer text-center ${
                    isCurrMonth
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-white/10 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-50/70 dark:bg-white/5 border border-slate-200/50 dark:border-white/5'
                  }`}
                >
                  {mName}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. YEARS PICKER VIEW */}
      {viewMode === 'years' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#DCE6F2]/80 dark:border-white/10">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setYearPageStart(prev => prev - 12)}
                className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
                title="Previous Years"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-extrabold text-xs text-slate-800 dark:text-slate-100">
                {yearPageStart} - {yearPageStart + 11}
              </span>
              <button
                type="button"
                onClick={() => setYearPageStart(prev => prev + 12)}
                className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
                title="Next Years"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setViewMode('days')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Back
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1">
            {Array.from({ length: 12 }, (_, i) => yearPageStart + i).map(y => {
              const isCurrYear = viewYear === y;
              return (
                <button
                  key={y}
                  type="button"
                  onClick={() => {
                    setViewYear(y);
                    setViewMode('days');
                  }}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-extrabold transition-all cursor-pointer text-center ${
                    isCurrYear
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-white/10 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-50/70 dark:bg-white/5 border border-slate-200/50 dark:border-white/5'
                  }`}
                >
                  {y}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#DCE6F2]/80 dark:border-white/10">
        {!required ? (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 px-2 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            Clear
          </button>
        ) : (
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 pl-1">
            Required *
          </span>
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSelectToday}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/40 px-3 py-1.5 rounded-xl border border-blue-200/60 dark:border-blue-700/40 transition-colors cursor-pointer"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`relative w-full ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-1.5"
        >
          {label} {required && <span className="text-red-500 font-bold">*</span>}
        </label>
      )}

      {/* Input Trigger Button */}
      <div
        ref={triggerRef}
        id={id}
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen(prev => !prev)}
        onKeyDown={e => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            setIsOpen(prev => !prev);
          }
        }}
        className={`input-sauda flex items-center justify-between cursor-pointer select-none font-semibold transition-all group ${
          isOpen ? 'ring-2 ring-blue-500/30 border-blue-600 dark:border-blue-400' : ''
        } ${
          error ? 'border-red-500 ring-2 ring-red-200/50 bg-red-50/20' : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${triggerClassName}`}
      >
        <span
          className={`tracking-wide ${
            effectiveValue
              ? 'text-slate-900 dark:text-slate-100 font-bold'
              : 'text-slate-400 dark:text-slate-500 font-normal'
          }`}
        >
          {effectiveValue ? formatDisplayDate(effectiveValue) : placeholder}
        </span>

        <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 shrink-0">
          {!required && value && (
            <span
              onClick={e => {
                e.stopPropagation();
                if (!disabled) onChange('');
              }}
              className="p-0.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
              title="Clear date"
            >
              <X className="w-3.5 h-3.5 stroke-[2.2]" />
            </span>
          )}
          <CalendarIcon className="w-4 h-4 stroke-[2.2] group-hover:scale-110 transition-transform" />
        </div>
      </div>

      {error && <FieldError error={error} />}

      {/* Popover / Modal via Portal */}
      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          isMobile ? (
            /* Mobile: Centered Glass Modal */
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 dark:bg-black/75 backdrop-blur-md animate-in fade-in duration-150"
              style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
              onClick={() => setIsOpen(false)}
            >
              <div
                className="w-full max-w-[330px] bg-white/95 dark:bg-[#111827]/95 backdrop-blur-2xl rounded-3xl p-4 shadow-2xl border border-[#DCE6F2] dark:border-white/15 animate-in zoom-in-95 duration-150"
                onClick={e => e.stopPropagation()}
              >
                {calendarContent}
              </div>
            </div>
          ) : (
            /* Desktop: Positioned Floating Popover */
            <div
              className="fixed inset-0 z-[100]"
              onClick={() => setIsOpen(false)}
            >
              <div
                style={{ top: `${popoverPos.top}px`, left: `${popoverPos.left}px` }}
                className="fixed z-[101] w-[330px] bg-white/95 dark:bg-[#111827]/95 backdrop-blur-2xl rounded-3xl p-4 shadow-[0_20px_50px_rgba(37,99,235,0.18),0_10px_30px_rgba(0,0,0,0.15)] border border-[#DCE6F2] dark:border-white/15 animate-in zoom-in-95 duration-150"
                onClick={e => e.stopPropagation()}
              >
                {calendarContent}
              </div>
            </div>
          ),
          document.body
        )}
    </div>
  );
};
