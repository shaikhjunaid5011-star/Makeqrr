import * as React from 'react';
import { QRConfig } from '../../types/qr';
import { auditScanability } from '../../lib/scanability';
import { auditScanabilityAsync } from '../../lib/worker-client';
import { CheckCircle2, AlertTriangle, XCircle, Info, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ScanabilityBadgeProps {
  config: QRConfig;
  className?: string;
}

export const ScanabilityBadge: React.FC<ScanabilityBadgeProps> = React.memo(({ config, className }) => {
  const [expanded, setExpanded] = React.useState(false);
  const [audit, setAudit] = React.useState(() => auditScanability(config));

  // Run audit in Web Worker off the main thread with debounce
  React.useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      auditScanabilityAsync(config).then(result => {
        if (active) {
          setAudit(result);
        }
      });
    }, 80);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [
    config.colors.foreground,
    config.colors.background,
    config.colors.transparentBackground,
    config.colors.gradient.enabled,
    config.colors.gradient.startColor,
    config.colors.gradient.endColor,
    config.eyes.customEyes,
    config.eyes.outerColor,
    config.eyes.innerColor,
    config.layout.type,
    config.layout.card.backgroundColor,
    config.quietZone,
    config.errorCorrection,
    config.logo.enabled,
    config.logo.size
  ]);

  const statusConfig = {
    excellent: {
      label: 'Easy to Scan: Great',
      icon: CheckCircle2,
      badgeClass:
        'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
    },
    warning: {
      label: 'Easy to Scan: Warning',
      icon: AlertTriangle,
      badgeClass:
        'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800'
    },
    risky: {
      label: 'Easy to Scan: Hard to Read',
      icon: XCircle,
      badgeClass:
        'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400 border-red-200 dark:border-red-800'
    }
  }[audit.score];

  const Icon = statusConfig.icon;

  return (
    <div className={cn('relative inline-block w-full', className)}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={cn(
          'w-full flex items-center justify-between px-2 sm:px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer min-w-0',
          statusConfig.badgeClass
        )}
      >
        <div className="flex items-center gap-1.5 min-w-0 shrink">
          <Icon className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate text-left text-[11px] sm:text-xs">{statusConfig.label}</span>
        </div>
        <div className="flex items-center gap-1 opacity-70 shrink-0 text-right ml-1">
          <span className="text-[10px] font-mono tabular-nums whitespace-nowrap">
            {audit.contrastRatio}:1 Color Match
          </span>
          <ChevronDown
            className={cn('w-3 h-3 transition-transform duration-200 shrink-0', expanded && 'rotate-180')}
          />
        </div>
      </button>

      {expanded && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-30 p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-2.5 text-xs animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center justify-between pb-1.5 border-b border-neutral-100 dark:border-neutral-800">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              Scan Check
            </span>
            <span className="text-[10px] text-neutral-500">Quick Tips</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-center">
            <div className="p-1.5 rounded-md bg-neutral-50 dark:bg-neutral-800">
              <span className="block text-[10px] text-neutral-500">Color Match</span>
              <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200">
                {audit.contrastRatio}:1
              </span>
            </div>
            <div className="p-1.5 rounded-md bg-neutral-50 dark:bg-neutral-800">
              <span className="block text-[10px] text-neutral-500">Edge Space</span>
              <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200">
                {config.quietZone} pt
              </span>
            </div>
            <div className="p-1.5 rounded-md bg-neutral-50 dark:bg-neutral-800">
              <span className="block text-[10px] text-neutral-500">Safety</span>
              <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200">
                Level {config.errorCorrection}
              </span>
            </div>
          </div>

          {audit.issues.length > 0 ? (
            <div className="space-y-1.5 pt-1">
              {audit.issues.map((issue, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'p-2 rounded-lg text-[11px] space-y-0.5 border',
                    issue.severity === 'risky'
                      ? 'bg-red-50/50 dark:bg-red-950/30 border-red-200 dark:border-red-900 text-red-800 dark:text-red-300'
                      : 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300'
                  )}
                >
                  <div className="font-semibold">{issue.title}</div>
                  <p className="opacity-90">{issue.description}</p>
                  <div className="font-medium opacity-100">Tip: {issue.recommendation}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Looks great! Phones will be able to scan this easily.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

ScanabilityBadge.displayName = 'ScanabilityBadge';
