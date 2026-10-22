import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PwaContextType {
  isInstalled: boolean;
  canPromptDirectly: boolean;
  isInstallModalOpen: boolean;
  setIsInstallModalOpen: (open: boolean) => void;
  promptInstall: () => Promise<void>;
  // PWA Update Management
  isUpdateAvailable: boolean;
  isUpdateModalOpen: boolean;
  setIsUpdateModalOpen: (open: boolean) => void;
  isUpdating: boolean;
  applyUpdate: () => Promise<void>;
  dismissUpdate: () => void;
  checkForUpdates: () => Promise<boolean>;
}

const PwaContext = createContext<PwaContextType | undefined>(undefined);

// Module-level variable to store prompt event if it fires before React mounts
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
    window.dispatchEvent(new CustomEvent('pwa-prompt-ready'));
  });
}

export const PwaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(globalDeferredPrompt);
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      Boolean((window.navigator as unknown as { standalone?: boolean }).standalone)
    );
  });
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // Update States
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const latestServerVersionRef = useRef<string | null>(null);

  // Check Service Worker Registration for updates
  const checkSwUpdate = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return false;
    // Don't show update prompt in local development mode
    if (import.meta.env.DEV) return false;

    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg) return false;

      setSwRegistration(reg);

      // Check if a worker is already waiting in background
      if (reg.waiting) {
        setIsUpdateAvailable(true);
        if (!sessionStorage.getItem('vyaparx_update_dismissed')) {
          setIsUpdateModalOpen(true);
        }
        return true;
      }

      // Explicitly check server for newer sw.js
      await reg.update().catch(() => {});

      if (reg.waiting) {
        setIsUpdateAvailable(true);
        if (!sessionStorage.getItem('vyaparx_update_dismissed')) {
          setIsUpdateModalOpen(true);
        }
        return true;
      }
    } catch (err) {
      console.warn('SW check update error:', err);
    }
    return false;
  }, []);

  // Check version.json (Bulletproof HTTP polling check)
  const checkVersionJsonUpdate = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    // Don't show update prompt in local development mode
    if (import.meta.env.DEV) return false;

    try {
      const res = await fetch(`/version.json?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (!data.version) return false;

        latestServerVersionRef.current = String(data.version);

        // If client has already updated/acknowledged this exact version, do not prompt
        const acknowledgedVersion = localStorage.getItem('vyaparx_client_build_id');
        if (acknowledgedVersion === String(data.version)) {
          return false;
        }

        const clientBuildId = typeof __APP_BUILD_ID__ !== 'undefined' ? String(__APP_BUILD_ID__) : undefined;
        const activeBuildId = acknowledgedVersion || clientBuildId;

        // If the server version differs from the active client build
        if (activeBuildId && data.version && String(data.version) !== activeBuildId) {
          console.log(`[PWA Update] New version detected: server=${data.version}, client=${activeBuildId}`);
          setIsUpdateAvailable(true);
          if (!sessionStorage.getItem('vyaparx_update_dismissed')) {
            setIsUpdateModalOpen(true);
          }
          return true;
        } else if (!acknowledgedVersion && data.version) {
          // Initialize baseline client build id
          localStorage.setItem('vyaparx_client_build_id', String(data.version));
        }
      }
    } catch {
      // Network offline or error - silently ignore
    }
    return false;
  }, []);

  // Combined update checker
  const checkForUpdates = useCallback(async (): Promise<boolean> => {
    if (import.meta.env.DEV) return false;
    const swFound = await checkSwUpdate();
    if (swFound) return true;
    return await checkVersionJsonUpdate();
  }, [checkSwUpdate, checkVersionJsonUpdate]);

  // Apply update immediately: acknowledge version, purge cache, notify SW, reload
  const applyUpdate = useCallback(async (): Promise<void> => {
    setIsUpdating(true);

    try {
      // 1. Mark this version as acknowledged so it NEVER loops again after reload
      if (latestServerVersionRef.current) {
        localStorage.setItem('vyaparx_client_build_id', latestServerVersionRef.current);
      }
      sessionStorage.setItem('vyaparx_update_dismissed', 'true');
      setIsUpdateModalOpen(false);
      setIsUpdateAvailable(false);

      // 2. Send skip waiting to all waiting or active service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          if (reg.waiting) {
            reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
          if (reg.active) {
            reg.active.postMessage({ type: 'SKIP_WAITING' });
            reg.active.postMessage({ type: 'CLEAR_CACHE' });
          }
          await reg.update().catch(() => {});
        }
      }

      // 3. Clear all CacheStorage entries
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }

      // 4. Short grace period for SW activate
      await new Promise((resolve) => setTimeout(resolve, 300));

      // 5. Hard reload page with cache-busting timestamp
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('_v', Date.now().toString());
      window.location.replace(currentUrl.toString());
    } catch (err) {
      console.error('Error applying update:', err);
      window.location.reload();
    }
  }, []);

  // Dismiss update dialog temporarily (leaves header badge active)
  const dismissUpdate = useCallback(() => {
    setIsUpdateModalOpen(false);
    sessionStorage.setItem('vyaparx_update_dismissed', 'true');
  }, []);

  // Listen to Service Worker events and register lifecycle
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Handle standalone media query changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      if (e.matches) setIsInstalled(true);
    };
    mediaQuery.addEventListener('change', handleMediaChange);

    if (globalDeferredPrompt && !deferredPrompt) {
      setDeferredPrompt(globalDeferredPrompt);
    }

    const handlePromptReady = () => {
      setDeferredPrompt(globalDeferredPrompt);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      globalDeferredPrompt = null;
      setIsInstallModalOpen(false);
    };

    window.addEventListener('pwa-prompt-ready', handlePromptReady);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Service Worker update detection (production only)
    if (!import.meta.env.DEV && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setSwRegistration(reg);

        if (reg.waiting) {
          setIsUpdateAvailable(true);
          if (!sessionStorage.getItem('vyaparx_update_dismissed')) {
            setIsUpdateModalOpen(true);
          }
        }

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker has installed and is waiting
              setIsUpdateAvailable(true);
              if (!sessionStorage.getItem('vyaparx_update_dismissed')) {
                setIsUpdateModalOpen(true);
              }
            }
          });
        });
      });

      // Reload if another tab or worker took over control
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }

    // Initial check after app mounts (production only)
    let initialTimer: ReturnType<typeof setTimeout> | undefined;
    let intervalTimer: ReturnType<typeof setInterval> | undefined;

    if (!import.meta.env.DEV) {
      initialTimer = setTimeout(() => {
        checkForUpdates();
      }, 2500);

      // Periodic check every 60 seconds
      intervalTimer = setInterval(() => {
        checkForUpdates();
      }, 60000);
    }

    // Check whenever user switches back to this tab or app is foregrounded
    const handleVisibility = () => {
      if (!import.meta.env.DEV && document.visibilityState === 'visible') {
        checkForUpdates();
      }
    };
    const handleFocus = () => {
      if (!import.meta.env.DEV) checkForUpdates();
    };
    const handleOnline = () => {
      if (!import.meta.env.DEV) checkForUpdates();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
      window.removeEventListener('pwa-prompt-ready', handlePromptReady);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (initialTimer) clearTimeout(initialTimer);
      if (intervalTimer) clearInterval(intervalTimer);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
    };
  }, [checkForUpdates, deferredPrompt]);

  const promptInstall = async () => {
    const promptEvent = deferredPrompt || globalDeferredPrompt;
    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          setDeferredPrompt(null);
          globalDeferredPrompt = null;
          setIsInstallModalOpen(false);
        }
      } catch (err) {
        console.error('PWA install prompt error:', err);
        setIsInstallModalOpen(true);
      }
    } else {
      // Fallback: Show visual step-by-step guidance modal
      setIsInstallModalOpen(true);
    }
  };

  return (
    <PwaContext.Provider
      value={{
        isInstalled,
        canPromptDirectly: Boolean(deferredPrompt || globalDeferredPrompt),
        isInstallModalOpen,
        setIsInstallModalOpen,
        promptInstall,
        isUpdateAvailable,
        isUpdateModalOpen,
        setIsUpdateModalOpen,
        isUpdating,
        applyUpdate,
        dismissUpdate,
        checkForUpdates,
      }}
    >
      {children}
    </PwaContext.Provider>
  );
};

export const usePwa = (): PwaContextType => {
  const context = useContext(PwaContext);
  if (!context) {
    throw new Error('usePwa must be used within a PwaProvider');
  }
  return context;
};
