import * as React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  Camera,
  Scan,
  X,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Upload,
  Lock,
  ArrowRight
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

export interface CameraPermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPermissionGranted: (stream: MediaStream) => void;
  onSwitchToUpload?: () => void;
}

type PermissionStatus = 'prompt' | 'requesting' | 'denied' | 'unavailable';

export const CameraPermissionDialog: React.FC<CameraPermissionDialogProps> = ({
  open,
  onOpenChange,
  onPermissionGranted,
  onSwitchToUpload
}) => {
  const prefersReduced = useReducedMotion();
  const [status, setStatus] = React.useState<PermissionStatus>('prompt');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const dialogRef = React.useRef<HTMLDivElement>(null);
  const allowButtonRef = React.useRef<HTMLButtonElement>(null);
  const requestInFlightRef = React.useRef<boolean>(false);
  const openRef = React.useRef<boolean>(open);
  const mountedRef = React.useRef<boolean>(true);

  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Reset state when opening/closing
  React.useEffect(() => {
    openRef.current = open;
    if (open) {
      setStatus('prompt');
      setErrorMessage(null);
      // Give time for modal animation to mount then focus primary action
      const timer = setTimeout(() => {
        allowButtonRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      requestInFlightRef.current = false;
      setStatus('prompt');
      setErrorMessage(null);
    }
  }, [open]);

  // Clean scroll lock on body without leaving lingering locks
  React.useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  // Keyboard accessibility: Escape to close + Focus trapping inside dialog
  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onOpenChange(false);
        return;
      }

      if (e.key === 'Tab') {
        const dialogNode = dialogRef.current;
        if (!dialogNode) return;

        const focusableElements = dialogNode.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  // Explicit user permission trigger (ONLY called via direct user click on Allow Camera Access / Try Again)
  const handleRequestPermission = async () => {
    // Prevent duplicate concurrent permission requests
    if (requestInFlightRef.current) return;

    // Guard: MediaDevices API support check
    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.getUserMedia !== 'function'
    ) {
      setStatus('unavailable');
      setErrorMessage("Camera isn't available on this device or browser.");
      return;
    }

    requestInFlightRef.current = true;
    setStatus('requesting');
    setErrorMessage(null);

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' }
          },
          audio: false
        });
      } catch (constraintErr: any) {
        if (constraintErr?.name === 'OverconstrainedError') {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
        } else {
          throw constraintErr;
        }
      }

      // If the user closed the dialog or navigated away while the browser prompt was open, stop tracks immediately
      if (!mountedRef.current || !openRef.current) {
        stream.getTracks().forEach(track => {
          try {
            track.stop();
          } catch {
            // ignore
          }
        });
        return;
      }

      // Permission granted! Close custom dialog and pass stream to scanner
      setStatus('prompt');
      onPermissionGranted(stream);
      onOpenChange(false);
    } catch (err: any) {
      if (!mountedRef.current || !openRef.current) return;

      const errorName = err?.name || '';

      if (
        errorName === 'NotAllowedError' ||
        errorName === 'PermissionDeniedError' ||
        err?.message?.toLowerCase().includes('permission denied') ||
        err?.message?.toLowerCase().includes('not allowed')
      ) {
        setStatus('denied');
        setErrorMessage(
          'Camera access was blocked. Please allow camera access in your browser settings and try again.'
        );
      } else if (
        errorName === 'NotFoundError' ||
        errorName === 'DevicesNotFoundError' ||
        errorName === 'NotSupportedError' ||
        errorName === 'OverconstrainedError'
      ) {
        setStatus('unavailable');
        setErrorMessage("Camera isn't available on this device.");
      } else {
        setStatus('denied');
        setErrorMessage(
          'Camera access was blocked. Please allow camera access in your browser settings and try again.'
        );
      }
    } finally {
      requestInFlightRef.current = false;
    }
  };

  const handleClose = () => {
    openRef.current = false;
    requestInFlightRef.current = false;
    onOpenChange(false);
  };

  const handleUploadClick = () => {
    onOpenChange(false);
    if (onSwitchToUpload) {
      onSwitchToUpload();
    }
  };

  return (
    <AnimatePresence mode="wait">
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pt-[max(0.75rem,env(safe-area-inset-top,0px))] pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] select-none"
          role="presentation"
        >
          {/* Backdrop with smooth blur and dimming */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 bg-neutral-950/70 backdrop-blur-sm"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Dialog Window */}
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="camera-dialog-title"
            aria-describedby="camera-dialog-desc"
            initial={
              prefersReduced
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.94, y: 14 }
            }
            animate={
              prefersReduced
                ? { opacity: 1 }
                : { opacity: 1, scale: 1, y: 0 }
            }
            exit={
              prefersReduced
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.96, y: 10 }
            }
            transition={{
              type: 'spring',
              damping: 26,
              stiffness: 340
            }}
            className={cn(
              'relative w-full max-w-md bg-white dark:bg-neutral-900',
              'border border-neutral-200 dark:border-neutral-800',
              'rounded-3xl shadow-2xl p-6 sm:p-8 z-10 overflow-hidden',
              'max-h-[calc(100dvh-2rem)] overflow-y-auto'
            )}
          >
            {/* Ambient Background Warm Glow */}
            <div
              className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-gradient-to-br from-[#E64500]/15 via-orange-500/10 to-transparent blur-3xl pointer-events-none"
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-gradient-to-tr from-amber-500/10 via-[#E64500]/5 to-transparent blur-3xl pointer-events-none"
              aria-hidden="true"
            />

            {/* Close '×' Button */}
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close dialog"
              className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E64500]"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Dynamic Content Based on Permission State */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
              {/* ========================================================= */}
              {/* STATE 1: Initial Prompt & Requesting State                */}
              {/* ========================================================= */}
              {(status === 'prompt' || status === 'requesting') && (
                <>
                  {/* Large Animated Camera / Scan Icon */}
                  <motion.div
                    initial={prefersReduced ? false : { scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      type: 'spring',
                      damping: 20,
                      stiffness: 300,
                      delay: 0.05
                    }}
                    className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-orange-50 to-orange-100/60 dark:from-neutral-800 dark:to-neutral-800/80 border border-orange-200/80 dark:border-orange-500/30 flex items-center justify-center shadow-lg shadow-orange-500/10 overflow-hidden"
                  >
                    {/* Corner Viewfinder Reticles */}
                    <div className="absolute inset-2.5 pointer-events-none">
                      <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#E64500] rounded-tl-sm" />
                      <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#E64500] rounded-tr-sm" />
                      <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#E64500] rounded-bl-sm" />
                      <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#E64500] rounded-br-sm" />
                    </div>

                    {/* Central Camera Icon */}
                    <motion.div
                      animate={
                        prefersReduced
                          ? {}
                          : {
                              scale: status === 'requesting' ? [1, 1.05, 1] : 1
                            }
                      }
                      transition={{
                        repeat: status === 'requesting' ? Infinity : 0,
                        duration: 1.2,
                        ease: 'easeInOut'
                      }}
                      className="relative z-10 text-[#E64500] dark:text-[#ff7a3d]"
                    >
                      <Camera className="w-10 h-10 sm:w-12 sm:h-12 stroke-[1.75]" />
                    </motion.div>

                    {/* Animated Scanning Laser Beam */}
                    {!prefersReduced && (
                      <motion.div
                        animate={{
                          y: ['-120%', '120%']
                        }}
                        transition={{
                          repeat: Infinity,
                          repeatType: 'reverse',
                          duration: 2,
                          ease: 'easeInOut'
                        }}
                        className="absolute inset-x-0 h-1 pointer-events-none z-20"
                        style={{ top: '50%' }}
                      >
                        <div className="w-full h-full bg-gradient-to-r from-transparent via-[#E64500] to-transparent shadow-[0_0_10px_#E64500]" />
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Heading & Supporting Text */}
                  <motion.div
                    initial={prefersReduced ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.12 }}
                    className="space-y-2 max-w-xs"
                  >
                    <h2
                      id="camera-dialog-title"
                      className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950 dark:text-neutral-50"
                    >
                      Use Your Camera
                    </h2>
                    <p
                      id="camera-dialog-desc"
                      className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal"
                    >
                      Scan a QR code using your device camera.
                    </p>
                  </motion.div>

                  {/* Privacy & Safety Reassurance Pills */}
                  <motion.div
                    initial={prefersReduced ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.35, delay: 0.18 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400"
                  >
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-800">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>100% Private · Video stays on device</span>
                    </div>
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={prefersReduced ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.22 }}
                    className="w-full pt-2 flex flex-col gap-2.5"
                  >
                    <Button
                      ref={allowButtonRef}
                      type="button"
                      variant="primary"
                      size="lg"
                      onClick={handleRequestPermission}
                      loading={status === 'requesting'}
                      loadingText="Requesting Access..."
                      aria-label="Allow Camera access"
                      className="w-full h-12 rounded-xl text-sm font-bold bg-[#E64500] hover:bg-[#cc3d00] active:bg-[#b33500] text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#E64500] focus-visible:ring-offset-2"
                    >
                      <Camera className="w-4 h-4 shrink-0" />
                      <span>Allow Camera Access</span>
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="default"
                      onClick={handleClose}
                      disabled={status === 'requesting'}
                      aria-label="Do not allow camera now"
                      className="w-full h-10 rounded-xl text-xs sm:text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                    >
                      <span>Not Now</span>
                    </Button>
                  </motion.div>
                </>
              )}

              {/* ========================================================= */}
              {/* STATE 2: Permission Denied State                          */}
              {/* ========================================================= */}
              {status === 'denied' && (
                <motion.div
                  initial={prefersReduced ? false : { opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="w-full flex flex-col items-center space-y-5"
                >
                  {/* Warning / Lock Icon */}
                  <div className="w-20 h-20 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-md">
                    <Lock className="w-9 h-9 stroke-[1.75]" />
                  </div>

                  <div className="space-y-2">
                    <h2
                      id="camera-dialog-title"
                      className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950 dark:text-neutral-50"
                    >
                      Camera Access Blocked
                    </h2>
                    <p
                      id="camera-dialog-desc"
                      className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-xs mx-auto"
                    >
                      {errorMessage ||
                        'Camera access was blocked. Please allow camera access in your browser settings and try again.'}
                    </p>
                  </div>

                  {/* Browser Settings Helper */}
                  <div className="w-full p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/80 text-left text-xs text-neutral-500 dark:text-neutral-400 space-y-1.5">
                    <div className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>How to unblock:</span>
                    </div>
                    <p className="leading-relaxed">
                      Tap the lock or site settings icon in your browser address bar and switch Camera permission to <strong>Allow</strong>.
                    </p>
                  </div>

                  {/* Denied Action Buttons */}
                  <div className="w-full pt-1 flex flex-col gap-2.5">
                    <Button
                      type="button"
                      variant="primary"
                      size="lg"
                      onClick={handleRequestPermission}
                      className="w-full h-11 rounded-xl text-xs sm:text-sm font-bold bg-[#E64500] hover:bg-[#cc3d00] text-white shadow-md shadow-orange-500/20 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                      <span>Try Again</span>
                    </Button>

                    {onSwitchToUpload && (
                      <Button
                        type="button"
                        variant="outline"
                        size="default"
                        onClick={handleUploadClick}
                        className="w-full h-10 rounded-xl text-xs font-semibold gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 shrink-0" />
                        <span>Upload QR Image Instead</span>
                      </Button>
                    )}

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleClose}
                      className="w-full h-9 rounded-xl text-xs font-semibold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
                    >
                      <span>Dismiss</span>
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* ========================================================= */}
              {/* STATE 3: Camera Unavailable on Device                     */}
              {/* ========================================================= */}
              {status === 'unavailable' && (
                <motion.div
                  initial={prefersReduced ? false : { opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="w-full flex flex-col items-center space-y-5"
                >
                  <div className="w-20 h-20 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 flex items-center justify-center shadow-md">
                    <AlertCircle className="w-9 h-9 stroke-[1.75]" />
                  </div>

                  <div className="space-y-2">
                    <h2
                      id="camera-dialog-title"
                      className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950 dark:text-neutral-50"
                    >
                      Camera Unavailable
                    </h2>
                    <p
                      id="camera-dialog-desc"
                      className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-xs mx-auto"
                    >
                      {errorMessage || "Camera isn't available on this device."}
                    </p>
                  </div>

                  <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xs">
                    You can still test and verify any QR code instantly by uploading a screenshot or image file.
                  </p>

                  <div className="w-full pt-1 flex flex-col gap-2.5">
                    {onSwitchToUpload && (
                      <Button
                        type="button"
                        variant="primary"
                        size="lg"
                        onClick={handleUploadClick}
                        className="w-full h-11 rounded-xl text-xs sm:text-sm font-bold bg-[#E64500] hover:bg-[#cc3d00] text-white shadow-md shadow-orange-500/20 cursor-pointer gap-1.5"
                      >
                        <Upload className="w-4 h-4 shrink-0" />
                        <span>Upload QR Image Instead</span>
                      </Button>
                    )}

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleClose}
                      className="w-full h-9 rounded-xl text-xs font-semibold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
                    >
                      <span>Close</span>
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
