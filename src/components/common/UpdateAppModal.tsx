import React from 'react';
import {
  X,
  Sparkles,
  RefreshCw,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { usePwa } from '../../context/PwaContext';
import { useLanguage } from '../../context/LanguageContext';

export const UpdateAppModal: React.FC = () => {
  const {
    isUpdateAvailable,
    isUpdateModalOpen,
    isUpdating,
    applyUpdate,
    dismissUpdate,
  } = usePwa();
  const { t } = useLanguage();

  if (!isUpdateAvailable || !isUpdateModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/75 backdrop-blur-xl animate-in fade-in duration-200"
      style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
    >
      <div
        className="bg-[#E8EDF3] dark:bg-[#262B36] border border-white/60 dark:border-white/10 rounded-3xl max-w-md w-full overflow-hidden shadow-neu-raised-lg animate-in zoom-in-95 duration-200 relative"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={dismissUpdate}
          disabled={isUpdating}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:shadow-neu-inset-sm transition-all cursor-pointer disabled:opacity-30"
          aria-label="Close"
          title={t('pwa.remindLater', 'Remind Later')}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content Body */}
        <div className="p-6 text-center space-y-5">
          {/* Animated Glowing Icon Tile */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white flex items-center justify-center shadow-neu-raised-md relative">
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white dark:border-[#262B36]"></span>
            </span>
            {isUpdating ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <Sparkles className="w-8 h-8 animate-pulse text-amber-200" />
            )}
          </div>

          {/* Heading & Subtitle */}
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide uppercase bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40">
              <Zap className="w-3.5 h-3.5 fill-blue-500 text-blue-500" />
              <span>{t('pwa.updateBadge', 'Update Ready')}</span>
            </div>

            <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
              {t('pwa.updateAvailableTitle', 'New Update Available!')}
            </h3>

            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed max-w-sm mx-auto">
              {t(
                'pwa.updateAvailableDesc',
                'A new version of VyaparX is ready. Click below to update now and get the latest features instantly without reinstalling.'
              )}
            </p>
          </div>

          {/* Feature Highlights Recessed Card */}
          <div className="neu-inset-sm p-4 rounded-2xl border border-black/[0.04] dark:border-white/[0.06] text-left space-y-2.5">
            <div className="flex items-center gap-2.5 text-xs font-bold text-gray-800 dark:text-gray-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Instant reload with newest changes & fixes</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-bold text-gray-800 dark:text-gray-200">
              <RefreshCw className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Clears outdated cache automatically</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-bold text-gray-800 dark:text-gray-200">
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>All your offline data and accounts remain safe</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={applyUpdate}
              disabled={isUpdating}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 active:from-blue-700 active:to-indigo-700 text-white font-black text-sm shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('pwa.updating', 'Updating Application...')}</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 stroke-[2.5]" />
                  <span>{t('pwa.updateNow', 'Update Now')}</span>
                </>
              )}
            </button>

            {!isUpdating && (
              <button
                type="button"
                onClick={dismissUpdate}
                className="w-full py-2.5 px-4 rounded-2xl bg-[#F0F3F8] dark:bg-[#2B3140] hover:bg-black/5 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-xs font-bold shadow-neu-raised-sm hover:shadow-neu-raised active:shadow-neu-pressed transition-all cursor-pointer border border-white/60 dark:border-white/10"
              >
                {t('pwa.remindLater', 'Remind Later')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
