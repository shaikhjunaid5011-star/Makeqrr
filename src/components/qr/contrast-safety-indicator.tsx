import * as React from 'react';
import { QRConfig } from '../../types/qr';
import { evaluateContrastSafety, suggestAccessibleForeground } from '../../lib/scanability';
import { ShieldCheck, AlertTriangle, XCircle, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ContrastSafetyIndicatorProps {
  config: QRConfig;
  onChange?: (updater: (prev: QRConfig) => QRConfig) => void;
  variant?: 'detailed' | 'compact';
  className?: string;
}

export const ContrastSafetyIndicator: React.FC<ContrastSafetyIndicatorProps> = React.memo(({
  config,
  onChange,
  variant = 'detailed',
  className
}) => {
  const safety = React.useMemo(
    () => evaluateContrastSafety(config),
    [
      config.colors.foreground,
      config.colors.background,
      config.colors.transparentBackground,
      config.colors.gradient.enabled,
      config.colors.gradient.startColor,
      config.colors.gradient.endColor,
      config.eyes.customEyes,
      config.eyes.outerColor,
      config.eyes.innerColor,
      config.layout.type,
      config.layout.card.backgroundColor
    ]
  );

  const handleAutoFix = React.useCallback(() => {
    if (!onChange) return;
    onChange(prev => {
      const bg =
        prev.colors.transparentBackground && prev.layout.type === 'card'
          ? prev.layout.card.backgroundColor || '#FFFFFF'
          : prev.colors.transparentBackground
          ? '#FFFFFF'
          : prev.colors.background || '#FFFFFF';

      const fixedFg = suggestAccessibleForeground(prev.colors.foreground, bg, 7.0);
      const fixedStart = prev.colors.gradient.enabled
        ? suggestAccessibleForeground(prev.colors.gradient.startColor, bg, 7.0)
        : prev.colors.gradient.startColor;
      const fixedEnd = prev.colors.gradient.enabled
        ? suggestAccessibleForeground(prev.colors.gradient.endColor, bg, 7.0)
        : prev.colors.gradient.endColor;
      const fixedOuterEye = prev.eyes.customEyes
        ? suggestAccessibleForeground(prev.eyes.outerColor, bg, 7.0)
        : prev.eyes.outerColor;
      const fixedInnerEye = prev.eyes.customEyes
        ? suggestAccessibleForeground(prev.eyes.innerColor, bg, 7.0)
        : prev.eyes.innerColor;

      return {
        ...prev,
        colors: {
          ...prev.colors,
          foreground: fixedFg,
          gradient: {
            ...prev.colors.gradient,
            startColor: fixedStart,
            endColor: fixedEnd
          }
        },
        eyes: {
          ...prev.eyes,
          outerColor: fixedOuterEye,
          innerColor: fixedInnerEye
        }
      };
    });
  }, [onChange]);

  const statusMeta = {
    safe: {
      icon: ShieldCheck,
      container:
        'bg-emerald-50/70 dark:bg-emerald-950/25 border-emerald-200/80 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200',
      badge:
        'bg-emerald-600/15 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300/60 dark:border-emerald-700/60',
      bar: 'bg-emerald-500',
      iconColor: 'text-emerald-600 dark:text-emerald-400'
    },
    warning: {
      icon: AlertTriangle,
      container:
        'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/70 text-amber-900 dark:text-amber-200',
      badge:
        'bg-amber-500/15 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-300/70 dark:border-amber-700/60',
      bar: 'bg-amber-500',
      iconColor: 'text-amber-600 dark:text-amber-400'
    },
    fail: {
      icon: XCircle,
      container:
        'bg-red-50/90 dark:bg-red-950/35 border-red-200 dark:border-red-800/80 text-red-900 dark:text-red-200',
      badge:
        'bg-red-500/15 dark:bg-red-500/20 text-red-800 dark:text-red-300 border-red-300/70 dark:border-red-700/60',
      bar: 'bg-red-500',
      iconColor: 'text-red-600 dark:text-red-400'
    }
  }[safety.status];

  const StatusIcon = statusMeta.icon;
  // Normalize meter width on a 1:1 to 12:1 visual scale so 3:1 (25%), 4.5:1 (38%), 7:1 (58%) read clearly
  const meterPercent = Math.max(6, Math.min(100, Math.round(((safety.minContrastRatio - 1) / 11) * 100)));
  const needsContrastFix = safety.minContrastRatio < 4.5;

  if (variant === 'compact') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          'w-full rounded-lg border px-2.5 py-1.5 text-xs transition-colors',
          statusMeta.container,
          className
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <StatusIcon className={cn('w-3.5 h-3.5 shrink-0', statusMeta.iconColor)} />
            <span className="font-semibold text-[11px] sm:text-xs truncate">
              Contrast Safety: {safety.headline}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={cn(
                'text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border tabular-nums',
                statusMeta.badge
              )}
            >
              {safety.wcagLevel} · {safety.minContrastRatio}:1
            </span>
          </div>
        </div>

        {(needsContrastFix || safety.isInverted) && (
          <div className="mt-1.5 pt-1.5 border-t border-current/15 flex items-center justify-between gap-2 text-[11px] leading-snug">
            <span className="opacity-95">{safety.message}</span>
            {needsContrastFix && onChange && (
              <button
                type="button"
                onClick={handleAutoFix}
                className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/90 dark:bg-neutral-900/90 text-neutral-900 dark:text-neutral-100 border border-current/20 hover:bg-white dark:hover:bg-neutral-800 font-semibold text-[10px] shadow-2xs transition-colors cursor-pointer"
              >
                <Sparkles className="w-2.5 h-2.5 text-[#E64500]" />
                <span>Fix</span>
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'p-3 rounded-xl border text-xs space-y-2 transition-colors',
        statusMeta.container,
        className
      )}
    >
      {/* Top Row: Label, WCAG Pill, Ratio */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <StatusIcon className={cn('w-4 h-4 shrink-0', statusMeta.iconColor)} />
          <span className="font-semibold truncate">Contrast Safety</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={cn(
              'text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border',
              statusMeta.badge
            )}
          >
            WCAG {safety.wcagLevel}
          </span>
          <span className="font-mono font-bold text-[11px] tabular-nums">
            {safety.minContrastRatio}:1
          </span>
        </div>
      </div>

      {/* Live Color Swatch + Contrast Scale Meter */}
      <div className="flex items-center gap-2.5">
        <div
          aria-hidden="true"
          className="w-7 h-7 rounded-lg border border-black/15 dark:border-white/15 flex items-center justify-center shrink-0 shadow-2xs"
          style={{ backgroundColor: safety.effectiveBackground }}
          title={`Preview: ${config.colors.foreground} on ${safety.effectiveBackground}`}
        >
          <span
            className="w-3.5 h-3.5 rounded-xs"
            style={{ backgroundColor: config.colors.foreground }}
          />
        </div>

        <div className="flex-1 space-y-1">
          <div className="relative h-1.5 w-full rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-200', statusMeta.bar)}
              style={{ width: `${meterPercent}%` }}
            />
            {/* WCAG AA 4.5:1 marker (~32% on 1..12 scale) */}
            <div
              aria-hidden="true"
              title="WCAG AA Minimum (4.5:1)"
              className="absolute top-0 bottom-0 w-px bg-neutral-900/40 dark:bg-white/50"
              style={{ left: '32%' }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] opacity-75 font-mono">
            <span>1:1</span>
            <span>AA 4.5:1</span>
            <span>AAA 7:1+</span>
          </div>
        </div>
      </div>

      {/* Warning / Guidance Message */}
      <p className="text-[11px] leading-snug opacity-95">
        {safety.message}
      </p>

      {/* One-Click Auto-Fix when colors fail WCAG AA (4.5:1) */}
      {needsContrastFix && onChange && (
        <button
          type="button"
          onClick={handleAutoFix}
          className="w-full py-1.5 px-2.5 rounded-lg bg-white/85 dark:bg-neutral-900/85 hover:bg-white dark:hover:bg-neutral-900 border border-current/20 text-neutral-900 dark:text-neutral-100 font-semibold text-[11px] flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#E64500]" />
          <span>Auto-Fix to Accessible Contrast ({safety.suggestedForeground})</span>
        </button>
      )}
    </div>
  );
});

ContrastSafetyIndicator.displayName = 'ContrastSafetyIndicator';
