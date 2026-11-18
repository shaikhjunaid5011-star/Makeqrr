import * as React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { QRConfig } from '../../types/qr';
import { createQRCodeInstance, createQRCodeStylingOptions } from '../../lib/qr-renderer';
import { validateAndBuildPayload } from '../../lib/payload-builders';
import { ScanabilityBadge } from './scanability-badge';
import { ContrastSafetyIndicator } from './contrast-safety-indicator';
import { Button } from '../ui/button';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  Camera,
  Download,
  Copy,
  Check,
  Share2,
  QrCode,
  AlertCircle,
  ExternalLink,
  Globe,
  Phone,
  Mail,
  MessageSquare,
  Wifi,
  User,
  MapPin,
  Calendar,
  FileText,
  CreditCard
} from 'lucide-react';
import { copyQRImageToClipboard } from '../../lib/export-canvas';
import { buildSmsActionHref } from '../../lib/action-dispatcher';
import { cn } from '../../lib/utils';
import { triggerCelebration } from '../../lib/motion-system';
import { ActionReadyModal } from './action-ready-modal';
import QRCodeStyling from 'qr-code-styling';

interface QRPreviewProps {
  config: QRConfig;
  onChangeConfig?: (updater: (prev: QRConfig) => QRConfig) => void;
  onOpenScanner: () => void;
  onOpenExport: () => void;
  onOpenShare?: () => void;
}

export const QRPreview: React.FC<QRPreviewProps> = React.memo(({
  config,
  onChangeConfig,
  onOpenScanner,
  onOpenExport,
  onOpenShare
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const qrInstanceRef = React.useRef<QRCodeStyling | null>(null);
  const rafIdRef = React.useRef<number | null>(null);
  const debounceTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Defer heavy QR calculations so user keystrokes and clicks remain instant 60fps
  const deferredConfig = React.useDeferredValue(config);

  const prefersReduced = useReducedMotion();
  const [zoom, setZoom] = React.useState<number>(1);
  const [isFullscreen, setIsFullscreen] = React.useState<boolean>(false);
  const [copying, setCopying] = React.useState<boolean>(false);
  const [copyFeedback, setCopyFeedback] = React.useState<{ status: 'success' | 'error'; message: string } | null>(null);
  const [scanPulseKey, setScanPulseKey] = React.useState<number>(0);
  const [isTransitioning, setIsTransitioning] = React.useState<boolean>(false);
  const [actionModalOpen, setActionModalOpen] = React.useState<boolean>(false);
  const hasInitializedRef = React.useRef<boolean>(false);

  // Validate the content
  const validation = React.useMemo(() => {
    return validateAndBuildPayload(
      deferredConfig.type,
      deferredConfig.content,
      deferredConfig.errorCorrection
    );
  }, [deferredConfig.type, deferredConfig.content, deferredConfig.errorCorrection]);

  // Compute a stable signature of ONLY the properties that alter QR generation
  const qrSignature = React.useMemo(() => {
    if (!validation.valid) return `invalid_${validation.empty ? 'empty' : 'err'}_${deferredConfig.type}`;
    return [
      deferredConfig.type,
      validation.payload,
      deferredConfig.pattern.type,
      deferredConfig.colors.foreground,
      deferredConfig.colors.background,
      deferredConfig.colors.transparentBackground,
      deferredConfig.colors.gradient.enabled
        ? `${deferredConfig.colors.gradient.type}_${deferredConfig.colors.gradient.startColor}_${deferredConfig.colors.gradient.endColor}_${deferredConfig.colors.gradient.angle}`
        : 'no_grad',
      deferredConfig.eyes.outer,
      deferredConfig.eyes.inner,
      deferredConfig.eyes.customEyes
        ? `${deferredConfig.eyes.outerColor}_${deferredConfig.eyes.innerColor}`
        : 'default_eyes',
      deferredConfig.quietZone,
      deferredConfig.errorCorrection,
      deferredConfig.logo.enabled
        ? `${deferredConfig.logo.source || ''}_${deferredConfig.logo.originalSource || ''}_${deferredConfig.logo.size}_${deferredConfig.logo.uploadSize}_${deferredConfig.logo.iconSize}_${deferredConfig.logo.emojiSize}_${deferredConfig.logo.padding}`
        : 'no_logo'
    ].join('|');
  }, [deferredConfig, validation]);

  const prevContentRef = React.useRef(deferredConfig.content);

  // Initialize or update QR instance with smooth fade/scale transition and debouncing
  React.useEffect(() => {
    if (!containerRef.current) return;

    // Clear existing debounced timer and RAF
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }

    // If input is empty or invalid, clear canvas and do NOT show old or fake QR code
    if (!validation.valid) {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      qrInstanceRef.current = null;
      setIsTransitioning(false);
      return;
    }

    // Start subtle transition before swapping the QR pattern on text typing
    const isFirstRender = !hasInitializedRef.current || !qrInstanceRef.current;
    const isContentTyping = prevContentRef.current !== deferredConfig.content;
    prevContentRef.current = deferredConfig.content;

    if (!isFirstRender && !prefersReduced && isContentTyping) {
      setIsTransitioning(true);
    }

    // Instantaneous update for styles/colors/templates/presets (0ms); 40ms debounce only for text typing
    const delay = isFirstRender ? 0 : (isContentTyping ? 40 : 0);

    // Debounce rapid continuous updates (typing, slider dragging) and coordinate visual transition
    debounceTimerRef.current = setTimeout(() => {
      rafIdRef.current = requestAnimationFrame(() => {
        if (!containerRef.current) return;

        try {
          const options = createQRCodeStylingOptions(deferredConfig, 280, validation.payload);

          if (!qrInstanceRef.current) {
            const qr = new QRCodeStyling(options);
            qrInstanceRef.current = qr;
            containerRef.current.innerHTML = '';
            qr.append(containerRef.current);
          } else {
            qrInstanceRef.current.update(options);
            if (containerRef.current.children.length === 0) {
              qrInstanceRef.current.append(containerRef.current);
            }
          }
          hasInitializedRef.current = true;
          setIsTransitioning(false);
          setScanPulseKey(k => k + 1);
        } catch (err) {
          console.error('QR rendering error:', err);
          setIsTransitioning(false);
          if (containerRef.current) {
            containerRef.current.innerHTML = '';
          }
        }
      });
    }, delay);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [qrSignature, deferredConfig, validation, prefersReduced]);

  const handleCopy = async () => {
    if (!validation.valid) {
      setCopyFeedback({
        status: 'error',
        message: validation.error || 'Please enter valid content first'
      });
      setTimeout(() => setCopyFeedback(null), 3000);
      return;
    }

    try {
      setCopying(true);
      await copyQRImageToClipboard(config);
      setCopyFeedback({ status: 'success', message: 'QR Image Copied!' });
      triggerCelebration(0.8, 0.4);
      setTimeout(() => setCopyFeedback(null), 2400);
    } catch (err: any) {
      setCopyFeedback({
        status: 'error',
        message: err?.message || 'Image copy not supported in this browser. Use Download instead.'
      });
      setTimeout(() => setCopyFeedback(null), 3500);
    } finally {
      setCopying(false);
    }
  };

  const handleDownloadClick = () => {
    if (!validation.valid) {
      setCopyFeedback({
        status: 'error',
        message: validation.error || 'Please enter valid content to download'
      });
      setTimeout(() => setCopyFeedback(null), 3000);
      return;
    }
    onOpenExport();
  };

  const isCard = config.layout.type === 'card';
  const hasFrame = config.frame.preset !== 'none';

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-between p-3 sm:p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs relative transition-all w-full overflow-hidden',
        isFullscreen ? 'fixed inset-2 sm:inset-4 z-50 shadow-2xl overflow-auto' : 'w-full'
      )}
    >
      {/* Top Preview Controls Bar */}
      <div className="w-full flex items-center justify-between pb-2.5 sm:pb-3 border-b border-neutral-100 dark:border-neutral-800 text-xs gap-2">
        <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">
          Live QR Preview
        </span>

        {/* Zoom & View Controls */}
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setZoom(z => Math.max(0.6, Math.round((z - 0.1) * 10) / 10))}
            title="Zoom Out (-)"
            className="p-1 rounded text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] sm:text-[11px] font-mono tabular-nums text-neutral-500 w-8 sm:w-10 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom(z => Math.min(1.6, Math.round((z + 0.1) * 10) / 10))}
            title="Zoom In (+)"
            className="p-1 rounded text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom(1)}
            title="Reset Zoom"
            className="p-1 rounded text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ml-0.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title="Full Screen"
            className="p-1 rounded text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ml-0.5"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Canvas / QR Render Stage */}
      <div className="flex-1 w-full flex items-center justify-center p-2 sm:p-5 min-h-[260px] sm:min-h-[340px] overflow-hidden">
        <div
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          className="transition-transform duration-100 max-w-full flex items-center justify-center"
        >
          {/* Card / Outer Layout Container */}
          <motion.div
            layout={!prefersReduced}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'flex flex-col items-center justify-center transition-colors duration-300 select-none max-w-full w-full mx-auto',
              isCard && 'shadow-md'
            )}
            style={{
              maxWidth: 'min(330px, 100%)',
              width: '100%',
              backgroundColor: isCard
                ? config.layout.card.backgroundColor
                : config.colors.transparentBackground
                ? 'transparent'
                : config.colors.background,
              borderColor: isCard ? config.layout.card.borderColor : 'transparent',
              borderWidth: isCard ? `${config.layout.card.borderWidth}px` : 0,
              borderRadius: isCard ? `${config.layout.card.borderRadius}px` : '12px',
              padding: isCard ? `min(${config.layout.card.padding}px, 5vw)` : '12px'
            }}
          >
            {/* Custom Heading (if top) */}
            <AnimatePresence initial={false}>
              {config.text.heading && (
                <motion.div
                  key="qr-heading"
                  initial={prefersReduced ? false : { opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full mb-2 sm:mb-3 text-center transition-colors duration-200 break-words text-balance"
                  style={{
                    color: config.text.textColor,
                    fontFamily: config.text.fontFamily || undefined,
                    fontSize: `min(${config.text.headingSize}px, 5.5vw)`,
                    fontWeight: config.text.headingWeight === 'bold' ? 700 : 500,
                    letterSpacing: `${config.text.letterSpacing}px`,
                    textAlign: config.text.alignment
                  }}
                >
                  {config.text.heading}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Custom Subtitle */}
            <AnimatePresence initial={false}>
              {config.text.subtitle && (
                <motion.div
                  key="qr-subtitle"
                  initial={prefersReduced ? false : { opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 0.8, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full mb-2 sm:mb-3 text-center text-xs transition-colors duration-200 break-words text-balance"
                  style={{
                    color: config.text.textColor,
                    fontFamily: config.text.fontFamily || undefined,
                    textAlign: config.text.alignment
                  }}
                >
                  {config.text.subtitle}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Frame Top Banner (if banner-top preset) */}
            <AnimatePresence initial={false}>
              {hasFrame && config.frame.style === 'banner-top' && (
                <motion.div
                  key={`frame-top-${config.frame.preset}`}
                  initial={prefersReduced ? false : { opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                  className={cn(
                    'w-full mb-2 py-1.5 px-3 text-center text-xs font-bold uppercase tracking-wider break-words transition-colors duration-300',
                    config.frame.preset === 'badge'
                      ? 'rounded-full w-4/5 mx-auto'
                      : config.frame.preset === 'solid'
                      ? 'rounded-none'
                      : 'rounded-md'
                  )}
                  style={{
                    backgroundColor: config.frame.preset === 'minimal' ? 'transparent' : config.frame.color,
                    color: config.frame.preset === 'minimal' ? config.frame.color : config.frame.textColor,
                    border: config.frame.preset === 'minimal' ? `2px solid ${config.frame.color}` : undefined
                  }}
                >
                  {config.frame.text || 'SCAN ME'}
                </motion.div>
              )}
            </AnimatePresence>

            {/* The Actual QR Code Canvas container */}
            <div
              className="flex items-center justify-center relative overflow-hidden max-w-full aspect-square rounded-xl transition-colors duration-300"
              style={{
                width: 'min(280px, calc(100vw - 72px))',
                height: 'auto',
                aspectRatio: '1 / 1',
                backgroundColor: config.colors.transparentBackground ? 'transparent' : config.colors.background
              }}
            >
              {/* QR Canvas rendered directly by QRCodeStyling with smooth fade + scale transition */}
              <motion.div
                ref={containerRef}
                initial={prefersReduced ? false : { opacity: 0, scale: 0.95 }}
                animate={
                  prefersReduced
                    ? { opacity: 1, scale: 1 }
                    : isTransitioning
                    ? { opacity: 0.36, scale: 0.955 }
                    : { opacity: 1, scale: 1 }
                }
                transition={
                  isTransitioning
                    ? { duration: 0.06, ease: 'easeOut' }
                    : { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
                }
                className={cn(
                  'w-full h-full flex items-center justify-center origin-center will-change-[transform,opacity] [&>canvas]:max-w-full [&>canvas]:h-auto [&>svg]:max-w-full [&>svg]:h-auto',
                  !validation.valid && 'hidden'
                )}
              />

              {/* Empty Input State: Shown when user hasn't entered data */}
              <AnimatePresence mode="wait">
                {!validation.valid && validation.empty && (
                  <motion.div
                    key="qr-empty-state"
                    initial={prefersReduced ? false : { opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col items-center justify-center text-center p-4 sm:p-6 text-neutral-400 dark:text-neutral-500"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-2.5 text-[#E64500]">
                      <QrCode className="w-6 h-6 stroke-[1.8]" />
                    </div>
                    <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 max-w-[200px]">
                      {validation.error || 'Enter content to preview QR'}
                    </p>
                    <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">
                      Live QR updates as you type
                    </p>
                  </motion.div>
                )}

                {/* Validation / Capacity Error State */}
                {!validation.valid && !validation.empty && (
                  <motion.div
                    key="qr-error-state"
                    initial={prefersReduced ? false : { opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col items-center justify-center text-center p-4 sm:p-6 text-amber-600 dark:text-amber-400"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center mb-2.5">
                      <AlertCircle className="w-6 h-6 stroke-[2]" />
                    </div>
                    <p className="text-xs font-semibold leading-snug max-w-[220px]">
                      {validation.error}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Scanning Light Beam on Configuration Update */}
              <AnimatePresence mode="wait">
                {!prefersReduced && scanPulseKey > 0 && validation.valid && (
                  <motion.div
                    key={scanPulseKey}
                    initial={{ top: '-15%', opacity: 0 }}
                    animate={{
                      top: ['-15%', '45%', '115%'],
                      opacity: [0, 0.9, 0]
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 0.85,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                    className="absolute left-0 right-0 pointer-events-none select-none z-20 flex flex-col items-center justify-center -translate-y-1/2"
                  >
                    <div className="w-full h-8 sm:h-10 bg-gradient-to-b from-transparent via-[#E64500]/15 dark:via-orange-400/20 to-transparent blur-xs" />
                    <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[#E64500] dark:via-orange-400 to-transparent shadow-[0_0_10px_rgba(230,69,0,0.7)]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Frame Bottom Banner */}
            <AnimatePresence initial={false}>
              {hasFrame && config.frame.style !== 'banner-top' && (
                <motion.div
                  key={`frame-bottom-${config.frame.preset}`}
                  initial={prefersReduced ? false : { opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                  className={cn(
                    'w-full mt-2 py-1.5 px-3 text-center text-xs font-bold uppercase tracking-wider break-words transition-colors duration-300',
                    config.frame.preset === 'badge'
                      ? 'rounded-full w-4/5 mx-auto'
                      : config.frame.preset === 'solid'
                      ? 'rounded-none'
                      : 'rounded-md'
                  )}
                  style={{
                    backgroundColor: config.frame.preset === 'minimal' ? 'transparent' : config.frame.color,
                    color: config.frame.preset === 'minimal' ? config.frame.color : config.frame.textColor,
                    border: config.frame.preset === 'minimal' ? `2px solid ${config.frame.color}` : undefined
                  }}
                >
                  {config.frame.text || 'SCAN ME'}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Custom Footer */}
            <AnimatePresence initial={false}>
              {config.text.footer && (
                <motion.div
                  key="qr-footer"
                  initial={prefersReduced ? false : { opacity: 0, y: 4, scale: 0.98 }}
                  animate={{ opacity: 0.7, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full mt-2 sm:mt-3 text-center text-[10px] sm:text-[11px] font-mono transition-colors duration-200 break-words"
                  style={{
                    color: config.text.textColor,
                    fontFamily: config.text.fontFamily || undefined,
                    textAlign: config.text.alignment
                  }}
                >
                  {config.text.footer}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Copy / Action Feedback Notification Banner */}
      <AnimatePresence mode="wait">
        {copyFeedback && (
          <motion.div
            key={copyFeedback.message}
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'w-full text-center text-xs py-1.5 px-3 rounded-lg mb-2 font-medium',
              copyFeedback.status === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
            )}
          >
            {copyFeedback.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Real-time Scanability & Contrast Safety Diagnostics */}
      <div className="w-full pt-1 sm:pt-2 space-y-1.5">
        <ContrastSafetyIndicator
          config={config}
          onChange={onChangeConfig}
          variant="compact"
        />
        <ScanabilityBadge config={config} />
      </div>

      {/* Status Row: Green status dot and Action Ready link */}
      {validation.valid && validation.payload && (
        <div className="w-full mt-2 p-2 px-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[11px] flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
            <div className="flex items-center gap-1.5 min-w-0 truncate text-neutral-700 dark:text-neutral-300 font-medium">
              {config.type === 'url' && <Globe className="w-3.5 h-3.5 text-[#E64500] shrink-0" />}
              {config.type === 'email' && <Mail className="w-3.5 h-3.5 text-[#E64500] shrink-0" />}
              {config.type === 'phone' && <Phone className="w-3.5 h-3.5 text-[#E64500] shrink-0" />}
              {config.type === 'whatsapp' && <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
              {config.type === 'sms' && <MessageSquare className="w-3.5 h-3.5 text-[#E64500] shrink-0" />}
              {config.type === 'wifi' && <Wifi className="w-3.5 h-3.5 text-[#E64500] shrink-0" />}
              {config.type === 'contact' && <User className="w-3.5 h-3.5 text-[#E64500] shrink-0" />}
              {config.type === 'location' && <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
              {config.type === 'event' && <Calendar className="w-3.5 h-3.5 text-[#E64500] shrink-0" />}
              {config.type === 'text' && <FileText className="w-3.5 h-3.5 text-neutral-500 shrink-0" />}
              {config.type === 'payment' && <CreditCard className="w-3.5 h-3.5 text-[#E64500] shrink-0" />}
              {config.type === 'social' && <Share2 className="w-3.5 h-3.5 text-[#E64500] shrink-0" />}

              <span className="truncate">
                {config.type === 'url' && 'Website Link Ready'}
                {config.type === 'email' && 'Email Draft Ready'}
                {config.type === 'phone' && 'Calling Handler Ready'}
                {config.type === 'whatsapp' && 'WhatsApp Chat Ready'}
                {config.type === 'sms' && 'SMS Handler Ready'}
                {config.type === 'wifi' && 'Wi-Fi Connection Ready'}
                {config.type === 'contact' && 'vCard Contact Ready'}
                {config.type === 'location' && 'Google Maps Ready'}
                {config.type === 'event' && 'Calendar Event Ready'}
                {config.type === 'text' && 'Text Encoded'}
                {config.type === 'payment' && 'UPI Payment Ready'}
                {config.type === 'social' && 'Social Profile Ready'}
              </span>
            </div>
          </div>

          {/* Action Trigger Tailored by Type */}
          <div className="shrink-0 flex items-center gap-1">
            {config.type === 'url' && (
              <a
                href={validation.payload}
                target="_blank"
                rel="noopener noreferrer"
                title="Open website link in new tab"
                className="text-[10px] text-[#E64500] dark:text-orange-400 hover:underline flex items-center gap-1 shrink-0 font-semibold px-2 py-0.5 rounded-lg bg-orange-50/80 dark:bg-orange-950/40 hover:bg-orange-100/80 transition-colors cursor-pointer"
              >
                <span>Open Link</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}

            {config.type === 'whatsapp' && (
              <a
                href={validation.payload}
                target="_blank"
                rel="noopener noreferrer"
                title="Open conversation in WhatsApp"
                className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 shrink-0 font-semibold px-2 py-0.5 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/40 hover:bg-emerald-100/80 transition-colors cursor-pointer"
              >
                <span>Open WhatsApp</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}

            {config.type === 'location' && (
              <a
                href={validation.payload}
                target="_blank"
                rel="noopener noreferrer"
                title="Open location in Google Maps"
                className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 shrink-0 font-semibold px-2 py-0.5 rounded-lg bg-blue-50/80 dark:bg-blue-950/40 hover:bg-blue-100/80 transition-colors cursor-pointer"
              >
                <span>Open in Maps</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}

            {config.type === 'social' && (
              <a
                href={validation.payload}
                target="_blank"
                rel="noopener noreferrer"
                title="Open social profile"
                className="text-[10px] text-[#E64500] dark:text-orange-400 hover:underline flex items-center gap-1 shrink-0 font-semibold px-2 py-0.5 rounded-lg bg-orange-50/80 dark:bg-orange-950/40 hover:bg-orange-100/80 transition-colors cursor-pointer"
              >
                <span>Open Profile</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}

            {config.type === 'email' && (
              <div className="flex items-center gap-1">
                <a
                  href={validation.payload}
                  title="Open default email application (Outlook, Windows Mail)"
                  className="text-[10px] text-[#E64500] dark:text-orange-400 hover:underline flex items-center gap-1 font-semibold px-2 py-0.5 rounded-lg bg-orange-50/80 dark:bg-orange-950/40 hover:bg-orange-100/80 transition-colors cursor-pointer"
                >
                  <Mail className="w-2.5 h-2.5" />
                  <span>Open Mail</span>
                </a>
                <button
                  type="button"
                  onClick={() => setActionModalOpen(true)}
                  title="Email options: Open in Gmail (Web), Outlook Web, or Windows setup"
                  className="text-[10px] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 px-1.5 py-0.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors font-medium cursor-pointer"
                >
                  Options
                </button>
              </div>
            )}

            {config.type === 'phone' && (
              <div className="flex items-center gap-1">
                <a
                  href={validation.payload}
                  title="Call number using Windows Phone Link, Skype, or telephony dialer"
                  className="text-[10px] text-[#E64500] dark:text-orange-400 hover:underline flex items-center gap-1 font-semibold px-2 py-0.5 rounded-lg bg-orange-50/80 dark:bg-orange-950/40 hover:bg-orange-100/80 transition-colors cursor-pointer"
                >
                  <Phone className="w-2.5 h-2.5" />
                  <span>Call Phone</span>
                </a>
                <button
                  type="button"
                  onClick={() => setActionModalOpen(true)}
                  title="View phone details & copy number"
                  className="text-[10px] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 px-1.5 py-0.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors font-medium cursor-pointer"
                >
                  Details
                </button>
              </div>
            )}

            {config.type === 'sms' && (
              <div className="flex items-center gap-1">
                <a
                  href={buildSmsActionHref(config.content.sms.phone, config.content.sms.message)}
                  title="Open messaging app (Phone Link, SMS)"
                  className="text-[10px] text-[#E64500] dark:text-orange-400 hover:underline flex items-center gap-1 font-semibold px-2 py-0.5 rounded-lg bg-orange-50/80 dark:bg-orange-950/40 hover:bg-orange-100/80 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-2.5 h-2.5" />
                  <span>Send SMS</span>
                </a>
                <button
                  type="button"
                  onClick={() => setActionModalOpen(true)}
                  title="View message text & copy"
                  className="text-[10px] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 px-1.5 py-0.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors font-medium cursor-pointer"
                >
                  Details
                </button>
              </div>
            )}

            {config.type === 'wifi' && (
              <button
                type="button"
                onClick={() => setActionModalOpen(true)}
                title="View Wi-Fi details, copy password, and Windows connect tips"
                className="text-[10px] text-[#E64500] dark:text-orange-400 hover:underline flex items-center gap-1 font-semibold px-2 py-0.5 rounded-lg bg-orange-50/80 dark:bg-orange-950/40 hover:bg-orange-100/80 transition-colors cursor-pointer"
              >
                <Wifi className="w-2.5 h-2.5" />
                <span>View Wi-Fi Info</span>
              </button>
            )}

            {config.type === 'contact' && (
              <button
                type="button"
                onClick={() => setActionModalOpen(true)}
                title="Save vCard contact file (.vcf) for Windows Contacts, Outlook, or Apple Contacts"
                className="text-[10px] text-[#E64500] dark:text-orange-400 hover:underline flex items-center gap-1 font-semibold px-2 py-0.5 rounded-lg bg-orange-50/80 dark:bg-orange-950/40 hover:bg-orange-100/80 transition-colors cursor-pointer"
              >
                <User className="w-2.5 h-2.5" />
                <span>Save Contact (.vcf)</span>
              </button>
            )}

            {config.type === 'event' && (
              <button
                type="button"
                onClick={() => setActionModalOpen(true)}
                title="Add event to Outlook (.ics) or Google Calendar"
                className="text-[10px] text-[#E64500] dark:text-orange-400 hover:underline flex items-center gap-1 font-semibold px-2 py-0.5 rounded-lg bg-orange-50/80 dark:bg-orange-950/40 hover:bg-orange-100/80 transition-colors cursor-pointer"
              >
                <Calendar className="w-2.5 h-2.5" />
                <span>Add to Calendar</span>
              </button>
            )}

            {config.type === 'text' && (
              <button
                type="button"
                onClick={() => setActionModalOpen(true)}
                title="View full formatted text and copy"
                className="text-[10px] text-[#E64500] dark:text-orange-400 hover:underline flex items-center gap-1 font-semibold px-2 py-0.5 rounded-lg bg-orange-50/80 dark:bg-orange-950/40 hover:bg-orange-100/80 transition-colors cursor-pointer"
              >
                <FileText className="w-2.5 h-2.5" />
                <span>View / Copy Text</span>
              </button>
            )}

            {config.type === 'payment' && (
              <button
                type="button"
                onClick={() => setActionModalOpen(true)}
                title="View UPI details and copy"
                className="text-[10px] text-[#E64500] dark:text-orange-400 hover:underline flex items-center gap-1 font-semibold px-2 py-0.5 rounded-lg bg-orange-50/80 dark:bg-orange-950/40 hover:bg-orange-100/80 transition-colors cursor-pointer"
              >
                <CreditCard className="w-2.5 h-2.5" />
                <span>UPI Details</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Action Ready Details Modal with Windows Fallbacks & Downloaders */}
      <ActionReadyModal
        open={actionModalOpen}
        onOpenChange={setActionModalOpen}
        config={config}
        payload={validation.payload}
      />

      {/* Bottom Action Buttons: Test QR, Copy Image, Share QR, Download */}
      <div className={cn(
        "w-full pt-2.5 sm:pt-3 mt-2 sm:mt-3 border-t border-neutral-100 dark:border-neutral-800 grid gap-1.5 sm:gap-2",
        onOpenShare ? "grid-cols-4" : "grid-cols-3"
      )}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onOpenScanner}
          className="text-xs gap-1 sm:gap-1.5 px-1 sm:px-2.5 h-8 sm:h-9 cursor-pointer"
          title="Scan QR with camera"
          aria-label="Scan QR with camera"
        >
          <Camera className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate hidden xs:inline">Camera</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopy}
          loading={copying}
          loadingText="Copying..."
          className="text-xs gap-1 sm:gap-1.5 px-1 sm:px-2.5 h-8 sm:h-9"
          title={validation.valid ? "Copy QR image directly to clipboard" : "Please enter content first"}
        >
          {copyFeedback?.status === 'success' ? (
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          ) : (
            <Copy className="w-3.5 h-3.5 shrink-0" />
          )}
          <span className="truncate hidden xs:inline">
            {copyFeedback?.status === 'success' ? 'Copied!' : 'Copy'}
          </span>
        </Button>

        {onOpenShare && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenShare}
            aria-label="Share QR"
            className="text-xs gap-1 sm:gap-1.5 px-1 sm:px-2 h-8 sm:h-9 text-[#E64500] dark:text-orange-400 border-orange-200/80 dark:border-orange-800/80 hover:bg-orange-50 dark:hover:bg-orange-950/40 cursor-pointer active:scale-90 active:rotate-[-1deg] transition-transform"
            title="Share QR code"
          >
            <Share2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate hidden sm:inline">Share QR</span>
          </Button>
        )}

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={handleDownloadClick}
          className="text-xs gap-1 sm:gap-1.5 px-1 sm:px-2.5 h-8 sm:h-9 font-semibold cursor-pointer active:scale-95 transition-all"
          title={validation.valid ? "Download QR code" : "Please enter content first"}
        >
          <Download className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Download</span>
        </Button>
      </div>
    </div>
  );
});

QRPreview.displayName = 'QRPreview';
