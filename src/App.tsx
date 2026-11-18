/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QRConfig, QRTemplate } from './types/qr';
import {
  loadSavedConfig,
  saveConfig,
  DEFAULT_QR_CONFIG,
  EMPTY_QR_CONTENT,
  hasUserEnteredData,
  clearEditorLocalStorage
} from './lib/storage';
import { useTheme } from './lib/theme-context';
import { RouterProvider, usePathname, useNavigate } from './lib/router';
import { TopNav } from './components/shared/top-nav';
import { Footer } from './components/shared/footer';
import { QREditor } from './components/qr/qr-editor';
import { useLenisSmoothScroll } from './lib/use-smooth-scroll';
import { AmbientBackground } from './components/shared/ambient-background';
import { NetworkStatusBanner } from './components/shared/network-status-banner';
import { NetworkStatusProvider } from './lib/network-status';
import { SEOHead } from './lib/seo';
import { pageTransitionVariants } from './lib/motion-system';
import { LoadingProvider, useLoading } from './lib/loading-context';
import { FullPageSkeleton } from './components/ui/skeleton';

import { HomePage } from './components/pages/home-page';

// Code-split secondary pages so their bundles load on demand
const TemplatesPage = React.lazy(() => import('./components/pages/templates-page').then(m => ({ default: m.TemplatesPage })));
const AboutPage = React.lazy(() => import('./components/pages/about-page').then(m => ({ default: m.AboutPage })));
const HelpPage = React.lazy(() => import('./components/pages/help-page').then(m => ({ default: m.HelpPage })));
const PrivacyPage = React.lazy(() => import('./components/pages/privacy-page').then(m => ({ default: m.PrivacyPage })));
const TermsPage = React.lazy(() => import('./components/pages/terms-page').then(m => ({ default: m.TermsPage })));
const SponsorPage = React.lazy(() => import('./components/pages/sponsor-page').then(m => ({ default: m.SponsorPage })));
const NotFoundPage = React.lazy(() => import('./components/pages/not-found-page').then(m => ({ default: m.NotFoundPage })));

// Code-split modals and heavy camera scanner dependencies
const ExportModal = React.lazy(() => import('./components/qr/export-modal').then(m => ({ default: m.ExportModal })));
const ShareModal = React.lazy(() => import('./components/qr/share-modal').then(m => ({ default: m.ShareModal })));
const QRScannerModal = React.lazy(() => import('./components/qr/qr-scanner-modal').then(m => ({ default: m.QRScannerModal })));
const CameraPermissionDialog = React.lazy(() => import('./components/qr/camera-permission-dialog').then(m => ({ default: m.CameraPermissionDialog })));
const TemplatesModal = React.lazy(() => import('./components/qr/templates-modal').then(m => ({ default: m.TemplatesModal })));
const RecentDesignsModal = React.lazy(() => import('./components/qr/recent-designs-modal').then(m => ({ default: m.RecentDesignsModal })));
const ResetModal = React.lazy(() => import('./components/qr/reset-modal').then(m => ({ default: m.ResetModal })));

interface RouteErrorBoundaryProps {
  pathname: string;
  onGoHome: () => void;
  children: React.ReactNode;
}

interface RouteErrorBoundaryState {
  hasError: boolean;
}

class RouteErrorBoundary extends React.Component<
  RouteErrorBoundaryProps,
  RouteErrorBoundaryState
> {
  constructor(props: RouteErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): RouteErrorBoundaryState {
    return { hasError: true };
  }

  componentDidUpdate(prevProps: RouteErrorBoundaryProps) {
    if (this.state.hasError && prevProps.pathname !== this.props.pathname) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 text-center">
          <div className="max-w-md space-y-4">
            <p className="text-xs font-mono uppercase tracking-widest text-[#E64500] font-semibold">
              Unexpected Error
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
              Something went wrong loading this view
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              A temporary rendering error occurred. You can retry loading this page or return to the homepage.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => this.setState({ hasError: false })}
                className="min-h-[44px] inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#E64500] text-white hover:bg-[#cc3d00] transition-colors cursor-pointer"
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false });
                  this.props.onGoHome();
                }}
                className="min-h-[44px] inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function StudioApp() {
  const pathname = usePathname();
  const navigate = useNavigate();
  const { setIsNavigating } = useLoading();

  // Subtle top route progress illumination during route/page transitions
  React.useEffect(() => {
    setIsNavigating(true);
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 240);
    return () => clearTimeout(timer);
  }, [pathname, setIsNavigating]);

  // Initialize silky Lenis momentum scrolling
  useLenisSmoothScroll();

  // Active QR state loaded from localStorage
  const [config, setConfig] = React.useState<QRConfig>(() => loadSavedConfig());

  // Debounced autosave to localStorage to prevent synchronous disk I/O on rapid typing
  React.useEffect(() => {
    const timer = setTimeout(() => {
      saveConfig(config);
    }, 400);
    return () => clearTimeout(timer);
  }, [config]);

  // History stack for Undo / Redo
  const [undoStack, setUndoStack] = React.useState<QRConfig[]>([]);
  const [redoStack, setRedoStack] = React.useState<QRConfig[]>([]);

  // Key to force clean remount of QREditor on Clear All so all child component state resets
  const [editorKey, setEditorKey] = React.useState(0);

  // Global Theme state
  const { theme, toggleTheme } = useTheme();

  // Modal open states
  const [exportOpen, setExportOpen] = React.useState(false);
  const [shareOpen, setShareOpen] = React.useState(false);
  const [cameraPermissionOpen, setCameraPermissionOpen] = React.useState(false);
  const [cameraPermissionGranted, setCameraPermissionGranted] = React.useState(false);
  const [scannerOpen, setScannerOpen] = React.useState(false);
  const [scannerStream, setScannerStream] = React.useState<MediaStream | null>(null);
  const [scannerMode, setScannerMode] = React.useState<'camera' | 'upload'>('camera');
  const [templatesOpen, setTemplatesOpen] = React.useState(false);
  const [recentOpen, setRecentOpen] = React.useState(false);
  const [resetOpen, setResetOpen] = React.useState(false);
  const [bannerHeight, setBannerHeight] = React.useState(0);

  const scannerStreamRef = React.useRef<MediaStream | null>(null);
  const openingCameraRef = React.useRef<boolean>(false);

  const stopScannerStream = React.useCallback(() => {
    if (scannerStreamRef.current) {
      scannerStreamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      scannerStreamRef.current = null;
    }
    setScannerStream(prev => {
      if (prev) {
        prev.getTracks().forEach(track => {
          try {
            track.stop();
          } catch {
            // ignore
          }
        });
      }
      return null;
    });
  }, []);

  // Stop all camera streams and close scanner dialogs if user navigates away
  React.useEffect(() => {
    setCameraPermissionOpen(false);
    setScannerOpen(false);
    stopScannerStream();
  }, [pathname, stopScannerStream]);

  // Ensure camera streams are stopped on page unload / unmount
  React.useEffect(() => {
    return () => {
      stopScannerStream();
    };
  }, [stopScannerStream]);

  const handleCameraPermissionGranted = React.useCallback((stream: MediaStream) => {
    scannerStreamRef.current = stream;
    setScannerStream(stream);
    setCameraPermissionGranted(true);
    setScannerMode('camera');
    setScannerOpen(true);
  }, []);

  const handleOpenScannerTrigger = React.useCallback(async () => {
    // Only open scanner/permission on explicit user button click
    if (openingCameraRef.current) return;

    // If permission was already granted in this session, open scanner without repeating the permission popup
    if (
      cameraPermissionGranted &&
      typeof navigator !== 'undefined' &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function'
    ) {
      openingCameraRef.current = true;
      try {
        stopScannerStream();
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
        scannerStreamRef.current = stream;
        setScannerStream(stream);
        setScannerMode('camera');
        setScannerOpen(true);
        return;
      } catch {
        // Permission was revoked or failed; fall back to custom permission dialog
        setCameraPermissionGranted(false);
        setCameraPermissionOpen(true);
        return;
      } finally {
        openingCameraRef.current = false;
      }
    }

    // First-time or ungranted state: display custom camera permission dialog first
    setCameraPermissionOpen(true);
  }, [cameraPermissionGranted, stopScannerStream]);

  const handleSwitchToUpload = React.useCallback(() => {
    stopScannerStream();
    setScannerMode('upload');
    setScannerOpen(true);
  }, [stopScannerStream]);

  // Ref to hold pending snapshot during continuous typing or dragging
  const pendingUndoSnapshotRef = React.useRef<QRConfig | null>(null);
  const undoDebounceTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Change config with history record
  const updateConfig = React.useCallback(
    (updater: (prev: QRConfig) => QRConfig) => {
      setConfig(prev => {
        const next = updater(prev);
        if (next === prev) return prev;

        // Capture initial state before burst of edits
        if (!pendingUndoSnapshotRef.current) {
          pendingUndoSnapshotRef.current = prev;
        }

        if (undoDebounceTimerRef.current) {
          clearTimeout(undoDebounceTimerRef.current);
        }

        // Commit snapshot to undo stack after continuous edits pause
        undoDebounceTimerRef.current = setTimeout(() => {
          if (pendingUndoSnapshotRef.current) {
            const snapshot = pendingUndoSnapshotRef.current;
            pendingUndoSnapshotRef.current = null;
            setUndoStack(u => [...u.slice(-25), snapshot]);
            setRedoStack([]);
          }
        }, 350);

        return next;
      });
    },
    []
  );

  const handleUndo = React.useCallback(() => {
    // Flush pending snapshot if any
    if (undoDebounceTimerRef.current) {
      clearTimeout(undoDebounceTimerRef.current);
      undoDebounceTimerRef.current = null;
    }
    pendingUndoSnapshotRef.current = null;

    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack(u => u.slice(0, -1));
    setRedoStack(r => [...r, config]);
    setConfig(previous);
  }, [undoStack, config]);

  const handleRedo = React.useCallback(() => {
    if (undoDebounceTimerRef.current) {
      clearTimeout(undoDebounceTimerRef.current);
      undoDebounceTimerRef.current = null;
    }
    pendingUndoSnapshotRef.current = null;

    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack(r => r.slice(0, -1));
    setUndoStack(u => [...u, config]);
    setConfig(next);
  }, [redoStack, config]);

  // Completely resets all content, styles, templates, logos, and local storage to blank defaults
  const handleConfirmClearAll = React.useCallback(() => {
    // Cancel any pending undo debounce timer so stale snapshots don't fire after reset
    if (undoDebounceTimerRef.current) {
      clearTimeout(undoDebounceTimerRef.current);
      undoDebounceTimerRef.current = null;
    }
    pendingUndoSnapshotRef.current = null;

    // 1. Build a completely blank content & default style configuration
    const cleanConfig: QRConfig = {
      ...DEFAULT_QR_CONFIG,
      id: `design_${Date.now()}`,
      updatedAt: Date.now(),
      content: JSON.parse(JSON.stringify(EMPTY_QR_CONTENT))
    };

    // 2. Immediately wipe localStorage and sessionStorage with the blank configuration
    clearEditorLocalStorage(cleanConfig);

    // 3. Set React state to pristine blank state
    setConfig(cleanConfig);
    setUndoStack([]);
    setRedoStack([]);

    // 4. Close all open dialogs & panels
    setResetOpen(false);
    setShareOpen(false);
    setExportOpen(false);
    setCameraPermissionOpen(false);
    setScannerOpen(false);
    stopScannerStream();
    setTemplatesOpen(false);
    setRecentOpen(false);

    // 5. Force clean remount of editor to wipe any child input, file, or dropdown state
    setEditorKey(k => k + 1);
  }, [stopScannerStream]);

  // Request Clear All with confirmation dialog if user-entered data exists
  const handleRequestClearAll = React.useCallback(() => {
    if (hasUserEnteredData(config)) {
      setResetOpen(true);
    } else {
      handleConfirmClearAll();
    }
  }, [config, handleConfirmClearAll]);

  // Apply template (changes design without altering user content!)
  const handleSelectTemplate = (template: QRTemplate) => {
    updateConfig(prev => {
      const tConf = template.config;
      const hasCustomUpload = prev.logo.type === 'upload' && Boolean(prev.logo.source);

      const nextConfig: QRConfig = {
        ...prev,
        errorCorrection: (tConf.errorCorrection as any) || prev.errorCorrection,
        quietZone: tConf.quietZone !== undefined ? tConf.quietZone : prev.quietZone,
        content: prev.content,
        type: prev.type,
        pattern: {
          ...prev.pattern,
          ...(tConf.pattern || {})
        },
        colors: {
          ...prev.colors,
          ...(tConf.colors || {}),
          gradient: {
            ...prev.colors.gradient,
            ...(tConf.colors?.gradient || {})
          }
        },
        eyes: {
          ...prev.eyes,
          ...(tConf.eyes || {})
        },
        frame: {
          ...prev.frame,
          ...(tConf.frame || {})
        },
        text: {
          ...prev.text,
          ...(tConf.text || {})
        },
        layout: {
          ...prev.layout,
          ...(tConf.layout || {}),
          card: {
            ...prev.layout.card,
            ...(tConf.layout?.card || {})
          }
        },
        logo: hasCustomUpload
          ? {
              ...prev.logo,
              ...(tConf.logo || {}),
              type: 'upload',
              source: prev.logo.originalSource || prev.logo.source,
              originalSource: prev.logo.originalSource || prev.logo.source,
              backgroundColor:
                prev.logo.backgroundColor && prev.logo.backgroundColor !== '#ffffff'
                  ? prev.logo.backgroundColor
                  : 'transparent',
              shape: prev.logo.shape || 'square',
              innerPadding: 0,
              padding: 0
            }
          : {
              ...prev.logo,
              ...(tConf.logo || {})
            }
      };

      return nextConfig;
    });
  };

  // Load a previously saved design from recent history
  const handleLoadDesign = (saved: QRConfig) => {
    updateConfig(() => saved);
    if (pathname !== '/' && pathname !== '/create') {
      navigate('/create');
    }
  };

  // Route View Resolver
  const renderRouteView = () => {
    switch (pathname) {
      case '/':
        return <HomePage onSelectTemplate={handleSelectTemplate} />;

      case '/create':
        return (
          <QREditor
            key={editorKey}
            config={config}
            onChangeConfig={updateConfig}
            onOpenScanner={handleOpenScannerTrigger}
            onOpenExport={() => setExportOpen(true)}
            onOpenShare={() => setShareOpen(true)}
            onOpenTemplates={() => setTemplatesOpen(true)}
            onOpenReset={handleRequestClearAll}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={undoStack.length > 0}
            canRedo={redoStack.length > 0}
            onSelectTemplate={handleSelectTemplate}
          />
        );

      case '/template':
      case '/templates':
        return (
          <TemplatesPage
            onSelectTemplate={template => {
              handleSelectTemplate(template);
            }}
          />
        );

      case '/about':
        return <AboutPage />;

      case '/help':
      case '/faq':
        return <HelpPage />;

      case '/privacy':
        return <PrivacyPage />;

      case '/terms':
        return <TermsPage />;

      case '/sponsor':
        return <SponsorPage />;

      default:
        return <NotFoundPage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 selection:bg-[#E64500] selection:text-white dark:selection:bg-[#E64500] dark:selection:text-white relative">
      <SEOHead />
      <AmbientBackground />
      {/* Network Online / Offline Status Banner */}
      <NetworkStatusBanner onHeightChange={setBannerHeight} />

      {/* Top Navigation */}
      <TopNav
        bannerOffset={bannerHeight}
        onOpenTemplates={() => setTemplatesOpen(true)}
        onOpenRecent={() => setRecentOpen(true)}
        onOpenExport={() => setExportOpen(true)}
        onOpenShare={() => setShareOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main View Area with Award-Winning Smooth Route Transitions */}
      <main
        style={{
          paddingTop: bannerHeight ? `calc(4rem + ${bannerHeight}px)` : undefined,
          transition: 'padding-top 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        className="flex-1 relative overflow-hidden pt-16 sm:pt-20"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            variants={pageTransitionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full"
          >
            <RouteErrorBoundary pathname={pathname} onGoHome={() => navigate('/')}>
              <React.Suspense
                fallback={
                  <FullPageSkeleton
                    variant={
                      pathname === '/templates' || pathname === '/template'
                        ? 'templates'
                        : pathname === '/about' ||
                          pathname === '/help' ||
                          pathname === '/faq' ||
                          pathname === '/privacy' ||
                          pathname === '/terms' ||
                          pathname === '/sponsor'
                        ? 'content'
                        : 'editor'
                    }
                  />
                }
              >
                {renderRouteView()}
              </React.Suspense>
            </RouteErrorBoundary>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Clean Footer */}
      <Footer />

      {/* Modals & Dialogs - Mounted on demand for optimal memory and rendering performance */}
      <React.Suspense fallback={null}>
        {exportOpen && (
          <ExportModal
            open={exportOpen}
            onOpenChange={setExportOpen}
            onOpenShare={() => setShareOpen(true)}
            config={config}
          />
        )}

        {shareOpen && (
          <ShareModal
            open={shareOpen}
            onOpenChange={setShareOpen}
            config={config}
          />
        )}

        {/* Camera Permission Custom Animated Dialog */}
        {cameraPermissionOpen && (
          <CameraPermissionDialog
            open={cameraPermissionOpen}
            onOpenChange={setCameraPermissionOpen}
            onPermissionGranted={handleCameraPermissionGranted}
            onSwitchToUpload={handleSwitchToUpload}
          />
        )}

        {scannerOpen && (
          <QRScannerModal
            open={scannerOpen}
            onOpenChange={(open) => {
              setScannerOpen(open);
              if (!open) {
                stopScannerStream();
              }
            }}
            initialStream={scannerStream}
            initialMode={scannerMode}
          />
        )}

        {templatesOpen && (
          <TemplatesModal
            open={templatesOpen}
            onOpenChange={setTemplatesOpen}
            config={config}
            onSelectTemplate={handleSelectTemplate}
          />
        )}

        {recentOpen && (
          <RecentDesignsModal
            open={recentOpen}
            onOpenChange={setRecentOpen}
            onLoadDesign={handleLoadDesign}
          />
        )}

        {resetOpen && (
          <ResetModal
            open={resetOpen}
            onOpenChange={setResetOpen}
            onConfirmReset={handleConfirmClearAll}
          />
        )}
      </React.Suspense>
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <LoadingProvider>
        <NetworkStatusProvider>
          <StudioApp />
        </NetworkStatusProvider>
      </LoadingProvider>
    </RouterProvider>
  );
}
