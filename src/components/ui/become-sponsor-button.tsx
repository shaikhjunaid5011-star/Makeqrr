import * as React from 'react';
import { Link } from '../../lib/router';
import { cn } from '../../lib/utils';

export interface BecomeSponsorButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  variant?: 'primary' | 'tinted' | 'auto';
  replace?: boolean;
}

/**
 * Interactive "Become a Sponsor" button with a large, soft, blurry ball effect.
 *
 * - The ball is locked on the Y-axis (fixed vertically at button center, 50%)
 * - Moves strictly horizontally along the X-axis (left to right, right to left)
 * - Zero vertical movement, zero bouncing, zero diagonal movement, zero Y-axis animation
 * - Approximately 3× the button's height in diameter (width matches height)
 * - Extends beyond the button edges and moves horizontally underneath/through the button
 * - Highly feathered, blurry, borderless shape using strong blur filters & radial gradients
 * - Enters smoothly on hover, travels fluidly across the X-axis, settles naturally
 * - Smoothly reverses/exits on mouse leave without suddenly disappearing
 * - Clean tap feedback on touch/mobile without leaving a sticky hover state
 * - Full keyboard focus support and respects prefers-reduced-motion
 * - Preserves button dimensions, primary #E64500 brand styling, and text readability (z-10)
 */
export const BecomeSponsorButton = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  BecomeSponsorButtonProps
>(
  (
    {
      href,
      onClick,
      className,
      children,
      variant = 'auto',
      replace = false,
      style,
      disabled,
      ...props
    },
    forwardedRef
  ) => {
    const containerRef = React.useRef<HTMLElement | null>(null);
    const isTouchRef = React.useRef(false);
    const touchTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    // Active state (hovered, touched, or keyboard-focused)
    const [isActive, setIsActive] = React.useState(false);
    const [isExiting, setIsExiting] = React.useState(false);
    const [isPressed, setIsPressed] = React.useState(false);

    // Dynamic button dimensions
    const [buttonDimensions, setButtonDimensions] = React.useState<{ width: number; height: number }>({
      width: 160,
      height: 48
    });

    // Horizontal coordinate of the ball (X-axis only; Y-axis is locked at center)
    const [coordX, setCoordX] = React.useState<number>(80);

    // Detect prefers-reduced-motion
    const [prefersReduced, setPrefersReduced] = React.useState(false);
    React.useEffect(() => {
      if (typeof window === 'undefined') return;
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReduced(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }, []);

    // Clean up timers
    React.useEffect(() => {
      return () => {
        if (touchTimeoutRef.current) {
          clearTimeout(touchTimeoutRef.current);
        }
      };
    }, []);

    // Determine variant (primary solid vermilion or tinted pill)
    const isPrimary =
      variant === 'primary' ||
      (variant === 'auto' && Boolean(className && className.includes('bg-[#E64500]')));

    // Measure button dimensions
    const measureDimensions = () => {
      const container = containerRef.current;
      if (!container) return { width: 160, height: 48 };
      const rect = container.getBoundingClientRect();
      const measured = { width: rect.width || 160, height: rect.height || 48 };
      setButtonDimensions(measured);
      return measured;
    };

    // Substantially expanded size: ~5.2× button height (both height and width matching for a huge soft volume)
    const buttonHeight = buttonDimensions.height || 48;
    const orbDiameter = Math.max(180, Math.round(buttonHeight * 5.2)); // ~250px diameter on a 48px button
    const orbRadius = orbDiameter / 2;

    // Expanded outer atmospheric diffusion aura size (~6.8× button height)
    const auraDiameter = Math.round(orbDiameter * 1.32); // ~330px diameter
    const auraRadius = auraDiameter / 2;

    // Mouse handlers (desktop) - X-axis only
    const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
      if (isTouchRef.current) return;
      measureDimensions();
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();

      const rawX = e.clientX - rect.left;
      setCoordX(rawX);
      setIsExiting(false);
      setIsActive(true);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
      if (isTouchRef.current || prefersReduced) return;
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();

      const rawX = e.clientX - rect.left;
      setCoordX(rawX);
      if (!isActive) {
        setIsExiting(false);
        setIsActive(true);
      }
    };

    const handleMouseLeave = () => {
      if (isTouchRef.current) return;
      // Smoothly reverse/exit without suddenly disappearing; retains last X position during fade-out
      setIsExiting(true);
      setIsActive(false);
    };

    // Touch handlers (mobile) - X-axis only
    const handleTouchStart = (e: React.TouchEvent<HTMLElement>) => {
      isTouchRef.current = true;
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
      measureDimensions();
      const container = containerRef.current;
      if (container && e.touches.length > 0) {
        const rect = container.getBoundingClientRect();
        const touch = e.touches[0];
        setCoordX(touch.clientX - rect.left);
      }
      setIsPressed(true);
      setIsActive(true);
      setIsExiting(false);
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLElement>) => {
      if (e.touches.length > 0 && !prefersReduced) {
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const touch = e.touches[0];
        setCoordX(touch.clientX - rect.left);
      }
    };

    const handleTouchEnd = () => {
      setIsPressed(false);
      // Clean non-sticky exit for mobile: smoothly fade out after a brief tap
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
      touchTimeoutRef.current = setTimeout(() => {
        setIsExiting(true);
        setIsActive(false);
        setTimeout(() => {
          isTouchRef.current = false;
        }, 300);
      }, 160);
    };

    const handleTouchCancel = () => {
      setIsPressed(false);
      setIsExiting(true);
      setIsActive(false);
      setTimeout(() => {
        isTouchRef.current = false;
      }, 200);
    };

    // Keyboard accessibility (centers the soft ball and glows)
    const handleFocus = () => {
      const dims = measureDimensions();
      setCoordX(dims.width / 2);
      setIsExiting(false);
      setIsActive(true);
    };

    const handleBlur = () => {
      setIsExiting(true);
      setIsActive(false);
    };

    // Shared ref merger
    const assignRef = (node: HTMLElement | null) => {
      containerRef.current = node;
      if (typeof forwardedRef === 'function') {
        forwardedRef(node as any);
      } else if (forwardedRef) {
        (forwardedRef as any).current = node;
      }
    };

    // The large, soft, blurry animated ball overlay (approx. 3× button height, locked Y at center 50%)
    const softBallOverlay = (
      <div
        className="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none select-none z-0"
        aria-hidden="true"
      >
        {/* Ambient background wash for seamless button illumination */}
        <div
          style={{
            opacity: isActive ? (isPrimary ? 0.55 : 0.38) : 0,
            transition: 'opacity 0.45s ease'
          }}
          className={cn(
            'absolute inset-0 rounded-[inherit] pointer-events-none transition-opacity duration-300',
            isPrimary
              ? 'bg-gradient-to-r from-amber-400/20 via-white/25 to-orange-400/20'
              : 'bg-gradient-to-r from-orange-500/15 via-[#E64500]/20 to-amber-500/15 dark:from-orange-400/20 dark:via-white/15 dark:to-orange-400/20'
          )}
        />

        {/* 1. Large Outer Feathered Aura (~6.8× button height) - Locked on Y axis at center (top: 50%, -50% Y) */}
        <div
          style={{
            top: '50%',
            left: 0,
            transform: prefersReduced
              ? 'translate3d(0, -50%, 0)'
              : `translate3d(${coordX - auraRadius}px, -50%, 0)`,
            width: auraDiameter,
            height: auraDiameter,
            opacity: isActive ? (isPrimary ? 0.8 : 0.6) : 0,
            transition: prefersReduced
              ? 'opacity 0.3s ease'
              : isExiting
              ? 'opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)'
              : 'opacity 0.25s ease, transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
            filter: 'blur(34px)',
            willChange: 'transform, opacity'
          }}
          className={cn(
            'absolute rounded-full pointer-events-none',
            isPrimary
              ? 'bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.6)_0%,rgba(255,215,160,0.42)_32%,rgba(255,140,50,0.22)_58%,transparent_80%)]'
              : 'bg-[radial-gradient(circle_at_center,rgba(230,69,0,0.45)_0%,rgba(255,130,40,0.3)_38%,rgba(255,180,100,0.12)_62%,transparent_80%)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.55)_0%,rgba(255,170,100,0.36)_38%,rgba(230,69,0,0.18)_62%,transparent_80%)]'
          )}
        />

        {/* 2. Primary Large Soft Blurry Ball (~5.2× button height) - Strictly locked on Y axis at center (top: 50%, -50% Y) */}
        <div
          style={{
            top: '50%',
            left: 0,
            transform: prefersReduced
              ? 'translate3d(0, -50%, 0)'
              : `translate3d(${coordX - orbRadius}px, -50%, 0) scale(${
                  isActive ? (isPressed ? 0.94 : 1) : 0.8
                })`,
            width: orbDiameter,
            height: orbDiameter,
            opacity: isActive ? 1 : 0,
            transition: prefersReduced
              ? 'opacity 0.3s ease'
              : isExiting
              ? 'opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), scale 0.45s cubic-bezier(0.16, 1, 0.3, 1)'
              : 'opacity 0.22s ease, transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), scale 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            filter: 'blur(24px)',
            willChange: 'transform, opacity'
          }}
          className={cn(
            'absolute rounded-full pointer-events-none',
            isPrimary
              ? 'bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.85)_0%,rgba(255,240,210,0.65)_25%,rgba(255,180,90,0.4)_50%,rgba(255,130,40,0.18)_72%,transparent_90%)]'
              : 'bg-[radial-gradient(circle_at_center,rgba(230,69,0,0.55)_0%,rgba(255,115,35,0.38)_28%,rgba(255,160,80,0.2)_52%,rgba(230,69,0,0)_78%,transparent_90%)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.68)_0%,rgba(255,180,110,0.5)_28%,rgba(230,69,0,0.28)_55%,rgba(230,69,0,0)_80%,transparent_90%)]'
          )}
        >
          {/* Internal fluid luminous core with gentle ambient breathing animation (scales symmetrically from center) */}
          <div
            className={cn(
              'w-full h-full rounded-full transition-transform duration-700',
              isActive && !prefersReduced && 'animate-sponsor-soft-ball-breathe',
              isPrimary
                ? 'bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.95)_0%,rgba(255,245,225,0.7)_25%,rgba(255,190,110,0.35)_55%,transparent_85%)]'
                : 'bg-[radial-gradient(circle_at_center,rgba(230,69,0,0.65)_0%,rgba(255,135,50,0.4)_25%,rgba(255,175,95,0.18)_52%,transparent_82%)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.85)_0%,rgba(255,195,130,0.55)_25%,rgba(230,69,0,0.22)_52%,transparent_82%)]'
            )}
          />
        </div>
      </div>
    );

    // Dynamic classes with guaranteed relative overflow-hidden and crisp text
    const mergedClassName = cn(
      'relative overflow-hidden group select-none isolate',
      isPressed && 'scale-[0.98]',
      className
    );

    // If an href is provided, render as accessible SPA Link
    if (href) {
      return (
        <Link
          ref={assignRef}
          href={href}
          replace={replace}
          className={mergedClassName}
          style={style}
          onClick={onClick as any}
          onMouseEnter={handleMouseEnter}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...(props as any)}
        >
          {softBallOverlay}
          <span
            className={cn(
              'relative z-10 inline-flex items-center gap-[inherit] pointer-events-none transition-transform duration-150',
              isPrimary && 'drop-shadow-[0_1px_2px_rgba(0,0,0,0.26)]'
            )}
          >
            {children}
          </span>
        </Link>
      );
    }

    // Otherwise render as native button
    return (
      <button
        ref={assignRef as any}
        type={props.type || 'button'}
        disabled={disabled}
        className={mergedClassName}
        style={style}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      >
        {softBallOverlay}
        <span
          className={cn(
            'relative z-10 inline-flex items-center gap-[inherit] pointer-events-none transition-transform duration-150',
            isPrimary && 'drop-shadow-[0_1px_2px_rgba(0,0,0,0.26)]'
          )}
        >
          {children}
        </span>
      </button>
    );
  }
);

BecomeSponsorButton.displayName = 'BecomeSponsorButton';
