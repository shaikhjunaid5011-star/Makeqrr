import * as React from 'react';
import { flushSync } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme, Theme } from '../../lib/theme-context';
import { usePrefersReducedMotion } from '../../lib/motion-system';
import { Monitor, Sun, Moon, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md';
  align?: 'left' | 'right';
  showSystemIndicator?: boolean;
}

/**
 * Animated Theme Toggler
 * Recreates the Magic UI View Transitions API circular screen reveal
 * along with celestial morphing (☀ → ◐ → 🌙), tactile button response,
 * and comprehensive Light / Dark / System support.
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = React.memo(({
  className,
  size = 'md',
  align = 'right',
  showSystemIndicator = true
}) => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const prefersReduced = usePrefersReducedMotion();
  const isDark = resolvedTheme === 'dark';

  const [menuOpen, setMenuOpen] = React.useState(false);
  const [rippling, setRippling] = React.useState(false);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const longPressTimerRef = React.useRef<number | null>(null);

  // Unique mask ID for SVG lunar crescent cutout
  const maskId = React.useId();

  // Close context menu on click outside or Escape
  React.useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  /**
   * Executes theme change with full-screen circular reveal using View Transitions API
   * or smooth CSS fallback on older/unsupported browsers and reduced motion.
   */
  const executeThemeChange = React.useCallback(async (targetTheme: Theme, originX?: number, originY?: number) => {
    const isReduced = prefersReduced || (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const supportsViewTransition = typeof document !== 'undefined' && 'startViewTransition' in document;

    // Trigger physical ripple feedback on the button
    setRippling(true);
    setTimeout(() => setRippling(false), 550);

    // Fallback if View Transitions API is unavailable or user prefers reduced motion
    if (!supportsViewTransition || isReduced) {
      setTheme(targetTheme);
      return;
    }

    // Determine circular expansion epicenter
    const rect = buttonRef.current?.getBoundingClientRect();
    const x = originX !== undefined && originX > 0 ? originX : (rect ? rect.left + rect.width / 2 : window.innerWidth / 2);
    const y = originY !== undefined && originY > 0 ? originY : (rect ? rect.top + rect.height / 2 : 40);

    // Calculate maximum distance to screen corners for full 360-degree coverage
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    try {
      const transition = (document as any).startViewTransition(() => {
        flushSync(() => {
          setTheme(targetTheme);
        });
      });

      await transition.ready;

      // Animate circular clip-path expanding across the entire viewport
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`
          ]
        },
        {
          duration: 520,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          pseudoElement: '::view-transition-new(root)'
        }
      );
    } catch {
      // In case transition was aborted or cancelled
      setTheme(targetTheme);
    }
  }, [prefersReduced, setTheme]);

  // Handle primary click toggle
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (menuOpen) {
      setMenuOpen(false);
      return;
    }

    const currentResolved = theme === 'system' ? resolvedTheme : theme;
    const targetTheme: Theme = currentResolved === 'light' ? 'dark' : 'light';
    executeThemeChange(targetTheme, e.clientX, e.clientY);
  };

  // Support right-click to open 3-mode picker (Light · Dark · System)
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(prev => !prev);
  };

  // Touch long-press support for mobile
  const handleTouchStart = () => {
    longPressTimerRef.current = window.setTimeout(() => {
      setMenuOpen(true);
    }, 450);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // Accessible keyboard activation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const rect = buttonRef.current?.getBoundingClientRect();
      const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
      const y = rect ? rect.top + rect.height / 2 : 40;
      const currentResolved = theme === 'system' ? resolvedTheme : theme;
      const targetTheme: Theme = currentResolved === 'light' ? 'dark' : 'light';
      executeThemeChange(targetTheme, x, y);
    } else if (e.key === 'ArrowDown' || e.key === 'ContextMenu') {
      e.preventDefault();
      setMenuOpen(true);
    }
  };

  // Animation spring transitions
  const springTransition = prefersReduced
    ? { duration: 0.15 }
    : { type: 'spring' as const, stiffness: 280, damping: 20 };

  const rayTransition = prefersReduced
    ? { duration: 0.15 }
    : { type: 'spring' as const, stiffness: 320, damping: 22 };

  const buttonSizeClasses = size === 'sm'
    ? 'w-8.5 h-8.5 text-xs'
    : 'w-9.5 h-9.5 sm:w-10 sm:h-10 text-xs';

  const tooltipText = theme === 'system'
    ? `Theme: System (${resolvedTheme}) · Click to toggle · Right-click for options`
    : `Theme: ${theme === 'dark' ? 'Dark' : 'Light'} · Click to toggle · Right-click for options`;

  return (
    <div ref={containerRef} className="relative inline-flex items-center justify-center shrink-0">
      {/* Physical Interactive Theme Button - Monochrome Black & White regarding theme */}
      <motion.button
        ref={buttonRef}
        type="button"
        role="button"
        tabIndex={0}
        aria-label={
          isDark
            ? 'Switch to light mode (current: dark)'
            : 'Switch to dark mode (current: light)'
        }
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        title={tooltipText}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onKeyDown={handleKeyDown}
        whileTap={prefersReduced ? undefined : { scale: 0.92 }}
        className={cn(
          buttonSizeClasses,
          'relative rounded-full flex items-center justify-center cursor-pointer select-none overflow-hidden transition-all duration-200',
          'border shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E64500] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900',
          isDark
            ? 'bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 text-white border-neutral-700 shadow-sm'
            : 'bg-white hover:bg-neutral-100 active:bg-neutral-200 text-neutral-900 border-neutral-200 shadow-xs',
          className
        )}
      >
        {/* Physical Ripple Wave on Button Click */}
        <AnimatePresence>
          {rippling && !prefersReduced && (
            <motion.span
              initial={{ scale: 0.2, opacity: 0.4 }}
              animate={{ scale: 2.2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 rounded-full pointer-events-none bg-neutral-400/25 dark:bg-neutral-500/30"
            />
          )}
        </AnimatePresence>

        {/* ===================================================================== */}
        {/* EXACT MORPHING CELESTIAL SVG (☀ → ◐ → 🌙)                             */}
        {/* ===================================================================== */}
        <svg
          viewBox="0 0 24 24"
          className="w-4.5 h-4.5 sm:w-5 sm:h-5 relative z-10 overflow-visible"
          aria-hidden="true"
        >
          <defs>
            {/* Dynamic Eclipse Mask that sweeps across to form the crescent moon */}
            <mask id={maskId}>
              <rect x="0" y="0" width="24" height="24" fill="white" />
              <motion.circle
                animate={{
                  cx: isDark ? 17.5 : 27,
                  cy: isDark ? 6.5 : 2,
                  r: isDark ? 7.6 : 5.5
                }}
                transition={springTransition}
                fill="black"
              />
            </mask>
          </defs>

          {/* 1. Radial Sun Rays (8 rays with spring rotation & collapse) */}
          <motion.g
            animate={{
              rotate: isDark ? 90 : 0,
              scale: isDark ? 0 : 1,
              opacity: isDark ? 0 : 1
            }}
            transition={rayTransition}
            style={{ transformOrigin: '12px 12px' }}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            {/* Cardinal Rays */}
            <line x1="12" y1="1.75" x2="12" y2="4.25" />
            <line x1="12" y1="19.75" x2="12" y2="22.25" />
            <line x1="1.75" y1="12" x2="4.25" y2="12" />
            <line x1="19.75" y1="12" x2="22.25" y2="12" />

            {/* Diagonal Rays */}
            <line x1="4.75" y1="4.75" x2="6.5" y2="6.5" />
            <line x1="17.5" y1="17.5" x2="19.25" y2="19.25" />
            <line x1="4.75" y1="19.25" x2="6.5" y2="17.5" />
            <line x1="17.5" y1="6.5" x2="19.25" y2="4.75" />
          </motion.g>

          {/* 2. Central Celestial Body (Sun Disc / Crescent Moon) */}
          <motion.circle
            cx="12"
            cy="12"
            animate={{
              r: isDark ? 8.2 : 5.2
            }}
            transition={springTransition}
            fill="currentColor"
            mask={`url(#${maskId})`}
          />
        </svg>

        {/* 4. Subtle System Sync Indicator Dot */}
        {showSystemIndicator && theme === 'system' && (
          <span
            aria-hidden="true"
            title="Syncing with OS theme"
            className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-[#E64500] ring-1.5 ring-white dark:ring-neutral-900"
          />
        )}
      </motion.button>

      {/* ===================================================================== */}
      {/* QUICK CONTEXT MENU (Light · Dark · System)                            */}
      {/* Opens on right-click or long-press, or keyboard ContextMenu           */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 4 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "absolute top-full mt-2 z-50 p-1.5 rounded-2xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-neutral-200/80 dark:border-neutral-800 shadow-xl min-w-[150px] space-y-0.5",
              align === 'right' ? 'right-0' : 'left-0'
            )}
          >
            <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400 font-mono">
              Theme Mode
            </div>

            {[
              {
                id: 'light' as const,
                label: 'Light',
                icon: Sun,
                iconColor: 'text-neutral-900 dark:text-neutral-100'
              },
              {
                id: 'dark' as const,
                label: 'Dark',
                icon: Moon,
                iconColor: 'text-neutral-900 dark:text-neutral-100'
              },
              {
                id: 'system' as const,
                label: 'System',
                icon: Monitor,
                iconColor: 'text-neutral-600 dark:text-neutral-400'
              }
            ].map(opt => {
              const Icon = opt.icon;
              const isSelected = theme === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={(e) => {
                    setMenuOpen(false);
                    executeThemeChange(opt.id, e.clientX, e.clientY);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left",
                    isSelected
                      ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold"
                      : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={cn("w-3.5 h-3.5", opt.iconColor)} />
                    <span>{opt.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#E64500]" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

ThemeToggle.displayName = 'ThemeToggle';
