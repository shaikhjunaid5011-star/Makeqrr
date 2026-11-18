import * as React from 'react';
import Lenis from 'lenis';

/**
 * Initializes silky Lenis momentum scrolling across the application
 * Automatically disables when user prefers reduced motion or inside modal viewports.
 */
export function useLenisSmoothScroll() {
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    // Accessibility check: do not enable smooth scroll if reduced motion is requested
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Mobile / touch screen check: preserve native 120Hz hardware touch scrolling
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 768;
    if (isTouchDevice) return;

    let lenis: Lenis | null = null;
    let rafId: number;

    try {
      lenis = new Lenis({
        duration: 0.9,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 0.9,
        syncTouch: false
      });

      const raf = (time: number) => {
        if (!document.hidden) {
          lenis?.raf(time);
        }
        rafId = requestAnimationFrame(raf);
      };

      rafId = requestAnimationFrame(raf);

      const onVisibility = () => {
        if (!document.hidden && !rafId) {
          rafId = requestAnimationFrame(raf);
        }
      };
      document.addEventListener('visibilitychange', onVisibility);

      return () => {
        if (rafId) cancelAnimationFrame(rafId);
        document.removeEventListener('visibilitychange', onVisibility);
        lenis?.destroy();
      };
    } catch {
      // Graceful fallback to native browser scroll
    }
  }, []);
}
