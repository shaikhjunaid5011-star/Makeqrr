import * as React from 'react';
import jsQR from 'jsqr';
import { Dialog } from '../ui/dialog';
import { Button } from '../ui/button';
import { Loader } from '../ui/loader';
import { Camera, Upload, CheckCircle2, AlertCircle, RefreshCw, Copy, ExternalLink, Volume2, VolumeX } from 'lucide-react';
import { copyToClipboard } from '../../lib/utils';
import { sanitizeSvgContent } from '../../lib/logo-utils';

const SCANNER_SOUND_STORAGE_KEY = 'makeqrr_scanner_sound';

/**
 * Plays a subtle, satisfying two-tone harmonic success beep using the Web Audio API.
 * Uses soft sine/triangle oscillators with smooth attack and exponential release
 * to avoid clicks or harshness, and automatically closes the AudioContext after playback.
 */
function playScanSuccessChime(enabled: boolean): void {
  if (!enabled || typeof window === 'undefined') return;

  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      void ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Master gain kept subtle and comfortable (peak 0.11)
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.linearRampToValueAtTime(0.11, now + 0.012);
    masterGain.gain.exponentialRampToValueAtTime(0.065, now + 0.075);
    masterGain.gain.setValueAtTime(0.09, now + 0.08);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    masterGain.connect(ctx.destination);

    // Primary sine oscillator: A5 (880 Hz) -> E6 (1318.51 Hz) perfect fifth interval
    const oscPrimary = ctx.createOscillator();
    oscPrimary.type = 'sine';
    oscPrimary.frequency.setValueAtTime(880, now);
    oscPrimary.frequency.setValueAtTime(1318.51, now + 0.075);
    oscPrimary.connect(masterGain);

    // Subtle warm harmonic triangle layer
    const harmonicGain = ctx.createGain();
    harmonicGain.gain.setValueAtTime(0.25, now);
    harmonicGain.connect(masterGain);

    const oscHarmonic = ctx.createOscillator();
    oscHarmonic.type = 'triangle';
    oscHarmonic.frequency.setValueAtTime(1760, now);
    oscHarmonic.frequency.setValueAtTime(2637.02, now + 0.075);
    oscHarmonic.connect(harmonicGain);

    oscPrimary.start(now);
    oscHarmonic.start(now);
    oscPrimary.stop(now + 0.23);
    oscHarmonic.stop(now + 0.23);

    // Clean up AudioContext resources once the chime completes
    setTimeout(() => {
      if (ctx.state !== 'closed') {
        void ctx.close().catch(() => {});
      }
    }, 300);
  } catch {
    // Ignore audio context errors on restricted autoplay environments
  }
}

interface QRScannerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialStream?: MediaStream | null;
  initialMode?: 'camera' | 'upload';
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  open,
  onOpenChange,
  initialStream,
  initialMode = 'camera'
}) => {
  const [mode, setMode] = React.useState<'camera' | 'upload'>(initialMode);
  const [cameraActive, setCameraActive] = React.useState(false);
  const [startingCamera, setStartingCamera] = React.useState(false);
  const [decodingFile, setDecodingFile] = React.useState(false);
  const [cameraError, setCameraError] = React.useState<string | null>(null);
  const [scanResult, setScanResult] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  // Respect user accessibility settings (prefers-reduced-motion) by default, with persistent user override
  const [soundEnabled, setSoundEnabled] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      const saved = window.localStorage.getItem(SCANNER_SOUND_STORAGE_KEY);
      if (saved !== null) {
        return saved === 'true';
      }
    } catch {
      // ignore storage errors
    }
    if (typeof window.matchMedia === 'function') {
      return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return true;
  });

  const soundEnabledRef = React.useRef<boolean>(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  const toggleSound = React.useCallback(() => {
    setSoundEnabled(prev => {
      const next = !prev;
      try {
        window.localStorage.setItem(SCANNER_SOUND_STORAGE_KEY, String(next));
      } catch {
        // ignore
      }
      if (next) {
        playScanSuccessChime(true);
      }
      return next;
    });
  }, []);

  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const animFrameRef = React.useRef<number | null>(null);
  const requestInFlightRef = React.useRef<boolean>(false);
  const openRef = React.useRef<boolean>(open);
  const mountedRef = React.useRef<boolean>(true);

  const stopCamera = React.useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const mediaStream = videoRef.current.srcObject as MediaStream;
      if (typeof mediaStream.getTracks === 'function') {
        mediaStream.getTracks().forEach(track => {
          try {
            track.stop();
          } catch {
            // ignore
          }
        });
      }
      videoRef.current.srcObject = null;
    }
    requestInFlightRef.current = false;
    setCameraActive(false);
    setStartingCamera(false);
  }, []);

  // Ensure all camera streams are stopped when component unmounts
  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopCamera();
    };
  }, [stopCamera]);

  const scanFrame = React.useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth'
      });

      if (code && code.data) {
        playScanSuccessChime(soundEnabledRef.current);
        setScanResult(code.data);
        stopCamera();
        return;
      }
    }

    animFrameRef.current = requestAnimationFrame(scanFrame);
  }, [stopCamera]);

  // Explicit user-triggered camera start (only invoked when user clicks Start Camera / Retry / Scan Again)
  const startCamera = React.useCallback(async () => {
    if (requestInFlightRef.current) return;

    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.getUserMedia !== 'function'
    ) {
      setCameraError("Camera isn't available on this device or browser.");
      setCameraActive(false);
      return;
    }

    stopCamera();
    requestInFlightRef.current = true;
    setCameraError(null);
    setScanResult(null);
    setStartingCamera(true);

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
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

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraActive(true);
        animFrameRef.current = requestAnimationFrame(scanFrame);
      }
    } catch (err: any) {
      if (!mountedRef.current || !openRef.current) return;
      const errorName = err?.name || '';
      setCameraError(
        errorName === 'NotAllowedError' ||
          errorName === 'PermissionDeniedError' ||
          err?.message?.toLowerCase().includes('permission denied')
          ? 'Camera access was blocked. Please allow camera access in your browser settings and try again.'
          : "Camera isn't available on this device."
      );
      setCameraActive(false);
    } finally {
      requestInFlightRef.current = false;
      if (mountedRef.current) {
        setStartingCamera(false);
      }
    }
  }, [scanFrame, stopCamera]);

  React.useEffect(() => {
    openRef.current = open;
    if (open) {
      if (initialMode) {
        setMode(initialMode);
      }
      // Attach already-granted stream passed from CameraPermissionDialog without calling getUserMedia again
      if (initialStream) {
        setMode('camera');
        streamRef.current = initialStream;
        if (videoRef.current) {
          videoRef.current.srcObject = initialStream;
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.play().then(() => {
            setCameraActive(true);
            animFrameRef.current = requestAnimationFrame(scanFrame);
          }).catch(() => {
            setCameraActive(true);
            animFrameRef.current = requestAnimationFrame(scanFrame);
          });
        }
      }
    } else {
      stopCamera();
      setScanResult(null);
      setCameraError(null);
      setDecodingFile(false);
    }
  }, [open, initialStream, initialMode, scanFrame, stopCamera]);

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setCameraError('Please select a valid image file (PNG, JPG, WebP, or SVG).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setCameraError('Image file is too large (max 15MB). Please choose a smaller screenshot.');
      return;
    }

    setDecodingFile(true);
    setCameraError(null);
    setScanResult(null);

    const img = new Image();
    const decodeLoadedImage = () => {
      const maxDim = 1600;
      let w = img.naturalWidth || img.width;
      let h = img.naturalHeight || img.height;
      if (!w || !h) {
        setDecodingFile(false);
        setCameraError('Invalid image dimensions.');
        return;
      }
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setDecodingFile(false);
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth'
      });
      setDecodingFile(false);
      if (code && code.data) {
        playScanSuccessChime(soundEnabledRef.current);
        setScanResult(code.data);
        setCameraError(null);
      } else {
        setCameraError('No valid QR code detected in this image. Try another screenshot.');
      }
    };

    img.onload = decodeLoadedImage;
    img.onerror = () => {
      setDecodingFile(false);
      setCameraError('Failed to read image file.');
    };

    const isSvgFile = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
    const reader = new FileReader();

    if (isSvgFile) {
      reader.onload = ev => {
        try {
          const rawSvg = ev.target?.result as string;
          const cleanSvg = sanitizeSvgContent(rawSvg);
          img.src = `data:image/svg+xml;utf8,${encodeURIComponent(cleanSvg)}`;
        } catch (err: any) {
          setDecodingFile(false);
          setCameraError(err?.message || 'Invalid or unsafe SVG image file.');
        }
      };
      reader.onerror = () => {
        setDecodingFile(false);
        setCameraError('Failed to load SVG file.');
      };
      reader.readAsText(file);
      return;
    }

    reader.onload = ev => {
      img.src = ev.target?.result as string;
    };
    reader.onerror = () => {
      setDecodingFile(false);
      setCameraError('Failed to load file.');
    };
    reader.readAsDataURL(file);
  };

  const handleCopyResult = async () => {
    if (!scanResult) return;
    await copyToClipboard(scanResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUrl = Boolean(scanResult && /^https?:\/\/[^\s]+$/i.test(scanResult));

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Test QR Code"
      description="Scan with your camera or upload an image to see what it opens."
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Mode Selector & Accessible Sound Toggle */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={mode === 'camera' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => {
              setMode('camera');
              setCameraError(null);
            }}
            className="flex-1 text-xs gap-1.5"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Camera</span>
          </Button>
          <Button
            type="button"
            variant={mode === 'upload' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => {
              stopCamera();
              setMode('upload');
              setCameraError(null);
            }}
            className="flex-1 text-xs gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Image</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleSound}
            aria-pressed={soundEnabled}
            aria-label={soundEnabled ? 'Mute scan success sound' : 'Enable scan success sound'}
            title={soundEnabled ? 'Scan sound on (click to mute)' : 'Scan sound muted (click to enable)'}
            className="px-2.5 text-xs gap-1 shrink-0"
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-[#E64500]" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-neutral-400" />
            )}
            <span className="hidden sm:inline text-[11px]">
              {soundEnabled ? 'Sound On' : 'Muted'}
            </span>
          </Button>
        </div>

        {/* Camera View */}
        {mode === 'camera' && (
          <div className="relative rounded-xl overflow-hidden bg-neutral-950 aspect-video flex flex-col items-center justify-center border border-neutral-200 dark:border-neutral-800">
            <video
              ref={videoRef}
              className={cameraActive ? 'w-full h-full object-cover' : 'hidden'}
            />
            <canvas ref={canvasRef} className="hidden" />

            {startingCamera && (
              <div className="p-6 text-center space-y-3">
                <Loader variant="qr-matrix" size="md" label="Starting camera..." />
              </div>
            )}

            {!cameraActive && !startingCamera && !scanResult && (
              <div className="p-6 text-center space-y-3">
                <Camera className="w-8 h-8 text-neutral-400 mx-auto" />
                <div className="text-xs text-neutral-300">
                  Click start to turn on your camera.
                </div>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={startCamera}
                  loading={startingCamera}
                  loadingText="Starting Camera..."
                  className="text-xs"
                >
                  Start Camera
                </Button>
              </div>
            )}

            {cameraActive && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-emerald-400 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.4)] animate-pulse" />
              </div>
            )}
          </div>
        )}

        {/* Upload View */}
        {mode === 'upload' && (
          <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl p-8 text-center bg-neutral-50/50 dark:bg-neutral-800/30">
            {decodingFile ? (
              <Loader
                variant="qr-matrix"
                size="md"
                label="Reading QR code..."
                sublabel="Finding and reading your QR code"
              />
            ) : (
              <>
                <Upload className="w-8 h-8 mx-auto mb-2 text-neutral-400" />
                <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 block">
                  Upload or drop a QR image to test
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFile}
                  className="mt-3 text-xs block mx-auto text-neutral-500 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:bg-neutral-900 file:text-white dark:file:bg-neutral-100 dark:file:text-neutral-900 cursor-pointer"
                />
              </>
            )}
          </div>
        )}

        {/* Camera / Scan Errors */}
        {cameraError && (
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{cameraError}</span>
            </div>
            {mode === 'camera' && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={startCamera}
                className="h-7 px-2.5 text-[11px] gap-1 shrink-0 border-red-300 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-700 dark:text-red-200 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry</span>
              </Button>
            )}
          </div>
        )}

        {/* Decoded QR Result */}
        {scanResult && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>QR Code Scanned Successfully</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setScanResult(null);
                  if (mode === 'camera') startCamera();
                }}
                className="h-6 text-[11px] gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Scan Again</span>
              </Button>
            </div>

            <div className="p-2.5 rounded bg-white dark:bg-neutral-900 border border-emerald-200 dark:border-emerald-900 font-mono text-xs text-neutral-800 dark:text-neutral-200 break-all select-all">
              {scanResult}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyResult}
                loading={copied}
                loadingText="Copied!"
                className="text-xs gap-1.5"
              >
                <Copy className="w-3 h-3" />
                <span>Copy Text</span>
              </Button>

              {isUrl && (
                <a
                  href={scanResult}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline px-2 py-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Open Link</span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
};
