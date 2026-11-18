import * as React from 'react';
import { QRConfig } from '../../../types/qr';
import { Switch, Slider } from '../../ui/slider';
import { calculateContrast, getEffectiveQRBackground } from '../../../lib/scanability';
import { ContrastSafetyIndicator } from '../contrast-safety-indicator';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface ColorsSelectorProps {
  config: QRConfig;
  onChange: (updater: (prev: QRConfig) => QRConfig) => void;
}

const PRESET_PALETTES = [
  { fg: '#000000', bg: '#ffffff', name: 'Monochrome' },
  { fg: '#0f172a', bg: '#f8fafc', name: 'Slate' },
  { fg: '#1e3a8a', bg: '#eff6ff', name: 'Cobalt' },
  { fg: '#064e3b', bg: '#f0fdf4', name: 'Emerald' },
  { fg: '#7c2d12', bg: '#fffbeb', name: 'Terracotta' },
  { fg: '#581c87', bg: '#faf5ff', name: 'Plum' }
];

export const ColorsSelector: React.FC<ColorsSelectorProps> = React.memo(({ config, onChange }) => {
  const { colors } = config;
  const { gradient } = colors;

  const bgForContrast = getEffectiveQRBackground(config);
  const startContrast = calculateContrast(gradient.startColor, bgForContrast);
  const endContrast = calculateContrast(gradient.endColor, bgForContrast);

  return (
    <div className="space-y-4">
      {/* Quick Color Presets */}
      <div>
        <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
          Color Themes
        </label>
        <div className="grid grid-cols-6 gap-1.5">
          {PRESET_PALETTES.map(p => (
            <button
              key={p.name}
              type="button"
              onClick={() =>
                onChange(prev => ({
                  ...prev,
                  colors: {
                    ...prev.colors,
                    foreground: p.fg,
                    background: p.bg,
                    transparentBackground: false,
                    gradient: {
                      ...prev.colors.gradient,
                      startColor: p.fg,
                      endColor: p.fg
                    }
                  }
                }))
              }
              title={p.name}
              className="flex flex-col items-center p-1 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all cursor-pointer group"
            >
              <div
                className="w-full h-6 rounded flex overflow-hidden border border-black/10 dark:border-white/10"
                style={{ background: p.bg }}
              >
                <div className="w-1/2 h-full" style={{ background: p.fg }} />
              </div>
              <span className="text-[10px] text-neutral-500 truncate w-full text-center mt-1">
                {p.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Colors */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        {/* Foreground */}
        <div>
          <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            QR Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={colors.foreground}
              onChange={e =>
                onChange(prev => ({
                  ...prev,
                  colors: { ...prev.colors, foreground: e.target.value }
                }))
              }
              className="w-8 h-8 rounded border border-neutral-300 dark:border-neutral-700 cursor-pointer p-0 bg-transparent"
            />
            <input
              type="text"
              value={colors.foreground}
              onChange={e =>
                onChange(prev => ({
                  ...prev,
                  colors: { ...prev.colors, foreground: e.target.value }
                }))
              }
              className="w-full h-8 text-xs font-mono px-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
            />
          </div>
        </div>

        {/* Background */}
        <div>
          <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Background Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              disabled={colors.transparentBackground}
              value={colors.background}
              onChange={e =>
                onChange(prev => ({
                  ...prev,
                  colors: { ...prev.colors, background: e.target.value }
                }))
              }
              className={cn(
                'w-8 h-8 rounded border border-neutral-300 dark:border-neutral-700 cursor-pointer p-0 bg-transparent',
                colors.transparentBackground && 'opacity-30 cursor-not-allowed'
              )}
            />
            <input
              type="text"
              disabled={colors.transparentBackground}
              value={colors.transparentBackground ? 'Transparent' : colors.background}
              onChange={e =>
                onChange(prev => ({
                  ...prev,
                  colors: { ...prev.colors, background: e.target.value }
                }))
              }
              className={cn(
                'w-full h-8 text-xs font-mono px-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900',
                colors.transparentBackground && 'opacity-50'
              )}
            />
          </div>
        </div>
      </div>

      <div className="pt-1">
        <Switch
          checked={colors.transparentBackground}
          onCheckedChange={checked =>
            onChange(prev => ({
              ...prev,
              colors: { ...prev.colors, transparentBackground: checked }
            }))
          }
          label="Transparent Background"
          description="Remove background color (great for stickers and cutouts)"
        />
      </div>

      {/* Real-Time WCAG Contrast Safety Indicator */}
      <ContrastSafetyIndicator
        config={config}
        onChange={onChange}
        variant="detailed"
      />

      {/* Gradient Section */}
      <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              Two-Color Blend
            </span>
            <p className="text-[11px] text-neutral-500">
              Blend two colors smoothly across the QR code
            </p>
          </div>
          <Switch
            checked={gradient.enabled}
            onCheckedChange={checked =>
              onChange(prev => ({
                ...prev,
                colors: {
                  ...prev.colors,
                  gradient: { ...prev.colors.gradient, enabled: checked }
                }
              }))
            }
          />
        </div>

        {gradient.enabled && (
          <div className="space-y-3 animate-in fade-in duration-150 p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-200 dark:border-neutral-800">
            {/* Linear vs Radial */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  onChange(prev => ({
                    ...prev,
                    colors: {
                      ...prev.colors,
                      gradient: { ...prev.colors.gradient, type: 'linear' }
                    }
                  }))
                }
                className={cn(
                  'flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer',
                  gradient.type === 'linear'
                    ? 'border-[#E64500] dark:border-orange-500 bg-white dark:bg-neutral-900 text-[#E64500] dark:text-orange-300 font-semibold ring-1 ring-[#E64500] dark:ring-orange-500 shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                )}
              >
                Straight Blend
              </button>
              <button
                type="button"
                onClick={() =>
                  onChange(prev => ({
                    ...prev,
                    colors: {
                      ...prev.colors,
                      gradient: { ...prev.colors.gradient, type: 'radial' }
                    }
                  }))
                }
                className={cn(
                  'flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer',
                  gradient.type === 'radial'
                    ? 'border-[#E64500] dark:border-orange-500 bg-white dark:bg-neutral-900 text-[#E64500] dark:text-orange-300 font-semibold ring-1 ring-[#E64500] dark:ring-orange-500 shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                )}
              >
                Center Blend
              </button>
            </div>

            {/* Start and End Color */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Start Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={gradient.startColor}
                    onChange={e =>
                      onChange(prev => ({
                        ...prev,
                        colors: {
                          ...prev.colors,
                          gradient: { ...prev.colors.gradient, startColor: e.target.value }
                        }
                      }))
                    }
                    className="w-7 h-7 rounded border border-neutral-300 dark:border-neutral-700 cursor-pointer p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={gradient.startColor}
                    onChange={e =>
                      onChange(prev => ({
                        ...prev,
                        colors: {
                          ...prev.colors,
                          gradient: { ...prev.colors.gradient, startColor: e.target.value }
                        }
                      }))
                    }
                    className="w-full h-7 text-xs font-mono px-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  End Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={gradient.endColor}
                    onChange={e =>
                      onChange(prev => ({
                        ...prev,
                        colors: {
                          ...prev.colors,
                          gradient: { ...prev.colors.gradient, endColor: e.target.value }
                        }
                      }))
                    }
                    className="w-7 h-7 rounded border border-neutral-300 dark:border-neutral-700 cursor-pointer p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={gradient.endColor}
                    onChange={e =>
                      onChange(prev => ({
                        ...prev,
                        colors: {
                          ...prev.colors,
                          gradient: { ...prev.colors.gradient, endColor: e.target.value }
                        }
                      }))
                    }
                    className="w-full h-7 text-xs font-mono px-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                  />
                </div>
              </div>
            </div>

            {/* Angle Slider (if linear) */}
            {gradient.type === 'linear' && (
              <Slider
                min={0}
                max={360}
                step={5}
                value={gradient.angle}
                unit="°"
                label="Blend Direction"
                onValueChange={angle =>
                  onChange(prev => ({
                    ...prev,
                    colors: {
                      ...prev.colors,
                      gradient: { ...prev.colors.gradient, angle }
                    }
                  }))
                }
              />
            )}

            {/* Gradient Contrast Warning (WCAG AA 4.5:1) */}
            {(startContrast < 4.5 || endContrast < 4.5) && (
              <div className="flex items-start gap-1.5 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>
                  Blend contrast drops to {Math.min(startContrast, endContrast)}:1 (below WCAG AA 4.5:1). Pick darker colors so phones can scan easily.
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

ColorsSelector.displayName = 'ColorsSelector';

