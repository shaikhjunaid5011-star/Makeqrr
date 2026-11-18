import * as React from 'react';
import { cn } from '../../lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shimmer?: boolean;
}

/**
 * Base primitive Skeleton component with smooth, GPU-accelerated shimmer effect
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  shimmer = true,
  ...props
}) => {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'relative overflow-hidden rounded-md bg-neutral-200/80 dark:bg-neutral-800/80',
        className
      )}
      {...props}
    >
      {shimmer && (
        <div
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent animate-skeleton-shimmer pointer-events-none"
        />
      )}
    </div>
  );
};

/**
 * Skeleton for form inputs, text areas, and select dropdowns
 */
export const FormFieldSkeleton: React.FC<{ hasLabel?: boolean; height?: string; className?: string }> = ({
  hasLabel = true,
  height = 'h-10',
  className
}) => {
  return (
    <div className={cn('space-y-1.5', className)}>
      {hasLabel && <Skeleton className="h-3.5 w-24 rounded-xs" />}
      <Skeleton className={cn('w-full rounded-xl', height)} />
    </div>
  );
};

/**
 * Skeleton for image or logo upload thumbnails
 */
export const ImageSkeleton: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12 rounded-lg',
    md: 'w-20 h-20 rounded-xl',
    lg: 'w-32 h-32 rounded-2xl'
  }[size];

  return (
    <div className={cn('relative flex items-center justify-center', sizeClasses, className)}>
      <Skeleton className="w-full h-full rounded-inherit" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <svg
          className="w-1/3 h-1/3 text-neutral-400 dark:text-neutral-600 opacity-60"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" strokeDasharray="3 3" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      </div>
    </div>
  );
};

/**
 * Skeleton for standard page headers (badge, title, subtitle)
 */
export const PageHeaderSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('space-y-3 pb-6 border-b border-neutral-200 dark:border-neutral-800', className)}>
      <Skeleton className="h-5 w-36 rounded-full" />
      <Skeleton className="h-9 sm:h-11 w-3/4 max-w-md rounded-lg" />
      <div className="space-y-1.5 max-w-xl">
        <Skeleton className="h-4 w-full rounded-xs" />
        <Skeleton className="h-4 w-4/5 rounded-xs" />
      </div>
    </div>
  );
};

/**
 * Skeleton for QR Preview Card matching exact dimensions of QRPreview component
 */
export const QRPreviewSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      aria-label="Loading QR code preview"
      className={cn(
        'w-full max-w-sm mx-auto p-4 sm:p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800/90 shadow-md space-y-4 select-none',
        className
      )}
    >
      {/* Top Header Controls (Zoom/Fullscreen placeholder) */}
      <div className="flex items-center justify-between pb-1">
        <Skeleton className="h-4 w-28 rounded-md" />
        <div className="flex items-center gap-1.5">
          <Skeleton className="w-7 h-7 rounded-lg" />
          <Skeleton className="w-7 h-7 rounded-lg" />
          <Skeleton className="w-7 h-7 rounded-lg" />
        </div>
      </div>

      {/* Main Square QR Canvas Box (280x280) */}
      <div className="relative aspect-square w-full rounded-2xl bg-neutral-100/80 dark:bg-neutral-950/80 border border-neutral-200/60 dark:border-neutral-800/60 flex items-center justify-center p-6 overflow-hidden">
        {/* Subtle Finder Pattern Reticles */}
        <div className="absolute inset-4 pointer-events-none opacity-40">
          <div className="absolute top-0 left-0 w-8 h-8 rounded-lg border-2 border-neutral-400 dark:border-neutral-600 flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-sm bg-neutral-400 dark:border-neutral-600" />
          </div>
          <div className="absolute top-0 right-0 w-8 h-8 rounded-lg border-2 border-neutral-400 dark:border-neutral-600 flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-sm bg-neutral-400 dark:border-neutral-600" />
          </div>
          <div className="absolute bottom-0 left-0 w-8 h-8 rounded-lg border-2 border-neutral-400 dark:border-neutral-600 flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-sm bg-neutral-400 dark:border-neutral-600" />
          </div>
        </div>

        {/* Center Loading Shimmer Matrix */}
        <div className="relative w-36 h-36 rounded-xl overflow-hidden">
          <Skeleton className="w-full h-full rounded-xl" />
        </div>
      </div>

      {/* Scanability Meter Row */}
      <div className="h-10 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/60 px-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="w-4 h-4 rounded-full" />
          <Skeleton className="h-3.5 w-32 rounded-xs" />
        </div>
        <Skeleton className="h-3.5 w-16 rounded-xs" />
      </div>

      {/* Action Ready Status Row */}
      <div className="h-10 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/60 px-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="w-2.5 h-2.5 rounded-full" />
          <Skeleton className="h-3.5 w-20 rounded-xs" />
        </div>
        <Skeleton className="w-3.5 h-3.5 rounded-xs" />
      </div>

      {/* 4 Action Buttons Row (Camera, Copy, Share, Download) */}
      <div className="grid grid-cols-4 gap-2 pt-1">
        <Skeleton className="h-11 rounded-xl" />
        <Skeleton className="h-11 rounded-xl" />
        <Skeleton className="h-11 rounded-xl" />
        <Skeleton className="h-11 rounded-xl bg-[#E64500]/25 dark:bg-[#E64500]/30" />
      </div>
    </div>
  );
};

/**
 * Skeleton for QR Editor Panels (Type selectors + Content Form + Customization)
 */
export const QREditorSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('space-y-6 select-none', className)}>
      {/* Content Type Selector Grid */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3.5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-28 rounded-xs" />
          <Skeleton className="h-3 w-36 rounded-xs" />
        </div>
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {Array.from({ length: 10 }).map((_, idx) => (
            <Skeleton key={idx} className="h-14 rounded-2xl" />
          ))}
        </div>
      </div>

      {/* Input Content Form Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-40 rounded-md" />
          <Skeleton className="h-3.5 w-64 rounded-xs" />
        </div>
        <div className="space-y-3 pt-2">
          <FormFieldSkeleton height="h-11" />
          <FormFieldSkeleton height="h-11" />
        </div>
      </div>

      {/* Accordion Customization Sections (Pattern, Colors, Logo, Frame) */}
      <div className="space-y-3">
        {['Style & Pattern', 'Colors & Contrast', 'Logo & Icon', 'Frames & Badges'].map((title, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-xl" />
              <Skeleton className="h-4 w-32 rounded-md" />
            </div>
            <Skeleton className="w-5 h-5 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Skeleton for a single Template Card
 */
export const TemplateCardSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn(
        'group relative rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 space-y-3.5 shadow-2xs select-none',
        className
      )}
    >
      {/* Square Preview Visual Area */}
      <div className="relative aspect-square w-full rounded-2xl bg-neutral-100 dark:bg-neutral-950 flex items-center justify-center p-4 overflow-hidden border border-neutral-200/50 dark:border-neutral-800/50">
        <Skeleton className="w-3/4 h-3/4 rounded-xl" />
      </div>

      {/* Info & Meta */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-4.5 w-3/5 rounded-md" />
          <Skeleton className="h-4 w-14 rounded-full" />
        </div>
        <Skeleton className="h-3.5 w-full rounded-xs" />
        <Skeleton className="h-3.5 w-4/5 rounded-xs" />
      </div>

      {/* Action Footer */}
      <div className="pt-2 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800/80">
        <Skeleton className="h-3.5 w-20 rounded-xs" />
        <Skeleton className="h-8 w-24 rounded-xl" />
      </div>
    </div>
  );
};

/**
 * Skeleton for Template Grid (e.g. on /templates route or in modal)
 */
export const TemplateGridSkeleton: React.FC<{ count?: number; className?: string }> = ({
  count = 6,
  className
}) => {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5', className)}>
      {Array.from({ length: count }).map((_, idx) => (
        <TemplateCardSkeleton key={idx} />
      ))}
    </div>
  );
};

/**
 * Navigation Bar Skeleton
 */
export const NavigationSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <header className={cn('h-16 border-b border-neutral-200 dark:border-neutral-800 px-4 sm:px-6 flex items-center justify-between bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md select-none', className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="w-9 h-9 rounded-xl" />
        <Skeleton className="h-5 w-36 rounded-md hidden xs:block" />
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <Skeleton className="h-8 w-20 rounded-full hidden md:block" />
        <Skeleton className="h-8 w-24 rounded-full hidden md:block" />
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="h-9 w-28 rounded-xl bg-[#E64500]/25 dark:bg-[#E64500]/30" />
      </div>
    </header>
  );
};

/**
 * Footer Skeleton
 */
export const FooterSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <footer className={cn('border-t border-neutral-200 dark:border-neutral-800 p-8 sm:p-12 space-y-8 bg-white dark:bg-neutral-950 select-none', className)}>
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="space-y-3">
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="h-3 w-32 rounded-xs" />
            <Skeleton className="h-3 w-28 rounded-xs" />
            <Skeleton className="h-3 w-36 rounded-xs" />
          </div>
        ))}
      </div>
      <div className="max-w-7xl mx-auto pt-6 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
        <Skeleton className="h-3.5 w-44 rounded-xs" />
        <Skeleton className="h-3.5 w-28 rounded-xs" />
      </div>
    </footer>
  );
};

/**
 * Comprehensive Full Page Skeleton for smooth lazy-loaded page rendering
 */
export const FullPageSkeleton: React.FC<{
  variant?: 'editor' | 'templates' | 'content';
  className?: string;
}> = ({ variant = 'editor', className }) => {
  if (variant === 'templates') {
    return (
      <div className={cn('max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 select-none', className)}>
        <PageHeaderSkeleton />
        {/* Search & Category Tabs Skeleton */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <Skeleton className="h-11 w-full sm:w-80 rounded-2xl" />
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Skeleton key={idx} className="h-8 w-20 rounded-full shrink-0" />
            ))}
          </div>
        </div>
        <TemplateGridSkeleton count={6} />
      </div>
    );
  }

  if (variant === 'content') {
    return (
      <div className={cn('max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-8 select-none', className)}>
        <PageHeaderSkeleton />
        <div className="space-y-4 pt-4">
          <Skeleton className="h-4 w-full rounded-xs" />
          <Skeleton className="h-4 w-11/12 rounded-xs" />
          <Skeleton className="h-4 w-4/5 rounded-xs" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
        <div className="space-y-4 pt-4">
          <Skeleton className="h-4 w-full rounded-xs" />
          <Skeleton className="h-4 w-3/4 rounded-xs" />
        </div>
      </div>
    );
  }

  // Default: Studio / Editor layout (Matches /create and home layouts)
  return (
    <div className={cn('max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 select-none', className)}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Editor Form Controls */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <QREditorSkeleton />
        </div>
        {/* Right Side: Sticky QR Preview */}
        <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24">
          <QRPreviewSkeleton />
        </div>
      </div>
    </div>
  );
};
