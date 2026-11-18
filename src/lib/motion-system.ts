import * as React from 'react';
import type { Variants } from 'motion/react';
import confetti from 'canvas-confetti';

/**
 * Standard Awwwards / Apple-grade cubic-bezier easing curves
 */
export const EASINGS = {
  // Ultra-smooth decelerate (fast out, gentle settle)
  easeOutExpo: [0.16, 1, 0.3, 1] as const,
  // Snappy responsive interaction
  easeOutBack: [0.34, 1.56, 0.64, 1] as const,
  // Balanced editorial smooth curve
  easeInOutCubic: [0.65, 0, 0.35, 1] as const,
  // Gentle ease in-out
  easeInOutSine: [0.37, 0, 0.63, 1] as const
};

export const SPRINGS = {
  gentle: { type: 'spring' as const, damping: 28, stiffness: 320 },
  responsive: { type: 'spring' as const, damping: 22, stiffness: 380 },
  bouncy: { type: 'spring' as const, damping: 14, stiffness: 350 },
  stiff: { type: 'spring' as const, damping: 30, stiffness: 500 }
};

/**
 * Page route transition variants with subtle blur-to-clear entrance
 */
export const pageTransitionVariants: Variants = {
  initial: {
    opacity: 0,
    y: 14,
    scale: 0.992,
    filter: 'blur(4px)'
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.36,
      ease: [0.16, 1, 0.3, 1]
    }
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.995,
    filter: 'blur(2px)',
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1]
    }
  }
};

/**
 * Staggered container for grids and lists
 */
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.03
    }
  }
};

export const staggerItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
    scale: 0.98
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.36,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

/**
 * Viewport scroll reveal variants (runs once on enter)
 */
export const scrollRevealVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
    scale: 0.985
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.48,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

/**
 * Modal / Dialog spring reveal variants
 */
export const dialogVariants: {
  backdrop: Variants;
  content: Variants;
} = {
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, transition: { duration: 0.18, ease: [0.4, 0, 1, 1] } }
  },
  content: {
    initial: { opacity: 0, scale: 0.95, y: 12 },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 26,
        stiffness: 340
      }
    },
    exit: {
      opacity: 0,
      scale: 0.96,
      y: 8,
      transition: { duration: 0.16, ease: [0.4, 0, 1, 1] }
    }
  }
};

/**
 * Accordion smooth slide variants
 */
export const accordionContentVariants: Variants = {
  closed: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
      opacity: { duration: 0.15 }
    }
  },
  open: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
      opacity: { duration: 0.22, delay: 0.04 }
    }
  }
};

/**
 * Hook to check prefers-reduced-motion
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mediaQuery.matches);

    const listener = (event: MediaQueryListEvent) => {
      setReduced(event.matches);
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  return reduced;
}

/**
 * Celebratory particle burst for Template Apply, QR Export, and Copy actions
 */
export function triggerCelebration(originX = 0.5, originY = 0.6) {
  try {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { x: originX, y: originY },
      colors: ['#E64500', '#ff7a3d', '#f59e0b', '#10b981', '#06b6d4'],
      disableForReducedMotion: true,
      ticks: 200,
      gravity: 1.2,
      scalar: 0.85
    });
  } catch {
    // Ignore in unsupported environments
  }
}
