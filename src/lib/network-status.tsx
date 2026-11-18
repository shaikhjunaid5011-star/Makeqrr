import * as React from 'react';

export type ConnectivityStatus = 'online' | 'offline' | 'unstable' | 'checking';

export interface NetworkStatusState {
  /** Current connectivity state: 'online' | 'offline' | 'unstable' | 'checking' */
  status: ConnectivityStatus;
  /** True when internet connection is verified reachable */
  isOnline: boolean;
  /** True when device has no network connection */
  isOffline: boolean;
  /** True when local network exists, but internet connectivity checks fail or are severely degraded */
  isUnstable: boolean;
  /** True when internet availability is actively being verified */
  isChecking: boolean;
  /** True if the session ever experienced an offline or unstable connection */
  hadIssueInSession: boolean;
  /** True if the most recent check was triggered manually by the user */
  isManualCheck: boolean;
  /** Last measured round-trip probe latency in milliseconds */
  latencyMs: number | null;
  /** Timestamp (ms) when internet reachability was last confirmed */
  lastVerifiedAt: number | null;
  /** Human-readable description of the current connectivity state */
  statusDetail: string;
  /** Manually trigger an immediate connectivity check */
  checkNow: () => Promise<ConnectivityStatus>;
}

interface ProbeOutcome {
  reachable: boolean;
  unstable: boolean;
  latencyMs: number | null;
  reason: string;
}

/**
 * Lightweight public HTTPS endpoints for verifying real internet connectivity
 * without requiring any backend server or exposing secrets.
 */
const CONNECTIVITY_ENDPOINTS = [
  'https://www.gstatic.com/generate_204',
  'https://dns.google/resolve?name=example.com&type=A'
] as const;

const PROBE_TIMEOUT_MS = 3800;
const SLOW_LATENCY_THRESHOLD_MS = 2200;
const VERIFY_RETRY_DELAY_MS = 650;
const MIN_CHECKING_DISPLAY_MS = 320;
const FOCUS_CHECK_COOLDOWN_MS = 15000;

/**
 * Bounded retry schedule (ms) when connection is 'unstable' or 'offline'.
 * Avoids infinite polling loops while automatically recovering when internet returns.
 */
const RECOVERY_BACKOFF_SCHEDULE_MS = [4000, 8000, 15000, 25000, 45000] as const;

interface NavigatorConnection extends EventTarget {
  readonly effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
  readonly rtt?: number;
  readonly downlink?: number;
  readonly saveData?: boolean;
}

function getNavigatorOnline(): boolean {
  if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
    return navigator.onLine;
  }
  return true;
}

function getNavigatorConnection(): NavigatorConnection | null {
  if (typeof navigator === 'undefined') return null;
  const nav = navigator as Navigator & {
    connection?: NavigatorConnection;
    mozConnection?: NavigatorConnection;
    webkitConnection?: NavigatorConnection;
  };
  return nav.connection || nav.mozConnection || nav.webkitConnection || null;
}

function isConnectionHintSlow(): boolean {
  const conn = getNavigatorConnection();
  if (!conn) return false;
  if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') {
    return true;
  }
  if (typeof conn.rtt === 'number' && conn.rtt >= 1600) {
    return true;
  }
  if (typeof conn.downlink === 'number' && conn.downlink > 0 && conn.downlink < 0.15) {
    return true;
  }
  return false;
}

/**
 * Performs a single lightweight HTTPS fetch with an AbortController timeout.
 */
async function probeSingleEndpoint(
  url: string,
  parentSignal: AbortSignal,
  timeoutMs: number
): Promise<{ ok: boolean; latencyMs: number }> {
  const controller = new AbortController();
  const onParentAbort = () => controller.abort();
  parentSignal.addEventListener('abort', onParentAbort, { once: true });

  const timer = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  const separator = url.includes('?') ? '&' : '?';
  const cacheBustedUrl = `${url}${separator}_cb=${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const start = typeof performance !== 'undefined' ? performance.now() : Date.now();

  try {
    const response = await fetch(cacheBustedUrl, {
      method: 'GET',
      mode: 'no-cors',
      cache: 'no-store',
      credentials: 'omit',
      signal: controller.signal
    });

    const end = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const latencyMs = Math.max(1, Math.round(end - start));

    // In 'no-cors' mode, a successful network round-trip produces type === 'opaque' (status 0)
    // In standard CORS mode, response.ok is true (status 200-299).
    const isReachable = response.type === 'opaque' || response.ok || (response.status >= 200 && response.status < 400);

    return { ok: isReachable, latencyMs };
  } catch {
    const end = typeof performance !== 'undefined' ? performance.now() : Date.now();
    return { ok: false, latencyMs: Math.round(end - start) };
  } finally {
    clearTimeout(timer);
    parentSignal.removeEventListener('abort', onParentAbort);
  }
}

function delayWithSignal(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

/**
 * Verifies real internet connectivity:
 * - Immediately returns offline if navigator.onLine is false.
 * - Never treats a single failed third-party request as proof that the internet is down:
 *   if the first probe fails, waits briefly and retries before reporting 'unstable'.
 * - Detects severely slow connections via round-trip timing and Network Information API hints.
 */
async function verifyInternetReachability(
  signal: AbortSignal,
  allowProbeWhenNavigatorOffline = false
): Promise<ProbeOutcome> {
  if (!getNavigatorOnline() && !allowProbeWhenNavigatorOffline) {
    return {
      reachable: false,
      unstable: false,
      latencyMs: null,
      reason: 'Device has no network connection.'
    };
  }

  // Attempt 1: Primary lightweight HTTPS probe
  const firstAttempt = await probeSingleEndpoint(CONNECTIVITY_ENDPOINTS[0], signal, PROBE_TIMEOUT_MS);
  if (signal.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }

  if (firstAttempt.ok) {
    const slowConnection = firstAttempt.latencyMs > SLOW_LATENCY_THRESHOLD_MS || isConnectionHintSlow();
    if (slowConnection) {
      return {
        reachable: true,
        unstable: true,
        latencyMs: firstAttempt.latencyMs,
        reason: `Connection is slow or unstable (${firstAttempt.latencyMs}ms).`
      };
    }
    return {
      reachable: true,
      unstable: false,
      latencyMs: firstAttempt.latencyMs,
      reason: 'Internet connection is reachable.'
    };
  }

  // Do not treat a single failed request as proof that the entire internet is unavailable.
  // Wait briefly and perform a second verification attempt.
  await delayWithSignal(VERIFY_RETRY_DELAY_MS, signal);

  if (!getNavigatorOnline() && !allowProbeWhenNavigatorOffline) {
    return {
      reachable: false,
      unstable: false,
      latencyMs: null,
      reason: 'Device has no network connection.'
    };
  }

  // Attempt 2: Retry verification probe
  const secondAttempt = await probeSingleEndpoint(CONNECTIVITY_ENDPOINTS[0], signal, PROBE_TIMEOUT_MS);
  if (signal.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }

  if (secondAttempt.ok) {
    const slowConnection = secondAttempt.latencyMs > SLOW_LATENCY_THRESHOLD_MS || isConnectionHintSlow();
    return {
      reachable: true,
      unstable: slowConnection,
      latencyMs: secondAttempt.latencyMs,
      reason: slowConnection
        ? `Connection is slow or unstable (${secondAttempt.latencyMs}ms).`
        : 'Internet connection is reachable.'
    };
  }

  // Both attempts failed. If browser reports no network interface, status is 'offline'.
  if (!getNavigatorOnline()) {
    return {
      reachable: false,
      unstable: false,
      latencyMs: null,
      reason: 'Device has no network connection.'
    };
  }

  // Local network exists (navigator.onLine === true), but connectivity checks are failing.
  return {
    reachable: false,
    unstable: true,
    latencyMs: null,
    reason: 'Network exists, but internet connectivity checks are failing.'
  };
}

const NetworkStatusContext = React.createContext<NetworkStatusState | null>(null);

export const NetworkStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = React.useState<ConnectivityStatus>(() =>
    getNavigatorOnline() ? 'online' : 'offline'
  );
  const [hadIssueInSession, setHadIssueInSession] = React.useState<boolean>(() => !getNavigatorOnline());
  const [isManualCheck, setIsManualCheck] = React.useState<boolean>(false);
  const [latencyMs, setLatencyMs] = React.useState<number | null>(null);
  const [lastVerifiedAt, setLastVerifiedAt] = React.useState<number | null>(null);
  const [statusDetail, setStatusDetail] = React.useState<string>(() =>
    getNavigatorOnline() ? 'Internet connection is reachable.' : 'Device has no network connection.'
  );

  const statusRef = React.useRef<ConnectivityStatus>(status);
  statusRef.current = status;

  const hadIssueRef = React.useRef<boolean>(hadIssueInSession);
  hadIssueRef.current = hadIssueInSession;

  const activeAbortRef = React.useRef<AbortController | null>(null);
  const recoveryTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const recoveryAttemptIndexRef = React.useRef<number>(0);
  const lastProbeTimestampRef = React.useRef<number>(0);
  const isMountedRef = React.useRef<boolean>(true);

  const clearRecoveryTimer = React.useCallback(() => {
    if (recoveryTimerRef.current) {
      clearTimeout(recoveryTimerRef.current);
      recoveryTimerRef.current = null;
    }
  }, []);

  const clearDebounceTimer = React.useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

  const abortActiveProbe = React.useCallback(() => {
    if (activeAbortRef.current) {
      activeAbortRef.current.abort();
      activeAbortRef.current = null;
    }
  }, []);

  const runConnectivityCheck = React.useCallback(
    async (options?: {
      showCheckingState?: boolean;
      manual?: boolean;
    }): Promise<ConnectivityStatus> => {
      const showChecking = options?.showCheckingState ?? false;
      const manual = options?.manual ?? false;

      clearDebounceTimer();
      clearRecoveryTimer();
      abortActiveProbe();

      // If browser explicitly reports no network adapter and this isn't a manual check,
      // immediately transition to 'offline' without making network requests.
      if (!getNavigatorOnline() && !manual) {
        if (isMountedRef.current) {
          setIsManualCheck(false);
          setHadIssueInSession(true);
          setStatus('offline');
          setStatusDetail('Device has no network connection.');
        }
        return 'offline';
      }

      const controller = new AbortController();
      activeAbortRef.current = controller;
      const checkStartTime = Date.now();
      lastProbeTimestampRef.current = checkStartTime;

      if (showChecking && isMountedRef.current) {
        setIsManualCheck(manual);
        setStatus('checking');
        setStatusDetail('Internet availability is currently being verified…');
      }

      try {
        const outcome = await verifyInternetReachability(controller.signal, manual);
        if (controller.signal.aborted || !isMountedRef.current) {
          return statusRef.current;
        }

        // Ensure 'checking' state stays visible long enough to avoid jarring single-frame flicker
        if (showChecking) {
          const elapsed = Date.now() - checkStartTime;
          if (elapsed < MIN_CHECKING_DISPLAY_MS) {
            await delayWithSignal(MIN_CHECKING_DISPLAY_MS - elapsed, controller.signal);
          }
        }

        if (controller.signal.aborted || !isMountedRef.current) {
          return statusRef.current;
        }

        let resolvedStatus: ConnectivityStatus;

        if (!outcome.reachable && !outcome.unstable) {
          resolvedStatus = 'offline';
          setHadIssueInSession(true);
        } else if (outcome.unstable) {
          resolvedStatus = 'unstable';
          setHadIssueInSession(true);
        } else {
          resolvedStatus = 'online';
          recoveryAttemptIndexRef.current = 0;
          setLastVerifiedAt(Date.now());
        }

        if (outcome.latencyMs !== null) {
          setLatencyMs(outcome.latencyMs);
        }

        setStatusDetail(outcome.reason);
        setStatus(resolvedStatus);

        // If connection is unstable or offline while network interface may still recover,
        // schedule a bounded automatic retry (never an infinite loop).
        if (resolvedStatus === 'unstable' || resolvedStatus === 'offline') {
          const attemptIdx = recoveryAttemptIndexRef.current;
          if (attemptIdx < RECOVERY_BACKOFF_SCHEDULE_MS.length) {
            const nextDelay = RECOVERY_BACKOFF_SCHEDULE_MS[attemptIdx];
            recoveryAttemptIndexRef.current = attemptIdx + 1;
            recoveryTimerRef.current = setTimeout(() => {
              if (!isMountedRef.current) return;
              if (getNavigatorOnline()) {
                void runConnectivityCheck({ showCheckingState: false, manual: false });
              }
            }, nextDelay);
          }
        }

        return resolvedStatus;
      } catch {
        // Aborted by a newer check or unmount
        return statusRef.current;
      } finally {
        if (activeAbortRef.current === controller) {
          activeAbortRef.current = null;
        }
      }
    },
    [abortActiveProbe, clearDebounceTimer, clearRecoveryTimer]
  );

  const checkNow = React.useCallback(async (): Promise<ConnectivityStatus> => {
    recoveryAttemptIndexRef.current = 0;
    return runConnectivityCheck({ showCheckingState: true, manual: true });
  }, [runConnectivityCheck]);

  React.useEffect(() => {
    isMountedRef.current = true;

    // 1. Initial verification on mount (silent if navigator.onLine is true so we never flicker on load)
    const initialOnline = getNavigatorOnline();
    const initialTimer = setTimeout(() => {
      if (!isMountedRef.current) return;
      if (initialOnline) {
        void runConnectivityCheck({ showCheckingState: false, manual: false });
      } else {
        setHadIssueInSession(true);
        setStatus('offline');
        setStatusDetail('Device has no network connection.');
      }
    }, 180);

    // 2. Browser 'offline' event handler
    const handleBrowserOffline = () => {
      clearDebounceTimer();
      clearRecoveryTimer();
      abortActiveProbe();
      recoveryAttemptIndexRef.current = 0;

      // Short 120ms stabilization check for micro-handoffs, unless navigator.onLine is already false
      if (!getNavigatorOnline()) {
        setIsManualCheck(false);
        setHadIssueInSession(true);
        setStatus('offline');
        setStatusDetail('Device has no network connection.');
      } else {
        debounceTimerRef.current = setTimeout(() => {
          if (!isMountedRef.current) return;
          if (!getNavigatorOnline()) {
            setIsManualCheck(false);
            setHadIssueInSession(true);
            setStatus('offline');
            setStatusDetail('Device has no network connection.');
          } else {
            void runConnectivityCheck({ showCheckingState: true, manual: false });
          }
        }, 150);
      }
    };

    // 3. Browser 'online' event handler
    const handleBrowserOnline = () => {
      clearDebounceTimer();
      clearRecoveryTimer();
      recoveryAttemptIndexRef.current = 0;

      // Immediately transition to 'checking' and verify real internet reachability
      void runConnectivityCheck({
        showCheckingState: hadIssueRef.current || statusRef.current !== 'online',
        manual: false
      });
    };

    // 4. Network Information API 'change' handler (Wi-Fi <-> Mobile data switching, DevTools throttling)
    const handleConnectionChange = () => {
      clearDebounceTimer();
      if (!getNavigatorOnline()) {
        handleBrowserOffline();
        return;
      }

      // Coalesce rapid interface handoff events over 250ms to prevent UI flickering
      debounceTimerRef.current = setTimeout(() => {
        if (!isMountedRef.current) return;
        const showChecking =
          statusRef.current === 'offline' ||
          statusRef.current === 'unstable' ||
          isConnectionHintSlow();
        recoveryAttemptIndexRef.current = 0;
        void runConnectivityCheck({ showCheckingState: showChecking, manual: false });
      }, 250);
    };

    // 5. Visibility / Focus recovery check (throttled to avoid unnecessary requests)
    const handleVisibilityOrFocus = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        return;
      }
      if (!getNavigatorOnline()) {
        handleBrowserOffline();
        return;
      }
      const now = Date.now();
      const needsImmediateRecovery =
        statusRef.current === 'offline' || statusRef.current === 'unstable';

      if (needsImmediateRecovery || now - lastProbeTimestampRef.current >= FOCUS_CHECK_COOLDOWN_MS) {
        recoveryAttemptIndexRef.current = 0;
        void runConnectivityCheck({
          showCheckingState: needsImmediateRecovery,
          manual: false
        });
      }
    };

    window.addEventListener('offline', handleBrowserOffline);
    window.addEventListener('online', handleBrowserOnline);
    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    const navConn = getNavigatorConnection();
    if (navConn && typeof navConn.addEventListener === 'function') {
      navConn.addEventListener('change', handleConnectionChange);
    }

    return () => {
      isMountedRef.current = false;
      clearTimeout(initialTimer);
      clearDebounceTimer();
      clearRecoveryTimer();
      abortActiveProbe();

      window.removeEventListener('offline', handleBrowserOffline);
      window.removeEventListener('online', handleBrowserOnline);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);

      if (navConn && typeof navConn.removeEventListener === 'function') {
        navConn.removeEventListener('change', handleConnectionChange);
      }
    };
  }, [abortActiveProbe, clearDebounceTimer, clearRecoveryTimer, runConnectivityCheck]);

  const contextValue = React.useMemo<NetworkStatusState>(
    () => ({
      status,
      isOnline: status === 'online',
      isOffline: status === 'offline',
      isUnstable: status === 'unstable',
      isChecking: status === 'checking',
      hadIssueInSession,
      isManualCheck,
      latencyMs,
      lastVerifiedAt,
      statusDetail,
      checkNow
    }),
    [status, hadIssueInSession, isManualCheck, latencyMs, lastVerifiedAt, statusDetail, checkNow]
  );

  return (
    <NetworkStatusContext.Provider value={contextValue}>
      {children}
    </NetworkStatusContext.Provider>
  );
};

export function useNetworkStatus(): NetworkStatusState {
  const ctx = React.useContext(NetworkStatusContext);
  if (!ctx) {
    throw new Error('useNetworkStatus must be used within a NetworkStatusProvider');
  }
  return ctx;
}
