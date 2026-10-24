import { createPortal } from 'react-dom';
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Info, X, CheckCircle2, HelpCircle, Lightbulb, Printer } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { resolvePageGuide, UI_GUIDE_STRINGS, type PageInfoGuide } from '../../data/pageGuides';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  companyInfo?: {
    companyName?: string;
    financialYear?: string;
  };
  showCompanyInfo?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  onRefresh?: () => void;
  onPrint?: () => void;
  rightAction?: React.ReactNode;
  info?: PageInfoGuide | string;
  showInfo?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  companyInfo,
  showCompanyInfo = true,
  showBack = true,
  onBack,
  onRefresh,
  onPrint,
  rightAction,
  info,
  showInfo = true,
}) => {
  const navigate = useNavigate();
  const { currentCompany, currentFinancialYear } = useApp();
  const { language } = useLanguage();
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const effectiveCompanyName = companyInfo?.companyName ?? currentCompany?.name;
  const effectiveFY = companyInfo?.financialYear ?? currentFinancialYear;

  const activeGuide = useMemo(() => {
    if (!showInfo) return null;
    return resolvePageGuide(title, language, info);
  }, [title, info, showInfo, language]);

  const uiStrings = UI_GUIDE_STRINGS[language] || UI_GUIDE_STRINGS.en;

  return (
    <>
      <div className="bg-[#E8EDF3] dark:bg-[#20242D] border-b border-black/5 dark:border-white/5 px-4 sm:px-6 py-3 sticky top-0 z-30 flex items-center justify-between gap-3 shadow-neu-raised-sm transition-all min-w-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {showBack && (
            <button
              type="button"
              onClick={handleBack}
              className="w-10 h-10 rounded-2xl flex items-center justify-center neu-raised-sm bg-[#F0F3F8] dark:bg-[#2B3140] border border-white/80 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-neu-raised active:shadow-neu-pressed transition-all shrink-0 cursor-pointer"
              aria-label="Go Back"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.3]" />
            </button>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-xl font-black text-gray-900 dark:text-white tracking-tight truncate uppercase">
              {title}
            </h1>
            {showCompanyInfo && (effectiveCompanyName || effectiveFY) && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full neu-inset-sm bg-black/5 dark:bg-black/25 border border-black/5 dark:border-white/5 text-[11px] font-semibold text-gray-600 dark:text-gray-300 mt-0.5 max-w-full">
                {effectiveCompanyName && (
                  <span className="text-gray-900 dark:text-white font-extrabold uppercase truncate">
                    {effectiveCompanyName}
                  </span>
                )}
                {effectiveFY && (
                  <span className="text-gray-500 dark:text-gray-400 font-bold shrink-0">
                    ({effectiveFY})
                  </span>
                )}
              </div>
            )}
            {subtitle && (
              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium truncate mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {onPrint && (
            <button
              type="button"
              onClick={onPrint}
              className="w-10 h-10 rounded-2xl flex items-center justify-center neu-raised-sm bg-[#F0F3F8] dark:bg-[#2B3140] border border-white/80 dark:border-white/10 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:shadow-neu-raised active:shadow-neu-pressed transition-all duration-150 cursor-pointer"
              aria-label="Print Report"
              title="Print Report / PDF"
            >
              <Printer className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2]" />
            </button>
          )}
          {showInfo && activeGuide && (
            <button
              type="button"
              onClick={() => setIsInfoOpen(true)}
              className="w-10 h-10 rounded-2xl flex items-center justify-center neu-raised-sm bg-[#F0F3F8] dark:bg-[#2B3140] border border-white/80 dark:border-white/10 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:shadow-neu-raised active:shadow-neu-pressed transition-all duration-150 cursor-pointer"
              aria-label="Page Information"
              title={uiStrings.badge}
            >
              <Info className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.3]" />
            </button>
          )}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="w-10 h-10 rounded-2xl flex items-center justify-center neu-raised-sm bg-[#F0F3F8] dark:bg-[#2B3140] border border-white/80 dark:border-white/10 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:shadow-neu-raised active:shadow-neu-pressed transition-all duration-300 cursor-pointer"
              aria-label="Refresh"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2]" />
            </button>
          )}
          {rightAction}
        </div>
      </div>

      {/* Page Info & Help Guide Modal */}
      {isInfoOpen && activeGuide && createPortal(
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/45 dark:bg-black/55 backdrop-blur-[3px] animate-in fade-in duration-200"
          onClick={() => setIsInfoOpen(false)}
        >
          <div 
            className="w-full max-w-md bg-[#E8EDF3] dark:bg-[#262B36] rounded-3xl shadow-neu-raised-lg border border-[#D5DDE7] dark:border-[#303746] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-[#D5DDE7] dark:border-[#303746] flex items-center justify-between gap-3 bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 text-white shrink-0 shadow-md">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                  <Info className="w-4 h-4 text-white stroke-[2.5]" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-sm sm:text-base tracking-wide uppercase truncate">
                    {activeGuide.title}
                  </h3>
                  <p className="text-[10px] text-blue-100 font-medium tracking-wide uppercase">
                    {uiStrings.badge}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsInfoOpen(false)}
                className="p-1.5 rounded-xl hover:bg-black/20 text-white transition-colors shrink-0 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto">
              {/* Section 1: What is this page */}
              <div className="rounded-2xl p-4 bg-[#F0F3F8] dark:bg-[#2B3140] border border-[#D5DDE7] dark:border-[#303746] shadow-neu-raised-sm">
                <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide text-blue-700 dark:text-blue-300 mb-1">
                  <HelpCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{uiStrings.whatIsThis}</span>
                </div>
                <p className="text-xs sm:text-[13px] text-[#263244] dark:text-[#F0F3F8] font-medium leading-relaxed">
                  {activeGuide.whatIsThis}
                </p>
              </div>

              {/* Section 2: What to do on this page */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide text-[#263244] dark:text-[#F0F3F8]">
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5] text-emerald-600 dark:text-emerald-400" />
                  <span>{uiStrings.whatToDo}</span>
                </div>
                <div className="space-y-2">
                  {activeGuide.whatToDo.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#DEE4ED] dark:bg-[#1B1F27] border border-[#D5DDE7]/80 dark:border-[#303746] shadow-neu-inset-sm text-xs sm:text-[13px] text-[#263244] dark:text-[#F0F3F8]"
                    >
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                        {idx + 1}
                      </span>
                      <span className="font-medium leading-relaxed flex-1">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Pro Tip */}
              {activeGuide.tips && (
                <div className="rounded-2xl p-3.5 bg-amber-500/10 dark:bg-amber-950/25 border border-amber-500/30 dark:border-amber-800/40 shadow-neu-raised-sm flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] sm:text-xs text-amber-900 dark:text-amber-200 font-medium leading-relaxed">
                    <strong className="font-bold">{uiStrings.proTip}:</strong> {activeGuide.tips}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#D5DDE7] dark:border-[#303746] bg-[#E8EDF3] dark:bg-[#262B36] flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setIsInfoOpen(false)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl neu-button-primary text-white font-black text-xs uppercase tracking-wider cursor-pointer"
              >
                {uiStrings.gotIt}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
