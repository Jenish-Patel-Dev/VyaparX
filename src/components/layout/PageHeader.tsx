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
  onSearchByGst?: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  companyInfo,
  showBack = true,
  onBack,
  onRefresh,
  rightAction,
  onSearchByGst,
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
    <div className="bg-white/80 backdrop-blur-2xl border-b border-blue-200/80 px-3.5 sm:px-4 py-3 sm:py-3.5 sticky top-0 z-10 flex items-center justify-between gap-3 shadow-[0_4px_16px_rgba(37,99,235,0.06),inset_0_1px_1.5px_0_rgba(255,255,255,0.98)] transition-all min-w-0">
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
        {showBack && (
          <button
            type="button"
            onClick={handleBack}
            className="p-1.5 -ml-1 text-gray-700 hover:text-blue-700 rounded-xl hover:bg-blue-50/80 active:scale-95 transition-all shrink-0 cursor-pointer"
            aria-label="Go Back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.3]" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-base sm:text-xl font-black text-gray-900 tracking-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] sm:text-xs text-gray-500 font-medium truncate">{subtitle}</p>
          )}
          {companyInfo && (
            <div className="text-[10px] sm:text-[11px] text-gray-500 font-medium leading-tight mt-0.5 min-w-0">
              {companyInfo.financialYear && (
                <div className="truncate">FY: <span className="text-gray-800 font-semibold">{companyInfo.financialYear}</span></div>
              )}
              {companyInfo.companyName && (
                <div className="truncate">Company: <span className="text-gray-800 font-semibold">{companyInfo.companyName}</span></div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {onSearchByGst && (
          <button
            type="button"
            onClick={onSearchByGst}
            className="text-xs font-bold text-blue-800 hover:bg-blue-100/90 transition-all py-1.5 px-3.5 rounded-full bg-gradient-to-b from-blue-50/95 to-blue-100/75 border border-blue-200/90 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.98),0_2px_8px_rgba(37,99,235,0.12)] active:scale-95 cursor-pointer"
          >
            Search by GST
          </button>
        )}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="p-2 text-blue-700 hover:text-blue-900 rounded-full bg-gradient-to-b from-white/95 to-blue-50/70 border border-blue-200/90 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.98),0_2px_8px_rgba(37,99,235,0.08)] transition-all active:rotate-180 duration-300 cursor-pointer"
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
