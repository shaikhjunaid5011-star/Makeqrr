import * as React from 'react';
import { motion } from 'motion/react';
import { QRConfig, QRTemplate } from '../../types/qr';
import { ContentForm } from './content/content-form';
import { QRPreview } from './qr-preview';
import { CustomizationStudio } from './customization/customization-studio';
import {
  Undo2,
  Redo2,
  RotateCcw,
  Layers,
  Download,
  Share2,
  Check,
  ChevronRight,
  Briefcase,
  Users,
  Calendar,
  CreditCard,
  FileText,
  Palette,
  Maximize2,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '../ui/button';
import { saveConfig, saveToRecentDesigns } from '../../lib/storage';
import { QR_TEMPLATES } from '../../lib/templates';
import { TemplateVisualPreview } from './template-visual-preview';
import { cn } from '../../lib/utils';
import { Link } from '../../lib/router';

export type MobileTab = 'content' | 'style' | 'logo' | 'layout' | 'frame';

interface QREditorProps {
  config: QRConfig;
  onChangeConfig: (updater: (prev: QRConfig) => QRConfig) => void;
  onOpenScanner: () => void;
  onOpenExport: () => void;
  onOpenShare: () => void;
  onOpenTemplates: () => void;
  onOpenReset: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onSelectTemplate?: (template: QRTemplate) => void;
}

interface TemplatePresetStripProps {
  currentPattern: string;
  currentColor: string;
  onSelectTemplate?: (template: QRTemplate) => void;
  onOpenTemplates: () => void;
}

const TemplatePresetStrip = React.memo<TemplatePresetStripProps>(({
  currentPattern,
  currentColor,
  onSelectTemplate,
  onOpenTemplates
}) => {
  const [templateCategory, setTemplateCategory] = React.useState<'all' | 'business' | 'social' | 'event' | 'payment'>('all');

  const quickTemplates = React.useMemo(() => {
    const list = templateCategory === 'all' ? QR_TEMPLATES : QR_TEMPLATES.filter(t => t.category === templateCategory);
    return list.slice(0, 10);
  }, [templateCategory]);

  return (
    <div className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
            Quick Styles
          </h2>
          <span className="text-[11px] text-neutral-500 dark:text-neutral-400 hidden lg:inline">
            Pick a style without changing your text
          </span>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 xs:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All' },
            { id: 'business', label: 'Business', icon: Briefcase },
            { id: 'social', label: 'Social', icon: Users },
            { id: 'event', label: 'Event', icon: Calendar },
            { id: 'payment', label: 'Payment', icon: CreditCard }
          ].map(cat => {
            const isActive = templateCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setTemplateCategory(cat.id as any)}
                className={cn(
                  'relative px-2.5 py-1 text-[11px] font-medium rounded-full transition-colors shrink-0 cursor-pointer z-10',
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-[#E64500] dark:hover:text-orange-400 hover:bg-orange-50/50 dark:hover:bg-orange-950/30'
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="preset-strip-cat-pill"
                    className="absolute inset-0 rounded-full bg-[#E64500] shadow-xs shadow-orange-500/25 -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                  />
                )}
                <span>{cat.label}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={onOpenTemplates}
            className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 pl-2 pr-1 py-1 flex items-center gap-0.5 shrink-0"
          >
            <span>All</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Visual Template Cards */}
      <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
        {quickTemplates.map(template => {
          const isPatternMatch = currentPattern === (template.config.pattern?.type || 'square');
          const isColorMatch = currentColor === template.config.colors?.foreground;
          const isSelected = isPatternMatch && isColorMatch;

          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onSelectTemplate?.(template)}
              title={`${template.name}: ${template.description}`}
              className={cn(
                'group flex flex-col items-center p-2 rounded-xl border text-left transition-all duration-200 shrink-0 w-[95px] sm:w-[110px] relative focus:outline-hidden cursor-pointer select-none hover:-translate-y-0.5',
                isSelected
                  ? 'border-[#E64500] dark:border-orange-500 ring-2 ring-[#E64500]/20 dark:ring-orange-500/20 bg-orange-50/40 dark:bg-orange-950/40 shadow-xs'
                  : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:border-orange-300 dark:hover:border-orange-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
              )}
            >
              {isSelected && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#E64500] text-white flex items-center justify-center text-[10px] shadow-xs z-10">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              )}

              <div className="w-[76px] sm:w-[84px] h-[76px] sm:h-[84px] rounded-lg overflow-hidden flex items-center justify-center bg-neutral-100 dark:bg-neutral-800/60 p-1 mb-1.5">
                <div className="transition-transform duration-200 group-hover:scale-105">
                  <TemplateVisualPreview template={template} size={70} />
                </div>
              </div>

              <div className="w-full text-center">
                <span className="block text-[10.5px] sm:text-[11px] font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                  {template.name}
                </span>
                <span className="block text-[8.5px] sm:text-[9px] uppercase tracking-wider font-mono text-neutral-400 truncate">
                  {template.category}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
});

TemplatePresetStrip.displayName = 'TemplatePresetStrip';

function useBreakpoint(): 'mobile' | 'tablet' | 'desktop' {
  const [bp, setBp] = React.useState<'mobile' | 'tablet' | 'desktop'>(() => {
    if (typeof window === 'undefined') return 'desktop';
    const w = window.innerWidth;
    return w < 768 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop';
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const update = () => {
      const w = window.innerWidth;
      const nextBp = w < 768 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop';
      setBp(current => (current !== nextBp ? nextBp : current));
    };

    window.addEventListener('resize', update, { passive: true });
    return () => window.removeEventListener('resize', update);
  }, []);

  return bp;
}

export const QREditor: React.FC<QREditorProps> = React.memo(({
  config,
  onChangeConfig,
  onOpenScanner,
  onOpenExport,
  onOpenShare,
  onOpenTemplates,
  onOpenReset,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onSelectTemplate
}) => {
  const breakpoint = useBreakpoint();
  const [isAdvanced, setIsAdvanced] = React.useState(false);
  const [mobileTab, setMobileTab] = React.useState<MobileTab>('content');
  const [tabletTab, setTabletTab] = React.useState<'content' | 'customize'>('content');

  // Debounced auto-save to recent designs history (2000ms delay to avoid thrashing localStorage)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      saveToRecentDesigns(config);
    }, 2000);
    return () => clearTimeout(timer);
  }, [config]);

  return (
    <div className="w-full max-w-7xl 2xl:max-w-(--breakpoint-2xl) mx-auto px-2.5 sm:px-6 py-2.5 sm:py-5 space-y-3 sm:space-y-4 pb-28 md:pb-8">
      {/* Compact Studio Page Header with Semantic H1 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 px-1">
        <div>
          <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
            Create Your Custom QR Code Online
          </h1>
          <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400">
            Generate static URL, WhatsApp (+country code), Wi-Fi, vCard, Google Maps &amp; UPI QR codes with custom logos and vector SVG export.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-3 text-[11px] font-medium text-neutral-500 dark:text-neutral-400 shrink-0">
          <Link href="/templates" className="hover:text-[#E64500] dark:hover:text-orange-400 transition-colors">
            Browse 50+ Templates
          </Link>
          <span>•</span>
          <Link href="/help" className="hover:text-[#E64500] dark:hover:text-orange-400 transition-colors">
            QR Printing &amp; Scan Guide
          </Link>
        </div>
      </div>

      {/* Top Studio Action Toolbar - Responsive, compact, zero horizontal overflow */}
      <div className="flex items-center justify-between p-1.5 sm:p-2.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs gap-1 sm:gap-2">
        <div className="flex items-center gap-0.5 sm:gap-1.5 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo"
            aria-label="Undo"
            className="h-8 sm:h-8.5 w-8 sm:w-auto px-0 sm:px-2.5 text-xs gap-1 cursor-pointer"
          >
            <Undo2 className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Undo</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo"
            aria-label="Redo"
            className="h-8 sm:h-8.5 w-8 sm:w-auto px-0 sm:px-2.5 text-xs gap-1 cursor-pointer"
          >
            <Redo2 className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Redo</span>
          </Button>

          <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800 mx-0.5" />

          {/* Compact Clear/Reset - Icon only on mobile (<= 640px) */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onOpenReset}
            title="Clear all QR content and reset studio"
            aria-label="Clear all content"
            className="h-8 sm:h-8.5 w-8 sm:w-auto px-0 sm:px-2.5 text-xs gap-1 text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Clear All</span>
          </Button>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Templates count badge */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenTemplates}
            aria-label="Templates"
            title="View Templates"
            className="h-8 sm:h-8.5 text-xs gap-1 px-1.5 sm:px-2.5 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
            <span className="hidden sm:inline">Templates</span>
            <span className="text-[10px] font-mono px-1 rounded bg-orange-50 dark:bg-orange-950/70 text-[#E64500] dark:text-orange-400 border border-orange-200/50 dark:border-orange-800/50 font-semibold">
              {QR_TEMPLATES.length}
            </span>
          </Button>

          {/* Share QR - Share icon only on mobile (<= 640px) */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenShare}
            aria-label="Share QR"
            title="Share QR"
            className="h-8 sm:h-8.5 w-8 sm:w-auto px-0 sm:px-2.5 text-xs gap-1.5 text-[#E64500] dark:text-orange-400 border-orange-200/80 dark:border-orange-800/80 hover:bg-orange-50 dark:hover:bg-orange-950/40 cursor-pointer active:scale-90 active:rotate-[-1deg] transition-transform"
          >
            <Share2 className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Share QR</span>
          </Button>

          {/* Download Button - Naturally fits available width */}
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onOpenExport}
            aria-label="Download QR"
            title="Download QR code"
            className="h-8 sm:h-8.5 px-2 sm:px-3 text-xs gap-1 sm:gap-1.5 font-semibold shadow-xs cursor-pointer active:scale-95 transition-all bg-[#E64500] hover:bg-[#cc3d00] text-white shrink-0"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden xs:inline">Download QR</span>
            <span className="xs:hidden">Download</span>
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. MOBILE RESPONSIVE LAYOUT (< 768px / md)                                */}
      {/* Preview-First layout with responsive tabs for Content, Style, Logo, Frame */}
      {/* ========================================================================= */}
      {breakpoint === 'mobile' && (
        <div className="space-y-4">
          {/* Sticky Mobile Live QR Preview */}
          <div className="w-full">
            <QRPreview
              config={config}
              onChangeConfig={onChangeConfig}
              onOpenScanner={onOpenScanner}
              onOpenExport={onOpenExport}
              onOpenShare={onOpenShare}
            />
          </div>

          {/* Quick Designer Presets Strip */}
          <TemplatePresetStrip
            currentPattern={config.pattern.type}
            currentColor={config.colors.foreground}
            onSelectTemplate={onSelectTemplate}
            onOpenTemplates={onOpenTemplates}
          />

          {/* Mobile Navigation Tabs: Content, Style, Logo, Layout, Frame */}
          <div className="sticky top-14 z-20 bg-neutral-50/90 dark:bg-neutral-950/90 backdrop-blur-md py-1.5">
            <div className="flex rounded-xl bg-neutral-200/70 dark:bg-neutral-800/80 p-1 gap-0.5 overflow-x-auto scrollbar-none shadow-xs">
              {[
                { id: 'content', label: 'Info', icon: FileText },
                { id: 'style', label: 'Design', icon: Palette },
                { id: 'logo', label: 'Logo', icon: ImageIcon },
                { id: 'layout', label: 'Card', icon: Layers },
                { id: 'frame', label: 'Frame', icon: Maximize2 }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = mobileTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setMobileTab(tab.id as MobileTab)}
                    className={cn(
                      'flex-1 min-w-[62px] py-2 px-1 text-xs font-semibold rounded-lg transition-all flex flex-col items-center justify-center gap-1 cursor-pointer',
                      isActive
                        ? 'bg-white dark:bg-neutral-900 text-[#E64500] dark:text-orange-400 shadow-xs font-semibold'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                    )}
                  >
                    <Icon className={cn('w-3.5 h-3.5', isActive ? 'text-[#E64500] dark:text-orange-400' : 'text-neutral-500')} />
                    <span className="text-[11px] leading-none">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Tab View Content */}
          <div className="w-full animate-in fade-in duration-150">
            {mobileTab === 'content' && (
              <ContentForm config={config} onChange={onChangeConfig} />
            )}

            {mobileTab === 'style' && (
              <CustomizationStudio
                config={config}
                onChange={onChangeConfig}
                isAdvanced={isAdvanced}
                onToggleAdvanced={setIsAdvanced}
                activeSection="style"
              />
            )}

            {mobileTab === 'logo' && (
              <CustomizationStudio
                config={config}
                onChange={onChangeConfig}
                isAdvanced={isAdvanced}
                onToggleAdvanced={setIsAdvanced}
                activeSection="logo"
              />
            )}

            {mobileTab === 'layout' && (
              <CustomizationStudio
                config={config}
                onChange={onChangeConfig}
                isAdvanced={isAdvanced}
                onToggleAdvanced={setIsAdvanced}
                activeSection="layout"
              />
            )}

            {mobileTab === 'frame' && (
              <CustomizationStudio
                config={config}
                onChange={onChangeConfig}
                isAdvanced={isAdvanced}
                onToggleAdvanced={setIsAdvanced}
                activeSection="frame"
              />
            )}
          </div>

          {/* Floating Mobile Sticky Bottom Bar (Prominent Download Action) */}
          <div className="fixed bottom-0 left-0 right-0 z-30 p-2 sm:p-2.5 pb-[max(0.625rem,calc(env(safe-area-inset-bottom,0px)+0.5rem))] bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 shadow-xl md:hidden">
            <div className="max-w-md mx-auto flex items-center justify-between gap-1.5 sm:gap-2">
              <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onUndo}
                  disabled={!canUndo}
                  title="Undo"
                  aria-label="Undo"
                  className="h-9 w-8 sm:w-9 p-0 text-neutral-600 dark:text-neutral-400 cursor-pointer"
                >
                  <Undo2 className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onRedo}
                  disabled={!canRedo}
                  title="Redo"
                  aria-label="Redo"
                  className="h-9 w-8 sm:w-9 p-0 text-neutral-600 dark:text-neutral-400 cursor-pointer"
                >
                  <Redo2 className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onOpenReset}
                  title="Clear All"
                  aria-label="Clear all content"
                  className="h-9 w-8 sm:w-9 p-0 text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onOpenTemplates}
                  aria-label="Templates"
                  title="Templates"
                  className="h-9 w-8 sm:w-auto p-0 sm:px-2.5 text-xs gap-1 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Templates</span>
                </Button>
              </div>

              {/* Share and Download Action Buttons */}
              <Button
                type="button"
                variant="outline"
                size="default"
                onClick={onOpenShare}
                title="Share QR"
                aria-label="Share QR"
                className="h-9 w-9 sm:w-auto p-0 sm:px-3 text-xs font-semibold gap-1.5 text-[#E64500] dark:text-orange-400 border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/30 hover:bg-orange-100/50 active:scale-90 active:rotate-[-1deg] transition-transform cursor-pointer shrink-0"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share QR</span>
              </Button>

              {/* High-Prominence Mobile Download CTA */}
              <Button
                type="button"
                variant="primary"
                size="default"
                onClick={onOpenExport}
                aria-label="Download QR"
                title="Download QR code"
                className="flex-1 h-9 sm:h-10 text-xs font-bold gap-1.5 shadow-md shadow-orange-500/25 bg-[#E64500] text-white hover:bg-[#cc3d00] active:bg-[#b33500] hover:scale-[1.01] transition-transform px-2.5 sm:px-4 shrink min-w-0"
              >
                <Download className="w-4 h-4 shrink-0" />
                <span className="truncate">Download QR</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TABLET 2-COLUMN LAYOUT (768px - 1024px: md to lg)                      */}
      {/* Intelligently collapses while keeping controls accessible and preview     */}
      {/* ========================================================================= */}
      {breakpoint === 'tablet' && (
        <div className="grid grid-cols-12 gap-5 items-start">
          {/* Left Column (7 cols): Content & Customization with clean tabs */}
          <div className="md:col-span-7 space-y-4">
            <div className="flex rounded-xl bg-neutral-100 dark:bg-neutral-800 p-1 shadow-xs">
              <button
                type="button"
                onClick={() => setTabletTab('content')}
                className={cn(
                  'flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5',
                  tabletTab === 'content'
                    ? 'bg-white dark:bg-neutral-900 text-[#E64500] dark:text-orange-400 shadow-xs font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                )}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>1. Your Information</span>
              </button>
              <button
                type="button"
                onClick={() => setTabletTab('customize')}
                className={cn(
                  'flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5',
                  tabletTab === 'customize'
                    ? 'bg-white dark:bg-neutral-900 text-[#E64500] dark:text-orange-400 shadow-xs font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                )}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>2. Design QR</span>
              </button>
            </div>

            {tabletTab === 'content' ? (
              <ContentForm config={config} onChange={onChangeConfig} />
            ) : (
              <CustomizationStudio
                config={config}
                onChange={onChangeConfig}
                isAdvanced={isAdvanced}
                onToggleAdvanced={setIsAdvanced}
              />
            )}
          </div>

          {/* Right Column (5 cols): Sticky Live QR Preview & Templates */}
          <div className="md:col-span-5 sticky top-20 space-y-4">
            <QRPreview
              config={config}
              onChangeConfig={onChangeConfig}
              onOpenScanner={onOpenScanner}
              onOpenExport={onOpenExport}
              onOpenShare={onOpenShare}
            />
            <TemplatePresetStrip
              currentPattern={config.pattern.type}
              currentColor={config.colors.foreground}
              onSelectTemplate={onSelectTemplate}
              onOpenTemplates={onOpenTemplates}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DESKTOP 3-COLUMN STUDIO LAYOUT (> 1024px: lg, xl, 2xl, ultra-wide)     */}
      {/* Column 1: QR Content (4 cols)                                            */}
      {/* Column 2: Sticky Center Stage Live QR Preview + Templates (4 cols)        */}
      {/* Column 3: Customization Studio (4 cols)                                   */}
      {/* ========================================================================= */}
      {breakpoint === 'desktop' && (
        <div className="grid grid-cols-12 gap-6 items-start">
          {/* Column 1: QR Content */}
          <div className="lg:col-span-4 space-y-4">
            <ContentForm config={config} onChange={onChangeConfig} />
          </div>

          {/* Column 2: Live QR Preview & Presets Strip (Sticky Center Stage) */}
          <div className="lg:col-span-4 sticky top-20 space-y-4">
            <QRPreview
              config={config}
              onChangeConfig={onChangeConfig}
              onOpenScanner={onOpenScanner}
              onOpenExport={onOpenExport}
              onOpenShare={onOpenShare}
            />
            <TemplatePresetStrip
              currentPattern={config.pattern.type}
              currentColor={config.colors.foreground}
              onSelectTemplate={onSelectTemplate}
              onOpenTemplates={onOpenTemplates}
            />
          </div>

          {/* Column 3: Customization Studio */}
          <div className="lg:col-span-4 space-y-4">
            <CustomizationStudio
              config={config}
              onChange={onChangeConfig}
              isAdvanced={isAdvanced}
              onToggleAdvanced={setIsAdvanced}
            />
          </div>
        </div>
      )}

      {/* Semantic QR Studio Guide & Internal Links for Search Visibility and User Help */}
      <section
        aria-label="Custom QR Code Generator Guide"
        className="pt-6 mt-6 border-t border-neutral-200/80 dark:border-neutral-800/80"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-neutral-600 dark:text-neutral-400">
          <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-1.5">
            <h2 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100">
              12+ Static QR Code Types
            </h2>
            <p className="leading-relaxed">
              Create permanent QR codes for Website URLs, WhatsApp messages with mandatory international country codes, Wi-Fi network credentials, vCard digital business cards, Google Maps coordinates, Email, Phone, SMS, Calendar events, and UPI payments.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-1.5">
            <h2 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Custom Logo, Colors &amp; Scan Safety
            </h2>
            <p className="leading-relaxed">
              Personalize module patterns, corner eyes, gradients, and CTA frames. When embedding a center brand logo or emoji, our generator uses Reed-Solomon High (30%) error correction and contrast checking to maintain reliable smartphone scanning.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-1.5">
            <h2 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100">
              High-Resolution PNG &amp; Vector SVG
            </h2>
            <p className="leading-relaxed">
              Download crisp PNG images up to 4096px for websites and social media, or export scalable vector SVG files for business cards, restaurant menus, flyers, and packaging. Explore{' '}
              <Link href="/templates" className="font-semibold text-[#E64500] dark:text-orange-400 hover:underline">
                ready-made QR templates
              </Link>{' '}
              or read our{' '}
              <Link href="/help" className="font-semibold text-[#E64500] dark:text-orange-400 hover:underline">
                QR code FAQ &amp; printing guide
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
});

QREditor.displayName = 'QREditor';

