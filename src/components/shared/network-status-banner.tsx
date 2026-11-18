import * as React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { WifiOff, Wifi, Check, X, AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNetworkStatus, ConnectivityStatus } from '../../lib/network-status';

export interface NetworkStatusBannerProps {
  onHeightChange?: (height: number) => void;
}

const ONLINE_AUTO_HIDE_MS = 3500;

export const NetworkStatusBanner: React.FC<NetworkStatusBannerProps> = ({ onHeightChange }) => {
  const prefersReduced = useReducedMotion();
  const {
    status,
    hadIssueInSession,
    isManualCheck,
    latencyMs,
    checkNow
  } = useNetworkStatus();

  // Controls whether the top banner is currently visible
  const [showBanner, setShowBanner] = React.useState<boolean>(() => status !== 'online');
  const [dismissedForStatus, setDismissedForStatus] = React.useState<ConnectivityStatus | null>(null);

  const bannerRef = React.useRef<HTMLDivElement>(null);
  const autoHideTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevStatusRef = React.useRef<ConnectivityStatus>(status);
  const showBannerRef = React.useRef<boolean>(showBanner);
  showBannerRef.current = showBanner;
  const hasShownOnlineRecoveryRef = React.useRef<boolean>(status === 'online');

  const clearAutoHideTimer = React.useCallback(() => {
    if (autoHideTimerRef.current) {
      clearTimeout(autoHideTimerRef.current);
      autoHideTimerRef.current = null;
    }
  }, []);

  // React to connectivity state changes without cancelling active recovery timers prematurely
  React.useEffect(() => {
    const prevStatus = prevStatusRef.current;
    prevStatusRef.current = status;

    if (status === 'offline' || status === 'unstable') {
      clearAutoHideTimer();
      hasShownOnlineRecoveryRef.current = false;
      if (dismissedForStatus !== status) {
        setShowBanner(true);
      }
      return;
    }

    if (status === 'checking') {
      // Show 'checking' banner if we were already showing the banner, recovering from an issue, or user clicked Check/Retry
      if (showBannerRef.current || hadIssueInSession || isManualCheck || prevStatus !== 'online') {
        clearAutoHideTimer();
        hasShownOnlineRecoveryRef.current = false;
        setDismissedForStatus(null);
        setShowBanner(true);
      }
      return;
    }

    if (status === 'online') {
      setDismissedForStatus(null);
      // Only show the "You're back online!" banner once per recovery or manual check
      if (
        !hasShownOnlineRecoveryRef.current &&
        (hadIssueInSession || isManualCheck || prevStatus !== 'online')
      ) {
        hasShownOnlineRecoveryRef.current = true;
        clearAutoHideTimer();
        setShowBanner(true);
        autoHideTimerRef.current = setTimeout(() => {
          setShowBanner(false);
          autoHideTimerRef.current = null;
        }, ONLINE_AUTO_HIDE_MS);
      } else if (!hasShownOnlineRecoveryRef.current) {
        setShowBanner(false);
      }
    }
  }, [status, hadIssueInSession, isManualCheck, dismissedForStatus, clearAutoHideTimer]);

  React.useEffect(() => {
    return () => {
      clearAutoHideTimer();
    };
  }, [clearAutoHideTimer]);

  // Notify parent of banner height changes for seamless layout clearance
  const updateBannerHeight = React.useCallback(
    (height: number) => {
      if (onHeightChange) {
        onHeightChange(height);
      }
    },
    [onHeightChange]
  );

  React.useEffect(() => {
    if (!showBanner) {
      updateBannerHeight(0);
      return;
    }

    const reportHeight = () => {
      if (bannerRef.current) {
        const measured = bannerRef.current.offsetHeight;
        updateBannerHeight(measured);
      } else {
        updateBannerHeight(40);
      }
    };

    reportHeight();
    window.addEventListener('resize', reportHeight);
    return () => window.removeEventListener('resize', reportHeight);
  }, [showBanner, status, updateBannerHeight]);

  const handleDismiss = () => {
    clearAutoHideTimer();
    setDismissedForStatus(status);
    setShowBanner(false);
  };

  const handleRetry = () => {
    setDismissedForStatus(null);
    void checkNow();
  };

  const getBannerThemeClasses = (currentStatus: ConnectivityStatus) => {
    switch (currentStatus) {
      case 'offline':
        return 'bg-rose-50/95 dark:bg-[#2b1016]/95 border-b border-rose-200/90 dark:border-rose-900/60 text-rose-950 dark:text-rose-100 backdrop-blur-md';
      case 'unstable':
        return 'bg-amber-50/95 dark:bg-[#291a07]/95 border-b border-amber-200/90 dark:border-amber-900/60 text-amber-950 dark:text-amber-100 backdrop-blur-md';
      case 'checking':
        return 'bg-neutral-100/95 dark:bg-neutral-900/95 border-b border-neutral-200/90 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 backdrop-blur-md';
      case 'online':
      default:
        return 'bg-emerald-50/95 dark:bg-[#06281b]/95 border-b border-emerald-200/90 dark:border-emerald-900/60 text-emerald-950 dark:text-emerald-100 backdrop-blur-md';
    }
  };

  const getStatusMessage = (currentStatus: ConnectivityStatus) => {
    switch (currentStatus) {
      case 'offline':
        return 'You’re offline! Check your internet connection.';
      case 'unstable':
        return 'Connection unstable — Internet reachability is slow or limited.';
      case 'checking':
        return 'Checking internet connection…';
      case 'online':
      default:
        return latencyMs
          ? `You’re back online! (${latencyMs}ms)`
          : 'You’re back online!';
    }
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.aside
          ref={bannerRef}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          initial={prefersReduced ? { opacity: 0 } : { y: '-100%', opacity: 0 }}
          animate={prefersReduced ? { opacity: 1 } : { y: 0, opacity: 1 }}
          exit={prefersReduced ? { opacity: 0 } : { y: '-100%', opacity: 0 }}
          transition={{
            duration: 0.35,
            ease: [0.16, 1, 0.3, 1]
          }}
          className={cn(
            'fixed top-0 left-0 right-0 z-[60] w-full select-none shadow-xs transition-colors duration-300',
            'pt-[env(safe-area-inset-top,0px)]',
            getBannerThemeClasses(status)
          )}
        >
          <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm font-medium">
            {/* Center / Message Block */}
            <div className="flex-1 flex items-center justify-center gap-2 sm:gap-2.5 min-w-0 text-center">
              {/* Dynamic Animated Status Icon */}
              <AnimatePresence mode="wait">
                {status === 'offline' && (
                  <motion.div
                    key="offline-icon"
                    initial={prefersReduced ? false : { scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    transition={{ type: 'spring', damping: 18, stiffness: 320 }}
                    className="relative flex items-center justify-center shrink-0"
                  >
                    <motion.div
                      animate={
                        prefersReduced
                          ? {}
                          : {
                              scale: [1, 1.15, 1],
                              opacity: [0.75, 1, 0.75]
                            }
                      }
                      transition={{
                        repeat: Infinity,
                        duration: 2.2,
                        ease: 'easeInOut'
                      }}
                      className="p-1 rounded-full bg-rose-100/80 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400"
                    >
                      <WifiOff className="w-4 h-4 stroke-[2.2]" />
                    </motion.div>
                  </motion.div>
                )}

                {status === 'unstable' && (
                  <motion.div
                    key="unstable-icon"
                    initial={prefersReduced ? false : { scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    transition={{ type: 'spring', damping: 18, stiffness: 320 }}
                    className="relative flex items-center justify-center shrink-0"
                  >
                    <div className="p-1 rounded-full bg-amber-100/90 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="w-4 h-4 stroke-[2.2]" />
                    </div>
                  </motion.div>
                )}

                {status === 'checking' && (
                  <motion.div
                    key="checking-icon"
                    initial={prefersReduced ? false : { scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="relative flex items-center justify-center shrink-0"
                  >
                    <div className="p-1 rounded-full bg-orange-100/90 dark:bg-orange-950/70 text-[#E64500] dark:text-orange-400">
                      <RefreshCw className="w-4 h-4 stroke-[2.2] animate-spin" />
                    </div>
                  </motion.div>
                )}

                {status === 'online' && (
                  <motion.div
                    key="online-icon"
                    initial={prefersReduced ? false : { scale: 0.5, rotate: -25, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 340 }}
                    className="relative flex items-center justify-center shrink-0"
                  >
                    <div className="relative p-1 rounded-full bg-emerald-100/90 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400">
                      <Wifi className="w-4 h-4 stroke-[2.2]" />
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-2 h-2 stroke-[3]" />
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Status Message */}
              <motion.div
                key={status}
                initial={prefersReduced ? false : { opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24 }}
                className="flex items-center min-w-0"
              >
                <span className="font-semibold tracking-tight truncate sm:whitespace-normal tabular-nums">
                  {getStatusMessage(status)}
                </span>
              </motion.div>
            </div>

            {/* Right Controls: Retry Button (when offline/unstable) + Dismiss Button */}
            <div className="flex items-center gap-1.5 shrink-0">
              {(status === 'offline' || status === 'unstable') && (
                <button
                  type="button"
                  onClick={handleRetry}
                  className={cn(
                    'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2',
                    status === 'offline'
                      ? 'bg-rose-200/75 hover:bg-rose-300/80 dark:bg-rose-900/60 dark:hover:bg-rose-800/70 text-rose-900 dark:text-rose-100 focus-visible:ring-rose-500'
                      : 'bg-amber-200/75 hover:bg-amber-300/80 dark:bg-amber-900/60 dark:hover:bg-amber-800/70 text-amber-900 dark:text-amber-100 focus-visible:ring-amber-500'
                  )}
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Dismiss connection notification"
                className={cn(
                  'p-1 rounded-lg transition-colors cursor-pointer shrink-0 active:scale-95 focus-visible:outline-none focus-visible:ring-2',
                  status === 'offline' &&
                    'text-rose-500 hover:text-rose-800 dark:hover:text-rose-200 hover:bg-rose-200/60 dark:hover:bg-rose-900/40 focus-visible:ring-rose-500',
                  status === 'unstable' &&
                    'text-amber-600 hover:text-amber-900 dark:hover:text-amber-200 hover:bg-amber-200/60 dark:hover:bg-amber-900/40 focus-visible:ring-amber-500',
                  status === 'checking' &&
                    'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 focus-visible:ring-neutral-500',
                  status === 'online' &&
                    'text-emerald-600 hover:text-emerald-900 dark:hover:text-emerald-200 hover:bg-emerald-200/60 dark:hover:bg-emerald-900/40 focus-visible:ring-emerald-500'
                )}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
