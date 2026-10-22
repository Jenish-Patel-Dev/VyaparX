/**
 * Platform Detection & Environment-Isolated Storage Utilities
 * 
 * Ensures strict isolation between:
 * 1. Web Browser (Website mode): Re-prompts on every fresh session/tab; stores strictly in sessionStorage.
 * 2. Installed App (PWA / Mobile Standalone): Prompts on first install; stored in localStorage across closes.
 */

export const APP_PWA_ACCEPTED_KEY = 'vyaparx_pwa_disclaimer_accepted_v1';
export const APP_WEB_SESSION_ACCEPTED_KEY = 'vyaparx_web_disclaimer_accepted_v1';

/**
 * Cross-Platform Standalone Detection Helper
 * Checks Capacitor native, Android WebAPK, iOS Safari standalone, manifest query params, and display-mode media queries.
 */
export const isStandaloneApp = (): boolean => {
  try {
    if (typeof window === 'undefined') return false;

    // 0. Capacitor / Cordova Native Mobile Container
    const win = window as any;
    if (win.Capacitor && typeof win.Capacitor.isNativePlatform === 'function' && win.Capacitor.isNativePlatform()) {
      return true;
    }

    // 1. Explicit start_url query param from manifest (?mode=pwa or ?source=pwa)
    if (window.location && window.location.search) {
      if (window.location.search.includes('mode=pwa') || window.location.search.includes('source=pwa')) {
        return true;
      }
    }

    // 2. iOS Safari Add-to-Home-Screen standalone mode
    if ((window.navigator as any).standalone === true) {
      return true;
    }

    // 3. Android WebAPK launch referrer
    if (typeof document !== 'undefined' && document.referrer && document.referrer.includes('android-app://')) {
      return true;
    }

    // 4. Standard W3C standalone display-mode media query
    if (typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
};

/**
 * Checks if user has already accepted the disclaimer according to current platform rules:
 * - Standalone App -> checks localStorage ONLY
 * - Web Browser -> checks sessionStorage ONLY
 */
export const hasAcceptedDisclaimer = (): boolean => {
  try {
    const isApp = isStandaloneApp();
    if (isApp) {
      return localStorage.getItem(APP_PWA_ACCEPTED_KEY) === 'true';
    } else {
      return sessionStorage.getItem(APP_WEB_SESSION_ACCEPTED_KEY) === 'true';
    }
  } catch {
    return false;
  }
};

/**
 * Saves acceptance according to current platform rules:
 * - Standalone App -> stores in localStorage
 * - Web Browser -> stores in sessionStorage (never leaks to localStorage)
 */
export const setAcceptedDisclaimer = (): void => {
  try {
    const isApp = isStandaloneApp();
    if (isApp) {
      localStorage.setItem(APP_PWA_ACCEPTED_KEY, 'true');
    } else {
      sessionStorage.setItem(APP_WEB_SESSION_ACCEPTED_KEY, 'true');
    }
  } catch (err) {
    console.error('Failed to save disclaimer acceptance:', err);
  }
};
