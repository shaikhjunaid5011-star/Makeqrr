import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from '../../lib/router';
import { usePrefersReducedMotion } from '../../lib/motion-system';

export const AmbientBackground: React.FC = React.memo(() => {
  const { pathname } = useLocation();
  const prefersReduced = usePrefersReducedMotion();
  const [navigating, setNavigating] = React.useState(false);

  // Trigger top route loading shimmer on route navigation
  React.useEffect(() => {
    setNavigating(true);
    const timer = setTimeout(() => {
      setNavigating(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Pause decorative CSS animations when browser tab is hidden to save battery & CPU
  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    const handleVisibility = () => {
      if (document.hidden) {
        document.documentElement.classList.add('tab-hidden');
      } else {
        document.documentElement.classList.remove('tab-hidden');
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  return (
    <>
      {/* Top Route Progress Glow Line */}
      <AnimatePresence>
        {navigating && !prefersReduced && (
          <motion.div
            initial={{ scaleX: 0, opacity: 0.9 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: '0% 50%' }}
            className="fixed top-0 left-0 right-0 h-[2px] z-50 bg-gradient-to-r from-orange-500 via-[#E64500] to-amber-500 pointer-events-none shadow-[0_0_8px_rgba(230,69,0,0.6)]"
          />
        )}
      </AnimatePresence>
    </>
  );
});

AmbientBackground.displayName = 'AmbientBackground';
