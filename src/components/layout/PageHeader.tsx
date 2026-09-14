import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  companyInfo?: {
    companyName?: string;
    financialYear?: string;
  };
  showBack?: boolean;
  onBack?: () => void;
  onRefresh?: () => void;
  rightAction?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  companyInfo,
  showBack = true,
  onBack,
  onRefresh,
  rightAction,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="bg-white/80 dark:bg-[#111827]/80 backdrop-blur-2xl border-b border-[#DCE6F2] dark:border-slate-800/80 px-3.5 sm:px-4 py-3 sm:py-3.5 sticky top-0 z-30 flex items-center justify-between gap-3 shadow-[0_4px_16px_rgba(37,99,235,0.06),inset_0_1px_1.5px_0_rgba(255,255,255,0.98)] dark:shadow-none transition-all min-w-0">
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
        {showBack && (
          <button
            type="button"
            onClick={handleBack}
            className="p-1.5 -ml-1 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl hover:bg-blue-50/80 dark:hover:bg-slate-800/80 active:scale-95 transition-all shrink-0 cursor-pointer"
            aria-label="Go Back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.3]" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-base sm:text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate">{subtitle}</p>
          )}
          {companyInfo && (
            <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5 min-w-0">
              {companyInfo.financialYear && (
                <div className="truncate">FY: <span className="text-slate-800 dark:text-slate-200 font-semibold">{companyInfo.financialYear}</span></div>
              )}
              {companyInfo.companyName && (
                <div className="truncate">Company: <span className="text-slate-800 dark:text-slate-200 font-semibold">{companyInfo.companyName}</span></div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 rounded-full bg-white/95 dark:bg-slate-800/90 border border-[#DCE6F2] dark:border-slate-700/80 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.98),0_2px_8px_rgba(37,99,235,0.08)] transition-all active:rotate-180 duration-300 cursor-pointer"
            aria-label="Refresh"
          >
            <RefreshCw className="w-4 h-4 stroke-[2]" />
          </button>
        )}
        {rightAction}
      </div>
    </div>
  );
};
