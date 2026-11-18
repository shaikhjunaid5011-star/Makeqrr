import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QRConfig } from '../../../types/qr';
import { PatternSelector } from './pattern-selector';
import { EyesSelector } from './eyes-selector';
import { ColorsSelector } from './colors-selector';
import { LogoSelector } from './logo-selector';
import { ReliabilityControls } from './reliability-controls';
import { LayoutFramesSelector } from './layout-frames-selector';
import {
  Palette,
  Sliders,
  Image as ImageIcon,
  Layers,
  Shield,
  Eye,
  Maximize,
  ChevronDown
} from 'lucide-react';
import { cn } from '../../../lib/utils';

export interface CustomizationStudioProps {
  config: QRConfig;
  onChange: (updater: (prev: QRConfig) => QRConfig) => void;
  isAdvanced: boolean;
  onToggleAdvanced: (adv: boolean) => void;
  activeSection?: 'all' | 'style' | 'logo' | 'layout' | 'frame';
}

export const CustomizationStudio: React.FC<CustomizationStudioProps> = React.memo(({
  config,
  onChange,
  isAdvanced,
  onToggleAdvanced,
  activeSection = 'all'
}) => {
  // Collapsible section states for Advanced mode
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({
    pattern: true,
    colors: true,
    logo: true,
    eyes: false,
    reliability: false,
    layout: false
  });

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // 1. MOBILE TARGETED SECTION: STYLE (Pattern + Eyes + Colors)
  if (activeSection === 'style') {
    return (
      <div className="space-y-4">
        {/* Module Pattern */}
        <div className="p-3.5 sm:p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-3">
          <span className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
            Dots Pattern
          </span>
          <PatternSelector
            value={config.pattern.type}
            color={config.colors.foreground}
            onChange={patternType =>
              onChange(prev => ({
                ...prev,
                pattern: { ...prev.pattern, type: patternType }
              }))
            }
          />
        </div>

        {/* Corner Eyes */}
        <div className="p-3.5 sm:p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <EyesSelector config={config} onChange={onChange} />
        </div>

        {/* Colors & Gradient */}
        <div className="p-3.5 sm:p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <ColorsSelector config={config} onChange={onChange} />
        </div>
      </div>
    );
  }

  // 2. MOBILE TARGETED SECTION: LOGO
  if (activeSection === 'logo') {
    return (
      <div className="p-3.5 sm:p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
        <LogoSelector config={config} onChange={onChange} />
      </div>
    );
  }

  // 3. MOBILE TARGETED SECTION: LAYOUT (Card + Reliability)
  if (activeSection === 'layout') {
    return (
      <div className="space-y-4">
        <div className="p-3.5 sm:p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <LayoutFramesSelector config={config} onChange={onChange} mode="layout" />
        </div>

        <div className="p-3.5 sm:p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <ReliabilityControls config={config} onChange={onChange} />
        </div>
      </div>
    );
  }

  // 4. MOBILE TARGETED SECTION: FRAME (Presets + Typography)
  if (activeSection === 'frame') {
    return (
      <div className="p-3.5 sm:p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
        <LayoutFramesSelector config={config} onChange={onChange} mode="frame" />
      </div>
    );
  }

  // 5. DEFAULT FULL STUDIO (Desktop & Tablet)
  return (
    <div className="space-y-4">
      {/* Studio Header & Basic/Advanced Mode Toggle */}
      <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Design
          </span>
          <p className="text-[11px] text-neutral-500">
            {isAdvanced ? 'All detailed controls' : 'Simple controls'}
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center p-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <button
            type="button"
            onClick={() => onToggleAdvanced(false)}
            className={cn(
              'px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer',
              !isAdvanced
                ? 'bg-[#E64500] text-white shadow-xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-[#E64500] dark:hover:text-orange-400'
            )}
          >
            Simple
          </button>
          <button
            type="button"
            onClick={() => onToggleAdvanced(true)}
            className={cn(
              'px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer',
              isAdvanced
                ? 'bg-[#E64500] text-white shadow-xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-[#E64500] dark:hover:text-orange-400'
            )}
          >
            Advanced
          </button>
        </div>
      </div>

      {/* BASIC MODE: Clean, straightforward, uncluttered */}
      {!isAdvanced && (
        <div className="space-y-4">
          {/* 1. Pattern */}
          <div className="p-3.5 sm:p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-3">
            <span className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              Dots Pattern
            </span>
            <PatternSelector
              value={config.pattern.type}
              color={config.colors.foreground}
              onChange={patternType =>
                onChange(prev => ({
                  ...prev,
                  pattern: { ...prev.pattern, type: patternType }
                }))
              }
            />
          </div>

          {/* 2. Colors */}
          <div className="p-3.5 sm:p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-3">
            <span className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              Colors
            </span>
            <ColorsSelector config={config} onChange={onChange} />
          </div>

          {/* 3. Logo */}
          <div className="p-3.5 sm:p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-3">
            <LogoSelector config={config} onChange={onChange} />
          </div>

          {/* 4. Frame & Layout Quick */}
          <div className="p-3.5 sm:p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-3">
            <LayoutFramesSelector config={config} onChange={onChange} mode="frame" />
          </div>
        </div>
      )}

      {/* ADVANCED MODE: Granular Accordion Sections */}
      {isAdvanced && (
        <div className="space-y-3">
          {/* Section: Pattern */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('pattern')}
              className="w-full flex items-center justify-between p-3.5 text-left text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-neutral-500" />
                <span>1. Dots Pattern</span>
              </div>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-neutral-400 transition-transform duration-200',
                  openSections.pattern && 'rotate-180'
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {openSections.pattern && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-1 border-t border-neutral-100 dark:border-neutral-800">
                    <PatternSelector
                      value={config.pattern.type}
                      color={config.colors.foreground}
                      onChange={patternType =>
                        onChange(prev => ({
                          ...prev,
                          pattern: { ...prev.pattern, type: patternType }
                        }))
                      }
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Section: Finder Eyes */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('eyes')}
              className="w-full flex items-center justify-between p-3.5 text-left text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-neutral-500" />
                <span>2. Corner Eyes</span>
              </div>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-neutral-400 transition-transform duration-200',
                  openSections.eyes && 'rotate-180'
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {openSections.eyes && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-1 border-t border-neutral-100 dark:border-neutral-800">
                    <EyesSelector config={config} onChange={onChange} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Section: Colors & Gradients */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('colors')}
              className="w-full flex items-center justify-between p-3.5 text-left text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-neutral-500" />
                <span>3. QR Color & Background</span>
              </div>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-neutral-400 transition-transform duration-200',
                  openSections.colors && 'rotate-180'
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {openSections.colors && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-1 border-t border-neutral-100 dark:border-neutral-800">
                    <ColorsSelector config={config} onChange={onChange} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Section: Center Logo & Icons */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('logo')}
              className="w-full flex items-center justify-between p-3.5 text-left text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-neutral-500" />
                <span>4. Add Logo or Image</span>
              </div>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-neutral-400 transition-transform duration-200',
                  openSections.logo && 'rotate-180'
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {openSections.logo && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-1 border-t border-neutral-100 dark:border-neutral-800">
                    <LogoSelector config={config} onChange={onChange} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Section: Error Correction & Quiet Zone */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('reliability')}
              className="w-full flex items-center justify-between p-3.5 text-left text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-neutral-500" />
                <span>5. Scan Safety & Edge Space</span>
              </div>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-neutral-400 transition-transform duration-200',
                  openSections.reliability && 'rotate-180'
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {openSections.reliability && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-1 border-t border-neutral-100 dark:border-neutral-800">
                    <ReliabilityControls config={config} onChange={onChange} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Section: Layout, Frames & Typography */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('layout')}
              className="w-full flex items-center justify-between p-3.5 text-left text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-neutral-500" />
                <span>6. Frames & Text</span>
              </div>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-neutral-400 transition-transform duration-200',
                  openSections.layout && 'rotate-180'
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {openSections.layout && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-1 border-t border-neutral-100 dark:border-neutral-800">
                    <LayoutFramesSelector config={config} onChange={onChange} mode="all" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}, (prev, next) => {
  return (
    prev.isAdvanced === next.isAdvanced &&
    prev.activeSection === next.activeSection &&
    prev.onChange === next.onChange &&
    prev.config.pattern === next.config.pattern &&
    prev.config.colors === next.config.colors &&
    prev.config.eyes === next.config.eyes &&
    prev.config.logo === next.config.logo &&
    prev.config.layout === next.config.layout &&
    prev.config.frame === next.config.frame &&
    prev.config.quietZone === next.config.quietZone &&
    prev.config.errorCorrection === next.config.errorCorrection &&
    prev.config.text === next.config.text
  );
});

CustomizationStudio.displayName = 'CustomizationStudio';

