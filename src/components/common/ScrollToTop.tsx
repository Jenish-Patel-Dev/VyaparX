import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Ensures that upon every navigation or route change,
 * the viewport and all main scrollable containers instantly scroll to the very top (0, 0),
 * preventing pages from opening scrolled down or cutting off top headers.
 */
export const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    const resetScroll = () => {
      // 1. Window & Document root
      try {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
      } catch {
        window.scrollTo(0, 0);
      }

      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
        document.documentElement.scrollLeft = 0;
      }
      if (document.body) {
        document.body.scrollTop = 0;
        document.body.scrollLeft = 0;
      }

      // 2. All nested scrollable containers (e.g. AppShell <main>, modal views)
      const scrollContainers = document.querySelectorAll<HTMLElement>(
        'main, [role="main"], .overflow-y-auto, [class*="overflow-y-auto"]'
      );
      scrollContainers.forEach(container => {
        try {
          container.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
        } catch {
          container.scrollTop = 0;
        }
        container.scrollTop = 0;
        container.scrollLeft = 0;
      });
    };

    // Immediate scroll reset
    resetScroll();

    // Next animation frame pass (handles immediate DOM replacement)
    const rafId = requestAnimationFrame(() => {
      resetScroll();
    });

    // Micro-delay pass (handles async state renders / data fetching)
    const timerId = setTimeout(() => {
      resetScroll();
    }, 40);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timerId);
    };
  }, [pathname, search]);

  return null;
};
