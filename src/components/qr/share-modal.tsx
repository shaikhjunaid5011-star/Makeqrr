import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dialog } from '../ui/dialog';
import { QRConfig, QRTemplate } from '../../types/qr';
import { getQRImageFile, exportQRCode, renderCompositeCanvas } from '../../lib/export-canvas';
import { validateAndBuildPayload } from '../../lib/payload-builders';
import { TemplateVisualPreview } from './template-visual-preview';
import { Button } from '../ui/button';
import {
  Share2,
  Download,
  AlertCircle,
  Loader2,
  Globe,
  ThumbsUp,
  MessageCircle,
  Repeat2,
  Heart,
  CheckCheck
} from 'lucide-react';
import { cn } from '../../lib/utils';
import confetti from 'canvas-confetti';

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: QRConfig;
}

export type SocialPlatform = 'whatsapp' | 'facebook' | 'x';

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12.031 2c-5.516 0-9.969 4.453-9.969 9.969 0 1.766.469 3.484 1.344 4.984L2 22l5.188-1.359c1.453.797 3.094 1.219 4.843 1.219 5.516 0 9.969-4.453 9.969-9.969S17.547 2 12.031 2zm5.828 14.125c-.25.703-1.438 1.344-2 1.422-.516.078-1.188.109-1.922-.125-.453-.141-1.031-.328-1.766-.641-3.094-1.344-5.109-4.453-5.266-4.656-.156-.203-1.266-1.688-1.266-3.219s.797-2.281 1.078-2.594c.281-.312.609-.391.812-.391.203 0 .406.016.578.016.188 0 .438-.078.688.516.25.609.859 2.094.938 2.25.078.156.125.344.031.547-.094.203-.141.328-.297.5-.156.172-.312.391-.453.516-.156.141-.312.297-.141.594.172.297.766 1.266 1.641 2.047 1.125 1 2.078 1.312 2.375 1.469.297.156.469.125.641-.078.172-.203.734-.859.938-1.156.203-.297.406-.25.672-.156.266.094 1.703.812 2 .953.297.141.484.219.562.344.078.125.078.719-.172 1.422z" />
  </svg>
);

const FacebookIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
  </svg>
);

const XIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export const ShareModal: React.FC<ShareModalProps> = ({ open, onOpenChange, config }) => {
  const [isSharing, setIsSharing] = React.useState(false);
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [shareSupported, setShareSupported] = React.useState<boolean | null>(null);
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = React.useState<SocialPlatform>('whatsapp');
  const [compositeDataUrl, setCompositeDataUrl] = React.useState<string | null>(null);

  // Strict User Requirement: Shared content must ONLY contain the QR image + text "Scan it quickly"
  // NEVER share the destination URL or editor URL.
  const SHARE_MESSAGE = 'Scan it quickly';

  // Include a dynamic config key in id so TemplateVisualPreview's React.memo updates immediately on style changes
  const previewTemplate = React.useMemo<QRTemplate>(() => {
    const styleKey = [
      config.type,
      config.pattern.type,
      config.colors.foreground,
      config.colors.background,
      config.colors.gradient.enabled ? `${config.colors.gradient.startColor}_${config.colors.gradient.endColor}` : 'flat',
      config.eyes.outer,
      config.eyes.inner,
      config.frame.preset,
      config.frame.text,
      config.logo.enabled ? `${config.logo.type}_${config.logo.size}` : 'nologo'
    ].join('_');

    return {
      id: `share_preview_${styleKey}`,
      name: 'Current QR Design',
      description: 'Custom QR code ready for sharing',
      category: 'business',
      previewColor: '#E64500',
      config: config as any
    };
  }, [config]);

  // Generate real composite QR image data URL when modal opens so the social mock-up shows the exact scannable QR
  React.useEffect(() => {
    if (!open) return;
    let active = true;
    renderCompositeCanvas(config, 360, true)
      .then(canvas => {
        if (active) {
          setCompositeDataUrl(canvas.toDataURL('image/png'));
        }
      })
      .catch(() => {
        if (active) {
          setCompositeDataUrl(null);
        }
      });
    return () => {
      active = false;
    };
  }, [open, config]);

  // Helper to generate a client-side File containing the current customized QR image
  const getPreparedQRFile = async (): Promise<File | null> => {
    try {
      return await getQRImageFile(config, `qr-code-${config.type}.png`);
    } catch {
      return null;
    }
  };

  // Check if Web Share API with file sharing is supported
  React.useEffect(() => {
    if (!open) return;

    let isMounted = true;
    const checkSupport = async () => {
      try {
        if (typeof navigator === 'undefined' || !navigator.share) {
          if (isMounted) setShareSupported(false);
          return;
        }

        if (navigator.canShare) {
          const testFile = new File([''], 'test.png', { type: 'image/png' });
          const canShareFiles = navigator.canShare({ files: [testFile] });
          if (isMounted) setShareSupported(canShareFiles);
        } else {
          if (isMounted) setShareSupported(true);
        }
      } catch {
        if (isMounted) setShareSupported(false);
      }
    };

    checkSupport();
    return () => {
      isMounted = false;
    };
  }, [open]);

  // Device Default Share:
  // Uses browser/device Web Share API ("navigator.share") as the ONLY sharing method.
  // Shares ONLY the generated QR image + text "Scan it quickly".
  // NEVER includes or shares the QR destination URL, website URL, editor URL, or any other link.
  const handleDeviceShare = async () => {
    if (isSharing) return;
    const validation = validateAndBuildPayload(config.type, config.content, config.errorCorrection);
    if (!validation.valid) {
      setStatusMessage(validation.error || 'Please enter valid QR content before sharing.');
      return;
    }
    setIsSharing(true);
    setStatusMessage(null);

    try {
      const qrFile = await getPreparedQRFile();

      if (typeof navigator !== 'undefined' && navigator.share && qrFile) {
        // Verify file sharing capability if available
        if (navigator.canShare && !navigator.canShare({ files: [qrFile] })) {
          setShareSupported(false);
          setStatusMessage("Sharing isn't supported on this device.");
          return;
        }

        // Share ONLY the generated image file with text "Scan it quickly", NO URL
        await navigator.share({
          title: SHARE_MESSAGE,
          text: SHARE_MESSAGE,
          files: [qrFile]
        });

        // Close modal on successful share completion
        onOpenChange(false);
        return;
      }

      // If Web Share is not available
      setShareSupported(false);
      setStatusMessage("Sharing isn't supported on this device.");
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        // User dismissed the native share dialog normally
        return;
      }
      setShareSupported(false);
      setStatusMessage("Sharing isn't supported on this device.");
    } finally {
      setIsSharing(false);
    }
  };

  // Fallback: Clear Download QR action
  const handleDownload = async () => {
    if (isDownloading) return;
    const validation = validateAndBuildPayload(config.type, config.content, config.errorCorrection);
    if (!validation.valid) {
      setStatusMessage(validation.error || 'Please enter valid QR content before downloading.');
      return;
    }
    setIsDownloading(true);
    try {
      await exportQRCode(config, {
        format: 'png',
        resolution: 1024,
        quality: 0.95,
        fileName: `makeqrr-${Date.now()}`
      });
      try {
        confetti({
          particleCount: 28,
          spread: 45,
          origin: { y: 0.65 }
        });
      } catch {
        // ignore
      }
      setStatusMessage('QR image downloaded successfully.');
    } catch {
      setStatusMessage('Failed to download QR image.');
    } finally {
      setIsDownloading(false);
    }
  };

  const renderQRVisual = (size: number) => {
    if (compositeDataUrl) {
      return (
        <img
          src={compositeDataUrl}
          alt="Customized QR code preview"
          referrerPolicy="no-referrer"
          style={{ width: size, height: size }}
          className="object-contain rounded-lg select-none"
        />
      );
    }
    return <TemplateVisualPreview template={previewTemplate} size={size} />;
  };

  const platforms: { id: SocialPlatform; label: string; icon: React.ReactNode; activeColor: string }[] = [
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: <WhatsAppIcon className="w-3.5 h-3.5" />,
      activeColor: 'text-[#128C7E] dark:text-[#25D366]'
    },
    {
      id: 'facebook',
      label: 'Facebook',
      icon: <FacebookIcon className="w-3.5 h-3.5" />,
      activeColor: 'text-[#1877F2] dark:text-[#4599FF]'
    },
    {
      id: 'x',
      label: 'X',
      icon: <XIcon className="w-3 h-3" />,
      activeColor: 'text-neutral-950 dark:text-white'
    }
  ];

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      variant="bottom-sheet"
      maxWidth="md"
    >
      <div className="w-full space-y-4">
        {/* Header */}
        <div className="text-left flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/80 text-[#E64500] flex items-center justify-center shrink-0">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
                Share QR
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Preview & share your customized QR image
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SOCIAL PREVIEW CARD (WhatsApp, Facebook, X Realistic Mock-ups)            */}
        {/* ========================================================================= */}
        <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-950/70 border border-neutral-200 dark:border-neutral-800 p-3.5 sm:p-4 space-y-3">
          {/* Card Top Bar: Social Preview Title + Platform Switcher Tabs */}
          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
            <div className="text-left">
              <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 block">
                Social Preview
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                How your QR appears when shared
              </span>
            </div>

            {/* Platform Switcher Segmented Control */}
            <div
              role="tablist"
              aria-label="Social platform preview"
              className="flex items-center p-1 rounded-xl bg-neutral-200/75 dark:bg-neutral-900 border border-neutral-300/50 dark:border-neutral-800 gap-0.5 self-start xs:self-auto"
            >
              {platforms.map(p => {
                const isActive = selectedPlatform === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setSelectedPlatform(p.id)}
                    className={cn(
                      'relative px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 z-10',
                      isActive
                        ? p.activeColor
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="social-preview-platform-pill"
                        className="absolute inset-0 rounded-lg bg-white dark:bg-neutral-800 shadow-xs -z-10"
                        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                      />
                    )}
                    {p.icon}
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Realistic Social Feed / Chat Mock-up Stage */}
          <div className="w-full overflow-hidden">
            <AnimatePresence mode="wait">
              {selectedPlatform === 'whatsapp' && (
                <motion.div
                  key="mockup-whatsapp"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-xl bg-[#EFEAE2] dark:bg-[#0B141A] border border-neutral-200/80 dark:border-neutral-800 overflow-hidden"
                >
                  {/* Simulated WhatsApp Chat Header */}
                  <div className="px-3 py-2 bg-[#008069] dark:bg-[#202C33] text-white flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-bold shrink-0">
                        <WhatsAppIcon className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-left leading-tight truncate">
                        <span className="font-semibold block text-xs truncate">WhatsApp Chat</span>
                        <span className="text-[10px] text-emerald-100 dark:text-neutral-400 block">
                          Image attachment preview
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono opacity-80">PNG</span>
                  </div>

                  {/* Chat Canvas with Outgoing Message Bubble */}
                  <div className="p-3 sm:p-4 flex justify-end">
                    <div className="bg-[#D9FDD3] dark:bg-[#005C4B] text-[#111B21] dark:text-[#E9EDEF] rounded-2xl rounded-tr-xs p-2 shadow-xs max-w-[240px] w-full space-y-1.5">
                      {/* Shared QR Image Frame */}
                      <div className="w-full aspect-square rounded-xl bg-white p-3 flex items-center justify-center border border-black/5 overflow-hidden">
                        {renderQRVisual(156)}
                      </div>

                      {/* Message Caption & Read Receipt */}
                      <div className="px-1 pt-0.5 flex items-end justify-between gap-2">
                        <span className="text-xs font-medium leading-snug text-left">
                          {SHARE_MESSAGE}
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-[#667781] dark:text-[#8696A0] font-mono tabular-nums shrink-0">
                          <span>10:42 AM</span>
                          <CheckCheck className="w-3.5 h-3.5 text-[#53BDEB]" />
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {selectedPlatform === 'facebook' && (
                <motion.div
                  key="mockup-facebook"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-xl bg-white dark:bg-[#242526] text-[#050505] dark:text-[#E4E6EB] border border-neutral-200 dark:border-neutral-800 overflow-hidden text-left"
                >
                  {/* Facebook Post Author Header */}
                  <div className="px-3.5 pt-3 pb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-neutral-950 flex items-center justify-center shrink-0">
                        <img
                          src="/assets/aistudio/Glowing_Orange_QR_Q_Icon_27c8178a.png"
                          alt="makeqrr"
                          className="w-full h-full object-cover scale-[1.18] select-none pointer-events-none"
                        />
                      </div>
                      <div className="leading-tight">
                        <span className="text-xs font-bold block">You</span>
                        <span className="text-[10px] text-neutral-500 dark:text-neutral-400 inline-flex items-center gap-1">
                          <span>Just now</span>
                          <span aria-hidden="true">·</span>
                          <Globe className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    </div>
                    <FacebookIcon className="w-4 h-4 text-[#1877F2]" />
                  </div>

                  {/* Facebook Post Caption */}
                  <div className="px-3.5 pb-2.5 text-xs font-medium">
                    {SHARE_MESSAGE}
                  </div>

                  {/* Shared QR Image Stage */}
                  <div className="bg-neutral-100 dark:bg-[#18191A] border-y border-neutral-200/80 dark:border-neutral-800 py-3.5 px-4 flex items-center justify-center">
                    <div className="p-3 rounded-xl bg-white shadow-xs border border-neutral-200/60 flex items-center justify-center">
                      {renderQRVisual(148)}
                    </div>
                  </div>

                  {/* Facebook Reaction & Action Bar */}
                  <div className="px-3.5 py-2 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <span className="w-4 h-4 rounded-full bg-[#1877F2] text-white inline-flex items-center justify-center">
                        <ThumbsUp className="w-2.5 h-2.5" />
                      </span>
                      <span>Like</span>
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium">
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Comment</span>
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium">
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </span>
                  </div>
                </motion.div>
              )}

              {selectedPlatform === 'x' && (
                <motion.div
                  key="mockup-x"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-xl bg-white dark:bg-neutral-950 text-[#0F1419] dark:text-[#E7E9EA] border border-neutral-200 dark:border-neutral-800 p-3.5 text-left space-y-2.5"
                >
                  {/* X Post Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-neutral-950 flex items-center justify-center shrink-0">
                        <img
                          src="/assets/aistudio/Glowing_Orange_QR_Q_Icon_27c8178a.png"
                          alt="makeqrr"
                          className="w-full h-full object-cover scale-[1.18] select-none pointer-events-none"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 text-xs">
                          <span className="font-bold truncate">You</span>
                          <span className="text-neutral-500 dark:text-neutral-400 truncate">@makeqrr</span>
                          <span className="text-neutral-400 dark:text-neutral-600" aria-hidden="true">·</span>
                          <span className="text-neutral-500 dark:text-neutral-400 font-mono tabular-nums">1m</span>
                        </div>
                        <p className="text-xs font-medium mt-0.5">
                          {SHARE_MESSAGE}
                        </p>
                      </div>
                    </div>
                    <XIcon className="w-3.5 h-3.5 text-neutral-900 dark:text-white shrink-0 mt-1" />
                  </div>

                  {/* X Media Card */}
                  <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/80 p-3.5 flex items-center justify-center relative overflow-hidden">
                    <div className="p-2.5 rounded-xl bg-white shadow-xs border border-neutral-100 flex items-center justify-center">
                      {renderQRVisual(144)}
                    </div>
                    <span className="absolute bottom-2 left-2.5 text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                      PNG · High Contrast
                    </span>
                  </div>

                  {/* X Engagement Footer */}
                  <div className="pt-0.5 flex items-center justify-between text-neutral-500 dark:text-neutral-400 text-[11px] font-mono tabular-nums px-1">
                    <span className="inline-flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Reply</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Repeat2 className="w-3.5 h-3.5" />
                      <span>Repost</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5" />
                      <span>Like</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className="text-[11px] text-center text-neutral-500 dark:text-neutral-400">
            Only the QR image and caption <span className="font-semibold text-neutral-700 dark:text-neutral-300">“{SHARE_MESSAGE}”</span> are shared.
          </p>
        </div>

        {/* Fallback notification when device sharing is unsupported */}
        {shareSupported === false && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-left flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 dark:text-amber-300">
              <p className="font-semibold">Sharing isn't supported on this device.</p>
              <p className="mt-0.5 text-amber-700/90 dark:text-amber-400/90 text-[11px]">
                You can download the high-resolution QR image below to share it on WhatsApp, Facebook, or X.
              </p>
            </div>
          </motion.div>
        )}

        {/* Status notification */}
        <AnimatePresence>
          {statusMessage && shareSupported !== false && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs text-center text-neutral-600 dark:text-neutral-400"
            >
              {statusMessage}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Actions: Device Default Share or Download Fallback */}
        <div className="space-y-2 pt-1">
          {shareSupported !== false ? (
            <Button
              type="button"
              variant="default"
              size="lg"
              onClick={handleDeviceShare}
              disabled={isSharing}
              className="w-full h-11 bg-[#E64500] hover:bg-[#cc3d00] active:scale-[0.98] text-white font-semibold gap-2 shadow-sm shadow-orange-500/20 cursor-pointer"
            >
              {isSharing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Opening Share Sheet...</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Share with Device</span>
                </>
              )}
            </Button>
          ) : (
            <Button
              type="button"
              variant="default"
              size="lg"
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full h-11 bg-[#E64500] hover:bg-[#cc3d00] active:scale-[0.98] text-white font-semibold gap-2 shadow-sm shadow-orange-500/20 cursor-pointer"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download QR</span>
                </>
              )}
            </Button>
          )}

          {/* Secondary fallback download when share is supported */}
          {shareSupported !== false && (
            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full h-9 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 border-neutral-200 dark:border-neutral-800 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              <span>Download Image</span>
            </Button>
          )}
        </div>
      </div>
    </Dialog>
  );
};
