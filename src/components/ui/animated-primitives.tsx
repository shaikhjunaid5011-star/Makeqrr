import * as React from 'react';
import { motion, useInView } from 'motion/react';
import { usePrefersReducedMotion } from '../../lib/motion-system';
import { cn } from '../../lib/utils';

/**
 * MagneticWrapper
 * Applies a subtle magnetic cursor-pull effect on desktop devices with a fine pointer.
 * Automatically disabled on touch devices and when prefers-reduced-motion is enabled.
 */
export interface MagneticWrapperProps {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}

export const MagneticWrapper: React.FC<MagneticWrapperProps> = ({
  children,
  strength = 0.22,
  className
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const prefersReduced = usePrefersReducedMotion();
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const [isFinePointer, setIsFinePointer] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    setIsFinePointer(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsFinePointer(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (prefersReduced || !isFinePointer || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - centerX) * strength;
      const deltaY = (e.clientY - centerY) * strength;
      setOffset({
        x: Math.max(-10, Math.min(10, deltaX)),
        y: Math.max(-8, Math.min(8, deltaY))
      });
    },
    [prefersReduced, isFinePointer, strength]
  );

  const handleMouseLeave = React.useCallback(() => {
    if (offset.x !== 0 || offset.y !== 0) {
      setOffset({ x: 0, y: 0 });
    }
  }, [offset.x, offset.y]);

  if (prefersReduced || !isFinePointer) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: offset.x, y: offset.y }}
      transition={{ type: 'spring', stiffness: 280, damping: 20, mass: 0.5 }}
      className={cn('inline-flex', className)}
    >
      {children}
    </motion.div>
  );
};

/**
 * AnimatedCounter
 * Animates a number from 0 to target value once when scrolled into view.
 */
export interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  durationMs?: number;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  suffix = '',
  prefix = '',
  durationMs = 950,
  className
}) => {
  const ref = React.useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-30px' });
  const prefersReduced = usePrefersReducedMotion();
  const [displayValue, setDisplayValue] = React.useState(prefersReduced ? value : 0);

  React.useEffect(() => {
    if (prefersReduced) {
      setDisplayValue(value);
      return;
    }
    if (!isInView) return;

    let rafId: number;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      // easeOutExpo curve
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayValue(Math.round(eased * value));
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [isInView, value, durationMs, prefersReduced]);

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
};

/**
 * AnimatedDivider
 * Premium scroll-revealed section divider with a subtle glowing #E64500 center highlight.
 */
export const AnimatedDivider: React.FC<{ className?: string }> = ({ className }) => {
  const prefersReduced = usePrefersReducedMotion();

  return (
    <div className={cn('relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden', className)} aria-hidden="true">
      <motion.div
        initial={prefersReduced ? { scaleX: 1, opacity: 1 } : { scaleX: 0.2, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="h-px w-full bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-800 to-transparent relative flex items-center justify-center"
      >
        <div className="w-28 sm:w-44 h-px bg-gradient-to-r from-transparent via-[#E64500]/65 to-transparent" />
      </motion.div>
    </div>
  );
};
