import { QRConfig, ScanabilityAudit } from '../types/qr';
import { auditScanability as syncAuditScanability } from './scanability';

let workerInstance: Worker | null = null;
let msgId = 0;
interface PendingCallback {
  resolve: (res: ScanabilityAudit) => void;
  timeoutId: ReturnType<typeof setTimeout>;
}

const callbacks = new Map<number, PendingCallback>();

function getWorker(): Worker | null {
  if (typeof window === 'undefined' || typeof Worker === 'undefined') {
    return null;
  }
  if (!workerInstance) {
    try {
      workerInstance = new Worker(
        new URL('../workers/qr-calc.worker.ts', import.meta.url),
        { type: 'module' }
      );
      workerInstance.onmessage = (e: MessageEvent) => {
        const { id, result } = e.data;
        const entry = callbacks.get(id);
        if (entry) {
          clearTimeout(entry.timeoutId);
          callbacks.delete(id);
          entry.resolve(result);
        }
      };
      workerInstance.onerror = () => {
        // Dispose failed worker; pending requests will fall back via timeout
        workerInstance?.terminate();
        workerInstance = null;
      };
    } catch {
      workerInstance = null;
    }
  }
  return workerInstance;
}

export function auditScanabilityAsync(config: QRConfig): Promise<ScanabilityAudit> {
  const worker = getWorker();
  if (!worker) {
    return Promise.resolve(syncAuditScanability(config));
  }

  return new Promise((resolve) => {
    const id = ++msgId;
    const timeoutId = setTimeout(() => {
      const entry = callbacks.get(id);
      if (entry) {
        callbacks.delete(id);
        entry.resolve(syncAuditScanability(config));
      }
    }, 250);

    callbacks.set(id, { resolve, timeoutId });

    const fg = config.colors.foreground;
    const bg = config.colors.transparentBackground
      ? config.layout.type === 'card'
        ? config.layout.card.backgroundColor || '#FFFFFF'
        : '#FFFFFF'
      : config.colors.background;

    worker.postMessage({
      id,
      type: 'AUDIT_SCANABILITY',
      data: {
        fg,
        bg,
        gradient: config.colors.gradient,
        eyes: config.eyes,
        quietZone: config.quietZone,
        errorCorrection: config.errorCorrection,
        logoSize: config.logo.size,
        logoEnabled: config.logo.enabled
      }
    });
  });
}
