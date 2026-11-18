import * as React from 'react';
import { LayoutType, FramePreset, QRConfig } from '../../../types/qr';
import { Input } from '../../ui/input';
import { Slider } from '../../ui/slider';
import { cn } from '../../../lib/utils';

export interface LayoutFramesSelectorProps {
  config: QRConfig;
  onChange: (updater: (prev: QRConfig) => QRConfig) => void;
  mode?: 'all' | 'layout' | 'frame';
}

const LAYOUT_TYPES: { id: LayoutType; label: string; desc: string }[] = [
  { id: 'qr-only', label: 'QR Only', desc: 'Just the QR code by itself' },
  { id: 'qr-text', label: 'QR + Text', desc: 'QR code with title and text' },
  { id: 'card', label: 'Framed Card', desc: 'QR code inside a neat card' }
];

const FRAME_PRESETS: { id: FramePreset; label: string; defaultText: string; renderIcon: React.ReactNode }[] = [
  {
    id: 'none',
    label: 'None',
    defaultText: '',
    renderIcon: <div className="w-8 h-8 rounded border border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-[10px] text-neutral-400">None</div>
  },
  {
    id: 'scan-me',
    label: 'Scan Me',
    defaultText: 'SCAN ME',
    renderIcon: (
      <div className="w-8 h-8 rounded bg-neutral-100 dark:bg-neutral-800 p-1 flex flex-col items-center justify-between border border-neutral-300 dark:border-neutral-700">
        <div className="w-5 h-5 bg-neutral-400/40 rounded-xs" />
        <div className="w-full h-1.5 bg-neutral-900 dark:bg-neutral-100 rounded-xs" />
      </div>
    )
  },
  {
    id: 'badge',
    label: 'Pill Badge',
    defaultText: 'SCAN TO CONNECT',
    renderIcon: (
      <div className="w-8 h-8 rounded bg-neutral-100 dark:bg-neutral-800 p-1 flex flex-col items-center justify-between border border-neutral-300 dark:border-neutral-700">
        <div className="w-5 h-5 bg-neutral-400/40 rounded-xs" />
        <div className="w-3/4 h-1.5 bg-neutral-900 dark:bg-neutral-100 rounded-full" />
      </div>
    )
  },
  {
    id: 'camera',
    label: 'Camera',
    defaultText: 'POINT CAMERA',
    renderIcon: (
      <div className="w-8 h-8 rounded bg-neutral-100 dark:bg-neutral-800 p-1 flex flex-col items-center justify-between border border-neutral-300 dark:border-neutral-700">
        <div className="w-full h-1.5 bg-neutral-900 dark:bg-neutral-100 rounded-xs" />
        <div className="w-5 h-5 bg-neutral-400/40 rounded-xs" />
      </div>
    )
  },
  {
    id: 'minimal',
    label: 'Outline',
    defaultText: 'SCAN HERE',
    renderIcon: (
      <div className="w-8 h-8 rounded p-1 flex flex-col items-center justify-between border-2 border-neutral-900 dark:border-neutral-100">
        <div className="w-5 h-5 bg-neutral-400/40 rounded-xs" />
        <div className="w-full h-1 bg-neutral-400/60 rounded-xs" />
      </div>
    )
  }
];

export const LayoutFramesSelector: React.FC<LayoutFramesSelectorProps> = React.memo(({
  config,
  onChange,
  mode = 'all'
}) => {
  const { layout, frame, text } = config;

  const showLayout = mode === 'all' || mode === 'layout';
  const showFrame = mode === 'all' || mode === 'frame';

  return (
    <div className="space-y-4">
      {/* 1. Layout Mode Section */}
      {showLayout && (
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
            Layout
          </label>
          <div className="grid grid-cols-1 xs:grid-cols-3 gap-2">
            {LAYOUT_TYPES.map(l => {
              const isSelected = layout.type === l.id;
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() =>
                    onChange(prev => ({
                      ...prev,
                      layout: { ...prev.layout, type: l.id }
                    }))
                  }
                  className={cn(
                    'flex flex-col p-2.5 rounded-xl border text-left transition-all cursor-pointer',
                    isSelected
                      ? 'border-[#E64500] dark:border-orange-500 bg-orange-50/60 dark:bg-orange-950/40 text-[#E64500] dark:text-orange-300 ring-1 ring-[#E64500] dark:ring-orange-500 shadow-xs'
                      : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-orange-200 dark:hover:border-orange-900/60'
                  )}
                >
                  <span className={cn(
                    "text-xs font-semibold",
                    isSelected ? "text-[#E64500] dark:text-orange-300" : "text-neutral-900 dark:text-neutral-100"
                  )}>
                    {l.label}
                  </span>
                  <span className="text-[10px] text-neutral-500 mt-0.5 line-clamp-2">
                    {l.desc}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Card Border Radius, Padding, and Colors (if card) */}
          {layout.type === 'card' && (
            <div className="space-y-3 pt-3 mt-3 border-t border-neutral-100 dark:border-neutral-800 animate-in fade-in duration-150">
              <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                Card Design
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Card Background
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={layout.card.backgroundColor}
                      onChange={e =>
                        onChange(prev => ({
                          ...prev,
                          layout: {
                            ...prev.layout,
                            card: { ...prev.layout.card, backgroundColor: e.target.value }
                          }
                        }))
                      }
                      className="w-7 h-7 rounded border border-neutral-300 dark:border-neutral-700 cursor-pointer p-0 bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={layout.card.backgroundColor}
                      onChange={e =>
                        onChange(prev => ({
                          ...prev,
                          layout: {
                            ...prev.layout,
                            card: { ...prev.layout.card, backgroundColor: e.target.value }
                          }
                        }))
                      }
                      className="w-full h-8 text-xs font-mono px-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Card Border Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={layout.card.borderColor}
                      onChange={e =>
                        onChange(prev => ({
                          ...prev,
                          layout: {
                            ...prev.layout,
                            card: { ...prev.layout.card, borderColor: e.target.value }
                          }
                        }))
                      }
                      className="w-7 h-7 rounded border border-neutral-300 dark:border-neutral-700 cursor-pointer p-0 bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={layout.card.borderColor}
                      onChange={e =>
                        onChange(prev => ({
                          ...prev,
                          layout: {
                            ...prev.layout,
                            card: { ...prev.layout.card, borderColor: e.target.value }
                          }
                        }))
                      }
                      className="w-full h-8 text-xs font-mono px-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                    />
                  </div>
                </div>
              </div>

              <Slider
                min={0}
                max={32}
                step={2}
                value={layout.card.borderRadius}
                unit="px"
                label="Card Corner Rounding"
                onValueChange={r =>
                  onChange(prev => ({
                    ...prev,
                    layout: {
                      ...prev.layout,
                      card: { ...prev.layout.card, borderRadius: r }
                    }
                  }))
                }
              />
              <Slider
                min={12}
                max={48}
                step={4}
                value={layout.card.padding}
                unit="px"
                label="Space Inside Card"
                onValueChange={p =>
                  onChange(prev => ({
                    ...prev,
                    layout: {
                      ...prev.layout,
                      card: { ...prev.layout.card, padding: p }
                    }
                  }))
                }
              />
            </div>
          )}
        </div>
      )}

      {/* 2. Frame Presets Section */}
      {showFrame && (
        <div className={cn(showLayout && 'pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-3')}>
          <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
            Frame
          </label>
          <div className="grid grid-cols-3 xs:grid-cols-5 gap-2">
            {FRAME_PRESETS.map(f => {
              const isSelected = frame.preset === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() =>
                    onChange(prev => ({
                      ...prev,
                      frame: {
                        ...prev.frame,
                        preset: f.id,
                        text: f.id === 'none' ? '' : prev.frame.text || f.defaultText,
                        style: f.id === 'camera' ? 'banner-top' : 'banner-bottom'
                      }
                    }))
                  }
                  className={cn(
                    'flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer',
                    isSelected
                      ? 'border-[#E64500] dark:border-orange-500 bg-orange-50/60 dark:bg-orange-950/40 text-[#E64500] dark:text-orange-300 ring-1 ring-[#E64500] dark:ring-orange-500 font-semibold shadow-xs'
                      : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-orange-200 dark:hover:border-orange-900/60'
                  )}
                >
                  <div className="mb-1">{f.renderIcon}</div>
                  <span className="text-[11px] truncate w-full">{f.label}</span>
                </button>
              );
            })}
          </div>

          {frame.preset !== 'none' && (
            <div className="space-y-3 pt-3 mt-3 border-t border-neutral-100 dark:border-neutral-800 animate-in fade-in duration-150">
              <div>
                <label className="block text-[11px] font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Frame Text
                </label>
                <Input
                  value={frame.text}
                  placeholder="e.g. SCAN ME / VIEW MENU"
                  onChange={e =>
                    onChange(prev => ({
                      ...prev,
                      frame: { ...prev.frame, text: e.target.value }
                    }))
                  }
                  className="text-xs uppercase tracking-wider font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Frame Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={frame.color}
                      onChange={e =>
                        onChange(prev => ({
                          ...prev,
                          frame: { ...prev.frame, color: e.target.value }
                        }))
                      }
                      className="w-7 h-7 rounded border border-neutral-300 dark:border-neutral-700 cursor-pointer p-0 bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={frame.color}
                      onChange={e =>
                        onChange(prev => ({
                          ...prev,
                          frame: { ...prev.frame, color: e.target.value }
                        }))
                      }
                      className="w-full h-8 text-xs font-mono px-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Text Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={frame.textColor}
                      onChange={e =>
                        onChange(prev => ({
                          ...prev,
                          frame: { ...prev.frame, textColor: e.target.value }
                        }))
                      }
                      className="w-7 h-7 rounded border border-neutral-300 dark:border-neutral-700 cursor-pointer p-0 bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={frame.textColor}
                      onChange={e =>
                        onChange(prev => ({
                          ...prev,
                          frame: { ...prev.frame, textColor: e.target.value }
                        }))
                      }
                      className="w-full h-8 text-xs font-mono px-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Typography & Headers */}
          <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-3 animate-in fade-in duration-150">
            <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              Card Text & Titles
            </label>

            <div className="space-y-2">
              <div>
                <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Title
                </label>
                <Input
                  value={text.heading}
                  placeholder="e.g. SCAN TO CONNECT"
                  onChange={e =>
                    onChange(prev => ({
                      ...prev,
                      text: { ...prev.text, heading: e.target.value }
                    }))
                  }
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Subtitle
                </label>
                <Input
                  value={text.subtitle}
                  placeholder="e.g. Point your camera to view portfolio"
                  onChange={e =>
                    onChange(prev => ({
                      ...prev,
                      text: { ...prev.text, subtitle: e.target.value }
                    }))
                  }
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Bottom Text
                </label>
                <Input
                  value={text.footer}
                  placeholder="e.g. Powered by makeqrr"
                  onChange={e =>
                    onChange(prev => ({
                      ...prev,
                      text: { ...prev.text, footer: e.target.value }
                    }))
                  }
                  className="text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

LayoutFramesSelector.displayName = 'LayoutFramesSelector';

