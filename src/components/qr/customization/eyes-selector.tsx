import * as React from 'react';
import { EyeOuterStyle, EyeInnerStyle, QRConfig } from '../../../types/qr';
import { calculateContrast, getEffectiveQRBackground } from '../../../lib/scanability';
import { Switch } from '../../ui/slider';
import { AlertTriangle } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface EyesSelectorProps {
  config: QRConfig;
  onChange: (updater: (prev: QRConfig) => QRConfig) => void;
}

const OUTER_EYE_OPTIONS: { id: EyeOuterStyle; label: string; svg: React.ReactNode }[] = [
  {
    id: 'square',
    label: 'Square',
    svg: (
      <svg viewBox="0 0 28 28" className="w-6 h-6">
        <rect x="2" y="2" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="4" />
      </svg>
    )
  },
  {
    id: 'rounded',
    label: 'Rounded',
    svg: (
      <svg viewBox="0 0 28 28" className="w-6 h-6">
        <rect x="2" y="2" width="24" height="24" rx="6" fill="none" stroke="currentColor" strokeWidth="4" />
      </svg>
    )
  },
  {
    id: 'circle',
    label: 'Circle',
    svg: (
      <svg viewBox="0 0 28 28" className="w-6 h-6">
        <circle cx="14" cy="14" r="11" fill="none" stroke="currentColor" strokeWidth="4" />
      </svg>
    )
  },
  {
    id: 'leaf',
    label: 'Leaf',
    svg: (
      <svg viewBox="0 0 28 28" className="w-6 h-6">
        <path d="M4 14 C4 4, 14 4, 24 4 L24 14 C24 24, 14 24, 4 24 Z" fill="none" stroke="currentColor" strokeWidth="4" />
      </svg>
    )
  }
];

const INNER_EYE_OPTIONS: { id: EyeInnerStyle; label: string; svg: React.ReactNode }[] = [
  {
    id: 'square',
    label: 'Square',
    svg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <rect x="5" y="5" width="14" height="14" fill="currentColor" />
      </svg>
    )
  },
  {
    id: 'rounded',
    label: 'Rounded',
    svg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <rect x="5" y="5" width="14" height="14" rx="3" fill="currentColor" />
      </svg>
    )
  },
  {
    id: 'circle',
    label: 'Circle',
    svg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <circle cx="12" cy="12" r="6" fill="currentColor" />
      </svg>
    )
  },
  {
    id: 'dot',
    label: 'Dot',
    svg: (
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <circle cx="12" cy="12" r="4" fill="currentColor" />
      </svg>
    )
  }
];

export const EyesSelector: React.FC<EyesSelectorProps> = React.memo(({ config, onChange }) => {
  const { eyes } = config;
  const bgForContrast = getEffectiveQRBackground(config);
  const outerEyeContrast = calculateContrast(eyes.outerColor, bgForContrast);
  const innerEyeContrast = calculateContrast(eyes.innerColor, bgForContrast);
  const minEyeContrast = Math.min(outerEyeContrast, innerEyeContrast);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
            Corner Eyes
          </span>
          <p className="text-[11px] text-neutral-500">
            Style the three corner shapes separately
          </p>
        </div>
        <Switch
          checked={eyes.customEyes}
          onCheckedChange={checked =>
            onChange(prev => ({
              ...prev,
              eyes: { ...prev.eyes, customEyes: checked }
            }))
          }
        />
      </div>

      {eyes.customEyes && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Outer Eyes */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Outer Corner Shape
            </label>
            <div className="grid grid-cols-4 gap-2">
              {OUTER_EYE_OPTIONS.map(opt => {
                const isSelected = eyes.outer === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      onChange(prev => ({
                        ...prev,
                        eyes: { ...prev.eyes, outer: opt.id }
                      }))
                    }
                    className={cn(
                      'flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all cursor-pointer',
                      isSelected
                        ? 'border-[#E64500] dark:border-orange-500 bg-orange-50/60 dark:bg-orange-950/40 text-[#E64500] dark:text-orange-300 font-semibold ring-1 ring-[#E64500] dark:ring-orange-500 shadow-xs'
                        : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-orange-200 dark:hover:border-orange-900/60'
                    )}
                  >
                    <div className="mb-1 text-current">
                      {opt.svg}
                    </div>
                    <span className="text-[11px]">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Inner Eyes */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Inner Dot Shape
            </label>
            <div className="grid grid-cols-4 gap-2">
              {INNER_EYE_OPTIONS.map(opt => {
                const isSelected = eyes.inner === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      onChange(prev => ({
                        ...prev,
                        eyes: { ...prev.eyes, inner: opt.id }
                      }))
                    }
                    className={cn(
                      'flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all cursor-pointer',
                      isSelected
                        ? 'border-[#E64500] dark:border-orange-500 bg-orange-50/60 dark:bg-orange-950/40 text-[#E64500] dark:text-orange-300 font-semibold ring-1 ring-[#E64500] dark:ring-orange-500 shadow-xs'
                        : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-orange-200 dark:hover:border-orange-900/60'
                    )}
                  >
                    <div className="mb-1 text-current">
                      {opt.svg}
                    </div>
                    <span className="text-[11px]">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Separate Eye Colors */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Outer Corner Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={eyes.outerColor}
                  onChange={e =>
                    onChange(prev => ({
                      ...prev,
                      eyes: { ...prev.eyes, outerColor: e.target.value }
                    }))
                  }
                  className="w-7 h-7 rounded border border-neutral-300 dark:border-neutral-700 cursor-pointer p-0 bg-transparent"
                />
                <input
                  type="text"
                  value={eyes.outerColor}
                  onChange={e =>
                    onChange(prev => ({
                      ...prev,
                      eyes: { ...prev.eyes, outerColor: e.target.value }
                    }))
                  }
                  className="w-full h-8 text-xs font-mono px-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Inner Dot Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={eyes.innerColor}
                  onChange={e =>
                    onChange(prev => ({
                      ...prev,
                      eyes: { ...prev.eyes, innerColor: e.target.value }
                    }))
                  }
                  className="w-7 h-7 rounded border border-neutral-300 dark:border-neutral-700 cursor-pointer p-0 bg-transparent"
                />
                <input
                  type="text"
                  value={eyes.innerColor}
                  onChange={e =>
                    onChange(prev => ({
                      ...prev,
                      eyes: { ...prev.eyes, innerColor: e.target.value }
                    }))
                  }
                  className="w-full h-8 text-xs font-mono px-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                />
              </div>
            </div>
          </div>

          {minEyeContrast < 4.5 && (
            <div className="flex items-start gap-1.5 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                Contrast Safety: Corner eye contrast ({minEyeContrast}:1) is below WCAG AA (4.5:1). Cameras rely on corner eyes to lock focus.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

EyesSelector.displayName = 'EyesSelector';

