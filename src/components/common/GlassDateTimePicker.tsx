import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

interface GlassDateTimePickerProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
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

export const GlassDateTimePicker: React.FC<GlassDateTimePickerProps> = ({
  value,
  onChange,
  placeholder = 'Select Date & Time...',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Parse existing value or initialize with now + 1 hour
  const initialDate = useMemo(() => {
    if (value) {
      const parsed = Date.parse(value);
      if (!isNaN(parsed)) return new Date(parsed);
    }
    const d = new Date();
    d.setHours(d.getHours() + 1);
    d.setMinutes(0);
    return d;
  }, [value]);

  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [viewYear, setViewYear] = useState<number>(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(initialDate.getMonth());

  // Time components
  const [hour, setHour] = useState<string>(() => {
    let h = initialDate.getHours() % 12;
    if (h === 0) h = 12;
    return String(h).padStart(2, '0');
  });

  const [minute, setMinute] = useState<string>(() => {
    return String(initialDate.getMinutes()).padStart(2, '0');
  });

  const [period, setPeriod] = useState<'AM' | 'PM'>(() => {
    return initialDate.getHours() >= 12 ? 'PM' : 'AM';
  });

  // Position calculation for popover
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const width = 340;
    const height = 440;

    let left = rect.left;
    if (left + width > window.innerWidth - 16) {
      left = Math.max(16, window.innerWidth - width - 16);
    }
    if (left < 16) left = 16;

    const spaceBelow = window.innerHeight - rect.bottom;
    const placeAbove = spaceBelow < height && rect.top > height;
    const top = placeAbove ? Math.max(16, rect.top - height - 8) : rect.bottom + 8;

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

  // Calendar month navigation
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Build calendar days grid
  const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const startDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const calendarDays = useMemo(() => {
    const days: Array<{
      day: number;
      year: number;
      month: number;
      isCurrentMonth: boolean;
    }> = [];

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

    for (let d = 1; d <= daysInCurrentMonth; d++) {
      days.push({
        day: d,
        year: viewYear,
        month: viewMonth,
        isCurrentMonth: true,
      });
    }

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
    return (
      selectedDate.getFullYear() === y &&
      selectedDate.getMonth() === m &&
      selectedDate.getDate() === d
    );
  };

  const formatOutput = (d: Date, h: string, min: string, p: 'AM' | 'PM') => {
    const day = String(d.getDate()).padStart(2, '0');
    const month = SHORT_MONTH_NAMES[d.getMonth()].toUpperCase();
    const year = d.getFullYear();
    return `${day}-${month}-${year} ${h}:${min} ${p}`;
  };

  const handleApply = () => {
    const formatted = formatOutput(selectedDate, hour, minute, period);
    onChange(formatted);
    setIsOpen(false);
  };

  const handleClear = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  // Quick preset shortcuts
  const handlePreset = (minutesToAdd: number) => {
    const d = new Date(Date.now() + minutesToAdd * 60 * 1000);
    setSelectedDate(d);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());

    let h = d.getHours() % 12;
    if (h === 0) h = 12;
    const hStr = String(h).padStart(2, '0');
    const mStr = String(d.getMinutes()).padStart(2, '0');
    const pStr = d.getHours() >= 12 ? 'PM' : 'AM';

    setHour(hStr);
    setMinute(mStr);
    setPeriod(pStr);

    const formatted = formatOutput(d, hStr, mStr, pStr);
    onChange(formatted);
    setIsOpen(false);
  };

  const popoverContent = (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center sm:block bg-black/40 sm:bg-transparent backdrop-blur-xs sm:backdrop-blur-none p-4 sm:p-0"
      onClick={() => setIsOpen(false)}
    >
      <div
        ref={popoverRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          top: window.innerWidth > 640 ? `${popoverPos.top}px` : undefined,
          left: window.innerWidth > 640 ? `${popoverPos.left}px` : undefined,
        }}
        className="w-full max-w-[340px] sm:w-[340px] sm:absolute neu-raised bg-[#F0F3F8] dark:bg-[#262B36] border border-white/90 dark:border-white/15 rounded-3xl p-4 shadow-neu-raised-lg text-slate-800 dark:text-slate-100 font-sans space-y-3.5 animate-in zoom-in-95"
      >
        {/* Quick Shortcut Buttons */}
        <div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Quick Return Time</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
            <button
              type="button"
              onClick={() => handlePreset(30)}
              className="py-1.5 px-1 rounded-xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 hover:text-blue-600 dark:hover:text-blue-400 text-center transition-all cursor-pointer text-[11px]"
            >
              +30m
            </button>
            <button
              type="button"
              onClick={() => handlePreset(60)}
              className="py-1.5 px-1 rounded-xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 hover:text-blue-600 dark:hover:text-blue-400 text-center transition-all cursor-pointer text-[11px]"
            >
              +1 Hr
            </button>
            <button
              type="button"
              onClick={() => handlePreset(120)}
              className="py-1.5 px-1 rounded-xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 hover:text-blue-600 dark:hover:text-blue-400 text-center transition-all cursor-pointer text-[11px]"
            >
              +2 Hrs
            </button>
            <button
              type="button"
              onClick={() => handlePreset(240)}
              className="py-1.5 px-1 rounded-xl neu-raised-sm bg-[#E8EDF3] dark:bg-[#20242D] border border-white/80 dark:border-white/10 hover:text-blue-600 dark:hover:text-blue-400 text-center transition-all cursor-pointer text-[11px]"
            >
              +4 Hrs
            </button>
          </div>
        </div>

        {/* Calendar Month & Navigation Header */}
        <div className="flex items-center justify-between pb-2 border-b border-black/[0.06] dark:border-white/10">
          <span className="font-extrabold text-xs text-slate-900 dark:text-white">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days Grid */}
        <div>
          <div className="grid grid-cols-7 gap-1 mb-1 text-center">
            {WEEKDAY_NAMES.map((w, idx) => (
              <span
                key={w}
                className={`text-[10px] font-bold uppercase py-0.5 ${
                  idx === 0 ? 'text-rose-500' : 'text-slate-400'
                }`}
              >
                {w}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {calendarDays.map((item, idx) => {
              const selected = isSelected(item.year, item.month, item.day);
              const isCurr = isToday(item.year, item.month, item.day);

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    const d = new Date(item.year, item.month, item.day);
                    setSelectedDate(d);
                    if (!item.isCurrentMonth) {
                      setViewMonth(item.month);
                      setViewYear(item.year);
                    }
                  }}
                  className={`h-7 w-7 mx-auto rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                    selected
                      ? 'bg-[#2563EB] text-white shadow-sm font-black'
                      : isCurr
                      ? 'border border-blue-500 text-blue-600 dark:text-blue-400 font-extrabold'
                      : item.isCurrentMonth
                      ? 'text-slate-800 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10'
                      : 'text-slate-400/50 dark:text-slate-600 hover:text-slate-600'
                  }`}
                >
                  {item.day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Selector (Hour : Minute AM/PM) */}
        <div className="pt-2 border-t border-black/[0.06] dark:border-white/10 space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <Clock className="w-3 h-3 text-blue-500" />
            <span>Select Return Time</span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              {/* Hour Dropdown */}
              <select
                value={hour}
                onChange={(e) => setHour(e.target.value)}
                className="px-2 py-1.5 rounded-xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map((h) => (
                  <option key={h} value={h} className="bg-white dark:bg-slate-900">
                    {h}
                  </option>
                ))}
              </select>

              <span className="font-extrabold text-slate-400">:</span>

              {/* Minute Dropdown */}
              <select
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
                className="px-2 py-1.5 rounded-xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(
                  (m) => (
                    <option key={m} value={m} className="bg-white dark:bg-slate-900">
                      {m}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* AM / PM Toggle Pills */}
            <div className="inline-flex p-0.5 rounded-xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-xs font-bold">
              <button
                type="button"
                onClick={() => setPeriod('AM')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  period === 'AM'
                    ? 'bg-[#2563EB] text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => setPeriod('PM')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  period === 'PM'
                    ? 'bg-[#2563EB] text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                PM
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-black/[0.06] dark:border-white/10 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Set Time</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Box */}
      <div
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2.5 rounded-xl neu-inset bg-[#E8EDF3] dark:bg-[#20242D] border border-black/5 dark:border-white/10 text-xs font-semibold text-slate-900 dark:text-white flex items-center justify-between cursor-pointer hover:border-blue-500/40 transition-colors"
      >
        <div className="flex items-center gap-2 truncate">
          <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className={value ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-400'}>
            {value || placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-slate-400 hover:text-rose-500 transition-colors"
              title="Clear selection"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <CalendarIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </div>
      </div>

      {/* Popover Portal */}
      {isOpen && createPortal(popoverContent, document.body)}
    </div>
  );
};
