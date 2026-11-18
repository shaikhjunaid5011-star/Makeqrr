import * as React from 'react';
import { Minus, Plus, RotateCcw, ShieldCheck, AlertTriangle, Sparkles, Image as ImageIcon, Smile } from 'lucide-react';
import { QRConfig } from '../../../types/qr';
import { calculateSafeLogoBounds, DEFAULT_ELEMENT_SIZES } from '../../../lib/logo-utils';
import { Button } from '../../ui/button';
import { cn } from '../../../lib/utils';

interface CenterElementSizeControlProps {
  config: QRConfig;
  onChange: (updater: (prev: QRConfig) => QRConfig) => void;
  activeType?: 'upload' | 'icon' | 'emoji';
  className?: string;
}

export const CenterElementSizeControl: React.FC<CenterElementSizeControlProps> = React.memo(({
  config,
  onChange,
  activeType,
  className
}) => {
  const { logo } = config;
  const currentType: 'upload' | 'icon' | 'emoji' = activeType || logo.type || 'upload';

  // Compute live safe boundaries based on QR version, module count, and error correction
  const safeBounds = React.useMemo(() => {
    return calculateSafeLogoBounds(config, undefined, undefined, currentType);
  }, [config, currentType]);

  const { safeMin, safeMax, defaultSize, currentSize, isAtMax, isAtMin } = safeBounds;
  const currentPercent = Math.round(currentSize * 100);
  const defaultPercent = Math.round(defaultSize * 100);
  const isDefault = Math.abs(currentSize - defaultSize) < 0.005;

  // Title and subtitle customized for each element type
  const meta = React.useMemo(() => {
    switch (currentType) {
      case 'icon':
        return {
          title: 'Built-in Icon Size',
          badge: 'Icon',
          description: 'Scale the center icon inside the QR matrix',
          icon: ImageIcon
        };
      case 'emoji':
        return {
          title: 'Center Emoji Size',
          badge: 'Emoji',
          description: 'Scale the center emoji inside the QR matrix',
          icon: Smile
        };
      case 'upload':
      default:
        return {
          title: 'Center Logo Size',
          badge: 'Logo / Image',
          description: 'Scale the uploaded image inside the QR matrix',
          icon: Sparkles
        };
    }
  }, [currentType]);

  // Handle direct slider or stepper value change
  const handleUpdateSize = React.useCallback(
    (newSize: number) => {
      const clamped = Math.max(safeMin, Math.min(safeMax, Number(newSize.toFixed(2))));
      onChange(prev => {
        const nextLogo = { ...prev.logo, size: clamped };
        if (currentType === 'upload') {
          nextLogo.uploadSize = clamped;
        } else if (currentType === 'icon') {
          nextLogo.iconSize = clamped;
        } else if (currentType === 'emoji') {
          nextLogo.emojiSize = clamped;
        }
        return {
          ...prev,
          logo: nextLogo
        };
      });
    },
    [safeMin, safeMax, currentType, onChange]
  );

  const handleStepDown = () => {
    if (isAtMin) return;
    handleUpdateSize(currentSize - 0.01);
  };

  const handleStepUp = () => {
    if (isAtMax) return;
    handleUpdateSize(currentSize + 0.01);
  };

  const handleResetToDefault = () => {
    handleUpdateSize(defaultSize);
  };

  const handleBoostToHighEC = () => {
    onChange(prev => ({
      ...prev,
      errorCorrection: 'H',
      logo: {
        ...prev.logo,
        // When boosted to High EC, allow larger size up to the new safe max
        size: Math.min(0.30, Math.max(prev.logo.size, 0.26))
      }
    }));
  };

  return (
    <div
      className={cn(
        'p-3.5 sm:p-4 rounded-2xl bg-neutral-50/80 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 space-y-3.5 select-none transition-all',
        className
      )}
    >
      {/* Header: Title, Category Badge, and Reset to Default */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-[#E64500] dark:text-orange-400 flex items-center justify-center shrink-0">
            <meta.icon className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                {meta.title}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-neutral-200/60 dark:bg-neutral-700/60 text-neutral-600 dark:text-neutral-300 font-medium hidden xs:inline">
                {meta.badge}
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
              {meta.description}
            </p>
          </div>
        </div>

        {/* Reset to Default Button */}
        <button
          type="button"
          onClick={handleResetToDefault}
          disabled={isDefault}
          title={`Reset to default (${defaultPercent}%)`}
          className={cn(
            'inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0 cursor-pointer',
            isDefault
              ? 'opacity-40 cursor-not-allowed text-neutral-400 dark:text-neutral-600'
              : 'text-neutral-600 dark:text-neutral-300 hover:text-[#E64500] dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/40 active:scale-95'
          )}
        >
          <RotateCcw className="w-3 h-3" />
          <span className="hidden sm:inline">Reset</span>
          <span className="font-mono text-[10px] text-neutral-400">({defaultPercent}%)</span>
        </button>
      </div>

      {/* Primary Size Controls: Stepper Minus + Smooth Range Slider + Stepper Plus + Readout */}
      <div className="space-y-2">
        <div className="flex items-center gap-2.5">
          {/* Stepper Minus (-) Button */}
          <button
            type="button"
            onClick={handleStepDown}
            disabled={isAtMin}
            aria-label="Decrease size by 1%"
            title="Decrease size (−1%)"
            className={cn(
              'w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-2xs',
              isAtMin
                ? 'opacity-40 cursor-not-allowed border-neutral-200 dark:border-neutral-800 text-neutral-400'
                : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 hover:border-orange-300 dark:hover:border-orange-700 hover:text-[#E64500] dark:hover:text-orange-400 active:scale-95'
            )}
          >
            <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>

          {/* Smooth Slider */}
          <div className="flex-1 relative flex items-center">
            <input
              type="range"
              min={safeMin}
              max={safeMax}
              step={0.01}
              value={currentSize}
              onChange={e => handleUpdateSize(parseFloat(e.target.value))}
              aria-label={meta.title}
              className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-[#E64500] dark:accent-[#ff6b2b] focus:outline-hidden"
            />
          </div>

          {/* Stepper Plus (+) Button */}
          <button
            type="button"
            onClick={handleStepUp}
            disabled={isAtMax}
            aria-label="Increase size by 1%"
            title="Increase size (+1%)"
            className={cn(
              'w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-2xs',
              isAtMax
                ? 'opacity-40 cursor-not-allowed border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 text-amber-500'
                : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 hover:border-orange-300 dark:hover:border-orange-700 hover:text-[#E64500] dark:hover:text-orange-400 active:scale-95'
            )}
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>

          {/* Current Size Value Readout Box */}
          <div className="w-16 sm:w-20 px-2 py-1.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700/80 text-center shrink-0 shadow-2xs">
            <div className="font-mono text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
              {currentPercent}%
            </div>
            <div className="text-[10px] text-neutral-400 font-mono leading-none">
              {currentSize.toFixed(2)}x
            </div>
          </div>
        </div>

        {/* Visual Scale Marker Bar (Min, Recommended, Max Safe) */}
        <div className="flex items-center justify-between text-[10px] text-neutral-400 font-medium px-1">
          <span>{Math.round(safeMin * 100)}% (Min)</span>
          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
            <ShieldCheck className="w-3 h-3" />
            <span>Optimal: 18% – 24%</span>
          </span>
          <span className={cn(isAtMax ? 'text-amber-600 dark:text-amber-400 font-bold' : '')}>
            {Math.round(safeMax * 100)}% (Safe Max)
          </span>
        </div>
      </div>

      {/* Safety Status & Maximum Safe Size Warning */}
      {isAtMax ? (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-2 animate-in fade-in duration-150">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold block">
                Maximum Safe Size Reached ({Math.round(safeMax * 100)}%)
              </span>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                The slider is clamped at {Math.round(safeMax * 100)}% to protect QR timing lines and data modules so phones can scan quickly and reliably.
              </p>
            </div>
          </div>

          {config.errorCorrection !== 'H' && (
            <div className="pt-1.5 border-t border-amber-200/80 dark:border-amber-800/80 flex flex-col xs:flex-row xs:items-center justify-between gap-2">
              <span className="text-[11px] text-amber-800 dark:text-amber-300">
                Want a larger logo? Switch to High error correction (30% recovery).
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleBoostToHighEC}
                className="h-6.5 text-[11px] bg-white dark:bg-neutral-900 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 hover:bg-amber-100 shrink-0 px-2.5 font-semibold gap-1"
              >
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Set High Safety (H)</span>
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-[11px] text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-1.5 truncate">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="truncate">
              <strong>Scan Safe:</strong> Leaves full clearance for all QR finder patterns
            </span>
          </div>
          <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
            EC Level {config.errorCorrection}
          </span>
        </div>
      )}
    </div>
  );
});

CenterElementSizeControl.displayName = 'CenterElementSizeControl';
