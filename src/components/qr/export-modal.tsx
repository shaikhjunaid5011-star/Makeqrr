import * as React from 'react';
import confetti from 'canvas-confetti';
import { Dialog } from '../ui/dialog';
import { Button } from '../ui/button';
import { QRConfig } from '../../types/qr';
import { exportQRCode, copyQRImageToClipboard, getSVGString } from '../../lib/export-canvas';
import { validateAndBuildPayload } from '../../lib/payload-builders';
import { copyToClipboard } from '../../lib/utils';
import { Download, Copy, Check, FileCode, Image as ImageIcon, Share2, AlertCircle } from 'lucide-react';
import { useLoading } from '../../lib/loading-context';
import { cn } from '../../lib/utils';

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: QRConfig;
  onOpenShare?: () => void;
}

const RESOLUTIONS = [
  { label: 'Standard (512px)', value: 512, desc: 'For phones & websites' },
  { label: 'High (1024px)', value: 1024, desc: 'For social media & screens' },
  { label: 'Print 2K (2048px)', value: 2048, desc: 'For flyers & business cards' },
  { label: 'Large Print 4K (4096px)', value: 4096, desc: 'For posters & banners' }
];

export const ExportModal: React.FC<ExportModalProps> = ({ open, onOpenChange, config, onOpenShare }) => {
  const [format, setFormat] = React.useState<'png' | 'svg' | 'jpeg' | 'webp'>('png');
  const [resolution, setResolution] = React.useState<number>(1024);
  const [exporting, setExporting] = React.useState(false);
  const [copyStatus, setCopyStatus] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const { showFullscreenLoader, hideFullscreenLoader } = useLoading();

  const validation = React.useMemo(() => {
    return validateAndBuildPayload(config.type, config.content, config.errorCorrection);
  }, [config.type, config.content, config.errorCorrection]);

  React.useEffect(() => {
    if (open) {
      setErrorMessage(null);
      setCopyStatus(null);
    }
  }, [open]);

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 }
      });
    } catch {
      // ignore
    }
  };

  const handleDownload = async () => {
    setErrorMessage(null);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Please enter valid QR content before downloading');
      return;
    }

    setExporting(true);
    const isUltraHighRes = resolution >= 2048;
    if (isUltraHighRes) {
      showFullscreenLoader(
        `Preparing ${resolution}px Image...`,
        'Creating your high-quality QR code image'
      );
    }

    try {
      await exportQRCode(config, {
        format,
        resolution,
        quality: 0.95,
        fileName: `qr-code-${config.type}-${Date.now()}`
      });
      triggerCelebration();
    } catch (err: any) {
      console.error('Download error:', err);
      setErrorMessage(err?.message || 'Download failed. Please try a different size or format.');
    } finally {
      if (isUltraHighRes) {
        hideFullscreenLoader();
      }
      setExporting(false);
    }
  };

  const handleCopyImage = async () => {
    setErrorMessage(null);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Please enter valid QR content before copying');
      return;
    }

    try {
      setCopyStatus('copying-image');
      await copyQRImageToClipboard(config);
      setCopyStatus('image-copied');
      triggerCelebration();
      setTimeout(() => setCopyStatus(null), 2500);
    } catch (err: any) {
      console.error(err);
      setCopyStatus(null);
      setErrorMessage(err?.message || 'Clipboard image copy is not supported in this browser. Please use Download instead.');
    }
  };

  const handleCopySVG = async () => {
    setErrorMessage(null);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Please enter valid QR content before copying');
      return;
    }

    try {
      setCopyStatus('copying-svg');
      const svg = await getSVGString(config);
      await copyToClipboard(svg);
      setCopyStatus('svg-copied');
      setTimeout(() => setCopyStatus(null), 2500);
    } catch (err: any) {
      console.error(err);
      setCopyStatus(null);
      setErrorMessage(err?.message || 'Failed to copy SVG markup to clipboard.');
    }
  };

  const handleCopyPayload = async () => {
    setErrorMessage(null);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Please enter valid QR content before copying');
      return;
    }

    try {
      setCopyStatus('copying-payload');
      await copyToClipboard(validation.payload);
      setCopyStatus('payload-copied');
      setTimeout(() => setCopyStatus(null), 2500);
    } catch (err: any) {
      console.error(err);
      setCopyStatus(null);
      setErrorMessage(err?.message || 'Failed to copy content to clipboard.');
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Download QR"
      description="Choose a file type and size, or copy your QR code directly."
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
            <span className="flex-1 font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Format Selection */}
        <div>
          <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
            File Type
          </label>
          <div className="grid grid-cols-2 xs:grid-cols-4 gap-2">
            {[
              { id: 'png', label: 'PNG', badge: 'Best for web' },
              { id: 'svg', label: 'SVG', badge: 'Best for print' },
              { id: 'jpeg', label: 'JPG', badge: 'Photo file' },
              { id: 'webp', label: 'WebP', badge: 'Small file' }
            ].map(f => {
              const isSelected = format === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFormat(f.id as any)}
                  className={cn(
                    'flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-xl border text-center transition-all cursor-pointer',
                    isSelected
                      ? 'border-[#E64500] dark:border-orange-500 bg-orange-50/60 dark:bg-orange-950/50 text-[#E64500] dark:text-orange-300 ring-1 ring-[#E64500] dark:ring-orange-500 font-semibold shadow-xs'
                      : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-orange-200 dark:hover:border-orange-900/60 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                  )}
                >
                  <span className="text-sm font-bold">{f.label}</span>
                  <span className="text-[10px] text-neutral-500">{f.badge}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Resolution Selector (Disabled for Vector SVG) */}
        {format !== 'svg' ? (
          <div>
            <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
              Image Size
            </label>
            <div className="grid grid-cols-2 gap-2">
              {RESOLUTIONS.map(r => {
                const isSelected = resolution === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setResolution(r.value)}
                    className={cn(
                      'flex flex-col p-2.5 rounded-xl border text-left transition-all cursor-pointer',
                      isSelected
                        ? 'border-[#E64500] dark:border-orange-500 bg-orange-50/60 dark:bg-orange-950/50 ring-1 ring-[#E64500] dark:ring-orange-500 font-semibold shadow-xs'
                        : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-orange-200 dark:hover:border-orange-900/60 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                    )}
                  >
                    <span className={cn(
                      "text-xs font-semibold font-mono tabular-nums",
                      isSelected ? "text-[#E64500] dark:text-orange-300" : "text-neutral-900 dark:text-neutral-100"
                    )}>
                      {r.label}
                    </span>
                    <span className="text-[10px] text-neutral-500">{r.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400">
            SVG images stay crisp and clear at any size, perfect for printing.
          </div>
        )}

        {/* Primary Download Button */}
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={handleDownload}
          loading={exporting}
          loadingText="Preparing download..."
          className="w-full gap-2 text-sm font-semibold shadow-md shadow-orange-500/25"
        >
          <Download className="w-4 h-4" />
          <span>{`Download ${format.toUpperCase()}`}</span>
        </Button>

        {/* Quick Clipboard Actions */}
        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
          <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
            Or Copy Directly
          </label>
          <div className="grid grid-cols-1 xs:grid-cols-3 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyImage}
              loading={copyStatus === 'copying-image'}
              loadingText="Copying..."
              className="text-xs gap-1.5 h-9"
            >
              {copyStatus === 'image-copied' ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <ImageIcon className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>{copyStatus === 'image-copied' ? 'Copied!' : 'Copy Image'}</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopySVG}
              loading={copyStatus === 'copying-svg'}
              loadingText="Copying..."
              className="text-xs gap-1.5 h-9"
            >
              {copyStatus === 'svg-copied' ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <FileCode className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>{copyStatus === 'svg-copied' ? 'Copied!' : 'Copy SVG'}</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyPayload}
              loading={copyStatus === 'copying-payload'}
              loadingText="Copying..."
              className="text-xs gap-1.5 h-9"
            >
              {copyStatus === 'payload-copied' ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <Copy className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>{copyStatus === 'payload-copied' ? 'Copied!' : 'Copy Text'}</span>
            </Button>

            {onOpenShare && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onOpenShare();
                }}
                className="text-xs gap-1.5 h-9 text-[#E64500] dark:text-orange-400 border-orange-200/80 dark:border-orange-800/80 hover:bg-orange-50 dark:hover:bg-orange-950/40"
              >
                <Share2 className="w-3.5 h-3.5 shrink-0" />
                <span>Share QR</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
};
