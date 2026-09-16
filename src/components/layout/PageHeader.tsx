import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Info, X, CheckCircle2, HelpCircle, Lightbulb } from 'lucide-react';
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
            <h1 className="text-base sm:text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight truncate uppercase">
              {title}
            </h1>
            {showCompanyInfo && (effectiveCompanyName || effectiveFY) && (
              <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5 min-w-0 flex items-center gap-1.5">
                {effectiveCompanyName && (
                  <span className="text-slate-700 dark:text-slate-200 font-bold uppercase truncate">
                    {effectiveCompanyName}
                  </span>
                )}
                {effectiveFY && (
                  <span className="text-slate-500 dark:text-slate-400 font-semibold shrink-0">
                    ({effectiveFY})
                  </span>
                )}
              </div>
            )}
            {subtitle && (
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {showInfo && activeGuide && (
            <button
              type="button"
              onClick={() => setIsInfoOpen(true)}
              className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 rounded-full bg-white/95 dark:bg-slate-800/90 border border-[#DCE6F2] dark:border-slate-700/80 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.98),0_2px_8px_rgba(37,99,235,0.08)] transition-all active:scale-95 duration-150 cursor-pointer flex items-center justify-center"
              aria-label="Page Information"
              title={uiStrings.badge}
            >
              <Info className="w-4 h-4 stroke-[2.3]" />
            </button>
          )}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 rounded-full bg-white/95 dark:bg-slate-800/90 border border-[#DCE6F2] dark:border-slate-700/80 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.98),0_2px_8px_rgba(37,99,235,0.08)] transition-all active:rotate-180 duration-300 cursor-pointer"
              aria-label="Refresh"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4 stroke-[2]" />
            </button>
          )}
          {rightAction}
        </div>
      </div>

      {/* Page Info & Help Guide Modal */}
      {isInfoOpen && activeGuide && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsInfoOpen(false)}
        >
          <div 
            className="w-full max-w-md bg-white/95 dark:bg-[#111827]/95 backdrop-blur-3xl rounded-3xl shadow-[0_25px_60px_-15px_rgba(37,99,235,0.25)] border border-[#DCE6F2] dark:border-white/15 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-[#DCE6F2] dark:border-white/10 flex items-center justify-between gap-3 bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 text-white shrink-0 shadow-glass">
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
              <div className="rounded-2xl p-3.5 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
                <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide text-blue-700 dark:text-blue-300 mb-1">
                  <HelpCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{uiStrings.whatIsThis}</span>
                </div>
                <p className="text-xs sm:text-[13px] text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  {activeGuide.whatIsThis}
                </p>
              </div>

              {/* Section 2: What to do on this page */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5] text-emerald-600 dark:text-emerald-400" />
                  <span>{uiStrings.whatToDo}</span>
                </div>
                <div className="space-y-1.5">
                  {activeGuide.whatToDo.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs sm:text-[13px] text-slate-700 dark:text-slate-300"
                    >
                      <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="font-medium leading-relaxed flex-1">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Pro Tip */}
              {activeGuide.tips && (
                <div className="rounded-2xl p-3 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] sm:text-xs text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                    <strong className="font-bold">{uiStrings.proTip}:</strong> {activeGuide.tips}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#DCE6F2] dark:border-white/10 bg-slate-50/70 dark:bg-slate-900/70 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setIsInfoOpen(false)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer"
              >
                {uiStrings.gotIt}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
