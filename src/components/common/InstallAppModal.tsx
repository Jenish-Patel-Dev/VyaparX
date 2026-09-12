import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Laptop,
  Smartphone,
  CheckCircle2,
  Sparkles,
  Share2,
  MoreVertical,
  PlusSquare,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { usePwa } from '../../context/PwaContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

type DevicePlatform = 'desktop' | 'android' | 'ios';

export const InstallAppModal: React.FC = () => {
  const { isInstallModalOpen, setIsInstallModalOpen, canPromptDirectly, promptInstall, isInstalled } = usePwa();
  const { palette } = useTheme();
  const { t } = useLanguage();

  const [selectedPlatform, setSelectedPlatform] = useState<DevicePlatform>('desktop');

  // Auto-detect device platform
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ua = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setSelectedPlatform('ios');
    } else if (/android/.test(ua)) {
      setSelectedPlatform('android');
    } else {
      setSelectedPlatform('desktop');
    }
  }, []);

  if (!isInstallModalOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-xl animate-in fade-in duration-200"
      style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
    >
      <div
        className="glass-card border border-white/70 dark:border-white/15 rounded-3xl max-w-lg w-full overflow-hidden shadow-glass-hover animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="relative p-5 border-b border-white/30 dark:border-white/10 bg-gradient-to-r from-blue-50/50 dark:from-white/5 to-transparent">
          <button
            type="button"
            onClick={() => setIsInstallModalOpen(false)}
            className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-white/50 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="VyaparX" className="w-12 h-12 object-contain drop-shadow-md shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">
                  {t('pwa.installModalTitle', 'Download VyaparX App')}
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                  Web App
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {t('pwa.installModalDesc', 'Install VyaparX as an application on your PC, laptop, or smartphone')}
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Status banner if already installed */}
          {isInstalled ? (
            <div className="flex items-center gap-3 p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="font-bold">{t('pwa.alreadyInstalledTitle', 'VyaparX is already installed!')}</p>
                <p className="text-[11px] opacity-90">
                  {t('pwa.alreadyInstalledDesc', 'You can launch it directly from your applications or home screen.')}
                </p>
              </div>
            </div>
          ) : null}

          {/* Direct Install Button (if browser triggered beforeinstallprompt) */}
          {canPromptDirectly && !isInstalled && (
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-blue-900 dark:text-blue-200">
                  {t('pwa.readyToInstall', 'Quick 1-Click Install Available')}
                </p>
                <p className="text-[11px] text-blue-700 dark:text-blue-400">
                  {t('pwa.readyToInstallDesc', 'Click below to install immediately onto your device')}
                </p>
              </div>
              <button
                type="button"
                onClick={promptInstall}
                className="btn-glass-primary w-full sm:w-auto px-4 py-2 text-white font-bold text-xs rounded-xl shadow-glass flex items-center justify-center gap-2 transition-all shrink-0 active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>{t('pwa.installNow', 'Install Now')}</span>
              </button>
            </div>
          )}

          {/* Platform Selector Tabs */}
          <div>
            <div className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
              {t('pwa.howToInstallTitle', 'Choose your device for instructions')}:
            </div>
            <div className="grid grid-cols-3 gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setSelectedPlatform('desktop')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                  selectedPlatform === 'desktop'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>Desktop / PC</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPlatform('android')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                  selectedPlatform === 'android'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Android</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPlatform('ios')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                  selectedPlatform === 'ios'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>iPhone / iPad</span>
              </button>
            </div>
          </div>

          {/* Platform Specific Instruction Cards */}
          <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-4 border border-gray-100 dark:border-gray-800 space-y-3">
            {selectedPlatform === 'desktop' && (
              <div className="space-y-2.5 text-xs text-gray-700 dark:text-gray-300">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <span className="font-bold">Chrome / Edge Address Bar:</span>{' '}
                    Look at the right side of the browser URL bar for the{' '}
                    <span className="inline-flex items-center font-mono font-bold bg-white dark:bg-gray-700 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600">
                      Install <Download className="w-3 h-3 ml-1 inline text-blue-500" />
                    </span>{' '}
                    icon.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <span className="font-bold">Or click browser Menu:</span> Click the 3 dots{' '}
                    <span className="inline-flex items-center font-mono bg-white dark:bg-gray-700 px-1 rounded border border-gray-200 dark:border-gray-600">
                      <MoreVertical className="w-3 h-3" />
                    </span>{' '}
                    in the top-right &rarr; Select <span className="font-bold text-gray-900 dark:text-white">"Install VyaparX"</span> (or "Save and share" &rarr; "Install").
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <span className="font-bold">Launch App:</span> Click{' '}
                    <span className="font-bold text-gray-900 dark:text-white">"Install"</span>. An app shortcut will be added to your Desktop, Taskbar, and Start Menu!
                  </div>
                </div>
              </div>
            )}

            {selectedPlatform === 'android' && (
              <div className="space-y-2.5 text-xs text-gray-700 dark:text-gray-300">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <span className="font-bold">Open Menu:</span> Tap the{' '}
                    <span className="inline-flex items-center font-mono bg-white dark:bg-gray-700 px-1 py-0.5 rounded border border-gray-200 dark:border-gray-600">
                      <MoreVertical className="w-3.5 h-3.5 inline text-gray-700 dark:text-gray-200" />
                    </span>{' '}
                    three dots at the top-right of Chrome or Edge browser.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <span className="font-bold">Select Install:</span> Tap{' '}
                    <span className="font-bold text-gray-900 dark:text-white">"Install app"</span> or{' '}
                    <span className="font-bold text-gray-900 dark:text-white">"Add to Home screen"</span>.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <span className="font-bold">Confirm:</span> Tap{' '}
                    <span className="font-bold text-gray-900 dark:text-white">"Install"</span>. The VyaparX app icon will appear on your phone home screen like a native app!
                  </div>
                </div>
              </div>
            )}

            {selectedPlatform === 'ios' && (
              <div className="space-y-2.5 text-xs text-gray-700 dark:text-gray-300">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <span className="font-bold">Tap Share in Safari:</span> At the bottom bar of Safari, tap the{' '}
                    <span className="inline-flex items-center font-mono bg-white dark:bg-gray-700 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600">
                      Share <Share2 className="w-3 h-3 ml-1 inline text-blue-500" />
                    </span>{' '}
                    button.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <span className="font-bold">Add to Home Screen:</span> Scroll down the share sheet and tap{' '}
                    <span className="font-bold text-gray-900 dark:text-white">
                      "Add to Home Screen" <PlusSquare className="w-3 h-3 ml-1 inline text-gray-700 dark:text-gray-300" />
                    </span>.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <span className="font-bold">Add:</span> Tap{' '}
                    <span className="font-bold text-gray-900 dark:text-white">"Add"</span> in the top right. VyaparX is now installed on your home screen!
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* App Advantages */}
          <div className="grid grid-cols-3 gap-2 text-center pt-1">
            <div className="p-2 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800">
              <Sparkles className="w-4 h-4 mx-auto mb-1 text-amber-500" />
              <div className="text-[11px] font-bold text-gray-900 dark:text-white">Fast Access</div>
              <div className="text-[9px] text-gray-400">Desktop / Mobile</div>
            </div>
            <div className="p-2 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800">
              <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-emerald-500" />
              <div className="text-[11px] font-bold text-gray-900 dark:text-white">Offline Ready</div>
              <div className="text-[9px] text-gray-400">Dexie local DB</div>
            </div>
            <div className="p-2 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800">
              <Laptop className="w-4 h-4 mx-auto mb-1 text-blue-500" />
              <div className="text-[11px] font-bold text-gray-900 dark:text-white">Full Screen</div>
              <div className="text-[9px] text-gray-400">No browser bars</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-850 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end">
          <button
            type="button"
            onClick={() => setIsInstallModalOpen(false)}
            className="btn-glass-secondary px-5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            {t('common.cancel', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};
