import * as React from 'react';
import { cn } from '../../lib/utils';

export type LoaderDesignType =
  | 'spinner'      // 1. Circular Spinner
  | 'dots'         // 2. Dot Loader
  | 'pulse'        // 3. Pulse Loader
  | 'orbit'        // 4. Orbit Loader
  | 'progress'     // 5. Progress Loader
  | 'qr'           // 6. QR Loader (Animated matrix with scan beam)
  | 'logo'         // 7. Logo Loader (Branded QR Studio logo)
  | 'shimmer'      // 8. Shimmer Loader
  | 'wave'         // 9. Wave Loader
  | 'minimal';     // 10. Minimal Button Loader

export interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: LoaderDesignType | 'qr-matrix' | 'inline' | 'block' | 'fullscreen' | 'bar';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  label?: string;
  sublabel?: string;
  color?: string; // Optional custom color override (default: #E64500 brand)
  speed?: 'slow' | 'normal' | 'fast';
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({
  variant = 'spinner',
  size = 'md',
  label,
  sublabel,
  color,
  speed = 'normal',
  className,
  ...props
}) => {
  // Normalize legacy variants to modern designs
  let activeDesign: LoaderDesignType = 'spinner';
  if (variant === 'qr-matrix' || variant === 'block' || variant === 'qr') {
    activeDesign = 'qr';
  } else if (variant === 'inline' || variant === 'minimal') {
    activeDesign = 'minimal';
  } else if (variant === 'bar' || variant === 'progress') {
    activeDesign = 'progress';
  } else if (variant === 'fullscreen' || variant === 'logo') {
    activeDesign = 'logo';
  } else if (
    variant === 'spinner' ||
    variant === 'dots' ||
    variant === 'pulse' ||
    variant === 'orbit' ||
    variant === 'shimmer' ||
    variant === 'wave'
  ) {
    activeDesign = variant;
  }

  // Size mapping
  const sizeMap = {
    xs: { px: 16, stroke: 2, dot: 4, text: 'text-[10px]' },
    sm: { px: 20, stroke: 2, dot: 5, text: 'text-xs' },
    md: { px: 36, stroke: 2.5, dot: 8, text: 'text-xs' },
    lg: { px: 56, stroke: 3, dot: 11, text: 'text-sm' },
    xl: { px: 80, stroke: 3.5, dot: 14, text: 'text-base' }
  }[size];

  // Primary brand color
  const brandColor = color || '#E64500';

  // ---------------------------------------------------------------------------
  // 1. Circular Spinner
  // ---------------------------------------------------------------------------
  if (activeDesign === 'spinner') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn('inline-flex flex-col items-center justify-center gap-2 select-none', className)}
        {...props}
      >
        <svg
          className="animate-spin-smooth shrink-0"
          width={sizeMap.px}
          height={sizeMap.px}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="12"
            cy="12"
            r="9.5"
            stroke="currentColor"
            strokeWidth={sizeMap.stroke}
            className="opacity-20 text-neutral-400 dark:text-neutral-600"
          />
          <path
            d="M12 2.5C17.2467 2.5 21.5 6.75329 21.5 12"
            stroke={brandColor}
            strokeWidth={sizeMap.stroke}
            strokeLinecap="round"
          />
        </svg>
        {label && (
          <span className={cn('font-medium text-neutral-700 dark:text-neutral-300', sizeMap.text)}>
            {label}
          </span>
        )}
        <span className="sr-only">{label || 'Loading...'}</span>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. Dot Loader (Three bouncing/pulsing dots)
  // ---------------------------------------------------------------------------
  if (activeDesign === 'dots') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn('inline-flex flex-col items-center justify-center gap-2 select-none', className)}
        {...props}
      >
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((idx) => (
            <span
              key={idx}
              className="rounded-full shrink-0"
              style={{
                width: sizeMap.dot,
                height: sizeMap.dot,
                backgroundColor: brandColor,
                animation: 'dotBounce 1.2s ease-in-out infinite',
                animationDelay: `${idx * 0.16}s`
              }}
            />
          ))}
        </div>
        {label && (
          <span className={cn('font-medium text-neutral-700 dark:text-neutral-300', sizeMap.text)}>
            {label}
          </span>
        )}
        <span className="sr-only">{label || 'Loading...'}</span>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 3. Pulse Loader (Expanding concentric rings)
  // ---------------------------------------------------------------------------
  if (activeDesign === 'pulse') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn('inline-flex flex-col items-center justify-center gap-2 select-none', className)}
        {...props}
      >
        <div
          className="relative flex items-center justify-center"
          style={{ width: sizeMap.px, height: sizeMap.px }}
        >
          <span
            className="absolute rounded-full animate-pulse-expand"
            style={{
              width: sizeMap.px * 0.85,
              height: sizeMap.px * 0.85,
              backgroundColor: `${brandColor}25`,
              border: `1.5px solid ${brandColor}60`
            }}
          />
          <span
            className="relative rounded-full shadow-xs"
            style={{
              width: sizeMap.px * 0.42,
              height: sizeMap.px * 0.42,
              backgroundColor: brandColor
            }}
          />
        </div>
        {label && (
          <span className={cn('font-medium text-neutral-700 dark:text-neutral-300', sizeMap.text)}>
            {label}
          </span>
        )}
        <span className="sr-only">{label || 'Loading...'}</span>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 4. Orbit Loader (Satellite orb orbiting central core)
  // ---------------------------------------------------------------------------
  if (activeDesign === 'orbit') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn('inline-flex flex-col items-center justify-center gap-2 select-none', className)}
        {...props}
      >
        <div
          className="relative flex items-center justify-center"
          style={{ width: sizeMap.px, height: sizeMap.px }}
        >
          {/* Orbital Track */}
          <div
            className="absolute rounded-full border border-neutral-300/60 dark:border-neutral-700/60"
            style={{ width: sizeMap.px * 0.88, height: sizeMap.px * 0.88 }}
          />
          {/* Central QR Core */}
          <div
            className="w-2.5 h-2.5 rounded-sm bg-neutral-900 dark:bg-neutral-100 shadow-2xs"
            style={{ width: sizeMap.px * 0.28, height: sizeMap.px * 0.28 }}
          />
          {/* Orbiting Satellite Node */}
          <div
            className="absolute inset-0 animate-orbit flex items-start justify-center"
          >
            <span
              className="rounded-full shadow-sm"
              style={{
                width: Math.max(4, sizeMap.px * 0.2),
                height: Math.max(4, sizeMap.px * 0.2),
                backgroundColor: brandColor,
                marginTop: -1
              }}
            />
          </div>
        </div>
        {label && (
          <span className={cn('font-medium text-neutral-700 dark:text-neutral-300', sizeMap.text)}>
            {label}
          </span>
        )}
        <span className="sr-only">{label || 'Loading...'}</span>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 5. Progress Loader (Smooth Indeterminate progress bar)
  // ---------------------------------------------------------------------------
  if (activeDesign === 'progress') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn('w-full relative overflow-hidden', className)}
        {...props}
      >
        <div className="w-full h-1 bg-neutral-200/80 dark:bg-neutral-800/80 rounded-full overflow-hidden relative">
          <div
            className="absolute top-0 bottom-0 rounded-full shadow-[0_0_8px_rgba(230,69,0,0.6)]"
            style={{
              backgroundColor: brandColor,
              animation: 'qrIndeterminateSweep 1.6s cubic-bezier(0.65, 0, 0.35, 1) infinite'
            }}
          />
        </div>
        {label && (
          <div className="flex items-center justify-between mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
            <span>{label}</span>
            {sublabel && <span className="font-mono">{sublabel}</span>}
          </div>
        )}
        <span className="sr-only">{label || 'Progressing...'}</span>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 6. QR Loader (Forming QR Matrix with sweeping laser line)
  // ---------------------------------------------------------------------------
  if (activeDesign === 'qr') {
    const isCompact = size === 'xs' || size === 'sm';
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn('inline-flex flex-col items-center justify-center gap-2 select-none', className)}
        {...props}
      >
        <div
          className={cn(
            'relative flex items-center justify-center rounded-2xl bg-white/90 dark:bg-neutral-900/90 border border-neutral-200/90 dark:border-neutral-800/90 shadow-xs backdrop-blur-xs select-none',
            isCompact ? 'p-1.5 rounded-lg border-0 bg-transparent shadow-none' : 'p-3'
          )}
          style={{
            width: isCompact ? sizeMap.px : sizeMap.px + 28,
            height: isCompact ? sizeMap.px : sizeMap.px + 28
          }}
        >
          {/* Corner Viewfinder Reticles */}
          {!isCompact && (
            <div className="absolute inset-1.5 pointer-events-none animate-qr-bracket">
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-neutral-900 dark:border-neutral-100 rounded-tl-sm" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-neutral-900 dark:border-neutral-100 rounded-tr-sm" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-neutral-900 dark:border-neutral-100 rounded-bl-sm" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-neutral-900 dark:border-neutral-100 rounded-br-sm" />
            </div>
          )}

          {/* QR Matrix SVG */}
          <svg
            width={sizeMap.px}
            height={sizeMap.px}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0"
          >
            {/* Finder 1 */}
            <rect x="4" y="4" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="2.5" className="text-neutral-900 dark:text-neutral-100" />
            <rect x="8" y="8" width="6" height="6" rx="1" fill="currentColor" className="text-neutral-900 dark:text-neutral-100" />
            {/* Finder 2 */}
            <rect x="30" y="4" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="2.5" className="text-neutral-900 dark:text-neutral-100" />
            <rect x="34" y="8" width="6" height="6" rx="1" fill="currentColor" className="text-neutral-900 dark:text-neutral-100" />
            {/* Finder 3 */}
            <rect x="4" y="30" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="2.5" className="text-neutral-900 dark:text-neutral-100" />
            <rect x="8" y="34" width="6" height="6" rx="1" fill="currentColor" className="text-neutral-900 dark:text-neutral-100" />

            {/* Pulsing QR Data Cells */}
            <rect x="22" y="6" width="4" height="4" rx="1" fill={brandColor} className="animate-qr-cell-1" />
            <rect x="22" y="14" width="4" height="4" rx="1" fill="currentColor" className="text-neutral-900 dark:text-neutral-100 animate-qr-cell-2" />
            <rect x="6" y="22" width="4" height="4" rx="1" fill="currentColor" className="text-neutral-900 dark:text-neutral-100 animate-qr-cell-3" />
            <rect x="14" y="22" width="4" height="4" rx="1" fill="currentColor" className="text-neutral-900 dark:text-neutral-100 animate-qr-cell-4" />
            <rect x="22" y="22" width="4" height="4" rx="1" fill={brandColor} className="animate-qr-cell-1" />
            <rect x="30" y="22" width="4" height="4" rx="1" fill="currentColor" className="text-neutral-900 dark:text-neutral-100 animate-qr-cell-2" />
            <rect x="38" y="22" width="4" height="4" rx="1" fill="currentColor" className="text-neutral-900 dark:text-neutral-100 animate-qr-cell-3" />
            <rect x="22" y="30" width="4" height="4" rx="1" fill="currentColor" className="text-neutral-900 dark:text-neutral-100 animate-qr-cell-4" />
            <rect x="30" y="30" width="4" height="4" rx="1" fill="currentColor" className="text-neutral-900 dark:text-neutral-100 animate-qr-cell-1" />
            <rect x="22" y="38" width="4" height="4" rx="1" fill={brandColor} className="animate-qr-cell-2" />
            <rect x="34" y="34" width="8" height="8" rx="2" fill="currentColor" className="text-neutral-900 dark:text-neutral-100 animate-qr-cell-3" />
          </svg>

          {/* Sweeping Laser Line */}
          {!isCompact && (
            <div className="absolute inset-x-2 top-2 h-1 overflow-hidden pointer-events-none">
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#E64500] to-transparent shadow-[0_0_8px_rgba(230,69,0,0.8)] animate-qr-scan" />
            </div>
          )}
        </div>

        {label && (
          <div className="text-center space-y-0.5">
            <span className={cn('block font-semibold text-neutral-800 dark:text-neutral-200', sizeMap.text)}>
              {label}
            </span>
            {sublabel && (
              <span className="block text-[11px] text-neutral-500 dark:text-neutral-400">
                {sublabel}
              </span>
            )}
          </div>
        )}
        <span className="sr-only">{label || 'Generating QR code...'}</span>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 7. Logo Loader (Branded Brandmark Animation for Initial Boot & Fullscreen)
  // ---------------------------------------------------------------------------
  if (activeDesign === 'logo') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn('flex flex-col items-center justify-center p-6 text-center space-y-4 select-none', className)}
        {...props}
      >
        <div className="relative flex items-center justify-center">
          {/* Subtle Ambient Pulse Aura */}
          <div className="absolute -inset-4 rounded-3xl bg-orange-500/10 dark:bg-orange-500/15 blur-xl animate-pulse" />

          {/* Logo Badge Container */}
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-md flex items-center justify-center p-3">
            <svg
              className="w-full h-full text-[#E64500]"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="2" y="2" width="10" height="10" rx="2.5" stroke="currentColor" strokeWidth="2.5" />
              <rect x="5" y="5" width="4" height="4" rx="1" fill="currentColor" />
              <rect x="20" y="2" width="10" height="10" rx="2.5" stroke="currentColor" strokeWidth="2.5" />
              <rect x="23" y="5" width="4" height="4" rx="1" fill="currentColor" />
              <rect x="2" y="20" width="10" height="10" rx="2.5" stroke="currentColor" strokeWidth="2.5" />
              <rect x="5" y="23" width="4" height="4" rx="1" fill="currentColor" />
              <rect x="18" y="18" width="12" height="12" rx="3" fill="currentColor" className="animate-qr-cell-1" />
            </svg>

            {/* Orbiting Laser Point */}
            <div className="absolute inset-0 rounded-2xl border border-orange-500/40 animate-orbit pointer-events-none" />
          </div>
        </div>

        <div className="space-y-1 max-w-xs">
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            {label || 'makeqrr'}
          </h3>
          {sublabel && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {sublabel}
            </p>
          )}
        </div>

        {/* Indeterminate Micro Bar */}
        <div className="w-28 h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden relative">
          <div className="absolute inset-y-0 bg-[#E64500] rounded-full animate-qr-bar" />
        </div>
        <span className="sr-only">{label || 'Loading makeqrr...'}</span>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 8. Shimmer Loader (Horizontal lighting sweep across a pill or surface)
  // ---------------------------------------------------------------------------
  if (activeDesign === 'shimmer') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          'relative overflow-hidden rounded-lg bg-neutral-200/80 dark:bg-neutral-800/80',
          className
        )}
        style={{
          width: sizeMap.px * 3,
          height: Math.max(16, sizeMap.px * 0.6)
        }}
        {...props}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent animate-skeleton-shimmer" />
        <span className="sr-only">{label || 'Loading...'}</span>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 9. Wave Loader (Audio / equalizer style vertical wave bars)
  // ---------------------------------------------------------------------------
  if (activeDesign === 'wave') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn('inline-flex flex-col items-center justify-center gap-2 select-none', className)}
        {...props}
      >
        <div className="flex items-center gap-1" style={{ height: sizeMap.px }}>
          {[0, 1, 2, 3, 4].map((idx) => (
            <span
              key={idx}
              className="w-1 rounded-full shrink-0"
              style={{
                height: sizeMap.px,
                backgroundColor: brandColor,
                animation: 'waveBar 1s ease-in-out infinite',
                animationDelay: `${idx * 0.12}s`
              }}
            />
          ))}
        </div>
        {label && (
          <span className={cn('font-medium text-neutral-700 dark:text-neutral-300', sizeMap.text)}>
            {label}
          </span>
        )}
        <span className="sr-only">{label || 'Processing...'}</span>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 10. Minimal Button Loader (Compact dual-bracket circular loader for buttons)
  // ---------------------------------------------------------------------------
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('inline-flex items-center gap-2 select-none', className)}
      {...props}
    >
      <svg
        className="animate-qr-spinner text-current shrink-0"
        width={sizeMap.px}
        height={sizeMap.px}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="9.5"
          stroke="currentColor"
          strokeWidth={sizeMap.stroke}
          strokeOpacity="0.25"
        />
        <path
          d="M12 2.5C6.75329 2.5 2.5 6.75329 2.5 12C2.5 14.2 3.25 16.2 4.5 17.8"
          stroke="currentColor"
          strokeWidth={sizeMap.stroke}
          strokeLinecap="round"
        />
        <rect
          x="9.5"
          y="9.5"
          width="5"
          height="5"
          rx="1"
          fill="currentColor"
        />
      </svg>
      {label && (
        <span className={cn('font-medium leading-none', sizeMap.text)}>
          {label}
        </span>
      )}
      <span className="sr-only">{label || 'Loading...'}</span>
    </div>
  );
};
